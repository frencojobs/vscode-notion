import * as vscode from 'vscode'

import getNonce from './utils/getNonce'
import openPanel from './utils/openPanel'

export default class Panel {
  public static readonly viewType = 'notion.view'

  private readonly _data: Record<string, unknown>
  private readonly _panel: vscode.WebviewPanel
  private readonly _extensionUri: vscode.Uri
  private _disposables: Array<vscode.Disposable> = []

  public static createOrShow(
    context: vscode.ExtensionContext,
    data: Record<string, unknown>
  ) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined

    const panel = vscode.window.createWebviewPanel(
      Panel.viewType,
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

    new Panel(panel, context, data)
  }

  private constructor(
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext,
    data: Record<string, unknown>
  ) {
    this._panel = panel
    this._extensionUri = context.extensionUri
    this._data = data

    this._update()
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables)
    this._panel.onDidChangeViewState(
      (_) => {
        if (this._panel.visible) {
          this._update()
        }
      },
      null,
      this._disposables
    )
    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'open':
            try {
              await openPanel(context, message.text)
            } catch (e) {
              if (e instanceof Error) {
                await vscode.window.showErrorMessage(
                  e.message ?? 'Unable to load the data!'
                )
              }
            }
            break
        }
      },
      null,
      this._disposables
    )
  }

  public dispose() {
    this._panel.dispose()

    while (this._disposables.length) {
      const x = this._disposables.pop()

      if (x) {
        x.dispose()
      }
    }
  }

  private get iconPath() {
    const root = vscode.Uri.joinPath(this._extensionUri, 'assets')
    return vscode.Uri.joinPath(root, 'notion.png')
  }

  private _update() {
    const webview = this._panel.webview
    this._panel.iconPath = this.iconPath

    const firstKey = Object.keys(this._data)[0]
    const firstBlock = (this._data[firstKey] as {
      value: Record<string, unknown>
    }).value as {
      properties: {
        title: Array<Array<unknown>>
      }
    }

    if (firstBlock?.properties?.title?.[0]) {
      this._panel.title = firstBlock.properties.title[0]
        .filter((x) => typeof x === 'string')
        .reduce<string>((a, b) => a + b, '')
    }

    this._panel.webview.html = this._getHtmlForWebView(webview, this._data)
  }

  private _getHtmlForWebView(
    webview: vscode.Webview,
    data: Record<string, unknown>
  ) {
    const nonce = getNonce()
    const config = vscode.workspace.getConfiguration('notion')
    const fontSize = config.get('fontSize') as number
    const fontFamily = config.get('fontFamily') as string

    const stylesResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'assets', 'reset.css')
    )

    const stylesMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'assets', 'vscode.css')
    )

    const stylesNotionUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'assets', 'notion.css')
    )

    const reactWebviewUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'assets', 'webview', 'index.js')
    )

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <!--
            Use a content security policy to only allow loading images from https or from our extension directory,
            and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${
          webview.cspSource
        } 'nonce-${nonce}'; img-src ${
      webview.cspSource
    } https:; script-src 'nonce-${nonce}';">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${stylesResetUri}" rel="stylesheet">
        <link href="${stylesMainUri}" rel="stylesheet">
        <link href="${stylesNotionUri}" rel="stylesheet">
        <style nonce=${nonce}>
          .notion {
            font-size: ${fontSize}px !important;
            font-family: ${fontFamily
              .split(',')
              .map((x) => x.trim())
              .join(', ')} !important;
          }
        </style>
        <script nonce=${nonce}>
          window.vscode = acquireVsCodeApi();
          window.data = ${JSON.stringify(data)};
        </script>
    </head>
    <body>
        <div id="root"></div>
        <script nonce="${nonce}" src="${reactWebviewUri}"></script>
    </body>
    </html>`
  }
}
