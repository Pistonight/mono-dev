import type { ESLint, Rule } from "eslint";

export const MonodevEslintPlugin: ESLint.Plugin = {
    rules: {
        "no-keyof-typeof-alias": {
            meta: {
                type: "suggestion",
                messages: {
                    noKeyofTypeofAlias:
                        "Avoid exporting type aliases of the form 'keyof typeof X'. Inline the type so it shows up in the documentation more precisely.",
                },
            },
            create(context: Rule.RuleContext) {
                return {
                    // migration
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    "ExportNamedDeclaration > TSTypeAliasDeclaration": (node: any) => {
                        const t = node.typeAnnotation;
                        if (
                            t.type === "TSTypeOperator" &&
                            t.operator === "keyof" &&
                            t.typeAnnotation?.type === "TSTypeQuery"
                        ) {
                            context.report({ node, messageId: "noKeyofTypeofAlias" });
                        }
                    },
                };
            },
        },
        "no-param-destructure": {
            meta: {
                type: "suggestion",
                messages: {
                    noParamDestructure:
                        "Avoid object destructuring in function parameters in library code. Use a named parameter to ensure it is presented properly in generated documentation.",
                },
            },
            create(context: Rule.RuleContext) {
                // migration
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                function checkParams(node: any) {
                    for (const param of node.params) {
                        if (param.type === "ObjectPattern") {
                            context.report({ node: param, messageId: "noParamDestructure" });
                        }
                    }
                }
                return {
                    "ExportNamedDeclaration > FunctionDeclaration": checkParams,
                    "ExportDefaultDeclaration > FunctionDeclaration": checkParams,
                    "ExportDefaultDeclaration > FunctionExpression": checkParams,
                    "ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > ArrowFunctionExpression":
                        checkParams,
                    "ExportDefaultDeclaration > ArrowFunctionExpression": checkParams,
                };
            },
        },
    },
};
