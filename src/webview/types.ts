type ExtendedWebviewMode = 'git' | 'file';
type IpcEventCommand = 'load' | 'change' | 'save';

interface IpcEvent {
  command: IpcEventCommand;
}

interface SaveEvent extends IpcEvent {
  command: 'save';
  contents: {
    left: string;
    right: string;
  };
}