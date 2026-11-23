export function computePassSerial(name: string, uni: string): string {
  const str = `${name}|${uni}`.toUpperCase();
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  const code = hash.toString(16).toUpperCase().slice(0, 4).padStart(4, '0');
  const initials =
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0] || '')
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'ET';
  return `ET-2026-${code}-${initials}`;
}

