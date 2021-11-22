this.addEventListener('message', message => {

    var text = message.data.text;
    var progress = 0;

    for (const c in message.data.CHARACTERS_TO_CHANGE)
        text = text.split(c).join(message.data.CHARACTERS_TO_CHANGE[c]);

    if (message.data.type === 'words') {

        for (const c of message.data.CHARACTERS_TO_PADE)
            text = text.split(c).join(' ' + c + ' ');
    }

    const words = text.split(message.data.type === 'chars' ? '' : ' ').filter(value => { return value; });
    const sequences = {};

    const step = 100 / words.length;

    for (let i = 0; i <= words.length - message.data.K; i++) {

        const sequence = words.slice(i, i + message.data.K).join(message.data.type === 'chars' ? '' : ' ');

        if (!sequences.hasOwnProperty(sequence))
            sequences[sequence] = {};

        const suffix = words[i + message.data.K];

        if (suffix) {

            if (!sequences[sequence].hasOwnProperty(suffix))
                sequences[sequence][suffix] = 0;

            sequences[sequence][suffix] += 1;
        }

        progress += step;

        if (Math.ceil(progress) !== Math.ceil(progress - step) && Math.ceil(progress) % message.data.refreshRate === 0)
            this.postMessage({ progress: progress });
    }

    for (const sequence in sequences) {
        postMessage({
            sequence: sequence,
            suffixes: sequences[sequence]
        });
    }

    postMessage({ done: true });
});