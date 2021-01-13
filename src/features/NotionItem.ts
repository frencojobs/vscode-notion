import * as path from 'path'
import * as vscode from 'vscode'

export default class NotionPageItem extends vscode.TreeItem {
  iconPath = path.join(
    __filename,
    '..',
    '..',
    'resources',
    'icons',
    'symbol-file.svg'
  )

  command: vscode.Command = {
    title: 'Open Page',
    command: 'vscode-notion.open',
    arguments: [this.id],
  }

  constructor(public readonly label: string, public readonly id: string) {
    super(label)
  }
}
