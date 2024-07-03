import path from "path";
import * as vscode from "vscode";
import { typeFootprint } from "./typeFootprint";
import { registerChatParticipant } from "./chatParticipant";
import { generate } from "./generate";

export function activate(context: vscode.ExtensionContext) {
  // chat bot
  registerChatParticipant(context);
  // commands
  const disposable = vscode.commands.registerCommand(
    "testdata-kun.generate",
    async () => {
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
        let typePrompt = "";
        targetAlias = activeEditor.document.getText(activeEditor.selection);

        try {
          typePrompt = typeFootprint(targetFile, targetAlias, {
            tsConfigFilePath,
          });

          await generate(typePrompt);
        } catch (e) {
          console.error(e);
          vscode.window.showErrorMessage(String(e));
        }
      }
    }
  );

  context.subscriptions.push(disposable);
}
