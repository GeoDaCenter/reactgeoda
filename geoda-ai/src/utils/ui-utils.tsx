import { createHash } from 'crypto';

// function to generate random id with 7 characters
export function generateRandomId() {
  return Math.random().toString(36).substring(7);
}

// generate hash id using input string
export function generateHashId(str: string) {
  const sha256 = createHash('sha256');
  sha256.update(str);
  return sha256.digest('hex');
}
