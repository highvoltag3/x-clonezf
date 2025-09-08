import CryptoJS from 'crypto-js'

export function getGravatarUrl(email: string, size: number = 80): string {
  const hash = CryptoJS.MD5(email.toLowerCase().trim()).toString()
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon&r=pg`
}

export function getGravatarUrlWithFallback(email: string, size: number = 80): string {
  const hash = CryptoJS.MD5(email.toLowerCase().trim()).toString()
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon&r=pg&f=y`
}
