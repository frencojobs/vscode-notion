import * as vscode from 'vscode'

import NotionConfig from './notionConfig'
import NotionPanel from './notionPanel'
import escapeAttribute from '../utils/escapeAttribute'
import fetchData from '../utils/fetchData'
import getNonce from '../utils/getNonce'

export default class NotionPanelManager
  implements vscode.WebviewPanelSerializer {
  public config = new NotionConfig()
  public cache = new Map<string, NotionPanel>()

  constructor(private readonly uri: vscode.Uri) {}

  public async createOrShow(id: string) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined

    try {
      if (this.cache.has(id)) {
        this.cache.get(id)?.revive(column)
      } else {
        const data = await vscode.window.withProgress<NotionData>(
          {
            title: 'VSCode Notion',
            location: vscode.ProgressLocation.Notification,
          },
          async (progress, _) => {
            progress.report({ message: 'Loading...' })
            return fetchData(this.config.api, id)
          }
        )

        const panel = vscode.window.createWebviewPanel(
          NotionPanel.viewType,
          'VSCode Notion',
          column || vscode.ViewColumn.One,
          {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [vscode.Uri.joinPath(this.uri, 'assets')],
          }
        )
        panel.iconPath = this.iconPath

        this.cache.set(id, new NotionPanel(id, panel, this, data))
      }
    } catch (e) {
      if (e instanceof Error) {
        vscode.window.showErrorMessage(e.message)
      } else {
        vscode.window.showErrorMessage(e)
      }
    }
  }

  public async deserializeWebviewPanel(
    webviewPanel: vscode.WebviewPanel,
    state: { id: string; data: NotionData }
  ) {
    this.cache.set(
      state.id,
      new NotionPanel(state.id, webviewPanel, this, state.data)
    )
  }

  public dispose(id: string) {
    this.cache.delete(id)
  }

  public reloadConfig() {
    this.config = new NotionConfig()
  }

  private getSettingsOverrideStyles(): string {
    return [
      this.config.fontFamily
        ? `--notion-font-family: ${this.config.fontFamily};`
        : '',
      !isNaN(this.config.fontSize)
        ? `--notion-font-size: ${this.config.fontSize}px;`
        : '',
      !isNaN(this.config.lineHeight)
        ? `--notion-line-height: ${this.config.lineHeight};`
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

  private getStyles(webview: vscode.Webview, uri: vscode.Uri): string {
    return ['reset.css', 'vscode.css', 'notion.css', 'prism.css']
      .map((x) => webview.asWebviewUri(vscode.Uri.joinPath(uri, 'assets', x)))
      .map((x) => `<link href="${x}" rel="stylesheet" />`)
      .join('')
  }

  private getScripts(
    webview: vscode.Webview,
    uri: vscode.Uri,
    nonce: string,
    state: NotionState
  ): string {
    const reactWebviewUri = webview.asWebviewUri(
      vscode.Uri.joinPath(uri, 'assets', 'webview', 'index.js')
    )

    return `
    <script nonce=${nonce}>
      const vscode = acquireVsCodeApi();
      vscode.setState(${JSON.stringify(state)});
      window.vscode = vscode;
    </script>
    <script nonce="${nonce}" src="${reactWebviewUri}"></script>`
  }

  public get iconPath() {
    const root = vscode.Uri.joinPath(this.uri, 'assets')
    return vscode.Uri.joinPath(root, 'notion.png')
  }

  public getHTML(webview: vscode.Webview, state: NotionState) {
    const nonce = getNonce()

    return `
    <!DOCTYPE html>
    <html lang="en" 
          style="${escapeAttribute(this.getSettingsOverrideStyles())}">
    <head>
        ${this.getMetaTags(webview, nonce)}
        ${this.getStyles(webview, this.uri)}
    </head>
    <body>
        <div id="root"></div>
        ${this.getScripts(webview, this.uri, nonce, state)}
    </body>
    </html>`
  }
}
