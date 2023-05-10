import * as vscode from 'vscode';

export default class Commands {
  connection: any;
  statusView: any;

  constructor(connection: any, statusView: any) {
    this.connection = connection;
    this.statusView = statusView;
  }

  host(host: string | null, port: number | null): void {
    if (host !== null || port !== null) {
      this.connection.close();

      if (host !== null) {
        this.connection.host = host;
      }
      if (port !== null) {
        this.connection.port = port;
      }

      this.connection.open();
    }
  }

  clear(): void {
    console.log("Commands.clear()");
    this.statusView.clear();
  }
}
