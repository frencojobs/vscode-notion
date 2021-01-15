export default function getTitle(data: NotionData) {
  const firstKey = Object.keys(data)[0]
  const firstBlock = (data[firstKey] as {
    value: Record<string, unknown>
  }).value as {
    properties: {
      title: Array<Array<unknown>>
    }
  }

  if (firstBlock?.properties?.title?.[0]) {
    return firstBlock.properties.title[0]
      .filter((x) => typeof x === 'string')
      .reduce<string>((a, b) => a + b, '')
  } else {
    return firstKey.substr(0, 5)
  }
}
