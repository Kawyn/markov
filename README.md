# MARKOV

Multithreading implemetation of Markov Chain in JavaScript.

## Instalation

Simply put this in your html file.

```html
<script src="https://kawyn.github.io/markov/lib/main.min.js"></script>
```

## Setup

Create a new Markov Chain using:

```js
// Seperator is a character or characters that seperates chain's links.
// Length is a number which represent the depth of chain.
// Threads is a number which defines number of threads.
const markov = new Markov(seperator?, length?, threads?);
```

After creating Markov Chain you can train it using train function:

```js
markov.train(sample, callback?);
```

Then to generate text use:

```js
// Length is number of links to generate.
// Start is a starting sequence of output.
// Alpha is a number wchich defines the importance of probability (check how markov chains works).
markov.predict(length, {start, alpha}?);
```

## Template

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />

        <title>template</title>

        <script src="https://kawyn.github.io/markov/lib/main.min.js"></script>
        <script>
            const markov = new Markov();
        </script>
    </head>

    <body> </body>
</html>
```

## Examples

-   [LOTR (en)](https://kawyn.github.io/markov/docs/examples/the_lord_of_the_rings.html)
-   [Hrabia Monte Christo (pl)](https://kawyn.github.io/markov/docs/examples/hrabia_monte_christo.html)

## Docs

### Properties

`chain` - Chain of the Instance of Markov. <br />

`seperator` - Character or characters that seperates chain's links (readonly). <br />
`length` - Number which represent the depth of chain (readonly). <br />

`threads` - Number which defines number of threads. <br />

`debug` - Boolean which detemining displaying of progress. <br />

### Methods

`train(sample, callback)` - Train the chain with a sample. This function adds values to the existing chain. <br />
`predict(length, { start, alpha })` - Predict or Generate string using chain. <br />
`clear()` - Clears existing chains to start anew. <br />
