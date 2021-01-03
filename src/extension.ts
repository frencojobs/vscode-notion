import * as vscode from "vscode";
import fetch from "node-fetch";
import Panel from "./panel";
import parseUrl from "./utils/parseUrl";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("vscode-notion.open", async () => {
      const input = await vscode.window.showInputBox({
        prompt: "Enter a full URL or just ID of the document.",
      });

      if (input !== undefined) {
        const url = parseUrl(
          vscode.workspace.getConfiguration("notion").get("api") as string,
          input
        );

        const data = await vscode.window.withProgress<Record<string, unknown>>(
          {
            title: "VSCode Notion",
            location: vscode.ProgressLocation.Notification,
            cancellable: true,
          },
          async (progress, _) => {
            progress.report({ message: "loading data" });
            const body = await (await fetch(url)).json();
            return body;
          }
        );

        console.log(data);

        Panel.createOrShow(context.extensionUri);
      }
    })
  );
}

export function deactivate() {}
