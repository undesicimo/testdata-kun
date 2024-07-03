import path from "path";
import * as vscode from "vscode";
import { generatePrompt, mainChatPrompt } from "./mainPrompts";

export async function generate(typePrompt: string) {
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
    vscode.LanguageModelChatMessage.User(generatePrompt),
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
      if (text.includes("Error")) {
        throw new Error("Error");
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
