const EMAIL_FORMAT_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Normalizes an email address into its canonical identity to block
 * Sybil / starter-credit farming via +subaddress tags, Gmail dots, and googlemail aliases.
 */
export function canonicalizeEmail(rawEmail: string): string {
  const normalized = rawEmail.trim().toLowerCase();
  const parts = normalized.split('@');
  if (parts.length !== 2) return normalized;

  let [local, domain] = parts;

  // Normalize googlemail.com -> gmail.com
  if (domain === 'googlemail.com') {
    domain = 'gmail.com';
  }

  // Strip +subaddress tags across email providers
  const plusIdx = local.indexOf('+');
  if (plusIdx !== -1) {
    local = local.slice(0, plusIdx);
  }

  // Gmail ignores periods in the local part
  if (domain === 'gmail.com') {
    local = local.replace(/\./g, '');
  }

  return `${local}@${domain}`;
}

export function isValidEmailFormat(rawEmail: string): boolean {
  const clean = rawEmail.trim();
  return clean.length >= 5 && clean.length <= 254 && EMAIL_FORMAT_REGEX.test(clean);
}
