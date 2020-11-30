const {
  app,
  BrowserWindow,
  BrowserView,
  Tray,
  Menu,
  shell,
  ipcMain,
  nativeTheme,
} = require('electron');
const path = require('path');

let tray = undefined;
let window = undefined;
let view = undefined;
const DEFAULT_WIDTH = 360;
const DEFAULT_HEIGHT = 540;
const STOCK_URL = 'https://tcinvest.tcbs.com.vn/tc-price';
const HOME_URL = 'https://tcinvest.tcbs.com.vn/home';
const ACCOUNT_URL = 'https://tcinvest.tcbs.com.vn/my-asset';

// Don't show the app in the doc
app.dock.hide();

app.on('ready', () => {
  createTray();
  createWindow();
});

const getTrayIconPath = () => {
  const fileName = 'trend-light.png';
  return app.isPackaged
    ? path.join(process.resourcesPath, fileName)
    : path.join('assets', fileName);
};

nativeTheme.on('updated', function theThemeHasChanged() {
  tray.setImage(getTrayIconPath());
});

const createTray = () => {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Home',
      click() {
        view.webContents.loadURL(HOME_URL);
        !window.isVisible() && showWindow();
      },
    },
    {
      label: 'Priceboard',
      click() {
        view.webContents.loadURL(STOCK_URL);
        !window.isVisible() && showWindow();
      },
    },
    {
      label: 'My Assets',
      click() {
        view.webContents.loadURL(ACCOUNT_URL);
        !window.isVisible() && showWindow();
      },
    },
    {
      type: 'separator',
    },
    {
      label: 'Reload Popup',
      click() {
        view.webContents.reload();
      },
    },
    {
      label: 'View on browser',
      click() {
        const currentURL = view.webContents.getURL();
        shell.openExternal(currentURL);
      },
    },
    {
      type: 'separator',
    },
    {
      label: 'Open Devtools',
      click() {
        view.webContents.openDevTools();
      },
    },
    {
      label: 'Quit',
      click() {
        app.quit();
      },
    },
  ]);

  tray = new Tray(getTrayIconPath());
  tray.on('click', function (event) {
    toggleWindow();
  });

  tray.on('right-click', function (event) {
    tray.popUpContextMenu(contextMenu);
  });
};

const getWindowPosition = () => {
  const windowBounds = window.getBounds();
  const trayBounds = tray.getBounds();

  // Center window horizontally below the tray icon
  const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2);

  // Position window 4 pixels vertically below the tray icon
  const y = Math.round(trayBounds.y + trayBounds.height);

  return { x: x, y: y };
};

const createWindow = () => {
  window = new BrowserWindow({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: false,
    webPreferences: {
      backgroundThrottling: false,
      contextIsolation: true,
    },
  });
  const { width, height } = window.getContentBounds();

  view = new BrowserView({
    webPreferences: {
      backgroundThrottling: false,
      contextIsolation: true,
    },
  });
  window.setBrowserView(view);
  view.setBounds({ x: 0, y: 0, width, height });
  view.webContents.loadURL(STOCK_URL);

  // Hide the window when it loses focus
  window.on('blur', () => {
    if (!window.webContents.isDevToolsOpened()) {
      window.hide();
    }
  });
};

const toggleWindow = () => {
  window.isVisible() ? window.hide() : showWindow();
};

const showWindow = () => {
  const position = getWindowPosition();
  window.setPosition(position.x, position.y, false);
  window.show();
};

ipcMain.on('show-window', () => {
  showWindow();
});
