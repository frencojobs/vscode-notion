import * as vscode from 'vscode'

import Panel from '../panel'
import fetchData from './fetchData'
import parseUrl from './parseUrl'

export default async function openPanel(
  context: vscode.ExtensionContext,
  urlOrId: string
) {
  const API = vscode.workspace.getConfiguration('notion').get('api') as string
  if (!API) {
    throw new Error("Couldn't load the API url.")
  }

  const input = urlOrId.trim()
  if (!input) {
    throw new Error("The URL or ID can't be empty.")
  }

  const url = parseUrl(API, input)
  const data = await vscode.window.withProgress<Record<string, unknown>>(
    {
      title: 'VSCode Notion',
      location: vscode.ProgressLocation.Notification,
    },
    async (progress, _) => {
      progress.report({ message: 'Loading...' })
      return fetchData(url)
    }
  )

  if (data) {
    Panel.createOrShow(context, data)
  }
}
