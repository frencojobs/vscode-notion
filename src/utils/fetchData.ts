import * as vscode from 'vscode'
import axios from 'axios'

import { NotionData } from '../types'

export default async function fetchData(id: string): Promise<NotionData> {
  const config = vscode.workspace.getConfiguration('vscode_notion')
  const api = config.get('api') as string

  if (!api.trim()) {
    throw new Error("API URL can't be empty.")
  }

  const res = await axios.get<NotionData>(`${api}/v1/page/${id}`)

  if (Object.keys(res.data).length < 1) {
    throw new Error("Couldn't load the data from API.")
  } else {
    return res.data
  }
}
