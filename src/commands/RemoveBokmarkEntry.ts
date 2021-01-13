import * as vscode from 'vscode'

import { Command } from '../CommandManager'
import NotionPanelManager from '../features/NotionPanelManager'

export class RemoveBookmarkEntry implements Command {
  public readonly id = 'vscode-notion.removeBookmarkEntry'

  constructor(private readonly manager: NotionPanelManager) {}

  execute() {
    const activeViews = Array.from(this.manager.cache.values()).filter(
      (x) => x.isActive
    )

    if (activeViews.length > 0) {
      activeViews[0].removeBookmark()
    }
  }
}
