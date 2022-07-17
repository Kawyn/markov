/**
 * Multithreading implemetation of Markov Chain.
 */
class Markov {

    chain = {};

    #seperator; #length; threads;

    get seperator() {

        return this.#seperator;
    }

    get length() {

        return this.#length;
    }

    #workers = [];

    debug = false;

    /**
     * Creates a new Markov Chain.
     * @param {string} seperator Character or characters that separates a chain nodes.
     * @param {number} length Length of the chain.
     * @param {number} threads Number of threads.
     */
    constructor (seperator = '', length = 10, threads = 8) {

        this.#seperator = seperator;
        this.#length = Math.max(1, length);

        // Keeps threads in range <1, hardware limit>
        this.threads = Math.min(navigator.hardwareConcurrency, Math.max(1, threads));
    }

    /**
     * Train the chain with a sample. This function adds values to the existing chain.
     * @param {string} sample Training sample.
     * @param {function} onComplete This function calls it when training is complete.
     */
    train(sample, onComplete = null) {

        const input = sample.split(this.#seperator).filter(value => value);
        const batch = Math.floor(input.length / this.threads);

        // For debug purpose.
        const time = performance.now();

        if (this.debug) {

            console.log(`[MARKOV] Starting training`);
            console.log(`[MARKOV] Threads: ${this.threads}, Batch Size: ${batch}`);
        }

        // Creates workers for threads.
        for (let i = 0; i < this.threads; i++) {

            const worker = new Worker('./src/worker.js');

            worker.addEventListener('message', message => {

                const subtrain = (main, sub) => {

                    // Goes throught batch chain value.
                    for (let k in sub) {

                        // Node doesn't exist in main chain -> we can take full node from batch chain.
                        if (!main[k]) {

                            main[k] = sub[k];
                        }

                        else {

                            // We cannot go deeper so we just sum the probability.
                            if (typeof main[k] === 'number')
                                main[k] += sub[k];

                            // We are going deeper!
                            else
                                subtrain(main[k], sub[k]);
                        }
                    }
                }

                subtrain(this.chain, message.data.chain);

                this.#workers.splice(this.#workers.indexOf(worker), 1);

                if (this.debug)
                    console.log(`[MARKOV] Training progress: ${(this.threads - this.#workers.length) / this.threads * 100}%`);

                if (this.#workers.length === 0) {

                    if (this.debug)
                        console.log(`[MARKOV] Training complete in ${((performance.now() - time) / 1000).toFixed(2)}s`);

                    if (typeof onComplete === 'function')
                        onComplete();
                }

            }, false)

            worker.postMessage({
                input: input.slice(i * batch, Math.min((i + 1) * batch, input.length)),
                length: this.#length,
            });

            this.#workers.push(worker);
        }

        return this;
    }

    /**
     * Predict or Generate string using chain.
     * @param {number} length Length of prediction.
     * @param {string} start Starting value of prediction.
     * @param {number} alpha Number which determines the importance of probability. Greater values provide more importance to commoner nodes from samples.
     * @returns Newly prediction.
     */
    predict(length, { start = '', alpha = 1 } = {}) {

        // Throwing start to array.
        if (typeof start === 'string')
            start = start.split(this.#seperator);

        const result = start;

        // If start value is missing or too short, we are filling empty space with random values.
        while (result.length < this.#length - 1) {

            let c = this.chain;

            for (let w of result)
                c = c[w];

            const keys = Object.keys(c);
            result.push(keys[Math.floor(Math.random() * keys.length)]);
            length--; // also it counts to length.
        }

        for (let i = 0; i < length; i++) {

            let c = this.chain;

            // Finds right chain node.
            for (let j = 1; j < this.#length; j++)
                c = c[result[result.length - this.#length + j]];

            // Some shenanigans with randomness or probability.
            let sum = 0;

            for (let k in c)
                sum += c[k] * alpha;

            let target = Math.random() * sum;

            for (let k in c) {

                target -= c[k] * alpha;

                if (target <= 0) {

                    result.push(k);
                    break;
                }
            }
        }

        return result.join(this.#seperator);
    }

    /**
     * Clears existing chains to start anew.
     */
    clear() {

        this.chain = {};

        return this;
    }
}