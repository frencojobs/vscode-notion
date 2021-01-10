import * as vscode from 'vscode'

import { NotionData } from './types'
import NotionPanelManager from './notionPanelManager'
import fetchData from './utils/fetchData'

export default class NotionPanel {
  public static readonly viewType = 'vscode-notion.view'
  public static readonly viewActiveContextKey = 'notionViewFocus'

  public static activeView: string | undefined = undefined
  public static cache = new Map<string, NotionPanel>()

  private readonly id: string
  private readonly panel: vscode.WebviewPanel

  private data: NotionData
  private disposables: Array<vscode.Disposable> = []

  public static async createOrShow(
    context: vscode.ExtensionContext,
    manager: NotionPanelManager,
    id: string
  ) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined

    if (this.cache.has(id)) {
      this.cache.get(id)?.panel.reveal(column)
    } else {
      const data = await vscode.window.withProgress<NotionData>(
        {
          title: 'VSCode Notion',
          location: vscode.ProgressLocation.Notification,
        },
        async (progress, _) => {
          progress.report({ message: 'Loading...' })
          return fetchData(id)
        }
      )

      const panel = vscode.window.createWebviewPanel(
        NotionPanel.viewType,
        'VSCode Notion',
        column || vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: [
            vscode.Uri.joinPath(context.extensionUri, 'assets'),
          ],
        }
      )

      this.cache.set(id, new NotionPanel(panel, context, manager, id, data))
    }
  }

  private constructor(
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext,
    private readonly manager: NotionPanelManager,
    id: string,
    data: NotionData
  ) {
    this.panel = panel
    this.panel.iconPath = manager.iconPath

    this.id = id
    this.data = data

    this.update()

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables)
    this.panel.onDidChangeViewState(
      ({ webviewPanel }) => {
        this.setViewActiveContext(webviewPanel.active)

        if (this.panel.visible) {
          NotionPanel.activeView = this.id
          this.update()
        } else {
          NotionPanel.activeView = undefined
        }
      },
      null,
      this.disposables
    )

    this.panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'open':
            await NotionPanel.createOrShow(context, manager, message.text)
            break
        }
      },
      null,
      this.disposables
    )
  }

  public dispose() {
    this.setViewActiveContext(false)

    NotionPanel.activeView = undefined
    NotionPanel.cache.delete(this.id)

    this.panel.dispose()
    while (this.disposables.length) {
      const x = this.disposables.pop()
      if (x) {
        x.dispose()
      }
    }
  }

  public async refresh() {
    this.data = await vscode.window.withProgress<NotionData>(
      {
        title: 'VSCode Notion',
        location: vscode.ProgressLocation.Notification,
      },
      async (progress, _) => {
        progress.report({ message: 'Refreshing...' })
        return fetchData(this.id)
      }
    )

    this.update()
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

    this.panel.webview.html = this.manager.getHTML(
      this.panel.webview,
      this.data
    )
  }

  private setViewActiveContext(value: boolean) {
    vscode.commands.executeCommand(
      'setContext',
      NotionPanel.viewActiveContextKey,
      value
    )
  }
}
