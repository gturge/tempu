import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';
import url from 'node:url';
import chalk from 'chalk';
import dotenv from 'dotenv';
import parse from './timesheet-parser';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

dotenv.config();

function getFilename(): string | undefined {
  if (process.env.NODE_ENV === 'develop') {
    const [_bin, _script, filename] = process.argv;
    return filename;
  }

  const [_bin, filename] = process.argv;
  return filename;
}

const windows: Record<string, BrowserWindow | null> = { main: null };

app.on('ready', async () => {
  const filename = getFilename();

  if (!filename) {
    console.log(chalk.red('No filename specified'));
    process.exit(1);
  }

  try {
    await fs.access(filename, fs.constants.R_OK);
  } catch (err) {
    console.log(chalk.red(`File '${filename}' doesn't exist`));
    process.exit(1);
  }

  windows.main = new BrowserWindow({
    autoHideMenuBar: true,
    width: 800,
    height: 768,
    resizable: true,
    backgroundColor: '#000000',
    title: `Tempù`,
    show: false,
    webPreferences: {
      preload: `${path.dirname(__dirname)}/dist/preload.js`,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  windows.main.loadFile(`${path.dirname(__dirname)}/index.html`);
  windows.main.on('closed', () => (windows.main = null));

  windows.main.webContents.on('did-finish-load', async () => {
    windows.main!.show();
    const content = await fs.readFile(filename, 'utf-8');
    const timesheet = parse(content);
    windows.main!.webContents.send('timesheet-update', timesheet);
  });

  windows.main = windows.main;
});
