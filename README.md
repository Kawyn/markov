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
// Sample is text which will be used to generate chain (this method adds links to existing chain).
// Callback called after training is done.
markov.train(sample, onComplete?);
```

Then to generate text use:

```js
// Length is number of links to generate.
// Start is a starting sequence of output.
// Alpha is a number wchich defines the importance of probability (check how markov chains works).
markov.predict(length, {start, alpha}?);
```

If you wish so, you can clear chain calling:
```js
markov.clear();
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

## Properties
| Property | Default Value | Description | 
| --- | :---: | --- |
| chain | Empty Object | Chain of the Instance of Markov. |
| seperator | C* | Character or characters that seperates chain's links (readonly). |
| length | C* | Number which represent the depth of chain (readonly). |
| threads | C* | Number which defines number of threads. |
| debug | false | Boolean which detemining displaying of progress. |

\*Defined in constructor.
