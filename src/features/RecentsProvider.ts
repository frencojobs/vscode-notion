import * as path from 'path'
import * as vscode from 'vscode'

import NotionPanelManager from './NotionPanelManager'

export default class RecentsProvider
  implements vscode.TreeDataProvider<NotionPageItem> {
  // --- yep, copied from StackOverflow
  private _onDidChangeTreeData: vscode.EventEmitter<
    NotionPageItem | undefined
  > = new vscode.EventEmitter<NotionPageItem | undefined>()

  readonly onDidChangeTreeData: vscode.Event<NotionPageItem | undefined> = this
    ._onDidChangeTreeData.event

  private refresh() {
    this._onDidChangeTreeData.fire(undefined)
  }
  /// ---

  constructor(private readonly manager: NotionPanelManager) {
    this.manager.onDidRecentsUpdated = () => {
      this.refresh()
    }
  }

  getTreeItem(element: NotionPageItem): vscode.TreeItem {
    return element
  }

  getChildren(): Thenable<Array<NotionPageItem>> {
    return Promise.resolve(
      Object.entries(this.manager.recents).map(
        ([id, title]) => new NotionPageItem(title, id)
      )
    )
  }
}

class NotionPageItem extends vscode.TreeItem {
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
