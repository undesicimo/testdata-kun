import path from "path";
import * as vscode from "vscode";
import { typeFootprint } from "./typeFootprint";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "testdata-kun.helloWorld",
    () => {
      let workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      let activeEditor = vscode.window.activeTextEditor;

      if (workspaceFolder && activeEditor) {
        let targetFile = activeEditor.document.uri.fsPath;
        //typeFootprint params
        let targetAlias = "";
        let tsConfigFilePath = path.join(
          workspaceFolder.uri.fsPath,
          "tsconfig.json"
        );

        targetAlias = activeEditor.document.getText(activeEditor.selection);
        vscode.window.showInformationMessage(
          typeFootprint(targetFile, targetAlias, {
            tsConfigFilePath,
          })
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
