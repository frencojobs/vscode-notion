export default function parseId(urlOrId: string): string {
  const pattern = /(?:https?:\/\/)?(?:www\.)?notion\.so\/([\w\.-]*)*\/?/
  if (pattern.test(urlOrId)) {
    return urlOrId.match(pattern)?.[1]!
  }
  return urlOrId
}
