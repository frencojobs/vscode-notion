export type NotionData = Record<string, unknown>
export type NotionState = {
  id: string
  data: NotionData
}
export type Message = {
  command: string
  text: string
}
