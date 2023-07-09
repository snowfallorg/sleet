import fs from "fs";
import path from "path";
import { describe, it, expect, beforeEach } from "vitest";
import {
	AstNode,
	NodeKind,
	Parser,
	isAttrBinding,
	isDestructuredFnParams,
	isIdentifierFnParams,
	isInheritBinding,
} from "./parser";

// A very crude pretty printer. The only goal here is to make snapshots easier
// to work with during development.
const pretty = (node: AstNode): string => {
	switch (node.kind) {
		case NodeKind.Root:
			return pretty(node.value.value);
		case NodeKind.Expr:
			return pretty(node.value);
		case NodeKind.SubExpr: {
			const modifiers = node.modifiers.map(pretty);
			const beforeComments = node.comments.before.map(pretty).join("\n");
			const afterComments = node.comments.after.map(pretty).join("\n");
			return `${beforeComments ? `${beforeComments}\n` : ""}${
				modifiers.length > 0 ? `${modifiers.join("\n")}\n` : ""
			}${pretty(node.value)}${afterComments ? `\n${afterComments}` : ""}`;
		}
		case NodeKind.FnCall: {
			return `(${pretty(node.name)} ${node.value.map(pretty).join(" ")})`;
		}
		case NodeKind.Modifier: {
			return `${node.action} ${pretty(node.value)};`;
		}
		case NodeKind.Comment:
			return `#${node.value}`;
		case NodeKind.BinaryExpr:
			return `(${pretty(node.left)} ${pretty(node.op)} ${pretty(node.right)})`;
		case NodeKind.UnaryExpr:
			return `(${pretty(node.op)}${pretty(node.value)})`;
		case NodeKind.Conditional:
			return `if ${pretty(node.condition)} then\n${pretty(node.then)
				.split("\n")
				.map((x) => `\t${x}`)
				.join("\n")}\nelse\n${pretty(node.else)
				.split("\n")
				.map((x) => `\t${x}`)
				.join("\n")}`;
		case NodeKind.String: {
			const quotes = node.multiline ? "''" : '"';
			return `${quotes}${node.value
				.map((value) => {
					if (typeof value === "string") {
						return value;
					}

					return `${pretty(value)}`;
				})
				.join(node.multiline ? "\n" : "")}${quotes}`;
		}
		case NodeKind.List:
			return `[\n${node.value
				.map(
					(value) =>
						`${pretty(value)
							.split("\n")
							.map((x) => `\t${x}`)
							.join("\n")}`
				)
				.join("\n")}\n]`;
		case NodeKind.LetIn:
			return `let\n${node.bindings
				.map(
					(value) =>
						`${pretty(value)
							.split("\n")
							.map((x) => `\t${x}`)
							.join("\n")}`
				)
				.join("\n")}\nin\n${pretty(node.body)
				.split("\n")
				.map((x) => `\t${x}`)
				.join("\n")}`;
		case NodeKind.Attrs:
			const rec = node.recursive ? "rec " : "";

			if (node.value.length === 0) {
				return `${rec}{}`;
			}

			return `${rec}{\n${node.value
				.map(
					(value) =>
						`${pretty(value)
							.split("\n")
							.map((x) => `\t${x}`)
							.join("\n")}`
				)
				.join("\n")}\n}`;
		case NodeKind.Attr: {
			if (isAttrBinding(node)) {
				const prettyValue = pretty(node.value);
				const lines = prettyValue.split("\n");
				const value = [lines[0]].concat(lines.slice(1)).join("\n");
				const comments = node.comments.map(pretty).join("\n");
				return `${comments ? `${comments}\n` : ""}${pretty(node.name)} = ${value};`;
			}
			if (isInheritBinding(node)) {
				const from = node.from ? `(${pretty(node.from)}) ` : "";
				const bindings = node.value.map(pretty).join(" ");
				const comments = node.comments.map(pretty).join("\n");
				return `${comments ? `${comments}\n` : ""}inherit ${from}${bindings};`;
			}
			throw new Error(`Unknown attr type: ${node}`);
		}
		case NodeKind.Identifier:
			return `${node.value
				.map((part) => {
					if (typeof part === "string") {
						return part;
					}

					return pretty(part);
				})
				.join(".")}`;
		case NodeKind.Fn:
			return `(${pretty(node.args)}:\n${pretty(node.body)
				.split("\n")
				.map((x) => `\t${x}`)
				.join("\n")}\n)`;
		case NodeKind.FnParams: {
			if (isIdentifierFnParams(node)) {
				return pretty(node.name);
			}

			if (isDestructuredFnParams(node)) {
				return `${node.as ? `${pretty(node.as)} @ ` : ""}{ ${node.value.map(pretty).join(", ")}${
					node.extra ? ", ..." : ""
				} }`;
			}
			throw new Error(`Unknown FnParams type: ${node}`);
		}
		case NodeKind.Import:
			return `(import ${pretty(node.value)})`;
		case NodeKind.FnParam:
			return `${pretty(node.name)}${node.default ? ` ? ${pretty(node.default)}` : ""}`;
		case NodeKind.Path:
			return node.value;
		case NodeKind.Interp:
			return `\${${pretty(node.value)}}`;
		case NodeKind.Int:
		case NodeKind.Float:
			return String(node.value);
		case NodeKind.Bool:
			return String(node.value);
		case NodeKind.Add:
			return "+";
		case NodeKind.Sub:
			return "-";
		case NodeKind.Mul:
			return "*";
		case NodeKind.Div:
			return "/";
		case NodeKind.And:
			return "&&";
		case NodeKind.Or:
			return "||";
		case NodeKind.Update:
			return "//";
		case NodeKind.Fallback:
			return "or";
		case NodeKind.EqEq:
			return "==";
		case NodeKind.NotEq:
			return "!=";
		case NodeKind.Has:
			return "?";
		case NodeKind.Null:
			return "null";
		case NodeKind.Gt:
			return ">";
		case NodeKind.Gte:
			return ">=";
		case NodeKind.Lt:
			return "<";
		case NodeKind.Lte:
			return "<=";
		case NodeKind.Concat:
			return "++";
		case NodeKind.Not:
			return "!";
		case NodeKind.Period:
			return "PERIOD";
		default:
			console.log(node);
			throw new Error(`Unknown node to prettify: "${node.kind}"`);
	}
};

describe("Parser", () => {
	let parser: Parser;

	beforeEach(() => {
		parser = new Parser();
	});

	it("should parse sub expr", () => {
		const ast = parser.parse(`42.0`);

		expect(ast).toMatchSnapshot();
	});

	it("should parse sub expr with comments", () => {
		const ast = parser.parse(`#before\n42.0#after`);

		expect(ast).toMatchSnapshot();
	});

	it("should parse booleans", () => {
		const ast = parser.parse(`true`);

		expect(pretty(ast)).toMatchInlineSnapshot('"true"');
	});

	it("should parse binary expressions", () => {
		const ast = parser.parse("1 + 2 * 3 * 4 - 5 / 6 - -7.8");

		expect(pretty(ast)).toMatchInlineSnapshot('"(((1 + (2 * (3 * 4))) - (5 / 6)) - -7.8)"');
	});

	it("should parse strings", () => {
		const ast = parser.parse('"hello ${"world"}!"');

		expect(pretty(ast)).toMatchInlineSnapshot('"\\"hello ${\\"world\\"}!\\""');
	});

	it("should parse multiline strings", () => {
		const ast = parser.parse(`''\n\thello, world!\n''`);

		expect(pretty(ast)).toMatchInlineSnapshot(`
			"''
				hello, world!
			''"
		`);
	});

	it("should parse boolean logic", () => {
		const ast = parser.parse(`true && false || true`);

		expect(pretty(ast)).toMatchInlineSnapshot('"((true && false) || true)"');
	});

	it("should parse boolean logic 2", () => {
		const ast = parser.parse(`true || false && true`);

		expect(pretty(ast)).toMatchInlineSnapshot('"(true || (false && true))"');
	});

	it("should parse lists", () => {
		const ast = parser.parse(`[\n#before\n 1 true "three"\n#after\n]`);

		expect(pretty(ast)).toMatchInlineSnapshot(`
			"[
				#before
				1
				true
				\\"three\\"
				#after
			]"
		`);
	});

	it("should parse attrs", () => {
		const ast = parser.parse(`{ x.y = true; }`);

		expect(pretty(ast)).toMatchInlineSnapshot(`
			"{
				x.y = true;
			}"
		`);
	});

	it("should parse recursive attrs", () => {
		const ast = parser.parse(`rec { x = true; }`);

		expect(pretty(ast)).toMatchInlineSnapshot(`
			"rec {
				x = true;
			}"
		`);
	});

	describe("Functions", () => {
		it("should parse identifier args", () => {
			const ast = parser.parse(`x: x`);

			expect(pretty(ast)).toMatchInlineSnapshot(`
				"(x:
					x
				)"
			`);
		});

		it("should parse args", () => {
			const ast = parser.parse(`{ a ? true, b }: a`);

			expect(pretty(ast)).toMatchInlineSnapshot(`
				"({ a ? true, b }:
					a
				)"
			`);
		});

		it("should parse prefix identifier args", () => {
			const ast = parser.parse(`x @ { a ? true, b }: x`);

			expect(pretty(ast)).toMatchInlineSnapshot(`
				"(x @ { a ? true, b }:
					x
				)"
			`);
		});

		it("should parse suffix identifier args", () => {
			const ast = parser.parse(`{ a ? true, b } @ x: x`);

			expect(pretty(ast)).toMatchInlineSnapshot(`
				"(x @ { a ? true, b }:
					x
				)"
			`);
		});

		it("should parse function calls", () => {
			const ast = parser.parse(`builtins.trace x y`);

			expect(pretty(ast)).toMatchInlineSnapshot('"(builtins.trace x y)"');
		});

		it("should parse function calls with operators", () => {
			const ast = parser.parse(`builtins.length x != 3`);

			expect(pretty(ast)).toMatchInlineSnapshot('"((builtins.length x) != 3)"');
		});

		it("should parse function calls with nested exprs", () => {
			const ast = parser.parse(`
				foldl
					(result: item:
						result // (mapAttrs
							(name: value:
								if isDerivation value then
									value
								else if builtins.isAttrs value then
									value
								else
									value)
							item)
					)
					{ }
					items;
			`);

			expect(pretty(ast)).toMatchInlineSnapshot(`
				"(foldl (result:
					(item:
						(result // (mapAttrs (name:
							(value:
								if (isDerivation value) then
									value
								else
									if (builtins.isAttrs value) then
										value
									else
										value
							)
						) item))
					)
				) {} items)"
			`);
		});

		it("should parse complex function calls", () => {
			const ast = parser.parse(`
          args@{ config
          , pkgs
          , system ? pkgs.system
          , target ? system
          , format ? "home"
          , host ? ""
          , virtual ? (snowfall-lib.system.is-virtual target)
          , systems ? { }
          , ...
          }:
          {
            _file = "virtual:snowfallorg/home/extra-special-args";

            config = {
              home-manager.extraSpecialArgs = {
                inherit system target format virtual systems host;

                lib = home-lib;

                inputs = snowfall-lib.flake.without-src user-inputs;
              };
            };
          };
			`);

			expect(pretty(ast)).toMatchInlineSnapshot(`
				"(args @ { config, pkgs, system ? pkgs.system, target ? system, format ? \\"home\\", host ? \\"\\", virtual ? (snowfall-lib.system.is-virtual target), systems ? {}, ... }:
					{
						_file = \\"virtual:snowfallorg/home/extra-special-args\\";
						config = {
							home-manager.extraSpecialArgs = {
								inherit system target format virtual systems host;
								lib = home-lib;
								inputs = (snowfall-lib.flake.without-src user-inputs);
							};
						};
					}
				)"
			`);
		});
	});

	describe("Let In", () => {
		it("should parse let in bindings", () => {
			const ast = parser.parse(`let x = 4; y = 2; inherit (a) b; in x + y`);

			expect(pretty(ast)).toMatchInlineSnapshot(`
				"let
					x = 4;
					y = 2;
					inherit (a) b;
				in
					(x + y)"
			`);
		});
	});

	describe("Fallbacks", () => {
		it("should parse fallbacks", () => {
			const ast = parser.parse(`x.y or 4`);

			expect(pretty(ast)).toMatchInlineSnapshot('"(x.y or 4)"');
		});
	});

	describe("Imports", () => {
		it("should parse imports", () => {
			const ast = parser.parse(`import ./x/y/z`);

			expect(pretty(ast)).toMatchInlineSnapshot('"(import ./x/y/z)"');
		});

		it("should parse import function calls", () => {
			const ast = parser.parse(`import ./x/y/z {}`);

			expect(pretty(ast)).toMatchInlineSnapshot('"((import ./x/y/z) {})"');
		});
	});

	describe("Lists", () => {
		it("should parse lists", () => {
			const ast = parser.parse(`[#one\na\n#two\nb]`);

			expect(pretty(ast)).toMatchInlineSnapshot(`
				"[
					#one
					a
					#two
					b
				]"
			`);
		});

		it("should parse lists", () => {
			const ast = parser.parse(`[#one\n1\n#two\n { x = y: 4; }\n#three\n]`);

			expect(pretty(ast)).toMatchInlineSnapshot(`
				"[
					#one
					1
					#two
					{
						x = (y:
							4
						);
					}
					#three
				]"
			`);
		});
	});

	describe("Unary Expr", () => {
		it("should parse unary exprs", () => {
			const ast = parser.parse(`
				{
					snowfall-top-level-lib = filterAttrs (name: value: !builtins.isAttrs value) snowfall-lib;

					base-lib = merge-shallow [
						core-inputs.nixpkgs.lib
						core-inputs-libs
						user-inputs-libs
						snowfall-top-level-lib
						{ snowfall = snowfall-lib; }
					];
				}
			`);

			expect(pretty(ast)).toMatchInlineSnapshot(`
				"{
					snowfall-top-level-lib = (filterAttrs (name:
						(value:
							(!(builtins.isAttrs value))
						)
					) snowfall-lib);
					base-lib = (merge-shallow [
						core-inputs.nixpkgs.lib
						core-inputs-libs
						user-inputs-libs
						snowfall-top-level-lib
						{
							snowfall = snowfall-lib;
						}
					]);
				}"
			`);
		});

		it("should parse unary exprs followed by binary exprs", () => {
			const ast = parser.parse(`!false && true`);

			expect(pretty(ast)).toMatchInlineSnapshot('"((!false) && true)"');
		});

		it("should parse unary exprs with fn call followed by binary exprs", () => {
			const ast = parser.parse(`!elem 1 [ 1 2 3 ] && true`);

			expect(pretty(ast)).toMatchInlineSnapshot(`
				"((!(elem 1 [
					1
					2
					3
				])) && true)"
			`);
		});
	});

	describe("Attrs", () => {
		it("parses rec attrs", () => {
			const ast = parser.parse(`
{
  gvariant = mkOptionType rec {
  };
}
		`);

			expect(pretty(ast)).toMatchInlineSnapshot(`
			"{
				gvariant = (mkOptionType rec {});
			}"
		`);
		});

		it("parses expr access", () => {
			const ast = parser.parse(`({ inherit f; }).f`);

			expect(pretty(ast)).toMatchInlineSnapshot(`
				"{
					inherit f;
				}.f"
			`);
		});

		it("parses complex attrs", () => {
			const ast = parser.parse(`
{
  gvariant = mkOptionType rec {
    merge = loc: defs:
      let
        vdefs = map (d:
          d // {
            value =
              if gvar.isGVariant d.value then d.value else gvar.mkValue d.value;
          }) defs;
        vals = map (d: d.value) vdefs;
        defTypes = map (x: x.type) vals;
        sameOrNull = x: y: if x == y then y else null;
        # A bit naive to just check the first entry…
        sharedDefType = foldl' sameOrNull (head defTypes) defTypes;
        allChecked = all (x: check x) vals;
      in if gvar.isArray sharedDefType && allChecked then
        gvar.mkValue ((types.listOf gvariant).merge loc (map vdefs)) // {
            type = sharedDefType;
          }
      else
        mergeDefaultOption loc defs;
};
}
		`);

			expect(pretty(ast)).toMatchInlineSnapshot(`
				"{
					gvariant = (mkOptionType rec {
						merge = (loc:
							(defs:
								let
									vdefs = (map (d:
										(d // {
											value = if (gvar.isGVariant d.value) then
												d.value
											else
												(gvar.mkValue d.value);
										})
									) defs);
									vals = (map (d:
										d.value
									) vdefs);
									defTypes = (map (x:
										x.type
									) vals);
									sameOrNull = (x:
										(y:
											if (x == y) then
												y
											else
												null
										)
									);
									# A bit naive to just check the first entry…
									sharedDefType = (foldl' sameOrNull (head defTypes) defTypes);
									allChecked = (all (x:
										(check x)
									) vals);
								in
									if ((gvar.isArray sharedDefType) && allChecked) then
										((gvar.mkValue ((types.listOf gvariant).merge loc (map vdefs))) // {
											type = sharedDefType;
										})
									else
										(mergeDefaultOption loc defs)
							)
						);
					});
				}"
			`);
		});
	});

	describe("Samples", () => {
		it("Parses quartz.nix", () => {
			const code = fs.readFileSync(path.resolve(__dirname, "__test__", "samples", "quartz.nix"), {
				encoding: "utf8",
			});

			const ast = parser.parse(code);

			expect(ast).toMatchSnapshot();
		});

		it("Parses wallpapers.nix", () => {
			const code = fs.readFileSync(path.resolve(__dirname, "__test__", "samples", "wallpapers.nix"), {
				encoding: "utf8",
			});

			const ast = parser.parse(code);

			expect(ast).toMatchSnapshot();
		});

		it("Parses network.nix", () => {
			const code = fs.readFileSync(path.resolve(__dirname, "__test__", "samples", "network.nix"), {
				encoding: "utf8",
			});

			const ast = parser.parse(code);

			expect(ast).toMatchSnapshot();
		});

		it("Parses audio.nix", () => {
			const code = fs.readFileSync(path.resolve(__dirname, "__test__", "samples", "audio.nix"), {
				encoding: "utf8",
			});

			const ast = parser.parse(code);

			expect(ast).toMatchSnapshot();
		});

		it("Parses attrs.nix", () => {
			const code = fs.readFileSync(path.resolve(__dirname, "__test__", "samples", "attrs.nix"), {
				encoding: "utf8",
			});

			const ast = parser.parse(code);

			expect(ast).toMatchSnapshot();
		});

		it("Parses home.nix", () => {
			const code = fs.readFileSync(path.resolve(__dirname, "__test__", "samples", "home.nix"), {
				encoding: "utf8",
			});

			const ast = parser.parse(code);

			expect(ast).toMatchSnapshot();
		});

		it("Parses snowfall-lib.nix", () => {
			const code = fs.readFileSync(path.resolve(__dirname, "__test__", "samples", "snowfall-lib.nix"), {
				encoding: "utf8",
			});

			const ast = parser.parse(code);

			expect(ast).toMatchSnapshot();
		});

		it("Parses types.nix", () => {
			const code = fs.readFileSync(path.resolve(__dirname, "__test__", "samples", "types.nix"), {
				encoding: "utf8",
			});

			const ast = parser.parse(code);

			expect(ast).toMatchSnapshot();
		});
	});
});
