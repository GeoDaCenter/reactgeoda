// function to generate random id with 7 characters
export function generateRandomId() {
  return Math.random().toString(36).substring(7);
}
