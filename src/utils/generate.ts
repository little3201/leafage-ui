/**
 * base 64 endcode
 * @param array 数组
 * @returns the url after base 64 endcode
 */
function base64UrlEncode(array: Uint8Array) {
  return btoa(String.fromCodePoint(...array))
    .replaceAll(/\+/g, '-').replaceAll(/\//g, '_').replace(/=+$/, '')
}

/**
 * generate verifer code
 * @returns verifer code
 */
export function generateVerifier(): string {
  const array = new Uint8Array(32)
  globalThis.crypto.getRandomValues(array)
  return base64UrlEncode(array)
}

/**
 * generate challenge code
 * @param codeVerifier verifier code
 * @returns challenge code
 */
export async function generateCodeChallenge(codeVerifier: string) {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier))
    .then(buffer => base64UrlEncode(new Uint8Array(buffer)))
}