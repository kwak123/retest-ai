
import { JavascriptParser } from './javascript';
import { TestBlock } from './interface';

describe('JavascriptParser', () => {
    let parser: JavascriptParser;

    beforeEach(() => {
        parser = new JavascriptParser();
    });

    it('should extract basic "it" block', () => {
        const content = `
            it('should add two numbers', () => {
                const sum = 1 + 2;
                expect(sum).toBe(3);
            });
        `;
        const tests = parser.extractTests(content);
        expect(tests).toHaveLength(1);
        expect(tests[0].name).toBe('should add two numbers');
        expect(tests[0].body).toContain('const sum = 1 + 2;');
    });

    it('should extract basic "test" block', () => {
        const content = `
            test('should subtract two numbers', () => {
                const diff = 3 - 1;
                expect(diff).toBe(2);
            });
        `;
        const tests = parser.extractTests(content);
        expect(tests).toHaveLength(1);
        expect(tests[0].name).toBe('should subtract two numbers');
    });

    it('should handle nested blocks (currently flattened)', () => {
        const content = `
            describe('Math operations', () => {
                it('multiplies', () => {
                    expect(2*2).toBe(4);
                });
            });
        `;
        const tests = parser.extractTests(content);
        expect(tests).toHaveLength(1);
        expect(tests[0].name).toBe('multiplies');
    });

    it('should ignore non-test code', () => {
        const content = `
            function helper() {
                return true;
            }
            const x = 10;
        `;
        const tests = parser.extractTests(content);
        expect(tests).toHaveLength(0);
    });

    it('should handle tests with string template names (basic)', () => {
         // The current implementation might need adjustment for this if not using literals
         // But for now let's test what we expect
         const content = `it("double quotes", () => {})`;
         const tests = parser.extractTests(content);
         expect(tests[0].name).toBe('double quotes');

    });
});
