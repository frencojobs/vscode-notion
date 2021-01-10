import * as vscode from 'vscode'

import { Command } from '../commandManager'
import NotionPanelManager from '../notionPanelManager'
import parseId from '../utils/parseId'

export class OpenPage implements Command {
  public readonly id = 'vscode-notion.open'

  public constructor(private readonly manager: NotionPanelManager) {}

  public execute() {
    vscode.window
      .showInputBox({
        prompt: 'Enter a full URL or just ID of the page.',
      })
      .then((input) => {
        if (!!input?.trim()) {
          const id = parseId(input)
          this.manager.createOrShow(id)
        }
      })
  }
}
