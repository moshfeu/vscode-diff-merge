type ExtendedWebviewMode = 'git' | 'file';
type IpcEventCommand = 'load' | 'change' | 'save' | 'diffApplied';

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

interface DiffAppliedEvent extends IpcEvent {
  command: 'diffApplied';
  count: number;
}

type DiffViewEvent = IpcEvent | SaveEvent | DiffAppliedEvent;