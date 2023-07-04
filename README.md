# Snowfall Sleet

<a href="https://nixos.wiki/wiki/Flakes" target="_blank">
	<img alt="Nix Flakes Ready" src="https://img.shields.io/static/v1?logo=nixos&logoColor=d8dee9&label=Nix%20Flakes&labelColor=5e81ac&message=Ready&color=d8dee9&style=for-the-badge">
</a>
<a href="https://github.com/snowfallorg/lib" target="_blank">
	<img alt="Built With Snowfall" src="https://img.shields.io/static/v1?label=Built%20With&labelColor=5e81ac&message=Snowfall&color=d8dee9&style=for-the-badge">
</a>

<p>
<!--
	This paragraph is not empty, it contains an em space (UTF-8 8195) on the next line in order
	to create a gap in the page.
-->
  
</p>

> A Nix parser written in TypeScript.

## Usage

### Lexer

To use the lexer, import the `Lexer` class and create a new instance.

```ts
import { Lexer } from "@snowfallorg/sleet";

const lexer = new Lexer();

const tokens = lexer.lex("let x = 4; in x");
```

### Parser

To use the parser, import the `Parser` class and create a new instance.

```ts
import { Parser } from "@snowfallorg/sleet";

const parser = new Parser();

const ast = parser.parse("let x = 4; in x");
```

## Implementation

This parser is not resilient. On any malformed input, Sleet will throw an error. This
may change in the future, but for now you should know that resilient parsing is not
a part of this library.
