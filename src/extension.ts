import * as vscode from 'vscode'

import * as commands from './commands'
import { CommandManager } from './CommandManager'
import BookmarksProvider from './features/BookmarksProvider'
import NotionPanelManager from './features/NotionPanelManager'
import RecentsProvider from './features/RecentsProvider'

export async function activate(context: vscode.ExtensionContext) {
  const manager = new NotionPanelManager(context)
  const recents = new RecentsProvider(manager)
  const bookmarks = new BookmarksProvider(manager)

  context.subscriptions.push(registerCommands(manager))
  context.subscriptions.push(
    vscode.window.registerWebviewPanelSerializer('vscode-notion.view', manager)
  )
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('vscode-notion-recents', recents)
  )

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('vscode-notion-bookmarks', bookmarks)
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

  commandManager.register(new commands.ClearRecents(manager))
  commandManager.register(new commands.ReloadRecents(manager))
  commandManager.register(new commands.RemoveRecentEntry(manager))

  commandManager.register(new commands.BookmarkEntry(manager))
  commandManager.register(new commands.RemoveBookmarkEntry(manager))
  return commandManager
}
