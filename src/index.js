const PACKAGE_NAME = 'DANDELION'

const SEPARATORS = {
    chars: '',
    words: ' '
};

const CHARACTERS_TO_PADE = ['.', ',', '?', '!', '\n', ';', ':'];
const CHARACTERS_TO_CHANGE = {

    '—': '-',

    '«': '',
    '»': '',
    '”': '',
    '„': '',

    '(': '',
    ')': '',

    '\r': ' ',
    '\t': ' ',

    '…': '...',
    '*': '',
};

class Dandelion {

    #worker = undefined;

    sequences = undefined;

    #text = '';
    #K = 3;

    set K(value) {

        if (this.#K === value)
            return;

        this.#K = value;
        this.train(this.#text);
    }

    get K() {

        return this.#K;
    }

    #type = 'words';

    set type(value) {

        if (this.#type === value)
            return;

        this.#type = value;
        this.train(this.#text);
    }

    get type() {

        return this.#type;
    }

    defaultOnStart = ({ start }) => {

        console.log('[' + PACKAGE_NAME + '] -- starting --');
    }

    defaultRefreshRate = 10;

    defaultOnRefresh = ({ start, progress }) => {

        console.log('[' + PACKAGE_NAME + '] Training: ' + Math.ceil(progress) + '%');
    }

    defaultOnDone = ({ start }) => {

        console.log('[' + PACKAGE_NAME + '] --  done ' + ((performance.now() - start) / 1000).toFixed(2) + 's ---');
    }



    constructor ({ type = 'words', K = 3 } = {}) {

        type = type.toLowerCase();

        if (type !== 'chars' && type !== 'words')
            throw '[' + PACKAGE_NAME + '] Type \'' + type + '\' is unknow.';

        this.#type = type;
        this.#K = K;
    }

    train(text, { onStart = this.defaultOnStart, onRefresh = this.defaultOnRefresh, refreshRate = this.defaultRefreshRate, onDone = this.defaultOnDone } = {}) {

        if (this.#worker) {

            console.warn('[' + PACKAGE_NAME + '] Terminating previous undone training.')
            this.#worker.terminate();
        }

        this.#worker = new Worker('../../src/train.js');

        return new Promise(resolve => {

            this.sequences = {};

            const start = performance.now();
            const dandelion = this;

            if (!text)
                text = this.#text;

            this.#text = text;


            function listener(message) {

                if (message.data.progress && typeof onRefresh === 'function')
                    return onRefresh({ start: start, progress: message.data.progress })



                else if (message.data.done) {

                    dandelion.#worker.removeEventListener('message', listener);
                    dandelion.#worker = undefined;

                    if (typeof onDone === 'function')
                        onDone({ start: start });

                    resolve(dandelion);
                }
                else
                    dandelion.sequences[message.data.sequence] = message.data.suffixes;

            }

            this.#worker.addEventListener('message', listener, false);

            if (typeof onStart == 'function')
                onStart({ start: start });

            this.#worker.postMessage({
                text: text,

                K: this.#K,
                type: this.#type,

                CHARACTERS_TO_PADE: CHARACTERS_TO_PADE,
                CHARACTERS_TO_CHANGE: CHARACTERS_TO_CHANGE,

                refreshRate: refreshRate
            });
        })
    }

    predict({ start = /^[A-Z]/, size = 100 } = {}) {

        let n = -1, text = start;

        if (typeof start === 'string') {

            text = this.preprocess(text);
            n = text.split(this.type === 'chars' ? '' : ' ').length;
            if (n < this.K)
                start = new RegExp('^' + text);
        }

        if (start instanceof RegExp) {

            const sequences = Object.keys(this.sequences).filter(value => {
                return start.test(value);
            });

            text = sequences[Math.floor(Math.random() * sequences.length)];
            n = 0;
        }

        text = text.split(this.type === 'chars' ? '' : ' ').filter(value => { return value; });

        if (n == -1)
            n = text.length;

        for (let i = 0; i < size; i++) {

            const sequence = text.slice(-this.K).join(this.type === 'chars' ? '' : ' ');
            const suffixes = this.sequences[sequence];

            if (!suffixes) {

                console.warn('[' + PACKAGE_NAME + '] Chain has no connections.');
                return text.join(this.type === 'chars' ? '' : ' ').slice(n);
            }

            const random = Math.random() * Object.keys(suffixes).reduce((sum, suffix) => {
                return sum + suffixes[suffix];
            }, 0);

            Object.keys(suffixes).reduce((r, suffix) => {

                if (random < r)
                    return;

                r += suffixes[suffix];

                if (random < r)
                    text.push(suffix);

                return r;
            }, 0);
        }

        return text.slice(n, n + size);
    }

    preprocess(text) {

        for (const c in CHARACTERS_TO_CHANGE)
            text = text.split(c).join(CHARACTERS_TO_CHANGE[c]);

        if (this.type === 'words') {

            for (const c of CHARACTERS_TO_PADE)
                text = text.split(c).join(' ' + c + ' ');
        }

        return text.split(SEPARATORS[this.type]).filter(value => { return value }).join(SEPARATORS[this.type]);
    }
}