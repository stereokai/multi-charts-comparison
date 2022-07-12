import { basename } from "path";
import * as recast from "recast";

export function decorateAllFunctionCalls(file, code) {
  function getConsoleLog(file, name, type, start) {
    const b = recast.types.builders;
    const CONSOLE = "console",
      LOG = "log";

    return b.expressionStatement(
      b.callExpression(
        b.memberExpression(b.identifier(CONSOLE), b.identifier(LOG), false),
        [
          b.literal(
            `Executing ${type}${name ? ` ${name}` : ""}${
              file ? ` from file ${file}` : ""
            }${start ? ` at line ${start}` : ""}`
          ),
        ]
      )
    );
  }

  function getOption(options, key, defaultValue) {
    if (options && Object.prototype.hasOwnProperty.call(options, key)) {
      return options[key];
    }
    return defaultValue;
  }

  const res = recast.print(
    recast.visit(
      recast.parse(code, {
        parser: {
          parse: (source, options) => {
            const comments = [];
            const ast = require("esprima-next").parse(source, {
              loc: true,
              locations: true,
              comment: true,
              onComment: comments,
              range: getOption(options, "range", false),
              tolerant: getOption(options, "tolerant", true),
              tokens: true,
              jsx: getOption(options, "jsx", false),
            });

            if (!Array.isArray(ast.comments)) {
              ast.comments = comments;
            }

            return ast;
          },
        },
      }),
      {
        visitFunction: function (path) {
          let name, type, start;

          if (path.value.loc) {
            start = path.value.loc.start.line;
          } else if (
            path.parentPath.value.type === "ExportNamedDeclaration" ||
            path.parentPath.value.type === "MethodDefinition"
          ) {
            start = path.parentPath.value.loc.start.line;
          }

          if (path.value.id && path.value.id.type === "Identifier") {
            name = path.value.id.name;
          } else if (path.parentPath.value.type === "MethodDefinition") {
            name = path.parentPath.value.key.name;
          }

          type = path.value.type;

          if (path.value.body && path.value.body.type !== "BlockStatement") {
            const b = recast.types.builders;
            const body = b.blockStatement([b.returnStatement(path.value.body)]);
            path.value.body = body;
          }

          if (
            path.value.body.type !== "ClassExpression" &&
            path.value.body.body
          ) {
            path.value.body.body.unshift(
              getConsoleLog(basename(file), name, type, start)
            );
          }
          this.traverse(path);
        },
      }
    )
  );

  return res;
}
