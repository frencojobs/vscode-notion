import * as vscode from 'vscode'

import NotionPageItem from './NotionItem'
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
      Object.entries(this.manager.recents)
        .reverse()
        .map(([id, title]) => new NotionPageItem(title, id))
    )
  }
}
