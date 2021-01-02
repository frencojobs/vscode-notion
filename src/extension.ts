import * as vscode from "vscode";
import { NotionPanel } from "./notionPanel";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("vscode-notion.open", async () => {
      const input = await vscode.window.showInputBox({
        prompt: "Enter a full URL or just ID of the document.",
      });

      if (input !== undefined) {
        const data = await vscode.window.withProgress<string>(
          {
            title: "woo",
            location: vscode.ProgressLocation.Notification,
            cancellable: true,
          },
          async (progress, _) => {
            progress.report({ message: "loading" });
            return "woo";
          }
        );

        NotionPanel.createOrShow(context.extensionUri);
      }
    })
  );
}

export function deactivate() {}
