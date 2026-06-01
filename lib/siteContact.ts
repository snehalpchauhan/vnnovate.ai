/** Update whatsappNumber with your business line (country code, no + or spaces). */
export const SITE_CONTACT = {
  email: 'hello@vnnovate.ai',
  whatsappNumber: '918160673087',
  whatsappMessage: "Hi Vnnovate.ai — I'd like to talk about an AI project.",
} as const

export function whatsappHref(): string {
  const text = encodeURIComponent(SITE_CONTACT.whatsappMessage)
  return `https://wa.me/${SITE_CONTACT.whatsappNumber}?text=${text}`
}

export function bookCallHref(): string {
  return `mailto:${SITE_CONTACT.email}?subject=${encodeURIComponent('Book a call — Vnnovate.ai')}`
}
