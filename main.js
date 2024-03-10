const {app, BrowserWindow, Menu, ipcMain, shell} = require('electron')
const path = require('path')
const os = require('os')
const fs = require('fs')
const resizeImg = require('resize-img')

const isMac = process.platform === 'darwin'

const isDev = process.env.NODE_ENV !== 'production'

let mainWindow

const createMainWindow = async () => {
    mainWindow = new BrowserWindow({
        title: 'Image Resizer',
        width: 700,
        height: 600,
        webPreferences: {
            sandbox: false,
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, `preload.js`),
        },
    })

    // open dev tools if in dev environment
    if (isDev) {
        mainWindow.webContents.openDevTools()
    }

    await mainWindow.loadFile(path.join(__dirname, './renderer/index.html'))
}

const createAboutWindow = () => {
    const aboutWindow = new BrowserWindow({
        title: 'About Image Resizer',
        width: 300,
        height: 300,
    })

    aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'))
}

app.whenReady().then(async () => {
    await createMainWindow()

    const mainMenu = Menu.buildFromTemplate(menu)

    Menu.setApplicationMenu(mainMenu)

    mainWindow.on('closed', () => mainWindow = null)

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow()
        }
    })
})

const menu = [
    ...(isMac ? [
        {
            label: app.name,
            submenu: [
                {
                    label: 'About',
                    click: createAboutWindow,
                },
            ],
        },
    ] : [
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About',
                    click: createAboutWindow,
                },
            ],
        },
    ]),
    {
        role: 'fileMenu',
    },
]

ipcMain.on('image:resize', (e, options) => {
    options.dest = path.join(os.homedir(), 'imageresizer')

    resizeImage(options)
})

const resizeImage = async ({imgPath, width, height, dest}) => {
    try {
        const newImg = await resizeImg(fs.readFileSync(imgPath), {
            width: +width,
            height: +height,
        })

        const filename = path.basename(imgPath)

        // create folder if not exist
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest)
        }

        // write file to destination folder
        fs.writeFileSync(path.join(dest, filename), newImg)

        mainWindow.webContents.send('image:done')

        // open destination folder
        shell.openPath(dest)
    } catch (e) {
        console.log(e)
    }
}

app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit()
    }
})