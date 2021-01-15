import * as vscode from 'vscode'

import { Command } from '../CommandManager'
import NotionPanelManager from '../features/NotionPanelManager'

export class RemoveRecent implements Command {
  public readonly id = 'vscode-notion.removeRecent'

  constructor(private readonly manager: NotionPanelManager) {}

  execute(item: vscode.TreeItem) {
    this.manager.removeRecent(item.id!)
  }
}
