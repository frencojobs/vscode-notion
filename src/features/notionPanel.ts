import * as vscode from 'vscode'

import NotionPanelManager from './notionPanelManager'
import fetchData from '../utils/fetchData'

export default class NotionPanel {
  public static readonly viewType = 'vscode-notion.view'
  public static readonly viewActiveContextKey = 'notionViewFocus'

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
      ({ webviewPanel }) => {
        this.setViewActiveContext(webviewPanel.active)
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
        return fetchData(this.manager.config.api, this.id)
      }
    )

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
    const firstKey = Object.keys(this.data)[0]
    const firstBlock = (this.data[firstKey] as {
      value: Record<string, unknown>
    }).value as {
      properties: {
        title: Array<Array<unknown>>
      }
    }

    if (firstBlock?.properties?.title?.[0]) {
      this.panel.title = firstBlock.properties.title[0]
        .filter((x) => typeof x === 'string')
        .reduce<string>((a, b) => a + b, '')
    }

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
}
