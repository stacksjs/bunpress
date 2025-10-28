// Sample JavaScript file for code import testing
export function greet(name) {
  return `Hello, ${name}!`
}

export function add(a, b) {
  return a + b
}

// #region math
export function multiply(a, b) {
  return a * b
}

export function divide(a, b) {
  if (b === 0) {
    throw new Error('Division by zero')
  }
  return a / b
}
// #endregion

export function subtract(a, b) {
  return a - b
}
