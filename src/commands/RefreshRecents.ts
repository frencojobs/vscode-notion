import { Command } from '../CommandManager'
import NotionPanelManager from '../features/NotionPanelManager'

export class RefreshRecents implements Command {
  public readonly id = 'vscode-notion.refreshRecents'

  constructor(private readonly manager: NotionPanelManager) {}

  execute() {
    this.manager.refreshRecents()
  }
}
