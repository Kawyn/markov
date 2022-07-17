/**
 * Worker for Markov. It creates chain from array.
 */
this.addEventListener('message', message => {

    const input = message.data.input;
    const chain = {};

    // We are going through array.
    for (let i = 0; i <= input.length - message.data.length; i++) {

        let depth = 0;

        let c = chain, w = input[i + depth];

        // Here, we are going deeper in chain e.g. root -> 'a' -> 'b' -> 'h'.
        while (depth !== message.data.length - 1) {

            if (!c[w])
                c[w] = {};

            c = c[w];

            depth++;

            w = input[i + depth];
        }

        // Counting number of occurrences.
        if (!c[w])
            c[w] = 0;

        c[w]++;
    }

    // Well boys. Worker is no more.
    postMessage({ chain: chain });
});