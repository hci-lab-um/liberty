const {app, BrowserWindow, ipcMain, Menu, dialog} = require('electron')
const fs = require('fs')
const configfile = 'config.json';
const defaultVocabularyFile = 'demoboard.json';
const path = require('path');
const url = require('url')

//Disables caching
app.commandLine.appendSwitch ("disable-http-cache");

let mainWindow;
//default configuration if configuration file does not exist
let defaultConfiguration = {
    "automaticScanningInterval": 2500,
    "backScanningGesture": "LEFT_ARROW",
    "selectorGesture": "SPACEBAR",
    "highlightColor": "green",
    "hoverDuration": 3000,
    "dwellAnimation": "fill-up",
    "isLeap": false,
    "leapInterval": 1000,
    "regionScanningColumns": 2,
    "regionScanningRows": 3,
    "scanningType": "STEP_SCANNING",
    "scanningGesture": "RIGHT_ARROW",
    "transition": "fade",
    "vocabularyFile": "demoboard.json"
};
// Template for Menu inside the solution
const menuTemplate = [
    {
    label: 'Settings',
    submenu: [
        {
            label: 'Create new vocabulary',
            click: function() {
                // send message to the main window to handle creation of new board
                mainWindow.webContents.send('createBoard');
            }
        },
        {
            label: 'Edit existing vocabulary',
            click: function() {
                // open file dialog to select vocabulary to edit
                dialog.showOpenDialog({
                        properties: ['openFile'],
                        filters: [{name: 'Custom File Type', extensions: ['json']}]
                    })
                    .then((result) => {
                        if (!result.canceled) {
                            const filepaths = result.filePaths;
                            if (typeof(filepaths) !== 'undefined') {
                                var vocabulary = JSON.parse(fs.readFileSync(filepaths[0], "utf8"));
                                // send message to main window with vocabulary to edit
                                mainWindow.webContents.send('editExistingBoard', vocabulary);
                            }
                        }
                    });
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'Import existing vocabulary',
            click: function() {
                //Open dialog to import a vocabulary into the board
                dialog.showOpenDialog({
                        properties: ['openFile'],
                        filters: [{name: 'Custom File Type', extensions: ['json']}]
                    })
                    .then((result) => {
                        if (!result.canceled) {
                            const filepaths = result.filePaths;
                            if (typeof filepaths !== 'undefined' && filepaths.length > 0) {
                                try {
                                    var vocabulary = JSON.parse(fs.readFileSync(filepaths[0], 'utf8'));
                                    mainWindow.webContents.send('vocabularyLoad', vocabulary);
                                } catch (error) {
                                    console.error('Error reading or parsing file:', error);
                                }
                            }
                        }
                    });
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'Change board configuration',
            click: function() {
                // send message to main window to open configuration modal
                mainWindow.webContents.send('configBoard');
            }
        }
    ]
    } /**Options below commented out as these were meant to be used in development only**/ , {
        label: 'Open Dev Tools',
        click: function() {
            mainWindow.openDevTools();
        }
    }, 
    {
        label: 'Refresh Page',
        click: function() {
            mainWindow.reload();
        }
    }];


function createWindow() {
    // create the main window
    mainWindow = new BrowserWindow({
        show: false,
        icon: __dirname + '/public/icon.png',
        title: 'Communications Board',
        backgroundColor: '#dee8f9',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
        minWidth: 1024,
        minHeight: 768,
    });
    mainWindow.maximize();
    var menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
    // load the index.html into the main window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, '/public/index.html'),
        protocol: 'file:',
        slashes: true
    }))

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

ipcMain.once('windowLoaded', (event) => {
    mainWindow.show();
})

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

ipcMain.on('refreshPage', (event) => {
    mainWindow.reload();
})

ipcMain.on('configChange', (event, configs) => {
    try {
        //save the configuration in the file system in JSON format
        var content = JSON.stringify(configs);
        fs.writeFileSync(configfile, content, 'utf8');
    } catch (e) {
        console.log(e);
    }
})

ipcMain.on('getVocabulary', (event, vocabularyPath) => {
    // send the vocabulary in the given path to the main window 
    if (fs.existsSync(vocabularyPath))
        var vocabulary = JSON.parse(fs.readFileSync(vocabularyPath, "utf8"));
    else if (fs.existsSync(defaultVocabularyFile))
        var vocabulary = JSON.parse(fs.readFileSync(defaultVocabularyFile, "utf8"));
    else var vocabulary = [];
    mainWindow.webContents.send("vocabularyLoad", vocabulary);
})

ipcMain.on('getConfiguration', (event) => {
    // send the configurations to the main window
    if (fs.existsSync(configfile))
        var configuration = JSON.parse(fs.readFileSync(configfile, 'utf8'));
    else
        var configuration = defaultConfiguration; // in case the configuration file does not exist send default
    mainWindow.webContents.send('configLoad', configuration);
});

ipcMain.on('addImageToNewItem', (event) => {
    // open file dialog to add an image to a vocabulary item
    dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{name: 'Images',extensions: ['jpg', 'png']}]
        })
        .then((result) => {
            if (!result.canceled) {
                const filepaths = result.filePaths;
                if (typeof(filepaths) !== 'undefined') {
                    var imagePath = filepaths[0];
                    mainWindow.webContents.send('imageSent', imagePath); //send path to image      
                }
            }
        });
});

// change the default vocabulary
ipcMain.on('changeVocabulary', (event) => {
    dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{name: 'Custom File Type', extensions: ['json']}]
        })
        .then((result) => {
            if (!result.canceled) {
                const filepaths = result.filePaths;
                if (typeof(filepaths) !== 'undefined') {
                    var vocabularyPath = filepaths[0];
                    mainWindow.webContents.send('vocabularySent', vocabularyPath);
                }
            }
        });
    mainWindow.webContents.send('importBoard');
});

// Save vocabulary of new communication board
ipcMain.on('newBoard', (event, newBoard) => {
    try {
        dialog.showSaveDialog({
                filters: [{name: 'Custom File Type', extensions: ['json']}]
            })
            .then((result) => {
                if (!result.canceled) {
                    const filePath = result.filePath;
                    if (typeof filePath !== 'undefined') {
                        const content = JSON.stringify(newBoard);
                        try {
                            fs.writeFileSync(filePath, content, 'utf8');
                            mainWindow.webContents.send('boardSaved');
                        } catch (e) {
                            console.error('Error writing file:', e);
                        }
                    }
                }
            });
    } catch (e) {
        console.log(e);
    }
})

//call createWindow function when Electron app is ready
app.on('ready', createWindow);