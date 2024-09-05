import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  handleUpdate(callback: (filename: string) => void) {
    const handler = (_, filename: string) => {
      callback(filename);
    };

    ipcRenderer.on('timesheet-update', handler);
  },
});
