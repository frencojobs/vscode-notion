import * as vscode from 'vscode'

import { NotionData } from './types'
import escapeAttribute from './utils/escapeAttribute'
import getNonce from './utils/getNonce'

export default class NotionPanelManager
  implements vscode.WebviewPanelSerializer {
  constructor(private readonly uri: vscode.Uri) {}

  public async deserializeWebviewPanel(
    webviewPanel: vscode.WebviewPanel,
    state: NotionData
  ) {
    webviewPanel.webview.html = this.getHTML(webviewPanel.webview, state)
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

  private getStyles(webview: vscode.Webview, uri: vscode.Uri): string {
    return ['reset.css', 'vscode.css', 'notion.css']
      .map((x) => webview.asWebviewUri(vscode.Uri.joinPath(uri, 'assets', x)))
      .map((x) => `<link href="${x}" rel="stylesheet" />`)
      .join('')
  }

  private getScripts(
    webview: vscode.Webview,
    uri: vscode.Uri,
    nonce: string,
    data: NotionData
  ): string {
    const reactWebviewUri = webview.asWebviewUri(
      vscode.Uri.joinPath(uri, 'assets', 'webview', 'index.js')
    )

    return `
      <script nonce=${nonce}>
        window.vscode = acquireVsCodeApi();
        window.data = ${JSON.stringify(data)};
      </script>
      <script nonce="${nonce}" src="${reactWebviewUri}"></script>`
  }

  public get iconPath() {
    const root = vscode.Uri.joinPath(this.uri, 'assets')
    return vscode.Uri.joinPath(root, 'notion.png')
  }

  public getHTML(webview: vscode.Webview, data: NotionData) {
    const nonce = getNonce()
    const config = vscode.workspace.getConfiguration('VSCodeNotion')

    return `
    <!DOCTYPE html>
    <html lang="en" 
          style="${escapeAttribute(this.getSettingsOverrideStyles(config))}">
    <head>
        ${this.getMetaTags(webview, nonce)}
        ${this.getStyles(webview, this.uri)}
    </head>
    <body>
        <div id="root"></div>
        ${this.getScripts(webview, this.uri, nonce, data)}
    </body>
    </html>`
  }
}
