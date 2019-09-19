export function getRandomString() {
  return Math.random()
    .toString(36)
    .slice(2)
}
