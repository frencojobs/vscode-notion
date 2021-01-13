import { Command } from '../CommandManager'
import NotionPanelManager from '../features/NotionPanelManager'

export class ReloadRecents implements Command {
  public readonly id = 'vscode-notion.reloadRecents'

  constructor(private readonly manager: NotionPanelManager) {}

  execute() {
    this.manager.reloadRecents()
  }
}
