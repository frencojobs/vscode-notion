import * as vscode from 'vscode'

import { Command } from '../commandManager'
import NotionPanel from '../notionPanel'

export class RefreshPage implements Command {
  public readonly id = 'vscode-notion.refresh'

  public execute() {
    if (NotionPanel.activeView) {
      NotionPanel.cache.get(NotionPanel.activeView)?.refresh()
    }
  }
}
