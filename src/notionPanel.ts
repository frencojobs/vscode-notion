import * as vscode from 'vscode'

import { NotionData } from './types'
import escapeAttribute from './utils/escapeAttribute'
import fetchData from './utils/fetchData'
import getNonce from './utils/getNonce'

export default class NotionPanel {
  private static cache = new Map<string, NotionPanel>()
  public static readonly viewType = 'vscode-notion.view'

  private readonly id: string
  private readonly uri: vscode.Uri
  private readonly panel: vscode.WebviewPanel

  private data: NotionData
  private disposables: Array<vscode.Disposable> = []

  public static async createOrShow(
    context: vscode.ExtensionContext,
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

      this.cache.set(id, new NotionPanel(panel, context, id, data))
    }
  }

  private constructor(
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext,
    id: string,
    data: NotionData
  ) {
    this.panel = panel
    this.uri = context.extensionUri
    this.panel.iconPath = this.iconPath()

    this.id = id
    this.data = data

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
      async (message) => {
        switch (message.command) {
          case 'open':
            await NotionPanel.createOrShow(context, message.text)
            break
        }
      },
      null,
      this.disposables
    )
  }

  public dispose() {
    NotionPanel.cache.delete(this.id)

    this.panel.dispose()
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

    this.panel.webview.html = this.getHTML(this.panel.webview, this.data)
  }

  private iconPath() {
    const root = vscode.Uri.joinPath(this.uri, 'assets')
    return vscode.Uri.joinPath(root, 'notion.png')
  }

  private getSettingsOverrideStyles(
    config: vscode.WorkspaceConfiguration
  ): string {
    return [
      config.has('fontFamily')
        ? `--notion-font-family: ${config.get('fontFamily')};`
        : '',
      config.has('fontSize') && !isNaN(config.get('fontSize') ?? NaN)
        ? `--notion-font-size: ${config.get('fontSize')}px;`
        : '',
    ].join('')
  }

  private getMetaTags(webview: vscode.Webview, nonce: string): string {
    return `
      <meta charset="UTF-8">
      <meta name="viewport" 
             content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Security-Policy" 
             content="default-src 'none'; 
                      style-src ${webview.cspSource} 'nonce-${nonce}'; 
                      img-src ${webview.cspSource} https:; 
                      script-src 'nonce-${nonce}';">`
  }

  private getStyles(webview: vscode.Webview): string {
    return ['reset.css', 'vscode.css', 'notion.css']
      .map((x) =>
        webview.asWebviewUri(vscode.Uri.joinPath(this.uri, 'assets', x))
      )
      .map((x) => `<link href="${x}" rel="stylesheet" />`)
      .join('')
  }

  private getScripts(
    webview: vscode.Webview,
    nonce: string,
    data: NotionData
  ): string {
    const reactWebviewUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.uri, 'assets', 'webview', 'index.js')
    )

    return `
      <script nonce=${nonce}>
        window.vscode = acquireVsCodeApi();
        window.data = ${JSON.stringify(data)};
      </script>
      <script nonce="${nonce}" src="${reactWebviewUri}"></script>`
  }

  private getHTML(webview: vscode.Webview, data: NotionData) {
    const nonce = getNonce()
    const config = vscode.workspace.getConfiguration('VSCodeNotion')

    return `
    <!DOCTYPE html>
    <html lang="en" 
          style="${escapeAttribute(this.getSettingsOverrideStyles(config))}">
    <head>
        ${this.getMetaTags(webview, nonce)}
        ${this.getStyles(webview)}
    </head>
    <body>
        <div id="root"></div>
        ${this.getScripts(webview, nonce, data)}
    </body>
    </html>`
  }
}
