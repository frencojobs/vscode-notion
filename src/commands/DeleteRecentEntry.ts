import * as vscode from 'vscode'

import { Command } from '../CommandManager'
import NotionPanelManager from '../features/NotionPanelManager'

export class DeleteRecentEntry implements Command {
  public readonly id = 'vscode-notion.deleteRecentEntry'

  constructor(private readonly manager: NotionPanelManager) {}

  execute(item: vscode.TreeItem) {
    this.manager.removeRecentEntry(item.id!)
  }
}
