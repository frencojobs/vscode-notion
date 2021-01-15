type NotionData = Record<string, unknown>
type NotionState = {
  id: string
  data: NotionData
}
type Message = {
  command: string
  text: string
}
