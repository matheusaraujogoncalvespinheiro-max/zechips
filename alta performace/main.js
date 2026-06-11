const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const isPackaged = app.isPackaged;
const DATA_DIR = isPackaged ? path.dirname(process.execPath) : process.cwd();
const PRODUCTS_FILE = path.join(DATA_DIR, 'produtos.json');
const SALES_FILE = path.join(DATA_DIR, 'vendas.json');
const RATES_FILE = path.join(DATA_DIR, 'taxas.json');

// Mock Data
const defaultProducts = [];

const defaultRates = {
    "Pix": 0.99,
    "Cartão de Débito": 1.99,
    "Cartão de Crédito": 3.99,
    "Dinheiro": 0.00
};

const defaultSales = [];

function checkAndSeedDatabase() {
    try {
        if (!fs.existsSync(PRODUCTS_FILE)) {
            fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(defaultProducts, null, 2), 'utf-8');
        }
        if (!fs.existsSync(RATES_FILE)) {
            fs.writeFileSync(RATES_FILE, JSON.stringify(defaultRates, null, 2), 'utf-8');
        }
        if (!fs.existsSync(SALES_FILE)) {
            fs.writeFileSync(SALES_FILE, JSON.stringify(defaultSales, null, 2), 'utf-8');
        }
    } catch (err) {
        console.error('Error seeding database:', err);
    }
}

// Ensure database files exist
checkAndSeedDatabase();

function createWindow () {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Alta Performance - Controle Interno",
    autoHideMenuBar: true,
    backgroundColor: '#0b0f14',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC communication handlers for database read/write
ipcMain.handle('read-db', async (event, key) => {
    let filePath;
    let fallbackData;

    if (key === 'products') { filePath = PRODUCTS_FILE; fallbackData = defaultProducts; }
    else if (key === 'sales') { filePath = SALES_FILE; fallbackData = defaultSales; }
    else if (key === 'rates') { filePath = RATES_FILE; fallbackData = defaultRates; }
    else return null;

    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify(fallbackData, null, 2), 'utf-8');
            return fallbackData;
        }
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading database ${key}:`, err);
        return fallbackData;
    }
});

ipcMain.handle('write-db', async (event, key, data) => {
    let filePath;
    if (key === 'products') filePath = PRODUCTS_FILE;
    else if (key === 'sales') filePath = SALES_FILE;
    else if (key === 'rates') filePath = RATES_FILE;
    else return { success: false };

    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        return { success: true };
    } catch (err) {
        console.error(`Error writing database ${key}:`, err);
        return { success: false };
    }
});
