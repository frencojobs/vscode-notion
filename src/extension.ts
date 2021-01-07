import * as vscode from 'vscode'

import openPanel from './utils/openPanel'

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('vscode-notion.open', async () => {
      const input = await vscode.window.showInputBox({
        prompt: 'Enter a full URL or just ID of the document.',
      })

      if (!!input) {
        try {
          await openPanel(context, input)
        } catch (e) {
          if (e instanceof Error) {
            await vscode.window.showErrorMessage(
              e.message ?? 'Unable to load the data!'
            )
          }
        }
      }
    })
  )
}

export function deactivate() {}
