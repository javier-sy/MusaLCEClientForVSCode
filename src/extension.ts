import * as vscode from 'vscode';
import { Connection } from './connection';
import StatusView from './status-view';
import Commands from './command';

export function activate(context: vscode.ExtensionContext) {
  console.log("musa-lce-client-for-vscode: activate");

  const connection = new Connection();
  const statusView = new StatusView();
  const commands = new Commands(connection, statusView);

  connection.statusView = statusView;
  connection.open();

  const sendCommand = vscode.commands.registerCommand('musa-lce-client-for-vscode.send', () => {
    const editor = vscode.window.activeTextEditor;

    if (editor) {
      var selection = editor.document.getText(editor.selection) || '';

      if (selection.length === 0) {
        const startPosition = editor.selection.start.with(undefined, 0);
        const endPosition = editor.selection.end.with(undefined, editor.document.lineAt(editor.selection.end.line).range.end.character);
        const range = new vscode.Range(startPosition, endPosition);
        selection = editor.document.getText(range);
      }
      if (selection.startsWith('#%')) {
        const result = eval(`commands.${selection.substring(2)}`);
        statusView.status(result);
      } else {
        connection.write(editor.document.uri.fsPath, selection);
      }
    }
  });

  const toggleCommand = vscode.commands.registerCommand('musa-lce-client-for-vscode.toggle', () => {
    statusView.toggle();
  });

  context.subscriptions.push(sendCommand, toggleCommand);
}

export function deactivate() {
  console.log("musa-lce-client-for-vscode: deactivate");
}
