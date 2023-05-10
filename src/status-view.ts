import * as vscode from 'vscode';

export default class StatusView {
    private outputChannel: vscode.OutputChannel;
    private isVisible: boolean;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('MusaLCE Status');
        this.isVisible = false;
    }

    status(message: string) {
        this.addMessage(message, '>');
    }

    error(message: string) {
        this.addMessage(message, 'Error');
    }

    success(message: string) {
        this.addMessage(message);
    }

    response(message: string) {
        this.addMessage(message);
    }

    private addMessage(text: string, prefix?: string | null) {
        if (text) {
            if(prefix) {
                this.outputChannel.appendLine(`[${prefix}] ${text}`);
            } else {
                this.outputChannel.appendLine(text);
            }
        }
    }

    clear() {
        this.outputChannel.clear();
    }

    show() {
        this.outputChannel.show();
        this.isVisible = true;
    }

    hide() {
        this.outputChannel.hide();
        this.isVisible = false;
    }

    dispose() {
        this.outputChannel.dispose();
    }

    toggle(): void {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}
