import * as vscode from 'vscode'

import { Command } from '../CommandManager'
import NotionPanelManager from '../features/NotionPanelManager'
import parseId from '../utils/parseId'

export class OpenPage implements Command {
  public readonly id = 'vscode-notion.openPage'

  public constructor(private readonly manager: NotionPanelManager) {}

  public async execute(urlOrId?: string) {
    let input = urlOrId ?? ''

    if (!urlOrId) {
      input =
        (await vscode.window.showInputBox({
          prompt: 'Enter a full URL or just ID of the page.',
        })) ?? ''
    }

    if (!!input.trim()) {
      const id = parseId(input)
      this.manager.createOrShow(id)
    }
  }
}
