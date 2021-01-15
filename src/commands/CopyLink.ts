import * as vscode from 'vscode'

import { Command } from '../CommandManager'
import NotionPanelManager from '../features/NotionPanelManager'

export class CopyLink implements Command {
  public readonly id = 'vscode-notion.copyLink'

  constructor(private readonly manager: NotionPanelManager) {}

  execute() {
    const activeViews = Array.from(this.manager.cache.values()).filter(
      (x) => x.isActive
    )

    if (activeViews.length > 0) {
      vscode.env.clipboard.writeText(`https://notion.so/${activeViews[0].id}`)
    }
  }
}
