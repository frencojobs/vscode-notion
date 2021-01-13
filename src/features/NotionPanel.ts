import * as vscode from 'vscode'

import NotionPanelManager from './NotionPanelManager'
import fetchData from '../utils/fetchData'
import getTitle from '../utils/getTitle'

export default class NotionPanel {
  public static readonly viewType = 'vscode-notion.pageView'
  public static readonly viewActiveContextKey = 'notionPageFocus'
  public static readonly viewBookmarkContextKey = 'notionPageBookmark'

  private disposables: Array<vscode.Disposable> = []

  constructor(
    public readonly id: string,
    private readonly panel: vscode.WebviewPanel,
    private readonly manager: NotionPanelManager,
    private data: NotionData
  ) {
    this.update()
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables)
    this.panel.onDidChangeViewState(
      (_) => {
        if (this.panel.visible) {
          this.update()
        }
      },
      null,
      this.disposables
    )
    this.panel.webview.onDidReceiveMessage(
      async (message: Message) => {
        switch (message.command) {
          case 'open':
            await manager.createOrShow(message.text)
            break
        }
      },
      null,
      this.disposables
    )
  }

  public get isActive() {
    return this.panel.active
  }

  public revive(column: vscode.ViewColumn | undefined) {
    this.panel.reveal(column)
  }

  public async refresh() {
    this.data = await vscode.window.withProgress<NotionData>(
      {
        title: 'VSCode Notion',
        location: vscode.ProgressLocation.Notification,
      },
      async (progress, _) => {
        progress.report({ message: 'Refreshing...' })
        return fetchData({
          id: this.id,
          api: this.manager.config.api,
          accessToken: this.manager.config.accessToken,
        })
      }
    )

    this.update()
  }

  public bookmark() {
    this.manager.updateBookmarkEntry({
      id: this.id,
      title: getTitle(this.data),
    })

    this.setBookmarkContext(true)
  }

  public unBookmark() {
    this.manager.removeBookmarkEntry(this.id)
    this.update()
  }

  private dispose() {
    this.setViewActiveContext(false)
    this.panel.dispose()
    this.manager.dispose(this.id)

    while (this.disposables.length) {
      const x = this.disposables.pop()
      if (x) {
        x.dispose()
      }
    }
  }

  private update() {
    const title = getTitle(this.data)
    this.panel.title = title

    this.setViewActiveContext(this.panel.active)

    if (Object.keys(this.manager.bookmarks).includes(this.id)) {
      this.manager.updateBookmarkEntry({
        id: this.id,
        title,
      })
      this.setBookmarkContext(true)
    } else {
      this.setBookmarkContext(false)
    }

    this.manager.updateRecentEntry({
      id: this.id,
      title,
    })

    this.panel.webview.html = this.manager.getHTML(this.panel.webview, {
      id: this.id,
      data: this.data,
    })
  }

  private setViewActiveContext(value: boolean) {
    vscode.commands.executeCommand(
      'setContext',
      NotionPanel.viewActiveContextKey,
      value
    )
  }

  private setBookmarkContext(value: boolean) {
    vscode.commands.executeCommand(
      'setContext',
      NotionPanel.viewBookmarkContextKey,
      value
    )
  }
}
