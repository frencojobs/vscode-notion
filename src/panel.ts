import * as vscode from "vscode";
import getNonce from "./utils/getNonce";

export default class Panel {
  public static readonly viewType = "notionPanel";

  private readonly _data: Record<string, unknown>;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(
    extensionUri: vscode.Uri,
    data: Record<string, unknown>
  ) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    const panel = vscode.window.createWebviewPanel(
      Panel.viewType,
      "Uwu",
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, "assets")],
      }
    );

    new Panel(panel, extensionUri, data);
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    data: Record<string, unknown>
  ) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._data = data;

    this._update();
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.onDidChangeViewState(
      (_) => {
        if (this._panel.visible) {
          this._update();
        }
      },
      null,
      this._disposables
    );
    this._panel.webview.onDidReceiveMessage((_) => {}, null, this._disposables);
  }

  public dispose() {
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();

      if (x) {
        x.dispose();
      }
    }
  }

  private _update() {
    const webview = this._panel.webview;
    this._panel.title = "Woo";
    this._panel.webview.html = this._getHtmlForWebView(webview, this._data);
  }

  private _getHtmlForWebView(
    webview: vscode.Webview,
    data: Record<string, unknown>
  ) {
    const nonce = getNonce();

    const reactWebviewUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "assets", "webview", "index.js")
    );

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
        } 'unsafe-inline'; img-src ${
      webview.cspSource
    } https:; script-src 'nonce-${nonce}';">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script nonce=${nonce}>
          window.data = ${JSON.stringify(data)};
        </script>
    </head>
    <body>
        <div id="root"></div>
        <script nonce="${nonce}" src="${reactWebviewUri}"></script>
    </body>
    </html>`;
  }
}
