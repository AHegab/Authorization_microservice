

export function calculatePasswordEntropy(password: string): number {
    let poolSize = 0;

    if (/[a-z]/.test(password)) poolSize += 26; // Lowercase letters
    if (/[A-Z]/.test(password)) poolSize += 26; // Uppercase letters
    if (/[0-9]/.test(password)) poolSize += 10; // Digits
    if (/[\W_]/.test(password)) poolSize += 32; // Special characters

    return password.length * Math.log2(poolSize);
}