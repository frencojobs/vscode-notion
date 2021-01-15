import { Command } from '../CommandManager'
import NotionPanelManager from '../features/NotionPanelManager'

export class ClearRecents implements Command {
  public readonly id = 'vscode-notion.clearRecents'

  constructor(private readonly manager: NotionPanelManager) {}

  execute() {
    this.manager.clearRecents()
  }
}
