import * as vscode from 'vscode'

import * as commands from './commands'
import { CommandManager } from './CommandManager'
import NotionPanelManager from './features/NotionPanelManager'

export function activate(context: vscode.ExtensionContext) {
  const manager = new NotionPanelManager(context.extensionUri)

  context.subscriptions.push(registerCommands(manager))
  context.subscriptions.push(
    vscode.window.registerWebviewPanelSerializer('vscode-notion.view', manager)
  )
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(() => manager.reloadConfig())
  )
}

function registerCommands(manager: NotionPanelManager): vscode.Disposable {
  const commandManager = new CommandManager()
  commandManager.register(new commands.OpenPage(manager))
  commandManager.register(new commands.RefreshPage(manager))
  commandManager.register(new commands.CopyLink(manager))
  return commandManager
}
