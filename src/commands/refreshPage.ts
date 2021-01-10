import { Command } from '../commandManager'
import NotionPanelManager from '../notionPanelManager'

export class RefreshPage implements Command {
  public readonly id = 'vscode-notion.refresh'

  constructor(private readonly manager: NotionPanelManager) {}

  execute() {
    const activeViews = Array.from(this.manager.cache.values()).filter(
      (x) => x.isActive
    )

    for (const view of activeViews) {
      view.refresh()
    }
  }
}
