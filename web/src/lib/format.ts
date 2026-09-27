export function formatEditionDate(s: string): string {
  try {
    const d = new Date(s);
    return (
      d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) +
      ' · ' +
      d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    );
  } catch {
    return s;
  }
}

export function naira(n: number): string {
  return `₦${Number(n).toLocaleString()}`;
}

export function shortDate(s: string): string {
  return (s || '').slice(0, 10);
}
