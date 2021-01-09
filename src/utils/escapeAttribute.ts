export default function escapeAttribute(value: string): string {
  return value.replace(/"/g, '&quot;')
}
