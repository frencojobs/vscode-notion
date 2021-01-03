export default function parseUrl(api: string, urlOrId: string): string {
  const pattern = /(?:https?:\/\/)?(?:www\.)?notion\.so\/([\w\.-]*)*\/?/;

  if (pattern.test(urlOrId)) {
    const id = urlOrId.match(pattern)?.[1]!;
    return `${api}/v1/page/${id}`;
  } else {
    return `${api}/v1/page/${urlOrId}`;
  }
}
