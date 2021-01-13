import * as vscode from 'vscode'

import NotionConfig from './NotionConfig'
import NotionPanel from './NotionPanel'
import escapeAttribute from '../utils/escapeAttribute'
import fetchData from '../utils/fetchData'
import getNonce from '../utils/getNonce'

export default class NotionPanelManager
  implements vscode.WebviewPanelSerializer {
  private readonly recentsKey = 'recents'
  private readonly bookmarksKey = 'bookmarks'
  private readonly uri: vscode.Uri

  public onDidRecentsUpdated: () => void = () => {}
  public onDidBookmarksUpdated: () => void = () => {}

  public config = new NotionConfig()
  public cache = new Map<string, NotionPanel>()

  constructor(private readonly context: vscode.ExtensionContext) {
    this.uri = this.context.extensionUri
  }

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
            return fetchData({
              id,
              api: this.config.api,
              accessToken: this.config.accessToken,
            })
          }
        )

        const panel = vscode.window.createWebviewPanel(
          NotionPanel.viewType,
          'VSCode Notion',
          column || vscode.ViewColumn.One,
          {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [vscode.Uri.joinPath(this.uri, 'resources')],
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

  public get recents() {
    return (
      this.context.globalState.get<Record<string, string>>(this.recentsKey) ??
      {}
    )
  }

  public get bookmarks() {
    return (
      this.context.globalState.get<Record<string, string>>(this.bookmarksKey) ??
      {}
    )
  }

  public async removeRecentEntry(id: string) {
    const recents = this.context.globalState.get<Record<string, string>>(
      this.recentsKey
    )

    if (recents) {
      delete recents[id]
    }

    this.onDidRecentsUpdated()
  }

  public async removeBookmarkEntry(id: string) {
    const bookmarks = this.context.globalState.get<Record<string, string>>(
      this.bookmarksKey
    )

    if (bookmarks) {
      delete bookmarks[id]
    }

    this.onDidBookmarksUpdated()
  }

  public async updateRecentEntry({ id, title }: { id: string; title: string }) {
    const recents = this.context.globalState.get<Record<string, string>>(
      this.recentsKey
    )

    await this.context.globalState.update(this.recentsKey, {
      ...(!!recents ? recents : {}),
      [id]: title,
    })

    this.onDidRecentsUpdated()
  }

  public async updateBookmarkEntry({
    id,
    title,
  }: {
    id: string
    title: string
  }) {
    const bookmarks = this.context.globalState.get<Record<string, string>>(
      this.bookmarksKey
    )

    await this.context.globalState.update(this.bookmarksKey, {
      ...(!!bookmarks ? bookmarks : {}),
      [id]: title,
    })

    this.onDidBookmarksUpdated()
  }

  public reloadRecents() {
    this.onDidRecentsUpdated()
  }

  public reloadBookmarks() {
    this.onDidBookmarksUpdated()
  }

  public clearRecents() {
    this.context.globalState.update(this.recentsKey, {})
    this.onDidRecentsUpdated()
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
      .map((x) =>
        webview.asWebviewUri(vscode.Uri.joinPath(uri, 'resources', 'styles', x))
      )
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
      vscode.Uri.joinPath(uri, 'resources', 'webview', 'index.js')
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
    const root = vscode.Uri.joinPath(this.uri, 'resources', 'icons')
    return vscode.Uri.joinPath(root, 'notion.svg')
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
