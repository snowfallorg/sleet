import {
	BoolToken,
	FloatToken,
	IntToken,
	InterpToken,
	KeywordToken,
	Lexer,
	Location,
	NullToken,
	PathToken,
	StringToken,
	Token,
	TokenKind,
} from "./lexer";

export enum NodeKind {
	Root = "Root",
	Comment = "Comment",
	Expr = "Expr",
	BinaryExpr = "BinaryExpr",
	SubExpr = "SubExpr",
	Conditional = "Conditional",
	Modifier = "Modifier",
	LetIn = "LetIn",
	Import = "Import",
	Fallback = "Fallback",
	Identifier = "Identifier",
	Null = "Null",
	Int = "Int",
	Float = "Float",
	Bool = "Bool",
	String = "String",
	Path = "Path",
	Attrs = "Attrs",
	Attr = "Attr",
	List = "List",
	Fn = "Fn",
	FnParams = "FnParams",
	FnParam = "FnParam",
	FnCall = "FnCall",
	Has = "Has",
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
	Interp = "Interp",
}

export interface BaseNode {
	kind: NodeKind;
	loc: Location;
}

export interface RootNode extends BaseNode {
	kind: NodeKind.Root;
	value: ExprNode;
}

export interface CommentNode extends BaseNode {
	kind: NodeKind.Comment;
	value: string;
}

export interface ExprNode extends BaseNode {
	kind: NodeKind.Expr;
	value: SubExprNode | BinaryExprNode;
}

export interface BinaryExprNode extends BaseNode {
	kind: NodeKind.BinaryExpr;
	op:
		| HasNode
		| EqNode
		| EqEqNode
		| NotEqNode
		| NotNode
		| LtNode
		| LteNode
		| GtNode
		| GteNode
		| AddNode
		| SubNode
		| MulNode
		| DivNode
		| ImpNode
		| UpdateNode
		| ConcatNode
		| OrNode
		| AndNode
		| PeriodNode
		| FallbackNode;
	left: SubExprNode | BinaryExprNode;
	right: SubExprNode | BinaryExprNode;
}

export interface SubExprNode extends BaseNode {
	kind: NodeKind.SubExpr;
	value: ValueNode | ExprNode;
	comments: {
		before: Array<CommentNode>;
		after: Array<CommentNode>;
	};
	modifiers: Array<ModifierNode>;
}

export interface WithModifierNode extends BaseNode {
	kind: NodeKind.Modifier;
	action: "with";
	value: ExprNode;
}

export interface AssertModifierNode extends BaseNode {
	kind: NodeKind.Modifier;
	action: "assert";
	value: ExprNode;
}

export type ModifierNode = WithModifierNode | AssertModifierNode;

export interface ConditionalNode extends BaseNode {
	kind: NodeKind.Conditional;
	condition: ExprNode;
	then: ExprNode;
	else: ExprNode;
}

export interface InterpNode extends BaseNode {
	kind: NodeKind.Interp;
	value: ExprNode;
}

export interface LetInNode extends BaseNode {
	kind: NodeKind.LetIn;
	bindings: Array<AttrNode>;
	body: ExprNode;
}

export interface ImportNode extends BaseNode {
	kind: NodeKind.Import;
	value: ExprNode;
}

export interface FallbackNode extends BaseNode {
	kind: NodeKind.Fallback;
}

export interface IdentifierNode extends BaseNode {
	kind: NodeKind.Identifier;
	value: Array<string | StringNode | InterpNode>;
	comments?: Array<CommentNode>;
}

export interface NullNode extends BaseNode {
	kind: NodeKind.Null;
}

export interface IntNode extends BaseNode {
	kind: NodeKind.Int;
	value: Number;
}

export interface FloatNode extends BaseNode {
	kind: NodeKind.Float;
	value: Number;
}

export interface BoolNode extends BaseNode {
	kind: NodeKind.Bool;
	value: boolean;
}

export interface StringNode extends BaseNode {
	kind: NodeKind.String;
	multiline: boolean;
	value: Array<string | InterpNode>;
}

export interface PathNode extends BaseNode {
	kind: NodeKind.Path;
	value: string;
}

export interface AttrsNode extends BaseNode {
	kind: NodeKind.Attrs;
	recursive: boolean;
	value: Array<AttrNode>;
}

export interface AttrBinding extends BaseNode {
	name: IdentifierNode;
	value: ExprNode;
	comments: Array<CommentNode>;
}

export const isAttrBinding = (node: AttrNode): node is AttrBinding & AttrNode => {
	return node.hasOwnProperty("name");
};

export interface InheritBinding extends BaseNode {
	from?: ExprNode;
	value: Array<IdentifierNode>;
	comments: Array<CommentNode>;
}

export const isInheritBinding = (node: AttrNode): node is InheritBinding & AttrNode => {
	return !isAttrBinding(node);
};

export type AttrNode = BaseNode & {
	kind: NodeKind.Attr;
} & (AttrBinding | InheritBinding);

export interface ListNode extends BaseNode {
	kind: NodeKind.List;
	value: Array<ExprNode>;
}

export interface FnNode extends BaseNode {
	kind: NodeKind.Fn;
	args: FnParamsNode;
	body: ExprNode;
}

export type IdentifierFnParams = {
	name: IdentifierNode;
};

export const isIdentifierFnParams = (node: FnParamsNode): node is IdentifierFnParams & FnParamsNode => {
	return node.hasOwnProperty("name");
};

export type DestructuredFnParams = {
	as?: IdentifierNode;
	value: Array<FnParamNode>;
	extra: boolean;
};

export const isDestructuredFnParams = (node: FnParamsNode): node is DestructuredFnParams & FnParamsNode => {
	return node.hasOwnProperty("value");
};

export type FnParamsNode = BaseNode & {
	kind: NodeKind.FnParams;
} & (IdentifierFnParams | DestructuredFnParams);

export interface FnParamNode extends BaseNode {
	kind: NodeKind.FnParam;
	name: IdentifierNode;
	default?: ExprNode;
}

export interface FnCallNode extends BaseNode {
	kind: NodeKind.FnCall;
	name: ValueNode | ExprNode;
	value: Array<ExprNode>;
}

export interface HasNode extends BaseNode {
	kind: NodeKind.Has;
}

export interface EqNode extends BaseNode {
	kind: NodeKind.Eq;
}

export interface EqEqNode extends BaseNode {
	kind: NodeKind.EqEq;
}

export interface NotEqNode extends BaseNode {
	kind: NodeKind.NotEq;
}

export interface NotNode extends BaseNode {
	kind: NodeKind.Not;
}

export interface LtNode extends BaseNode {
	kind: NodeKind.Lt;
}

export interface LteNode extends BaseNode {
	kind: NodeKind.Lte;
}

export interface GtNode extends BaseNode {
	kind: NodeKind.Gt;
}

export interface GteNode extends BaseNode {
	kind: NodeKind.Gte;
}

export interface AddNode extends BaseNode {
	kind: NodeKind.Add;
}

export interface SubNode extends BaseNode {
	kind: NodeKind.Sub;
}

export interface MulNode extends BaseNode {
	kind: NodeKind.Mul;
}

export interface DivNode extends BaseNode {
	kind: NodeKind.Div;
}

export interface ImpNode extends BaseNode {
	kind: NodeKind.Imp;
}

export interface UpdateNode extends BaseNode {
	kind: NodeKind.Update;
}

export interface ConcatNode extends BaseNode {
	kind: NodeKind.Concat;
}

export interface OrNode extends BaseNode {
	kind: NodeKind.Or;
}

export interface AndNode extends BaseNode {
	kind: NodeKind.And;
}

export interface PeriodNode extends BaseNode {
	kind: NodeKind.Period;
}

export type ValueNode =
	| IntNode
	| FloatNode
	| StringNode
	| InterpNode
	| BoolNode
	| AttrsNode
	| ListNode
	| FnNode
	| FnCallNode
	| PathNode
	| IdentifierNode
	| LetInNode
	| ImportNode
	| NullNode
	| ConditionalNode;

export type AstNode =
	| RootNode
	| CommentNode
	| PathNode
	| ModifierNode
	| IdentifierNode
	| LetInNode
	| ExprNode
	| FnNode
	| FnParamsNode
	| FnParamNode
	| FnCallNode
	| BinaryExprNode
	| SubExprNode
	| IntNode
	| FloatNode
	| StringNode
	| BoolNode
	| AttrsNode
	| AttrNode
	| ListNode
	| HasNode
	| EqNode
	| EqEqNode
	| NotEqNode
	| NotNode
	| LtNode
	| LteNode
	| GtNode
	| GteNode
	| AddNode
	| SubNode
	| MulNode
	| DivNode
	| ImpNode
	| UpdateNode
	| ConcatNode
	| OrNode
	| AndNode
	| PeriodNode
	| InterpNode
	| ImportNode
	| NullNode
	| FallbackNode
	| ConditionalNode;

enum ParserState {
	Default = "Default",
}

// https://nixos.org/manual/nix/unstable/language/operators.html
export const precedence = {
	[TokenKind.Period]: 1,
	[TokenKind.Has]: 4,
	[TokenKind.Concat]: 5,
	[TokenKind.Mul]: 6,
	[TokenKind.Div]: 6,
	[TokenKind.Sub]: 7,
	[TokenKind.Add]: 7,
	[TokenKind.Update]: 9,
	[TokenKind.Lt]: 10,
	[TokenKind.Lte]: 10,
	[TokenKind.Gt]: 10,
	[TokenKind.Gte]: 10,
	[TokenKind.EqEq]: 11,
	[TokenKind.NotEq]: 11,
	[TokenKind.And]: 12,
	[TokenKind.Or]: 13,
	[TokenKind.Imp]: 13,
} as const;

export class Parser {
	lexer = new Lexer();
	cursor = 0;
	state: Array<ParserState> = [];
	tokens: Array<Token> = [];

	isOperator(token: Token): boolean {
		return (
			token.kind === TokenKind.Add ||
			token.kind === TokenKind.Sub ||
			token.kind === TokenKind.Mul ||
			token.kind === TokenKind.Div ||
			token.kind === TokenKind.Eq ||
			token.kind === TokenKind.EqEq ||
			token.kind === TokenKind.NotEq ||
			token.kind === TokenKind.Lt ||
			token.kind === TokenKind.Lte ||
			token.kind === TokenKind.Gt ||
			token.kind === TokenKind.Gte ||
			token.kind === TokenKind.Imp ||
			token.kind === TokenKind.Update ||
			token.kind === TokenKind.Concat ||
			token.kind === TokenKind.Or ||
			token.kind === TokenKind.And ||
			token.kind === TokenKind.Period ||
			token.kind === TokenKind.Has
		);
	}

	getOperatorPrecedence(token: Token): number {
		// @ts-expect-error
		// @FIXME(jakehamilton): This is a dumb TS error complaining about indexing
		// this object. The types need to be updated to be "correct" even though this
		// does exactly what we want..
		return precedence[token.kind] ?? 0;
	}

	getOpNode(token: Token): BinaryExprNode["op"] {
		let kind: BinaryExprNode["op"]["kind"];

		switch (token.kind) {
			case TokenKind.Has:
				kind = NodeKind.Has;
				break;
			case TokenKind.Eq:
				kind = NodeKind.Eq;
				break;
			case TokenKind.EqEq:
				kind = NodeKind.EqEq;
				break;
			case TokenKind.NotEq:
				kind = NodeKind.NotEq;
				break;
			case TokenKind.Lt:
				kind = NodeKind.Lt;
				break;
			case TokenKind.Lte:
				kind = NodeKind.Lte;
				break;
			case TokenKind.Gt:
				kind = NodeKind.Gt;
				break;
			case TokenKind.Gte:
				kind = NodeKind.Gte;
				break;
			case TokenKind.Add:
				kind = NodeKind.Add;
				break;
			case TokenKind.Sub:
				kind = NodeKind.Sub;
				break;
			case TokenKind.Mul:
				kind = NodeKind.Mul;
				break;
			case TokenKind.Div:
				kind = NodeKind.Div;
				break;
			case TokenKind.Imp:
				kind = NodeKind.Imp;
				break;
			case TokenKind.Update:
				kind = NodeKind.Update;
				break;
			case TokenKind.Concat:
				kind = NodeKind.Concat;
				break;
			case TokenKind.Or:
				kind = NodeKind.Or;
				break;
			case TokenKind.And:
				kind = NodeKind.And;
				break;
			case TokenKind.Period:
				kind = NodeKind.Period;
				break;
			default:
				throw new Error(`Unknown op node for token "${token.kind}"`);
		}

		return {
			kind,
			loc: token.loc,
		};
	}

	lookahead<T>(fn: () => T): T {
		const cursor = this.cursor;
		const state = [...this.state];

		const result = fn();

		this.cursor = cursor;
		this.state = state;

		return result;
	}

	peek(offset = 0) {
		return this.tokens[this.cursor + offset];
	}

	consume() {
		const token = this.tokens[this.cursor];

		this.cursor++;

		return token;
	}

	parse(code: string) {
		const tokens = this.lexer.lex(code);

		const node = this.parseTokens(tokens);

		return node;
	}

	skipNewLines() {
		while (this.cursor < this.tokens.length) {
			let token = this.peek();

			if (token.kind !== TokenKind.NewLine) {
				break;
			}

			this.consume();
		}
	}

	parseTokens(tokens: Array<Token>): RootNode {
		this.cursor = 0;
		this.state = [];
		this.tokens = tokens;

		const expr = this.parseExpr();

		return {
			kind: NodeKind.Root,
			value: expr,
			loc: expr.loc,
		};
	}

	parseExpr(inFunctionCall = false, inList = false): ExprNode {
		let currentPrecedence = 0;

		let root: SubExprNode | BinaryExprNode = this.parseSubExpr(true, inFunctionCall, inList);
		let last: BinaryExprNode;

		while (this.cursor < this.tokens.length) {
			if (inFunctionCall || inList) {
				break;
			}

			const op = this.lookahead(() => {
				while (this.cursor < this.tokens.length) {
					const token = this.peek();

					if (token.kind === TokenKind.NewLine || token.kind === TokenKind.Comment || token.kind === TokenKind.Eof) {
						this.consume();
						continue;
					}

					return token;
				}
			});

			if (op !== undefined && op.kind === TokenKind.Keyword && op.value === "or") {
				this.skipNewLines();

				this.consume();

				const right = this.parseSubExpr(true, inFunctionCall, inList);

				if (root.kind === NodeKind.SubExpr) {
					const node: BinaryExprNode = {
						kind: NodeKind.BinaryExpr,
						op: {
							kind: NodeKind.Fallback,
							loc: op.loc,
						},
						left: root,
						right,
						loc: {
							start: root.loc.start,
							end: right.loc.end,
						},
					};

					last = node;
					root = node;
				} else {
					const node: BinaryExprNode = {
						kind: NodeKind.BinaryExpr,
						op: {
							kind: NodeKind.Fallback,
							loc: op.loc,
						},
						left: last!.right,
						right,
						loc: {
							start: last!.right.loc.start,
							end: right.loc.end,
						},
					};

					last!.right = node;
					last = node;
				}

				currentPrecedence = 1;

				continue;
			}

			if (op !== undefined && this.isOperator(op)) {
				this.skipNewLines();

				const precedence = this.getOperatorPrecedence(op);

				// Skip the operator
				this.consume();

				const right = this.parseSubExpr(true, inFunctionCall, inList);

				if (root.kind === NodeKind.SubExpr || precedence > currentPrecedence) {
					const node: BinaryExprNode = {
						kind: NodeKind.BinaryExpr,
						op: this.getOpNode(op),
						left: root,
						right,
						loc: {
							start: root.loc.start,
							end: right.loc.end,
						},
					};
					last = node;
					root = node;
				} else {
					const node: BinaryExprNode = {
						kind: NodeKind.BinaryExpr,
						op: this.getOpNode(op),
						left: last!.right,
						right,
						loc: {
							start: last!.right.loc.start,
							end: right.loc.end,
						},
					};

					last!.right = node;
					last = node;
				}

				currentPrecedence = precedence;

				continue;
			}

			break;
		}

		return {
			kind: NodeKind.Expr,
			value: root,
			loc: {
				start: root.loc.start,
				end: root.loc.end,
			},
		};
	}

	parseSubExpr(postExpressionComments = true, inFunctionCall = false, inList = false): SubExprNode {
		const modifiers: SubExprNode["modifiers"] = [];

		const comments: SubExprNode["comments"] = {
			before: [],
			after: [],
		};

		modifiers.push(...this.parseModifiers());

		comments.before = this.parseComments();

		modifiers.push(...this.parseModifiers());

		let token: Token = this.peek();

		const start = token.loc;

		let negate = false;

		if (token.kind === TokenKind.Sub) {
			negate = true;
			this.consume();
			token = this.peek();
		}

		let value: SubExprNode["value"];

		let end: Location = token.loc;

		switch (token.kind) {
			case TokenKind.Int: {
				const node = this.parseInt(negate);
				end = node.loc;

				value = {
					...node,
					loc: {
						start: start.start,
						end: node.loc.end,
					},
				};
				break;
			}
			case TokenKind.Float: {
				const node = this.parseFloat(negate);
				end = node.loc;

				value = {
					...node,
					loc: {
						start: start.start,
						end: node.loc.end,
					},
				};
				break;
			}
			case TokenKind.Bool: {
				value = this.parseBool();
				end = value.loc;
				break;
			}
			case TokenKind.String: {
				value = this.parseString();
				end = value.loc;
				break;
			}
			case TokenKind.Interp: {
				value = this.parseInterp();
				end = value.loc;
				break;
			}
			case TokenKind.OpenBracket: {
				value = this.parseList();
				end = value.loc;
				break;
			}
			case TokenKind.OpenCurly: {
				const fn = this.tryParseFunction();

				if (fn) {
					value = fn;
				} else {
					value = this.parseAttrs();
				}

				end = value.loc;
				break;
			}
			case TokenKind.Identifier: {
				const fn = this.tryParseFunction();

				if (fn) {
					value = fn;
				} else {
					value = this.parseIdentifier();
				}

				end = value.loc;
				break;
			}
			case TokenKind.Path: {
				value = this.parsePath();
				end = value.loc;
				break;
			}
			case TokenKind.OpenParen: {
				const openParen = this.consume();
				const expr = this.parseExpr();
				const closeParen = this.consume();

				value = expr;
				end = {
					start: openParen.loc.start,
					end: closeParen.loc.end,
				};
				break;
			}
			case TokenKind.Keyword: {
				value = this.parseKeyword();
				end = value.loc;
				break;
			}
			case TokenKind.Null: {
				value = this.parseNull();
				end = value.loc;
				break;
			}
			default:
				console.log(this.tokens.slice(this.cursor - 10, this.cursor));
				console.log("-----");
				console.log(token);
				throw new Error(`Unexpected token: ${token.kind}`);
		}

		const args: Array<ExprNode> = [];

		if (
			// Function args must be their own expression to be parsed as a function call.
			!inFunctionCall &&
			// You can't call a function in a list because the list delimiter is whitespace.
			!inList &&
			// Only certain nodes can be called as functions.
			(value.kind === NodeKind.Expr || value.kind === NodeKind.Identifier || value.kind === NodeKind.Import)
		) {
			while (this.cursor < this.tokens.length) {
				const next = this.lookahead(() => {
					while (this.cursor < this.tokens.length) {
						const token = this.peek();

						if (token.kind !== TokenKind.NewLine && token.kind !== TokenKind.Comment) {
							return token;
						}

						this.consume();
					}

					return undefined;
				});

				if (
					next === undefined ||
					next.kind === TokenKind.Eof ||
					next.kind === TokenKind.Comma ||
					next.kind === TokenKind.Semi ||
					next.kind === TokenKind.CloseCurly ||
					next.kind === TokenKind.CloseBracket ||
					next.kind === TokenKind.CloseParen ||
					next.kind === TokenKind.Keyword ||
					this.isOperator(next)
				) {
					break;
				}

				args.push(this.parseExpr(true));
			}
		}

		if (postExpressionComments) {
			comments.after = this.parseComments();
		}

		if (args.length > 0) {
			return {
				kind: NodeKind.SubExpr,
				value: {
					kind: NodeKind.FnCall,
					name: value,
					value: args,
					loc: {
						start: start.start,
						end: args[args.length - 1].loc.end,
					},
				},
				modifiers,
				comments,
				loc: {
					start: start.start,
					end: end.end,
				},
			};
		}

		return {
			kind: NodeKind.SubExpr,
			value: value!,
			modifiers,
			comments,
			loc: {
				start: start.start,
				end: end.end,
			},
		};
	}

	parseInt(negate = false): IntNode {
		const token = this.consume() as IntToken;

		return {
			kind: NodeKind.Int,
			value: negate ? -1 * token.value : token.value,
			loc: token.loc,
		};
	}

	parseFloat(negate = false): FloatNode {
		const token = this.consume() as FloatToken;

		return {
			kind: NodeKind.Float,
			value: negate ? -1 * token.value : token.value,
			loc: token.loc,
		};
	}

	parseBool(): BoolNode {
		const token = this.consume() as BoolToken;

		return {
			kind: NodeKind.Bool,
			value: token.value,
			loc: token.loc,
		};
	}

	parseString(): StringNode {
		const token = this.consume() as StringToken;

		const subParser = new Parser();
		const parts = token.value.map((value) => {
			if (typeof value === "string") {
				return value;
			}

			const ast = subParser.parseTokens([value]);

			return (ast.value.value as SubExprNode).value as InterpNode;
		});

		return {
			kind: NodeKind.String,
			multiline: token.multiline,
			value: parts,
			loc: token.loc,
		};
	}

	parseInterp(): InterpNode {
		const token = this.consume() as InterpToken;

		const subParser = new Parser();
		const ast = subParser.parseTokens(token.value);

		return {
			kind: NodeKind.Interp,
			value: ast.value,
			loc: token.loc,
		};
	}

	parseList(): ListNode {
		const openBracket = this.consume();
		const items: Array<ExprNode> = [];

		while (this.cursor < this.tokens.length) {
			this.skipNewLines();

			const next = this.peek();
			if (next !== undefined && next.kind === TokenKind.CloseBracket) {
				break;
			}

			const expr = this.parseExpr(false, true);

			if (items.length > 0) {
				const prev = items[items.length - 1];

				if (
					expr.value.kind === NodeKind.SubExpr &&
					prev.value.kind === NodeKind.SubExpr &&
					prev.value.comments.after.length > 0
				) {
					expr.value.comments.before = prev.value.comments.after;
					prev.value.comments.after = [];
				}
			}
			items.push(expr);
		}

		const closeBracket = this.consume();

		return {
			kind: NodeKind.List,
			value: items,
			loc: {
				start: openBracket.loc.start,
				end: closeBracket.loc.end,
			},
		};
	}

	parseAttrs(): AttrsNode {
		const openCurly = this.consume();
		const attrs: Array<AttrNode> = [];

		while (this.cursor < this.tokens.length) {
			this.skipNewLines();

			const next = this.lookahead(() => {
				while (this.cursor < this.tokens.length) {
					const token = this.peek();

					if (token.kind !== TokenKind.NewLine && token.kind !== TokenKind.Comment) {
						return token;
					}

					this.consume();
				}
			});

			if (next?.kind === TokenKind.CloseCurly) {
				const comments = this.parseComments();

				if (attrs.length > 0) {
					attrs[attrs.length - 1].comments.push(...comments);
				}
				break;
			}

			const attr = this.parseAttr();

			attrs.push(attr);
		}

		const closeCurly = this.consume();

		return {
			kind: NodeKind.Attrs,
			value: attrs,
			recursive: false,
			loc: {
				start: openCurly.loc.start,
				end: closeCurly.loc.end,
			},
		};
	}

	parseAttr(): AttrNode {
		const comments = this.parseComments();

		const token = this.peek();

		if (token.kind === TokenKind.Keyword && token.value === "inherit") {
			this.consume();

			let from: InheritBinding["from"] = undefined;
			const bindings: InheritBinding["value"] = [];

			if (this.peek().kind === TokenKind.OpenParen) {
				this.consume();
				from = this.parseExpr();
				this.consume();
			}

			while (this.cursor < this.tokens.length) {
				const comments = this.parseComments();

				if (this.peek().kind === TokenKind.Semi) {
					break;
				}

				const identifier = this.parseIdentifier();

				bindings.push({
					...identifier,
					comments,
				});
			}

			// Skip semi.
			this.consume();

			return {
				kind: NodeKind.Attr,
				from,
				comments,
				value: bindings,
				loc: {
					start: token.loc.start,
					end: bindings[bindings.length - 1].loc.end,
				},
			};
		}

		const name = this.parseIdentifier();

		comments.push(...this.parseComments());

		this.skipNewLines();

		// Equal sign
		this.consume();

		const expr = this.parseExpr();

		const semi = this.consume();

		return {
			kind: NodeKind.Attr,
			name,
			value: expr,
			comments,
			loc: {
				start: name.loc.start,
				end: semi.loc.end,
			},
		};
	}

	parseIdentifier(): IdentifierNode {
		const parts: IdentifierNode["value"] = [];

		const start = this.peek().loc;
		let end = start;

		while (this.cursor < this.tokens.length) {
			const token = this.peek();
			end = token.loc;

			switch (token.kind) {
				case TokenKind.Identifier:
					this.consume();
					parts.push(token.value);
					break;
				case TokenKind.String:
					parts.push(this.parseString());
					break;
				case TokenKind.Interp:
					parts.push(this.parseInterp());
					break;
				default:
					console.log(this.tokens.slice(this.cursor - 10, this.cursor));
					console.log("-----");
					console.log(token);
					throw new Error(`Unknown token in identifier path: "${token.kind}"`);
			}

			if (this.peek()?.kind !== TokenKind.Period) {
				break;
			}

			// Skip period
			this.consume();
		}

		return {
			kind: NodeKind.Identifier,
			value: parts,
			loc: {
				start: start.start,
				end: end.end,
			},
		};
	}

	parseComments(): Array<CommentNode> {
		const comments: Array<CommentNode> = [];

		while (this.cursor < this.tokens.length) {
			this.skipNewLines();

			const token = this.peek();

			if (token.kind !== TokenKind.Comment) {
				break;
			}

			comments.push({
				kind: NodeKind.Comment,
				value: token.value,
				loc: token.loc,
			});

			this.consume();
		}

		return comments;
	}

	tryParseFunction(): FnNode | undefined {
		const isIdentifierArg = this.lookahead(() => {
			const ident = this.peek();
			const colon = this.peek(1);
			return ident?.kind === TokenKind.Identifier && colon?.kind === TokenKind.Colon;
		});

		if (isIdentifierArg) {
			const ident = this.parseIdentifier();
			this.consume(); // Colon

			const body = this.parseExpr();

			return {
				kind: NodeKind.Fn,
				args: {
					kind: NodeKind.FnParams,
					name: ident,
					loc: ident.loc,
				},
				body,
				loc: {
					start: ident.loc.start,
					end: body.loc.end,
				},
			};
		}

		const isIdentifierAt = this.lookahead(() => {
			const ident = this.peek();
			const at = this.peek(1);
			return ident?.kind === TokenKind.Identifier && at?.kind === TokenKind.At;
		});

		let as: DestructuredFnParams["as"];

		if (isIdentifierAt) {
			as = this.parseIdentifier();
			this.consume(); // Skip at sign.
		}

		const isDestructuredFnParams = this.lookahead(() => {
			let token = this.peek();
			if (token.kind !== TokenKind.OpenCurly) {
				return false;
			}

			this.consume();

			let depth = 0;

			while (this.cursor < this.tokens.length) {
				token = this.peek();

				if (token.kind === TokenKind.OpenCurly) {
					depth++;
				}

				if (token.kind === TokenKind.CloseCurly) {
					depth--;
				}

				this.consume();

				if (depth === -1) {
					break;
				}
			}

			const isAttrsColon = this.peek()?.kind === TokenKind.Colon;
			const isAttrsAt = this.peek()?.kind === TokenKind.At;

			if (isIdentifierAt || isAttrsColon) {
				return isAttrsColon;
			}

			return isAttrsAt;
		});

		if (isDestructuredFnParams) {
			// @ts-expect-error
			// @NOTE(jakehamilton): TS complains that we're not setting `loc` here,
			// but it will be set below...
			const args: FnParamsNode & DestructuredFnParams = {
				kind: NodeKind.FnParams,
				as,
				value: [],
				extra: false,
			};

			// Skip curly
			const openCurly = this.consume();

			while (this.cursor < this.tokens.length) {
				const token = this.peek();
				if (token.kind === TokenKind.CloseCurly) {
					break;
				}

				if (token.kind === TokenKind.Ellipsis) {
					this.consume();
					args.extra = true;
					break;
				}

				const identifier = this.parseIdentifier();

				let defaultValue: FnParamNode["default"] = undefined;

				if (this.peek()?.kind === TokenKind.Has) {
					this.consume();
					defaultValue = this.parseExpr();
				}

				args.value.push({
					kind: NodeKind.FnParam,
					name: identifier,
					default: defaultValue,
					loc: {
						start: identifier.loc.start,
						end: defaultValue !== undefined ? defaultValue.loc.end : identifier.loc.end,
					},
				});

				const next = this.lookahead(() => {
					while (this.cursor < this.tokens.length) {
						const token = this.peek();
						if (token?.kind !== TokenKind.NewLine && token?.kind !== TokenKind.Comment) {
							return token;
						}

						this.consume();
					}
				});

				if (next === undefined) {
					throw new Error(`Unexpected end of input.`);
				}

				if (next.kind !== TokenKind.Comma && next.kind !== TokenKind.CloseCurly) {
					throw new Error(`Expected comma or closed curly brace, but got: "${next.kind}"`);
				}

				this.skipNewLines();

				if (next.kind === TokenKind.Comma) {
					this.consume();
				}

				this.skipNewLines();
			}

			const closeCurly = this.consume();

			const isAttrsAt = this.peek()?.kind === TokenKind.At;
			if (isAttrsAt) {
				// Skip at sign.
				this.consume();

				args.as = this.parseIdentifier();
			}

			if (isAttrsAt) {
				args.loc = {
					start: openCurly.loc.start,
					end: args.as!.loc.end,
				};
			} else if (args.as) {
				args.loc = {
					start: args.as.loc.start,
					end: closeCurly.loc.end,
				};
			} else {
				args.loc = {
					start: openCurly.loc.start,
					end: closeCurly.loc.end,
				};
			}

			// Skip colon.
			this.consume();

			const body = this.parseExpr();

			return {
				kind: NodeKind.Fn,
				args,
				body,
				loc: {
					start: args.loc.start,
					end: body.loc.end,
				},
			};
		}

		return undefined;
	}

	parseModifiers(): Array<ModifierNode> {
		const modifiers: Array<ModifierNode> = [];

		while (this.cursor < this.tokens.length) {
			this.skipNewLines();

			const token = this.peek();

			if (token?.kind !== TokenKind.Keyword || (token?.value !== "with" && token?.value !== "assert")) {
				break;
			}

			switch (token.value) {
				case "with": {
					this.consume();

					const expr = this.parseExpr();

					const semi = this.consume();

					modifiers.push({
						kind: NodeKind.Modifier,
						action: "with",
						value: expr,
						loc: {
							start: token.loc.start,
							end: semi.loc.end,
						},
					});
					break;
				}
				case "assert": {
					this.consume();

					const expr = this.parseExpr();

					const semi = this.consume();

					modifiers.push({
						kind: NodeKind.Modifier,
						action: "assert",
						value: expr,
						loc: {
							start: token.loc.start,
							end: semi.loc.end,
						},
					});
					break;
				}
			}
		}

		return modifiers;
	}

	parsePath(): PathNode {
		const path = this.consume() as PathToken;

		return {
			kind: NodeKind.Path,
			value: path.value,
			loc: path.loc,
		};
	}

	parseKeyword(): LetInNode | ImportNode | ConditionalNode | AttrsNode {
		const token = this.peek() as KeywordToken;

		switch (token.value) {
			case "let": {
				this.consume();

				const attrs: Array<AttrNode> = [];

				while (this.cursor < this.tokens.length) {
					this.skipNewLines();

					const next = this.lookahead(() => {
						while (this.cursor < this.tokens.length) {
							const token = this.peek();

							if (token.kind !== TokenKind.NewLine && token.kind !== TokenKind.Comment) {
								return token;
							}

							this.consume();
						}
					});

					if (next !== undefined && next?.kind === TokenKind.Keyword && next.value === "in") {
						const comments = this.parseComments();

						if (attrs.length > 0) {
							attrs[attrs.length - 1].comments.push(...comments);
						}
						break;
					}

					const attr = this.parseAttr();

					attrs.push(attr);
				}

				// Skip in.
				this.consume();

				const expr = this.parseExpr();

				return {
					kind: NodeKind.LetIn,
					bindings: attrs,
					body: expr,
					loc: {
						start: token.loc.start,
						end: expr.loc.end,
					},
				};
			}
			case "import": {
				this.consume();

				const expr = this.parseExpr(true);

				return {
					kind: NodeKind.Import,
					value: expr,
					loc: {
						start: token.loc.start,
						end: expr.loc.end,
					},
				};
			}
			case "if": {
				this.consume();

				this.skipNewLines();

				const condition = this.parseExpr();

				this.skipNewLines();

				// Skip then
				this.consume();

				this.skipNewLines();

				const thenBody = this.parseExpr();

				this.skipNewLines();

				// Skip else
				this.consume();

				this.skipNewLines();

				const elseBody = this.parseExpr();

				return {
					kind: NodeKind.Conditional,
					condition,
					then: thenBody,
					else: elseBody,
					loc: {
						start: token.loc.start,
						end: elseBody.loc.end,
					},
				};
			}
			case "rec": {
				this.consume();

				const attrs = this.parseAttrs();

				attrs.recursive = true;
				attrs.loc.start = token.loc.start;

				return attrs;
			}
			default:
				throw new Error(`Unexpected keyword: ${token.value}`);
		}
	}

	parseNull(): NullNode {
		const token = this.consume() as NullToken;

		return {
			kind: NodeKind.Null,
			loc: token.loc,
		};
	}
}

export default Parser;
