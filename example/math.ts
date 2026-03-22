
export function add(a: number, b: number): number {
    return a + b;
}

export function subtract(a: number, b: number): number {
    // BUG: Intentional bug for testing
    return b - a; 
}

export function multiply(a: number, b: number): number {
    return a * b;
}
