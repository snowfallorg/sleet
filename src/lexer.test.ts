import fs from "fs";
import path from "path";
import { describe, it, expect, beforeEach } from "vitest";
import { Lexer, Token, TokenKind } from "./lexer";

const expectKind = <K extends TokenKind, T extends Extract<Token, { kind: K }>>(
	token: Token,
	kind: K,
	options: Partial<Omit<T, "kind">> = {}
) => {
	expect(token).toMatchObject(
		expect.objectContaining({
			kind,
			...options,
		})
	);
};

describe("Lexer", () => {
	let lexer: Lexer;

	beforeEach(() => {
		lexer = new Lexer();
	});

	describe("Raw Tokens", () => {
		describe("Basic", () => {
			it("should lex eof", () => {
				const tokens = lexer.lex("");

				expect(tokens.length).toBe(1);
				expectKind(tokens[0], TokenKind.Eof);
			});

			it("should lex new lines", () => {
				const tokens = lexer.lex("\n\r\n\n");

				expect(tokens.length).toBe(4);
				expectKind(tokens[0], TokenKind.NewLine);
				expectKind(tokens[1], TokenKind.NewLine);
				expectKind(tokens[2], TokenKind.NewLine);
				expectKind(tokens[3], TokenKind.Eof);
			});

			it("should lex semicolons", () => {
				const tokens = lexer.lex(";");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.Semi);
				expectKind(tokens[1], TokenKind.Eof);
			});
		});

		describe("Grouping", () => {
			it("should lex parens", () => {
				const tokens = lexer.lex("()");

				expect(tokens.length).toBe(3);
				expectKind(tokens[0], TokenKind.OpenParen);
				expectKind(tokens[1], TokenKind.CloseParen);
				expectKind(tokens[2], TokenKind.Eof);
			});

			it("should lex curly", () => {
				const tokens = lexer.lex("{}");

				expect(tokens.length).toBe(3);
				expectKind(tokens[0], TokenKind.OpenCurly);
				expectKind(tokens[1], TokenKind.CloseCurly);
				expectKind(tokens[2], TokenKind.Eof);
			});

			it("should lex bracket", () => {
				const tokens = lexer.lex("[]");

				expect(tokens.length).toBe(3);
				expectKind(tokens[0], TokenKind.OpenBracket);
				expectKind(tokens[1], TokenKind.CloseBracket);
				expectKind(tokens[2], TokenKind.Eof);
			});
		});

		describe("Literal Values", () => {
			it("should lex null", () => {
				const tokens = lexer.lex("null");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.Null);
				expectKind(tokens[1], TokenKind.Eof);
			});

			it("should lex true", () => {
				const tokens = lexer.lex("true");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.Bool, {
					value: true,
				});
				expectKind(tokens[1], TokenKind.Eof);
			});

			it("should lex false", () => {
				const tokens = lexer.lex("false");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.Bool, {
					value: false,
				});
				expectKind(tokens[1], TokenKind.Eof);
			});
		});

		describe("Keywords & Identifiers", () => {
			it("should lex let-in", () => {
				const tokens = lexer.lex("let in");

				expect(tokens.length).toBe(3);
				expectKind(tokens[0], TokenKind.Keyword, {
					value: "let",
				});
				expectKind(tokens[1], TokenKind.Keyword, {
					value: "in",
				});
				expectKind(tokens[2], TokenKind.Eof);
			});

			it("should lex with", () => {
				const tokens = lexer.lex("with");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.Keyword, {
					value: "with",
				});
				expectKind(tokens[1], TokenKind.Eof);
			});

			it("should lex inherit", () => {
				const tokens = lexer.lex("inherit");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.Keyword, {
					value: "inherit",
				});
				expectKind(tokens[1], TokenKind.Eof);
			});

			it("should lex assert", () => {
				const tokens = lexer.lex("assert");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.Keyword, {
					value: "assert",
				});
				expectKind(tokens[1], TokenKind.Eof);
			});

			it("should lex identifiers", () => {
				const tokens = lexer.lex("builtins");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.Identifier, {
					value: "builtins",
				});
				expectKind(tokens[1], TokenKind.Eof);
			});

			it("should lex kebab identifiers", () => {
				const tokens = lexer.lex("some-thing");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.Identifier, {
					value: "some-thing",
				});
				expectKind(tokens[1], TokenKind.Eof);
			});
		});

		describe("Paths", () => {
			it("should lex absolute path", () => {
				const tokens = lexer.lex("/a/b/c");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.Path, {
					value: "/a/b/c",
				});
				expectKind(tokens[1], TokenKind.Eof);
			});

			it("should lex escaped absolute path", () => {
				const tokens = lexer.lex("/a\\;/b\\ c/d");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.Path, {
					value: "/a;/b c/d",
				});
				expectKind(tokens[1], TokenKind.Eof);
			});

			it("should lex complex absolute path", () => {
				const tokens = lexer.lex("/a/@b/c.xyz/something_else.txt/0000-21.md");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.Path, {
					value: "/a/@b/c.xyz/something_else.txt/0000-21.md",
				});
				expectKind(tokens[1], TokenKind.Eof);
			});

			it("should lex relative path", () => {
				const tokens = lexer.lex("./a/b/c");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.Path, {
					value: "./a/b/c",
				});
				expectKind(tokens[1], TokenKind.Eof);
			});

			it("should lex escaped relative path", () => {
				const tokens = lexer.lex("./a\\;/b\\ c/d");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.Path, {
					value: "./a;/b c/d",
				});
				expectKind(tokens[1], TokenKind.Eof);
			});

			it("should lex complex relative path", () => {
				const tokens = lexer.lex("./a/@b/c.xyz/something_else.txt/0000-21.md");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.Path, {
					value: "./a/@b/c.xyz/something_else.txt/0000-21.md",
				});
				expectKind(tokens[1], TokenKind.Eof);
			});

			it("should lex home path", () => {
				const tokens = lexer.lex("~/a/b/c");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.Path, {
					value: "~/a/b/c",
				});
				expectKind(tokens[1], TokenKind.Eof);
			});

			it("should lex escaped home path", () => {
				const tokens = lexer.lex("~/a\\;/b\\ c/d");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.Path, {
					value: "~/a;/b c/d",
				});
				expectKind(tokens[1], TokenKind.Eof);
			});

			it("should lex complex home path", () => {
				const tokens = lexer.lex("~/a/@b/c.xyz/something_else.txt/0000-21.md");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.Path, {
					value: "~/a/@b/c.xyz/something_else.txt/0000-21.md",
				});
				expectKind(tokens[1], TokenKind.Eof);
			});
		});

		describe("Numbers", () => {
			it("should lex integers", () => {
				const tokens = lexer.lex("42");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.Int, {
					value: 42,
				});
				expectKind(tokens[1], TokenKind.Eof);
			});

			it("should lex floats", () => {
				const tokens = lexer.lex("3.14");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.Float, {
					value: 3.14,
				});
				expectKind(tokens[1], TokenKind.Eof);
			});
		});

		describe("Operators", () => {
			it("should lex eq", () => {
				const tokens = lexer.lex("=");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.Eq);
				expectKind(tokens[1], TokenKind.Eof);
			});

			it("should lex eqeq", () => {
				const tokens = lexer.lex("==");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.EqEq);
				expectKind(tokens[1], TokenKind.Eof);
			});

			it("should lex noteq", () => {
				const tokens = lexer.lex("!=");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.NotEq);
				expectKind(tokens[1], TokenKind.Eof);
			});

			it("should lex not", () => {
				const tokens = lexer.lex("!");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.Not);
				expectKind(tokens[1], TokenKind.Eof);
			});

			it("should lex lt", () => {
				const tokens = lexer.lex("<");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.Lt);
				expectKind(tokens[1], TokenKind.Eof);
			});

			it("should lex gt", () => {
				const tokens = lexer.lex(">");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.Gt);
				expectKind(tokens[1], TokenKind.Eof);
			});

			it("should lex add", () => {
				const tokens = lexer.lex("+");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.Add);
				expectKind(tokens[1], TokenKind.Eof);
			});

			it("should lex sub", () => {
				const tokens = lexer.lex("-");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.Sub);
				expectKind(tokens[1], TokenKind.Eof);
			});

			it("should lex mul", () => {
				const tokens = lexer.lex("*");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.Mul);
				expectKind(tokens[1], TokenKind.Eof);
			});

			it("should lex div", () => {
				const tokens = lexer.lex("/");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.Div);
				expectKind(tokens[1], TokenKind.Eof);
			});

			it("should lex imp", () => {
				const tokens = lexer.lex("->");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.Imp);
				expectKind(tokens[1], TokenKind.Eof);
			});

			it("should lex sub", () => {
				const tokens = lexer.lex("++");

				expect(tokens.length).toBe(2);
				expectKind(tokens[0], TokenKind.Concat);
				expectKind(tokens[1], TokenKind.Eof);
			});
		});
	});

	describe("Strings", () => {
		it("should lex string", () => {
			const tokens = lexer.lex(`"hello world!"`);

			expect(tokens.length).toBe(2);
			expectKind(tokens[0], TokenKind.String, {
				multiline: false,
				value: ["hello world!"],
			});
			expectKind(tokens[1], TokenKind.Eof);
		});

		it("should lex multiline string", () => {
			const tokens = lexer.lex(`''hello world!''`);

			expect(tokens.length).toBe(2);
			expectKind(tokens[0], TokenKind.String, {
				multiline: true,
				value: ["hello world!"],
			});
			expectKind(tokens[1], TokenKind.Eof);
		});

		it("should lex multiline string with new line", () => {
			const tokens = lexer.lex(`''\n\thello world!\n''`);

			expect(tokens.length).toBe(2);
			expectKind(tokens[0], TokenKind.String, {
				multiline: true,
				value: ["\n\thello world!\n"],
			});
			expectKind(tokens[1], TokenKind.Eof);
		});

		it("should lex interpolated string", () => {
			const tokens = lexer.lex('"number ${1}"');

			expect(tokens.length).toBe(2);
			expectKind(tokens[0], TokenKind.String, {
				multiline: false,
				value: [
					"number ",
					expect.objectContaining({
						kind: TokenKind.Interp,
						value: [
							expect.objectContaining({
								kind: TokenKind.Int,
								value: 1,
							}),
						],
					}),
					"",
				],
			});
			expectKind(tokens[1], TokenKind.Eof);
		});

		it("should lex multiple interpolated string", () => {
			const tokens = lexer.lex('"number ${1} ${2}"');

			expect(tokens.length).toBe(2);
			expectKind(tokens[0], TokenKind.String, {
				multiline: false,
				value: [
					"number ",
					expect.objectContaining({
						kind: TokenKind.Interp,
						value: [
							expect.objectContaining({
								kind: TokenKind.Int,
								value: 1,
							}),
						],
					}),
					" ",
					expect.objectContaining({
						kind: TokenKind.Interp,
						value: [
							expect.objectContaining({
								kind: TokenKind.Int,
								value: 2,
							}),
						],
					}),
					"",
				],
			});
			expectKind(tokens[1], TokenKind.Eof);
		});

		it("should lex nested interpolated string", () => {
			const tokens = lexer.lex('"hello ${"world ${"!"}"}"');

			expect(tokens.length).toBe(2);
			expectKind(tokens[0], TokenKind.String, {
				multiline: false,
				value: [
					"hello ",
					expect.objectContaining({
						kind: TokenKind.Interp,
						value: [
							expect.objectContaining({
								kind: TokenKind.String,
								value: [
									"world ",
									expect.objectContaining({
										kind: TokenKind.Interp,
										value: [
											expect.objectContaining({
												kind: TokenKind.String,
												value: ["!"],
											}),
										],
									}),
									"",
								],
							}),
						],
					}),
					"",
				],
			});
			expectKind(tokens[1], TokenKind.Eof);
		});
	});

	describe("Comments", () => {
		it("should lex comments", () => {
			const tokens = lexer.lex(`# asdf`);

			expect(tokens.length).toBe(2);
			expectKind(tokens[0], TokenKind.Comment, {
				value: " asdf",
				multiline: false,
			});
			expectKind(tokens[1], TokenKind.Eof);
		});

		it("should lex multiline comments", () => {
			const tokens = lexer.lex(`/* asdf */`);

			console.log(tokens);
			expect(tokens.length).toBe(2);
			expectKind(tokens[0], TokenKind.Comment, {
				value: " asdf ",
				multiline: true,
			});
			expectKind(tokens[1], TokenKind.Eof);
		});
	});

	describe("Samples", () => {
		it("Lexes quartz.nix", () => {
			const code = fs.readFileSync(path.resolve(__dirname, "__test__", "samples", "quartz.nix"), {
				encoding: "utf8",
			});

			const tokens = lexer.lex(code);

			expect(tokens).toMatchSnapshot();
		});

		it("Lexes wallpapers.nix", () => {
			const code = fs.readFileSync(path.resolve(__dirname, "__test__", "samples", "wallpapers.nix"), {
				encoding: "utf8",
			});

			const tokens = lexer.lex(code);

			expect(tokens).toMatchSnapshot();
		});

		it("Lexes network.nix", () => {
			const code = fs.readFileSync(path.resolve(__dirname, "__test__", "samples", "network.nix"), {
				encoding: "utf8",
			});

			const tokens = lexer.lex(code);

			expect(tokens).toMatchSnapshot();
		});
	});
});
