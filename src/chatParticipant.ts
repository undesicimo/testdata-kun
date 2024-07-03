import * as vscode from "vscode";
import { mainChatPrompt } from "./mainPrompts";

export async function registerChatParticipant(
  context: vscode.ExtensionContext
) {
  const handler: vscode.ChatRequestHandler = async (
    request: vscode.ChatRequest,
    handlerCtx: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ) => {
    try {
      const [model] = await vscode.lm.selectChatModels({
        vendor: "copilot",
        family: "gpt-3.5-turbo",
      });

      const previousMessagesFromUser = handlerCtx.history
        .filter(h => h instanceof vscode.ChatRequestTurn)
        .map(c => {
          return vscode.LanguageModelChatMessage.User(c.prompt);
        });

      if (model) {
        const messages = [
          ...previousMessagesFromUser,
          vscode.LanguageModelChatMessage.User(mainChatPrompt),
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

  const chatbot = vscode.chat.createChatParticipant(
    "chat.testdata-kun",
    handler
  );
  chatbot.iconPath = vscode.Uri.joinPath(context.extensionUri, "icon.webp");
}
