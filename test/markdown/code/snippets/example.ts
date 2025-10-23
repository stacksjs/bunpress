// Sample TypeScript file for code import testing
interface User {
  id: number
  name: string
  email: string
}

// #region validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateUser(user: User): boolean {
  return user.id > 0 && user.name.length > 0 && validateEmail(user.email)
}
// #endregion

export function createUser(name: string, email: string): User {
  return {
    id: Date.now(),
    name,
    email,
  }
}
