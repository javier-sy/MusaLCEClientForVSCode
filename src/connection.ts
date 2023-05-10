import * as net from 'net';
import StatusView from './status-view';

export class Connection {

  host: string;
  port: number;
  statusView: StatusView | null = null;
  error: boolean;
  closed: boolean;
  client: net.Socket | null = null;

  constructor(host?: string, port?: number) {
    this.host = host || "localhost";
    this.port = port || 1327;
    this.error = false;
    this.closed = true;
  }

  destroy() {
    this.client?.end();
    this.statusView?.response("Disconnected from MusaLCEServer host");

    this.client = null;
    this.statusView = null;
  }

  open() {
    this.statusView?.response('Connecting to MusaLCEServer host ' + this.host + ':' + this.port + '...');

    if (this.client != null) this.close();

    this.client = this.createSocket();
    this.error = false;
    this.client.connect(this.port, this.host);
    this.closed = false;
  }

  close() {
    if (this.closed) {
      this.statusView?.response('Confirming closing last connection...');
    } else {
      this.statusView?.response('Closing current connection...');
      this.client?.end();
    }
    this.client = null;
    this.error = false;
    this.closed = true;
  }

  write(sourcePath: string, message: string) {
    if (this.error) this.close();
    if (this.closed) this.open();

    this.client?.write('#path\n');
    this.client?.write(sourcePath + '\n');
    this.client?.write('#begin\n');

    for (const line of message.split('\n')) {
      if (line === '#begin' || line === '#end') {
        this.client?.write('#' + line + '\n');
      } else {
        this.client?.write(line + '\n');
      }
    }

    this.client?.write('#end\n');
  }

  createSocket() {
    const self = this;
    const socket = new net.Socket();

    socket.on('error', function (error: string) {
      self.statusView?.error('Error on connection to MusaLCEServer host ' + self.host + ':' + self.port + ' (' + error + ')');
      self.error = true;
    });

    socket.on('close', function () {
      if (socket === self.client) {
        self.statusView?.error('Closed current connection');
        self.closed = true;
      } else {
        self.statusView?.error('Closed previous connection');
      }
    });

    socket.on('connect', function () {
      self.statusView?.response('... connected');
    });

    socket.on('data', function (data: Buffer) {
      if (self.statusView) {
        const lines = data.toString().trim().split('\n');
        let kind: string | null = null;
        let errorField: string | null = null;
        let echo: string[] = [];
        let errorMessage: string[] = [];
        let errorBacktrace: string[] = [];

        console.log("on data: lines = ", lines);

        for (const line of lines) {
          switch (line) {
            case '//echo':
              kind = 'echo';
              break;

            case '//error':
              kind = 'error';
              errorField = 'message';
              break;

            case '//backtrace':
              errorField = 'backtrace';
              break;

            case '//end':
              switch (kind) {
                case 'error':
                  for (const e of errorMessage) {
                    self.statusView.error(e);
                  }
    
                  for (const bt of errorBacktrace) {
                    self.statusView.error('\t' + bt);
                  }
                  errorField = null;
                  errorMessage = [];
                  errorBacktrace = [];
                  break;
    
                case 'echo':
                  for (const e of echo) {
                    self.statusView.status(e);
                  }
                  echo = [];
                  break;
              }
    
              kind = null;
    
              break;
    
            default:
              switch (kind) {
                case 'error':
                  switch (errorField) {
                    case 'message':
                      errorMessage.push(line);
                      break;
    
                    case 'backtrace':
                      if(line.trim() != '') { 
                        errorBacktrace.push(line); 
                      }
                      break;
                  }
                  break;
    
                case 'echo':
                  echo.push(line);
                  break;
    
                default:
                  const displayLine = line.startsWith('//') ? line.substring(2) : line;
                  self.statusView.success(displayLine);
              }
          }
        }
      } else {
        console.log("data received (no status view available): " + data);
      }
    });
    
    return socket;
  }
}    
