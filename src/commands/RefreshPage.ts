import { Command } from '../CommandManager'
import NotionPanelManager from '../features/NotionPanelManager'

export class RefreshPage implements Command {
  public readonly id = 'vscode-notion.refresh'

  constructor(private readonly manager: NotionPanelManager) {}

  execute() {
    Array.from(this.manager.cache.values())
      .filter((x) => x.isActive)
      .forEach((x) => x.refresh())
  }
}
