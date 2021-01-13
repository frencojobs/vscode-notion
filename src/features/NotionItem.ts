import * as vscode from 'vscode'

export default class NotionPageItem extends vscode.TreeItem {
  iconPath = new vscode.ThemeIcon('symbol-file')
  command: vscode.Command = {
    title: 'Open Page',
    command: 'vscode-notion.openPage',
    arguments: [this.id],
  }

  constructor(public readonly label: string, public readonly id: string) {
    super(label)
  }
}
