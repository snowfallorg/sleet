export enum TokenKind {
	Eof = "Eof",
	Comment = "Comment",
	Null = "Null",
	Bool = "Bool",
	String = "String",
	Int = "Int",
	Float = "Float",
	Path = "Path",
	OpenParen = "OpenParen",
	CloseParen = "CloseParen",
	OpenCurly = "OpenCurly",
	CloseCurly = "CloseCurly",
	DollarCurly = "DollarCurly",
	OpenBracket = "OpenBracket",
	CloseBracket = "CloseBracket",
	Keyword = "Keyword",
	Operator = "Operator",
	Semi = "Semi",
	Identifier = "Identifier",
	NewLine = "NewLine",
	Has = "Has",
	At = "At",
	Colon = "Colon",
	Eq = "Eq",
	EqEq = "EqEq",
	NotEq = "NotEq",
	Not = "Not",
	Lt = "Lt",
	Lte = "Lte",
	Gt = "Gt",
	Gte = "Gte",
	Add = "Add",
	Sub = "Sub",
	Mul = "Mul",
	Div = "Div",
	Imp = "Imp",
	Update = "Update",
	Concat = "Concat",
	Or = "Or",
	And = "And",
	Period = "Period",
	Comma = "Comma",
	Ellipsis = "Ellipsis",
	Interp = "Interp",
}

export interface Location {
	start: { line: number; col: number };
	end: { line: number; col: number };
}

export interface BaseToken {
	kind: TokenKind;
	loc: Location;
}

export interface EofToken extends BaseToken {
	kind: TokenKind.Eof;
}

export interface CommentToken extends BaseToken {
	kind: TokenKind.Comment;
	value: string;
}

export interface NullToken extends BaseToken {
	kind: TokenKind.Null;
}

export interface BoolToken extends BaseToken {
	kind: TokenKind.Bool;
	value: boolean;
}

export interface StringToken extends BaseToken {
	kind: TokenKind.String;
	multiline: boolean;
	value: Array<string | InterpToken>;
}

export interface IntToken extends BaseToken {
	kind: TokenKind.Int;
	value: number;
}

export interface FloatToken extends BaseToken {
	kind: TokenKind.Float;
	value: number;
}

export interface PathToken extends BaseToken {
	kind: TokenKind.Path;
	value: string;
}

export interface OpenParenToken extends BaseToken {
	kind: TokenKind.OpenParen;
}

export interface CloseParenToken extends BaseToken {
	kind: TokenKind.CloseParen;
}

export interface OpenCurlyToken extends BaseToken {
	kind: TokenKind.OpenCurly;
}

export interface CloseCurlyToken extends BaseToken {
	kind: TokenKind.CloseCurly;
}

export interface DollarCurlyToken extends BaseToken {
	kind: TokenKind.DollarCurly;
}

export interface OpenBracketToken extends BaseToken {
	kind: TokenKind.OpenBracket;
}

export interface CloseBracketToken extends BaseToken {
	kind: TokenKind.CloseBracket;
}

export interface KeywordToken extends BaseToken {
	kind: TokenKind.Keyword;
	value: string;
}

export interface OperatorToken extends BaseToken {
	kind: TokenKind.Operator;
	value: string;
}

export interface SemiToken extends BaseToken {
	kind: TokenKind.Semi;
}

export interface IdentifierToken extends BaseToken {
	kind: TokenKind.Identifier;
	value: string;
}

export interface NewLineToken extends BaseToken {
	kind: TokenKind.NewLine;
}

export interface HasToken extends BaseToken {
	kind: TokenKind.Has;
}

export interface AtToken extends BaseToken {
	kind: TokenKind.At;
}

export interface ColonToken extends BaseToken {
	kind: TokenKind.Colon;
}

export interface EqToken extends BaseToken {
	kind: TokenKind.Eq;
}

export interface EqEqToken extends BaseToken {
	kind: TokenKind.EqEq;
}

export interface NotEqToken extends BaseToken {
	kind: TokenKind.NotEq;
}

export interface NotToken extends BaseToken {
	kind: TokenKind.Not;
}

export interface LtToken extends BaseToken {
	kind: TokenKind.Lt;
}

export interface LteToken extends BaseToken {
	kind: TokenKind.Lte;
}

export interface GtToken extends BaseToken {
	kind: TokenKind.Gt;
}

export interface GteToken extends BaseToken {
	kind: TokenKind.Gte;
}

export interface AddToken extends BaseToken {
	kind: TokenKind.Add;
}

export interface SubToken extends BaseToken {
	kind: TokenKind.Sub;
}

export interface MulToken extends BaseToken {
	kind: TokenKind.Mul;
}

export interface DivToken extends BaseToken {
	kind: TokenKind.Div;
}

export interface ImpToken extends BaseToken {
	kind: TokenKind.Imp;
}

export interface UpdateToken extends BaseToken {
	kind: TokenKind.Update;
}

export interface ConcatToken extends BaseToken {
	kind: TokenKind.Concat;
}

export interface OrToken extends BaseToken {
	kind: TokenKind.Or;
}

export interface AndToken extends BaseToken {
	kind: TokenKind.And;
}

export interface PeriodToken extends BaseToken {
	kind: TokenKind.Period;
}

export interface CommaToken extends BaseToken {
	kind: TokenKind.Comma;
}

export interface EllipsisToken extends BaseToken {
	kind: TokenKind.Ellipsis;
}

export interface InterpToken extends BaseToken {
	kind: TokenKind.Interp;
	value: Array<Token>;
}

export type Token =
	| EofToken
	| CommentToken
	| NullToken
	| BoolToken
	| StringToken
	| IntToken
	| FloatToken
	| PathToken
	| OpenParenToken
	| CloseParenToken
	| OpenCurlyToken
	| CloseCurlyToken
	| DollarCurlyToken
	| OpenBracketToken
	| CloseBracketToken
	| KeywordToken
	| OperatorToken
	| SemiToken
	| IdentifierToken
	| NewLineToken
	| HasToken
	| AtToken
	| ColonToken
	| EqToken
	| EqEqToken
	| NotEqToken
	| NotToken
	| LtToken
	| LteToken
	| GtToken
	| GteToken
	| AddToken
	| SubToken
	| MulToken
	| DivToken
	| ImpToken
	| UpdateToken
	| ConcatToken
	| OrToken
	| AndToken
	| PeriodToken
	| CommaToken
	| EllipsisToken
	| InterpToken;

export class Lexer {
	code = "";
	cursor = 0;
	line = 1;
	col = 1;
	tokens: Array<Token> = [];

	lex(code: string) {
		this.code = code;
		this.cursor = 0;
		this.line = 1;
		this.col = 1;
		this.tokens = [];

		while (this.cursor < this.code.length) {
			const token = this.lexToken();

			this.tokens.push(token);

			if (token.kind === TokenKind.Eof) {
				break;
			}
		}

		if (this.tokens.length === 0 || this.tokens[this.tokens.length - 1].kind !== TokenKind.Eof) {
			this.tokens.push(this.lexEofToken());
		}

		return this.tokens;
	}

	peek(offset = 0) {
		const cursor = this.cursor;
		const line = this.line;
		const col = this.col;

		this.cursor += offset;
		const char = this.consume();

		this.cursor = cursor;
		this.line = line;
		this.col = col;

		return char;
	}

	consume() {
		let char = this.code[this.cursor];

		this.cursor++;
		this.col++;

		if (char === "\r" && this.peek() === "\n") {
			// Windows is terrible...
			this.cursor++;
			char = "\r\n";
			this.line++;
			this.col = 1;
		} else if (char === "\n") {
			this.line++;
			this.col = 1;
		}

		return char;
	}

	lexToken(): Token {
		// Skip whitespace
		let char;
		while (this.cursor < this.code.length) {
			char = this.peek();

			if (char === "\n" || char === "\r\n" || !/\s/.test(char)) {
				break;
			}

			this.consume();
		}

		char = this.peek();

		if (
			char === "." &&
			(this.peek(1) === undefined || (this.peek(1) !== undefined && this.peek(1) !== "/" && this.peek(1) !== "."))
		) {
			return this.lexPeriod();
		}

		if (char === undefined) {
			return this.lexEofToken();
		}

		if (char === "\n" || char === "\r\n") {
			return this.lexNewLine();
		}

		if (char === ";") {
			return this.lexSemi();
		}

		if (char === "(") {
			return this.lexOpenParen();
		}

		if (char === ")") {
			return this.lexCloseParen();
		}

		if (char === "{") {
			return this.lexOpenCurly();
		}

		if (char === "}") {
			return this.lexCloseCurly();
		}

		if (char === "[") {
			return this.lexOpenBracket();
		}

		if (char === "]") {
			return this.lexCloseBracket();
		}

		if (char === "$" && this.peek(1) === "{") {
			return this.lexInterp();
		}

		if (this.isIdentStart(char)) {
			return this.lexIdent();
		}

		if (char === "." && this.cursor + 2 < this.code.length && this.peek(1) === "." && this.peek(2) === ".") {
			return this.lexOperator();
		}

		if (
			this.isPathStart(char) &&
			this.cursor + 1 < this.code.length &&
			this.isPath(this.peek(1)) &&
			`${char}${this.peek(1)}` != "//"
		) {
			return this.lexPath();
		}

		if (this.isNumberStart(char)) {
			return this.lexNumber();
		}

		if (this.isOperatorStart(char)) {
			return this.lexOperator();
		}

		if (char === '"' || (char === "'" && this.peek(1) === "'")) {
			return this.lexString();
		}

		if (char === "#") {
			return this.lexComment();
		}

		// We don't know what kind of token this is. Instead, stop lexing
		// and send back EOF. This should probably be made more resilient in
		// the future.
		return this.lexEofToken();
	}

	lexPeriod(): PeriodToken {
		const { line: startLine, col: startCol } = this;

		this.consume();

		const { line: endLine, col: endCol } = this;

		return {
			kind: TokenKind.Period,
			loc: {
				start: { line: startLine, col: startCol },
				end: { line: endLine, col: endCol },
			},
		};
	}

	lexNewLine(): NewLineToken {
		const { line: startLine, col: startCol } = this;

		this.consume();

		const { line: endLine, col: endCol } = this;

		return {
			kind: TokenKind.NewLine,
			loc: {
				start: { line: startLine, col: startCol },
				end: { line: endLine, col: endCol },
			},
		};
	}

	lexEofToken(): EofToken {
		this.consume();

		return {
			kind: TokenKind.Eof,
			loc: {
				start: { line: this.line, col: this.col },
				end: { line: this.line, col: this.col },
			},
		};
	}

	lexSemi(): SemiToken {
		const { line: startLine, col: startCol } = this;

		this.consume();

		const { line: endLine, col: endCol } = this;

		return {
			kind: TokenKind.Semi,
			loc: {
				start: { line: startLine, col: startCol },
				end: { line: endLine, col: endCol },
			},
		};
	}

	lexOpenParen(): OpenParenToken {
		const { line: startLine, col: startCol } = this;

		this.consume();

		const { line: endLine, col: endCol } = this;

		return {
			kind: TokenKind.OpenParen,
			loc: {
				start: { line: startLine, col: startCol },
				end: { line: endLine, col: endCol },
			},
		};
	}

	lexCloseParen(): CloseParenToken {
		const { line: startLine, col: startCol } = this;

		this.consume();

		const { line: endLine, col: endCol } = this;

		return {
			kind: TokenKind.CloseParen,
			loc: {
				start: { line: startLine, col: startCol },
				end: { line: endLine, col: endCol },
			},
		};
	}

	lexOpenCurly(): OpenCurlyToken {
		const { line: startLine, col: startCol } = this;

		this.consume();

		const { line: endLine, col: endCol } = this;

		return {
			kind: TokenKind.OpenCurly,
			loc: {
				start: { line: startLine, col: startCol },
				end: { line: endLine, col: endCol },
			},
		};
	}

	lexCloseCurly(): CloseCurlyToken {
		const { line: startLine, col: startCol } = this;

		this.consume();

		const { line: endLine, col: endCol } = this;

		return {
			kind: TokenKind.CloseCurly,
			loc: {
				start: { line: startLine, col: startCol },
				end: { line: endLine, col: endCol },
			},
		};
	}

	lexOpenBracket(): OpenBracketToken {
		const { line: startLine, col: startCol } = this;

		this.consume();

		const { line: endLine, col: endCol } = this;

		return {
			kind: TokenKind.OpenBracket,
			loc: {
				start: { line: startLine, col: startCol },
				end: { line: endLine, col: endCol },
			},
		};
	}

	lexCloseBracket(): CloseBracketToken {
		const { line: startLine, col: startCol } = this;

		this.consume();

		const { line: endLine, col: endCol } = this;

		return {
			kind: TokenKind.CloseBracket,
			loc: {
				start: { line: startLine, col: startCol },
				end: { line: endLine, col: endCol },
			},
		};
	}

	isIdentStart(char: string): boolean {
		return /[a-zA-Z_]/.test(char);
	}

	isIdent(char: string): boolean {
		return /[a-zA-Z0-9_'\-]/.test(char);
	}

	lexIdent(): IdentifierToken | KeywordToken | NullToken | BoolToken {
		const { line: startLine, col: startCol } = this;
		let chars = this.consume();

		while (this.cursor < this.code.length && this.isIdent(this.peek())) {
			chars += this.consume();
		}

		const { line: endLine, col: endCol } = this;

		switch (chars) {
			case "null":
				return {
					kind: TokenKind.Null,
					loc: {
						start: { line: startLine, col: startCol },
						end: { line: endLine, col: endCol },
					},
				};
			case "true":
				return {
					kind: TokenKind.Bool,
					value: true,
					loc: {
						start: { line: startLine, col: startCol },
						end: { line: endLine, col: endCol },
					},
				};
			case "false":
				return {
					kind: TokenKind.Bool,
					value: false,
					loc: {
						start: { line: startLine, col: startCol },
						end: { line: endLine, col: endCol },
					},
				};
			case "let":
			case "in":
			case "rec":
			case "with":
			case "inherit":
			case "assert":
			case "or":
			case "import":
			case "if":
			case "then":
			case "else":
				return {
					kind: TokenKind.Keyword,
					value: chars,
					loc: {
						start: { line: startLine, col: startCol },
						end: { line: endLine, col: endCol },
					},
				};
			default:
				return {
					kind: TokenKind.Identifier,
					value: chars,
					loc: {
						start: { line: startLine, col: startCol },
						end: { line: endLine, col: endCol },
					},
				};
		}
	}

	isPathStart(char: string): boolean {
		return char === "." || char === "/" || char === "~";
	}

	isPath(char: string): boolean {
		return /[A-Za-z0-9_@\.\-\$\/\~]/.test(char);
	}

	lexPath(): PathToken {
		const { line: startLine, col: startCol } = this;

		let path = this.consume();

		const { line: endLine, col: endCol } = this;

		while (this.cursor < this.code.length) {
			let char = this.peek();

			if (char === "\\") {
				this.consume();
				path += this.consume();
				continue;
			}

			if (this.isPath(char)) {
				path += this.consume();
			} else {
				break;
			}
		}

		return {
			kind: TokenKind.Path,
			value: path,
			loc: {
				start: { line: startLine, col: startCol },
				end: { line: endLine, col: endCol },
			},
		};
	}

	isNumberStart(char: string): boolean {
		return /[0-9]/.test(char);
	}

	isNumber(char: string): boolean {
		return /[0-9]/.test(char);
	}

	lexNumber(): IntToken | FloatToken {
		const { line: startLine, col: startCol } = this;

		let number = this.consume();
		let isFloat = false;

		const { line: endLine, col: endCol } = this;

		while (this.cursor < this.code.length) {
			let char = this.peek();

			if (char === "." && this.isNumber(this.peek(1))) {
				number += this.consume();
				isFloat = true;
				continue;
			}

			if (this.isNumber(char)) {
				number += this.consume();
			} else {
				break;
			}
		}

		return {
			kind: isFloat ? TokenKind.Float : TokenKind.Int,
			value: Number(number),
			loc: {
				start: { line: startLine, col: startCol },
				end: { line: endLine, col: endCol },
			},
		};
	}

	isOperatorStart(char: string): boolean {
		return ["=", "!", "+", "-", "*", "/", "<", ">", ":", "@", ".", ",", "?", "|", "&"].includes(char);
	}

	isOperator(text: string): boolean {
		return [
			"=",
			"==",
			"!=",
			"!",
			"+",
			"-",
			"*",
			"/",
			"->",
			"//",
			"++",
			"<",
			">",
			":",
			"@",
			"..", // This is terrible, but...
			"...",
			",",
			"?",
			"<=",
			">=",
			"||",
			"&&",
		].includes(text);
	}

	lexOperator():
		| HasToken
		| AtToken
		| ColonToken
		| EqToken
		| EqEqToken
		| NotEqToken
		| NotToken
		| LtToken
		| LteToken
		| GtToken
		| GteToken
		| AddToken
		| SubToken
		| MulToken
		| DivToken
		| ImpToken
		| UpdateToken
		| ConcatToken
		| OrToken
		| AndToken
		| CommaToken
		| EllipsisToken {
		const start = this.cursor;
		const { line: startLine, col: startCol } = this;

		let operator = this.consume();

		while (this.cursor < this.code.length && this.isOperator(operator + this.peek())) {
			operator += this.consume();
		}

		const end = this.cursor;
		const { line: endLine, col: endCol } = this;

		const loc = {
			start: { line: startLine, col: startCol },
			end: { line: endLine, col: endCol },
		};

		switch (operator) {
			case "?":
				return {
					kind: TokenKind.Has,
					loc,
				};
			case "@":
				return {
					kind: TokenKind.At,
					loc,
				};
			case ":":
				return {
					kind: TokenKind.Colon,
					loc,
				};
			case "=":
				return {
					kind: TokenKind.Eq,
					loc,
				};
			case "==":
				return {
					kind: TokenKind.EqEq,
					loc,
				};
			case "!=":
				return {
					kind: TokenKind.NotEq,
					loc,
				};
			case "!":
				return {
					kind: TokenKind.Not,
					loc,
				};
			case "<":
				return {
					kind: TokenKind.Lt,
					loc,
				};
			case ">":
				return {
					kind: TokenKind.Gt,
					loc,
				};
			case "+":
				return {
					kind: TokenKind.Add,
					loc,
				};
			case "-":
				return {
					kind: TokenKind.Sub,
					loc,
				};
			case "*":
				return {
					kind: TokenKind.Mul,
					loc,
				};
			case "/":
				return {
					kind: TokenKind.Div,
					loc,
				};
			case "->":
				return {
					kind: TokenKind.Imp,
					loc,
				};
			case "++":
				return {
					kind: TokenKind.Concat,
					loc,
				};
			case ",":
				return {
					kind: TokenKind.Comma,
					loc,
				};
			case "...":
				return {
					kind: TokenKind.Ellipsis,
					loc,
				};
			case "//":
				return {
					kind: TokenKind.Update,
					loc,
				};
			case "||":
				return {
					kind: TokenKind.Or,
					loc,
				};
			case "&&":
				return {
					kind: TokenKind.And,
					loc,
				};
		}

		console.log(this.code.substring(start - 10, end + 10));

		throw new Error(`Unknown operator: ${operator}`);
	}

	lexInterp(): InterpToken {
		const { line: startLine, col: startCol } = this;

		this.consume();
		this.consume();

		let depth = 0;
		const tokens: Array<Token> = [];

		while (this.cursor < this.code.length) {
			const token = this.lexToken();

			if (token.kind === TokenKind.OpenCurly) {
				depth++;
			}

			if (token.kind === TokenKind.CloseCurly) {
				depth--;
			}

			if (depth === -1) {
				break;
			}

			tokens.push(token);
		}

		const { line: endLine, col: endCol } = this;

		return {
			kind: TokenKind.Interp,
			value: tokens,
			loc: {
				start: { line: startLine, col: startCol },
				end: { line: endLine, col: endCol },
			},
		};
	}

	lexString(): StringToken {
		const { line: startLine, col: startCol } = this;

		const multiline = this.peek() === "'";
		const parts: StringToken["value"] = [""];

		this.consume();

		if (multiline) {
			this.consume();
		}

		while (this.cursor < this.code.length) {
			if (multiline && this.peek() === "'" && this.peek(1) === "'") {
				this.consume();
				this.consume();
				break;
			}

			if (!multiline && this.peek() === '"') {
				this.consume();
				break;
			}

			const char = this.peek();

			if (char === "\\") {
				this.consume();
				parts[parts.length - 1] = parts[parts.length - 1] + this.consume();
				continue;
			}

			if (char === "$" && this.peek(1) === "{") {
				const interp = this.lexInterp();

				parts.push(interp);
				parts.push("");

				continue;
			}

			parts[parts.length - 1] = parts[parts.length - 1] + this.consume();
		}

		const { line: endLine, col: endCol } = this;

		return {
			kind: TokenKind.String,
			multiline,
			value: parts,
			loc: {
				start: { line: startLine, col: startCol },
				end: { line: endLine, col: endCol },
			},
		};
	}

	lexComment(): CommentToken {
		const { line: startLine, col: startCol } = this;

		let comment = "";

		this.consume();

		while (
			this.cursor < this.code.length &&
			!(this.peek() === "\n") &&
			!(this.peek() === "\r" && this.peek(1) === "\n")
		) {
			comment += this.consume();
		}

		const { line: endLine, col: endCol } = this;

		return {
			kind: TokenKind.Comment,
			value: comment,
			loc: {
				start: { line: startLine, col: startCol },
				end: { line: endLine, col: endCol },
			},
		};
	}
}

export default new Lexer();
