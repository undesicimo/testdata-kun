import path from "path";
import * as vscode from "vscode";
import { main } from "./mainPrompts";
import { typeFootprint } from "./typeFootprint";

export function activate(context: vscode.ExtensionContext) {
  // chat bot
  registerChatParticipant();
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

          console.info(typePrompt);

          await executePrompt(typePrompt);
        } catch (e) {
          console.error(e);
          vscode.window.showErrorMessage(String(e));
        }
      }
    }
  );

  context.subscriptions.push(disposable);
}

async function executePrompt(typePrompt: string) {
  const [model] = await vscode.lm.selectChatModels({
    vendor: "copilot",
    family: "gpt-3.5-turbo",
  });
  let chatResponse: vscode.LanguageModelChatResponse | undefined;
  // No models available
  if (!model) {
    vscode.window.showErrorMessage("No models available");
  }
  const messages = [
    vscode.LanguageModelChatMessage.User(main),
    vscode.LanguageModelChatMessage.User(
      "only respond with the dummy data in the format that corresponds to the type declaration."
    ),
    vscode.LanguageModelChatMessage.User(typePrompt),
  ];

  try {
    chatResponse = await model.sendRequest(
      messages,
      {},
      new vscode.CancellationTokenSource().token
    );
  } catch (err) {
    console.error(err);
    vscode.window.showErrorMessage(String(err));
    if (err instanceof vscode.LanguageModelError) {
      console.error(err.message, err.code, err.cause);
    } else {
      throw err;
    }
    return;
  }

  if (chatResponse) {
    const response = chatResponse;
    let text = "";
    try {
      for await (const chunk of response.text) {
        text += chunk;
      }
      //copy to clipboard
      await vscode.env.clipboard.writeText(text);
      vscode.window.showInformationMessage("Copied to clipboard");
    } catch (e) {
      vscode.window.showErrorMessage(String(e));
      console.error(e);
    }
  }
}

async function registerChatParticipant() {
  const handler: vscode.ChatRequestHandler = async (
    request: vscode.ChatRequest,
    context: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ) => {
    try {
      const [model] = await vscode.lm.selectChatModels({
        vendor: "copilot",
        family: "gpt-3.5-turbo",
      });

      //history
      const previousMessages = context.history.filter(
        h => h instanceof vscode.ChatRequestTurn
      );
      const prev = previousMessages.map(m =>
        vscode.LanguageModelChatMessage.User(m.prompt)
      );

      if (model) {
        const messages = [
          ...prev,
          vscode.LanguageModelChatMessage.User(main),
          vscode.LanguageModelChatMessage.User(request.prompt),
        ];

        const chatResponse = await model.sendRequest(messages, {}, token);
        for await (const fragment of chatResponse.text) {
          stream.markdown(fragment);
        }
      }
    } catch (err) {
      console.error(err);
      vscode.window.showErrorMessage(String(err));
      if (err instanceof vscode.LanguageModelError) {
        console.error(err.message, err.code, err.cause);
      } else {
        throw err;
      }
    }
  };

  const cat = vscode.chat.createChatParticipant("chat.testdata-kun", handler);
}

// This method is called when your extension is deactivated
export function deactivate() {}
