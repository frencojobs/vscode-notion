import * as vscode from 'vscode'

import * as commands from './commands'
import { CommandManager } from './commandManager'

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(registerCommands(context))
}

function registerCommands(context: vscode.ExtensionContext): vscode.Disposable {
  const commandManager = new CommandManager()
  commandManager.register(new commands.OpenPage(context))
  commandManager.register(new commands.RefreshPage(context))
  return commandManager
}
