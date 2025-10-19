/* --- START MOD: Input Logger Mod (Standalone V2.0 - Auto-Clear) --- */

const MAX_LOGS = 10;
const OVERLAY_ID = 'mod-input-logger-overlay';
const CLEAR_TIMEOUT_MS = 2000; // 2 seconds

let keyTimers = {};
let keyLog = [];
let autoClearTimer = null; // Timer variable for auto-clearing

// --- Timer Management ---

function resetAutoClearTimer() {
    // Clear any existing timer
    if (autoClearTimer) {
        clearTimeout(autoClearTimer);
    }
    // Set a new timer
    autoClearTimer = setTimeout(clearKeyLogs, CLEAR_TIMEOUT_MS);
}

function clearKeyLogs() {
    if (keyLog.length > 0) {
        keyLog = []; // Clear the log array
        updateOverlayDisplay(); // Update the display to be empty
        console.log('MOD: Key log cleared due to 2-second inactivity.');
    }
    autoClearTimer = null; // Mark timer as complete
}


// --- Event Handlers ---

function handleKeyDown(event) {
    if (event.repeat) {
        return;
    }
    
    resetAutoClearTimer(); // Reset timer on key down

    const key = event.code;
    
    keyTimers[key] = performance.now();
    
    // Log the press immediately for visual feedback
    addLogEntry(key, 'PRESS', 0);
}

function handleKeyUp(event) {
    resetAutoClearTimer(); // Reset timer on key up
    
    const key = event.code;
    
    if (keyTimers[key]) {
        const durationMs = performance.now() - keyTimers[key];
        
        addLogEntry(key, 'RELEASE', durationMs);
        
        delete keyTimers[key];
    }
}

// --- Logging and Display ---

function addLogEntry(key, type, durationMs) {
    const displayKey = getDisplayKey(key);
    
    const logEntry = {
        key: displayKey,
        type: type,
        duration: durationMs,
    };

    // Remove any existing 'PRESS' entry for this key before adding a new one
    // This ensures a clean log when RELEASE is finally added
    keyLog = keyLog.filter(log => !(log.key === displayKey && log.type === 'PRESS'));


    // Add the new entry
    keyLog.unshift(logEntry);

    // Keep the log array size limited (only count RELEASE entries towards MAX_LOGS)
    const releaseCount = keyLog.filter(log => log.type === 'RELEASE').length;
    if (releaseCount > MAX_LOGS) {
        // Find and remove the oldest RELEASE entry (the one closest to the end)
        let removed = false;
        for (let i = keyLog.length - 1; i >= 0 && !removed; i--) {
            if (keyLog[i].type === 'RELEASE') {
                keyLog.splice(i, 1);
                removed = true;
            }
        }
    }
    
    updateOverlayDisplay();
}

function getDisplayKey(key) {
    switch (key) {
        case 'Space': return 'SPACE';
        case 'ControlLeft': return 'L-CTRL';
        case 'ControlRight': return 'R-CTRL';
        case 'ShiftLeft': return 'L-SHIFT';
        case 'ShiftRight': return 'R-SHIFT';
        case 'AltLeft': return 'L-ALT';
        case 'AltRight': return 'R-ALT';
        case 'Enter': return 'ENTER';
        case 'ArrowUp': return 'UP';
        case 'ArrowDown': return 'DOWN';
        case 'ArrowLeft': return 'LEFT';
        case 'ArrowRight': return 'RIGHT';
        default: return key.replace('Key', '');
    }
}

function updateOverlayDisplay() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) return;

    let html = '';
    
    // Only show RELEASE events AND currently pressed keys
    keyLog.forEach(log => {
        if (log.type === 'RELEASE') {
             const time = ` (${log.duration.toFixed(2)}ms)`;
             html += `<div class="key-release">
                        <span class="key-name">${log.key}</span>
                        <span class="key-time">${time}</span>
                     </div>`;
        } else {
             html += `<div class="key-press current-press">
                        <span class="key-name">${log.key}</span>
                        <span class="key-time">...held</span>
                     </div>`;
        }
    });

    overlay.innerHTML = html;
}

// --- DOM Setup ---

function createOverlayHTML() {
    const overlayHTML = `<div id="${OVERLAY_ID}"></div>`;
    document.body.insertAdjacentHTML('beforeend', overlayHTML);
}

function applyBaseModStyles() {
    const style = document.createElement('style');
    style.id = 'mod-input-logger-styles';
    style.innerHTML = `
        /* Overlay container */
        #${OVERLAY_ID} {
            position: fixed;
            bottom: 10px;
            left: 10px;
            z-index: 100000;
            padding: 10px;
            background-color: rgba(0, 0, 0, 0.7);
            border-radius: 5px;
            font-family: monospace;
            color: #FFF;
            font-size: 14px;
            width: 250px;
            pointer-events: none;
        }

        /* Log entry styling */
        #${OVERLAY_ID} > div {
            padding: 3px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        #${OVERLAY_ID} > div:last-child {
            border-bottom: none;
        }

        /* Key name */
        .key-name {
            font-weight: bold;
            color: #79c9ff;
        }

        /* Duration time */
        .key-time {
            color: #a8ffb8;
            font-size: 0.9em;
        }

        /* Visual cue for current press */
        .key-press.current-press {
            color: #ff9999;
            background-color: rgba(255, 255, 255, 0.1);
        }
    `;
    document.head.appendChild(style);
}

// 9. Initialization (Execution Flow)
(function initInputLoggerMod() {
    applyBaseModStyles();
    createOverlayHTML();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    console.log('MOD: Input Logger Mod (V2.0) is active and running.');
})();

/* --- END MOD: Input Logger Mod (Standalone V2.0 - Auto-Clear) --- */