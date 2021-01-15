import { Command } from '../CommandManager'
import NotionPanelManager from '../features/NotionPanelManager'

export class UnBookmarkPage implements Command {
  public readonly id = 'vscode-notion.unBookmarkPage'

  constructor(private readonly manager: NotionPanelManager) {}

  execute() {
    const activeViews = Array.from(this.manager.cache.values()).filter(
      (x) => x.isActive
    )

    if (activeViews.length > 0) {
      activeViews[0].unBookmark()
    }
  }
}
