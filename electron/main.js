const { app, BrowserWindow, shell, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs"); 
const { spawn } = require('child_process'); // <--- NEW REQUIREMENT

let browserWindow = null;
let pythonProcess = null; // <--- NEW: Variable to hold the Python process

// --- PYTHON BACKEND STARTUP LOGIC ---
function startPythonBackend() {
    const pythonDir = path.join(__dirname, 'backend');
    if (!fs.existsSync(pythonDir)) {
        fs.mkdirSync(pythonDir, { recursive: true });
        console.log(`Created Python backend directory at: ${pythonDir}`);
    }
    
    const scriptPath = path.join(pythonDir, 'key_logger.py');
    
    // Ensure the Python script exists (or create a dummy one if it's missing)
    if (!fs.existsSync(scriptPath)) {
        console.warn(`Python script not found at ${scriptPath}. Please create it.`);
    }

    // Use 'python3' as it's common on modern systems, fall back to 'python' if needed.
    const pythonExecutable = process.platform === 'win32' ? 'python' : 'python3'; 
    
    console.log(`Attempting to start Python script using: ${pythonExecutable}`);
    
    pythonProcess = spawn(pythonExecutable, [scriptPath]);
    
    pythonProcess.stdout.on('data', (data) => {
        console.log(`[Python STDOUT]: ${data.toString().trim()}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`[Python STDERR]: ${data.toString().trim()}`);
    });
    
    pythonProcess.on('close', (code) => {
        console.log(`[Python Process] Exited with code ${code}`);
        pythonProcess = null;
    });
}

// Function to send data from Renderer via Main to Python
ipcMain.on('log-key-to-python', (event, logEntry) => {
    if (pythonProcess && pythonProcess.stdin.writable) {
        // Send the JSON string to Python's standard input
        pythonProcess.stdin.write(JSON.stringify(logEntry) + '\n', (err) => {
            if (err) {
                console.error(`Error writing to Python process: ${err.message}`);
            }
        });
    } else {
        console.warn('Python process not running or not ready to receive data.');
    }
});
// --- PYTHON BACKEND ENDUP LOGIC ---


const singleInstanceLockSucessful = app.requestSingleInstanceLock();

if (singleInstanceLockSucessful) {
  app.on("second-instance", () => {
    if (null != browserWindow) {
      if (browserWindow.isMinimized()) {
        browserWindow.restore();
      }
      browserWindow.focus();
    }
  });
} else {
  app.quit();
}

app.on("web-contents-created", (e, n) => {
  n.setWindowOpenHandler(
    (
      { url: e }
    ) => (
      "https://opengameart.org/content/sci-fi-theme-1" != e ||
        setImmediate(() => {
          shell.openExternal(e);
        }),
      {
        action: "deny",
      }
    )
  ),
    n.on("will-navigate", (e, n) => {
      e.preventDefault();
    });
});

// --- IPC LISTENERS START ---

ipcMain.on("quit", () => {
    // Terminate Python process before quitting the app
    if (pythonProcess) {
        console.log("Terminating Python process...");
        pythonProcess.kill();
    }
    app.quit();
});

ipcMain.on('toggle-devtools', () => {
  if (browserWindow) {
    if (!browserWindow.webContents.isDevToolsOpened()) {
      browserWindow.webContents.openDevTools({ mode: 'undocked' });
      console.log('Main Process: DevTools Opened (Undocked) via IPC.');
    } else {
      browserWindow.webContents.closeDevTools();
      console.log('Main Process: DevTools Closed via IPC.');
    }
  }
});

/**
 * Recursively reads all image files from a directory and its subdirectories. 
 * (Unchanged logic for image reading)
 */
function getFilesRecursively(directory, relativePath = '') {
    // ... (Your existing getFilesRecursively function) ...
    let results = [];
    
    if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory()) {
        return results; 
    }
    
    const filesInDirectory = fs.readdirSync(directory, { withFileTypes: true });

    for (const file of filesInDirectory) {
        const absolutePath = path.join(directory, file.name);
        const currentRelativePath = path.join(relativePath, file.name); 
        
        if (file.isDirectory()) {
            results = results.concat(getFilesRecursively(absolutePath, currentRelativePath));
        } else if (file.isFile() && /\.(png|jpe?g|gif|webp)$/i.test(file.name)) {
            results.push(currentRelativePath.replace(/\\/g, '/')); 
        }
    }
    return results;
}

ipcMain.handle('read-images', (event, folderPath) => {
    const appRoot = app.getAppPath();
    const absolutePath = path.join(appRoot, folderPath);
    try {
        if (!fs.existsSync(absolutePath)) {
            return [];
        }
        const relativeImagePaths = getFilesRecursively(absolutePath);
        const browserPaths = relativeImagePaths.map(p => path.join(folderPath, p).replace(/\\/g, '/'));
        return browserPaths;
    } catch (error) {
        console.error(`[Main Process] Critical Error reading directory: ${error.message}`);
        return [];
    }
});
// --- IPC LISTENERS END ---


app.on("window-all-closed", () => {
  app.quit();
});

/**
 * Loads and injects all JavaScript files found in the 'mods' folder.
 * (Unchanged logic for mod loading)
 */
function loadExternalMods(targetWindow) {
    const modsPath = path.join(__dirname, 'mods');

    if (!fs.existsSync(modsPath)) {
        console.log(`Mods directory not found at: ${modsPath}. Skipping mod loading.`);
        return;
    }

    fs.readdir(modsPath, (err, files) => {
        if (err) {
            console.error("Could not read the mods directory:", err);
            return;
        }

        const jsFiles = files.filter(file => file.endsWith('.js')).sort();

        jsFiles.forEach(file => {
            const filePath = path.join(modsPath, file);
            try {
                const scriptContent = fs.readFileSync(filePath, 'utf8');
                
                targetWindow.webContents.executeJavaScript(scriptContent, true)
                    .then(() => {
                        console.log(`Successfully injected mod: ${file}`);
                    })
                    .catch(e => {
                        console.error(`Error executing mod script ${file}:`, e);
                    });

            } catch (e) {
                console.error(`Error loading or reading mod file ${file}:`, e);
            }
        });
    });
}

app.whenReady().then(() => {
  
  browserWindow = new BrowserWindow({
    width: 1024,
    height: 800,
    minWidth: 320,
    minHeight: 200,
    fullscreen: false, 
    useContentSize: true,
    autoHideMenuBar: true,
    webPreferences: {
      devTools: true, 
      preload: path.join(__dirname, "preload.js"),
      backgroundThrottling: !1,
    },
  }); 
  
  browserWindow.removeMenu();
  browserWindow.webContents.on("before-input-event", (e, n) => {
    n.isAutoRepeat ||
      "keyDown" != n.type ||
      (("F11" == n.code || (n.alt && "Enter" == n.code)) &&
        (browserWindow.setFullScreen(!browserWindow.isFullScreen()),
        e.preventDefault()));
  });
  browserWindow.on("enter-full-screen", () => {
    browserWindow.webContents.send("fullscreen-change", true);
  });
  browserWindow.on("leave-full-screen", () => {
    browserWindow.webContents.send("fullscreen-change", false);
  });
  ipcMain.on("is-fullscreen", (e) => {
    e.returnValue = browserWindow.isFullScreen();
  });
  ipcMain.on("set-fullscreen", (e, n) => {
    browserWindow.setFullScreen(n);
  });
  
  let mainGamePath = path.join(__dirname, "index.html");
  
  if (!fs.existsSync(mainGamePath)) {
      mainGamePath = path.join(__dirname, "..", "index.html");
  }
  
  console.log(`Attempting to load main game file from: ${mainGamePath}`);

  if (fs.existsSync(mainGamePath)) {
      browserWindow.loadURL("file://" + mainGamePath); 
  } else {
      console.error("CRITICAL ERROR: index.html not found.");
      browserWindow.loadURL(`data:text/html;charset=UTF-8,<h1>Error: Game File Not Found</h1>`);
      return; 
  }
  
  // Start Python backend when Electron is ready
  startPythonBackend();

  browserWindow.webContents.on('did-finish-load', () => {
      loadExternalMods(browserWindow);
  });
});