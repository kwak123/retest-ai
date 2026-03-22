import { LanguageParser, TestBlock } from "./interface.js";
import { parse } from "@typescript-eslint/typescript-estree";
import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/typescript-estree";

export class JavascriptParser implements LanguageParser {
  extractTests(content: string): TestBlock[] {
    const ast = parse(content, {
      loc: true,
      range: true,
      comment: false,
      tokens: false,
      actions: [], // Explicitly type this to avoid error if types mismatch defaults
      errorOnUnknownASTType: false
    });

    const tests: TestBlock[] = [];
    
    this.traverse(ast, (node) => {
      if (node.type === AST_NODE_TYPES.CallExpression && node.callee.type === AST_NODE_TYPES.Identifier) {
        const name = node.callee.name;
        if (name === 'it' || name === 'test') {
          const testName = this.extractTestName(node);
          const block = this.extractBlock(node, content);
          if (testName && block) {
            tests.push({
              name: testName,
              body: block.content,
              location: {
                start: { line: node.loc.start.line, column: node.loc.start.column },
                end: { line: node.loc.end.line, column: node.loc.end.column }
              }
            });
          }
        }
        // TODO: Handle 'describe' blocks recursively for full suite names? 
        // For MVP we just flatten 'it' blocks.
      }
    });

    return tests;
  }

  private traverse(node: TSESTree.Node, visitor: (node: TSESTree.Node) => void) {
    visitor(node);
    
    for (const key in node) {
      if (Object.prototype.hasOwnProperty.call(node, key)) {
        const child = (node as any)[key];
        if (typeof child === 'object' && child !== null) {
          if (Array.isArray(child)) {
            child.forEach(c => {
               if (c && typeof c.type === 'string') {
                 this.traverse(c, visitor);
               }
            });
          } else if (typeof child.type === 'string') {
            this.traverse(child, visitor);
          }
        }
      }
    }
  }

  private extractTestName(node: TSESTree.CallExpression): string | null {
    if (node.arguments.length > 0 && node.arguments[0].type === AST_NODE_TYPES.Literal) {
      return String(node.arguments[0].value);
    }
    return null;
  }

  private extractBlock(node: TSESTree.CallExpression, fullContent: string): { content: string } | null {
    // We want the text of the entire CallExpression usually, effectively the whole test code.
    // Or do we just want the callback body?
    // Design decision: Hash the entire test definition (CallExpression), including the name.
    // This allows detecting changes to the name or the body.
    
    if (node.range) {
       return { content: fullContent.substring(node.range[0], node.range[1]) };
    }
    return null;
  }
}
