import * as vscode from 'vscode'

import { Command } from '../commandManager'
import NotionPanel from '../notionPanel'
import parseId from '../utils/parseId'

export class OpenPage implements Command {
  public readonly id = 'vscode-notion.open'

  public constructor(private readonly context: vscode.ExtensionContext) {}

  public async execute() {
    const input = await vscode.window.showInputBox({
      prompt: 'Enter a full URL or just ID of the page.',
    })

    if (!!input?.trim()) {
      const id = parseId(input)
      await NotionPanel.createOrShow(this.context, id)
    }
  }
}
