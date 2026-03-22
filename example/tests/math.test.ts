
import { add } from '../math';

describe('Math Library', () => {
    it('should add two numbers', () => {
        expect(add(1, 2)).toBe(3);
    });
});
