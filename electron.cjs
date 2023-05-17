const { app, BrowserWindow } = require('electron');

const createWindow = () => {
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  return window.loadFile('./dist/index.html');
};

const handleError = (error) => {
  console.error(`[ERROR]: ${error.message || error.toString()}`);
  app.quit();
};

app
  .whenReady()
  .then(createWindow)
  .then(() => {
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow().catch(handleError);
    });
  })
  .catch(handleError);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
