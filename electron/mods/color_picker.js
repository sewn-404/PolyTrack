/* --- START MOD: Local Storage Color Picker & Auto-Load (V6.0 - Preload API Fix) --- */

// --- STATE MANAGEMENT (Unchanged) ---
const MOD_TEXT_COLOR_KEY = 'modTextColor';
const MOD_BUTTON_COLOR_KEY = 'modButtonColor';
const MOD_FONT_SIZE_KEY = 'modFontSize'; 
const MOD_OPACITY_KEY = 'modOpacity'; 

const COLOR_PICKER_BUTTON_ID = 'mod-color-picker-button';
const TOGGLE_DEV_CONSOLE_ID = 'mod-toggle-dev-console-button';

let currentTextColor = '#FF0000';
let currentButtonColor = '#000000';
let currentButtonTextColor = '#FFFFFF'; 
let currentButtonHoverTextColor = '#FFFFFF'; 
let currentFontSize = 1.2; 
let currentOpacity = 1.0; 

// --- CORE FIX: INLINE STYLE INTERCEPTOR (Unchanged) ---
const BLOCKED_STYLES = ['blue', '0, 102, 255', '0, 150, 255', 'rgb(0, 102, 255)'];

function hijackStyleSetters() {
    const originalSetAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function (name, value) {
        if (name === 'style' && typeof value === 'string') {
            if (BLOCKED_STYLES.some(color => value.includes(color))) {
                value = value.replace(/background-color:\s*[^;]+;/g, '');
                value = value.replace(/box-shadow:\s*[^;]+;/g, '');
            }
        }
        return originalSetAttribute.apply(this, arguments);
    };

    const originalSetProperty = CSSStyleDeclaration.prototype.setProperty;
    CSSStyleDeclaration.prototype.setProperty = function (property, value, priority) {
        if (property.toLowerCase() === 'background-color' || property.toLowerCase() === 'box-shadow') {
            if (BLOCKED_STYLES.some(color => value.includes(color))) {
                return; 
            }
        }
        return originalSetProperty.apply(this, arguments);
    };
    
    console.log('MOD: Inline style setters successfully hijacked.');
}

// CRITICAL FIX: Toggles the Developer Console using the exposed API from preload.js
function toggleDevConsole() {
    try {
        // Use the function exposed via the contextBridge in preload.js
        if (window.electron && typeof window.electron.toggleDevTools === 'function') {
            window.electron.toggleDevTools(); 
            console.log('MOD: Toggling DevTools using exposed Electron API.');
        } else {
             // Fallback/Error for debugging
             console.error('MOD: window.electron.toggleDevTools not found. Check preload.js.');
        }
    } catch (e) {
        console.error('MOD: Failed to execute DevTools toggle.', e);
    }
}

// 1. Logic to define and inject base styles (Unchanged logic)
function applyBaseModStyles() {
    const style = document.createElement('style');
    style.id = 'mod-base-styles';
    style.innerHTML = `
        /* MOD: Complete Link Hiding */
        #ui > div > a { 
            display: none !important;
        }
        #ui > div > div.info > a:nth-child(1), 
        #ui > div > div.info > a:nth-child(2),
        #ui > div > div.info > a:nth-child(4) { 
            display: none !important;
        }

        /* MOD: Button Icon Styling */
        .mod-button-icon {
            margin-right: 8px; 
            font-size: 1.1em; 
            vertical-align: middle;
        }
        .mod-console-icon {
            margin-right: 8px; 
            font-size: 1.1em; 
            vertical-align: middle;
        }

        /* MOD: Button Animation Styles */
        .custom-mod-button {
            transition: all 0.15s ease-out;
        }
        
        /* MODAL STYLES (Unchanged) */
        #mod-color-modal {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 400px;
            padding: 20px;
            background-color: #333;
            border: 2px solid #555;
            z-index: 10000;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            color: white;
            font-family: sans-serif;
            display: none;
        }
        #mod-color-modal label {
            display: block;
            margin: 10px 0 5px 0;
            font-weight: bold;
        }
        #mod-color-modal input[type="color"], #mod-color-modal input[type="range"] {
            width: 100%;
            height: 40px;
            border: none;
            background: #222;
        }
        #mod-apply-button {
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            border: none;
            cursor: pointer;
            font-size: 16px;
        }
    `;
    document.head.appendChild(style);
}

// 2. Load colors and size from Local Storage or set defaults (Unchanged logic)
function loadColors() {
    const savedTextColor = localStorage.getItem(MOD_TEXT_COLOR_KEY);
    const savedButtonColor = localStorage.getItem(MOD_BUTTON_COLOR_KEY);
    const savedFontSize = localStorage.getItem(MOD_FONT_SIZE_KEY); 
    const savedOpacity = localStorage.getItem(MOD_OPACITY_KEY); 

    if (savedTextColor) {
        currentTextColor = savedTextColor;
    }
    if (savedButtonColor) {
        currentButtonColor = savedButtonColor;
    }
    if (savedFontSize) { 
        currentFontSize = parseFloat(savedFontSize);
    }
    if (savedOpacity) { 
        currentOpacity = parseFloat(savedOpacity);
    }
    
    updateButtonTextColor(currentButtonColor); 
}

// 3. Save colors and size to Local Storage (Unchanged logic)
function saveColorsToLocalStorage(textColor, buttonColor, fontSize, opacity) { 
    localStorage.setItem(MOD_TEXT_COLOR_KEY, textColor);
    localStorage.setItem(MOD_BUTTON_COLOR_KEY, buttonColor);
    localStorage.setItem(MOD_FONT_SIZE_KEY, fontSize); 
    localStorage.setItem(MOD_OPACITY_KEY, opacity); 
    console.log('MOD: Custom settings saved to Local Storage.');
}

// 4. Update button text color logic (Unchanged logic)
function updateButtonTextColor(baseHexColor) {
    let r = parseInt(baseHexColor.substring(1, 3), 16);
    let g = parseInt(baseHexColor.substring(3, 5), 16);
    let b = parseInt(baseHexColor.substring(5, 7), 16);
    let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    currentButtonTextColor = luminance > 0.5 ? '#000000' : '#FFFFFF'; 
    currentButtonHoverTextColor = currentButtonTextColor; 
}

// 5. Apply colors and size to the game via inline style properties (Unchanged logic)
function applyCurrentColors() {
    updateButtonTextColor(currentButtonColor); 
    const body = document.body;
    
    // Set CSS Variables
    body.style.setProperty('--mod-text-color', currentTextColor);
    body.style.setProperty('--mod-button-bg', currentButtonColor);
    body.style.setProperty('--mod-button-text-color', currentButtonTextColor);
    body.style.setProperty('--mod-button-hover-text-color', currentButtonHoverTextColor);
    body.style.setProperty('--mod-font-scale', currentFontSize); 
    body.style.setProperty('--mod-opacity', currentOpacity); 
    
    let dynamicStyle = document.getElementById('mod-dynamic-styles');
    if (!dynamicStyle) {
        dynamicStyle = document.createElement('style');
        dynamicStyle.id = 'mod-dynamic-styles';
        document.head.appendChild(dynamicStyle);
    }
    
    dynamicStyle.innerHTML = `
        /* MOD: Dynamic Text Color & Size - Targeting #ui for max specificity */
        #ui, #ui * {
            color: var(--mod-text-color) !important;
            font-size: calc(var(--mod-font-scale) * 1em) !important;
        }

        /* MOD: Dynamic Opacity Control */
        #ui, 
        #ui button, 
        #ui input[type="button"], 
        #ui a[role="button"], 
        #ui .button-class-from-inspection,
        #${COLOR_PICKER_BUTTON_ID}, 
        #${TOGGLE_DEV_CONSOLE_ID}, 
        #ui > div.menu,
        #ui > div.info {
            opacity: var(--mod-opacity) !important; 
        }

        /* MOD: Dynamic Button BASE Colors (Applies to all buttons including mod buttons) */
        #ui button, 
        #ui input[type="button"], 
        #ui a[role="button"], 
        #ui .button-class-from-inspection,
        #${COLOR_PICKER_BUTTON_ID},
        #${TOGGLE_DEV_CONSOLE_ID}
        {
            background-color: var(--mod-button-bg) !important;
            color: var(--mod-button-text-color) !important;
            transition: all 0.15s ease-out; 
        }

        /* FIX: Hover Override (Applies the hover effect and restores full opacity) */
        #ui button:hover, 
        #ui input[type="button"]:hover, 
        #ui a[role="button"]:hover, 
        #ui .button-class-from-inspection:hover, 
        #${COLOR_PICKER_BUTTON_ID}:hover,
        #${TOGGLE_DEV_CONSOLE_ID}:hover
        {
            background-color: var(--mod-button-bg) !important; 
            color: var(--mod-button-hover-text-color) !important; 
            border-color: var(--mod-button-bg) !important; 
            filter: brightness(1.2) !important; 
            box-shadow: 0 0 8px var(--mod-button-hover-text-color) !important; 
            opacity: 1.0 !important; /* Forces full visibility on hover */
        }
    `;
    console.log(`MOD: Colors and Opacity applied. Opacity: ${currentOpacity}`);
}

// 6. Modal Functions (Unchanged logic)
function openColorModal() {
    const modal = document.getElementById('mod-color-modal');
    if (modal) {
        document.getElementById('text-color-input').value = currentTextColor;
        document.getElementById('button-color-input').value = currentButtonColor;
        document.getElementById('font-size-input').value = currentFontSize; 
        document.getElementById('font-size-value').textContent = (currentFontSize * 100).toFixed(0) + '%'; 
        
        document.getElementById('opacity-input').value = currentOpacity;
        document.getElementById('opacity-value').textContent = (currentOpacity * 100).toFixed(0) + '%';

        modal.style.display = 'block';
    }
}

function saveAndApplyColorsFromModal() {
    const newTextColor = document.getElementById('text-color-input').value;
    const newButtonColor = document.getElementById('button-color-input').value;
    const newFontSize = document.getElementById('font-size-input').value; 
    const newOpacity = document.getElementById('opacity-input').value;
    
    currentTextColor = newTextColor;
    currentButtonColor = newButtonColor;
    currentFontSize = parseFloat(newFontSize); 
    currentOpacity = parseFloat(newOpacity);

    updateButtonTextColor(currentButtonColor);

    saveColorsToLocalStorage(newTextColor, newButtonColor, newFontSize, newOpacity); 
    applyCurrentColors();
    document.getElementById('mod-color-modal').style.display='none';
}

// 7. Create Modal HTML (Unchanged logic)
function createColorModalHTML() {
    const modalHTML = `
        <div id="mod-color-modal">
            <h3>🎨 Custom UI Settings</h3>

            <label for="text-color-input">Global Text Color:</label>
            <input type="color" id="text-color-input" value="${currentTextColor}"><br>
            
            <label for="button-color-input">Button Background Color (Base/Hover):</label>
            <input type="color" id="button-color-input" value="${currentButtonColor}"><br>
            
            <label for="opacity-input">UI Opacity: <span id="opacity-value">${(currentOpacity * 100).toFixed(0)}%</span></label>
            <input type="range" id="opacity-input" min="0.1" max="1.0" step="0.05" value="${currentOpacity}" 
                oninput="document.getElementById('opacity-value').textContent = (this.value * 100).toFixed(0) + '%';">
            <br>
            
            <label for="font-size-input">Font Size Scale: <span id="font-size-value">${(currentFontSize * 100).toFixed(0)}%</span></label>
            <input type="range" id="font-size-input" min="0.5" max="1.5" step="0.05" value="${currentFontSize}" 
                oninput="document.getElementById('font-size-value').textContent = (this.value * 100).toFixed(0) + '%';">
            <br>
            
            <button id="mod-apply-button">Apply & Save</button>
            <button onclick="document.getElementById('mod-color-modal').style.display='none'" style="margin-left: 10px; background-color: #f44336; color: white;">Cancel</button>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById('mod-apply-button').addEventListener('click', saveAndApplyColorsFromModal);
}

// 8. Create and inject buttons into their respective locations (Unchanged injection logic)
function injectButtons() {
    
    // --- 1. Inject Color Picker Button (Main Menu next to Customize) ---
    const colorPickerButtonExists = document.getElementById(COLOR_PICKER_BUTTON_ID);
    if (!colorPickerButtonExists) {
        const allButtons = document.querySelectorAll('button, a[role="button"]');
        let customizeButton = null;

        for (const button of allButtons) {
            if (button.textContent.trim() === 'Customize') {
                customizeButton = button;
                break; 
            }
        }

        if (customizeButton) {
            const colorPickerButton = document.createElement('button');
            colorPickerButton.id = COLOR_PICKER_BUTTON_ID;
            colorPickerButton.innerHTML = '<span class="mod-button-icon">🎨</span>Color Picker'; 
            colorPickerButton.className = customizeButton.className + ' custom-mod-button'; 
            colorPickerButton.addEventListener('click', openColorModal);

            customizeButton.insertAdjacentElement('afterend', colorPickerButton);
        }
    }
    
    // --- 2. Inject Toggle Dev Console Button (Settings Menu next to Reset) ---
    const devConsoleButtonExists = document.getElementById(TOGGLE_DEV_CONSOLE_ID);
    if (!devConsoleButtonExists) {
        
        // Target the Reset button using the provided selector
        const resetButton = document.querySelector("#ui > div > div.settings-menu > div.button-wrapper > button.button.reset");

        if (resetButton) {
            const devConsoleButton = document.createElement('button');
            devConsoleButton.id = TOGGLE_DEV_CONSOLE_ID;
            devConsoleButton.innerHTML = '<span class="mod-console-icon">⚙️</span>Dev Console'; 
            devConsoleButton.className = resetButton.className + ' custom-mod-button'; 
            devConsoleButton.addEventListener('click', toggleDevConsole);
            
            resetButton.insertAdjacentElement('afterend', devConsoleButton);
        }
    } 
}


// 9. Initialization (Execution Flow) - IMMEDIATE EXECUTION
(function initMod() {
    // 💥 ULTIMATE FIX 💥: Hijack style setters before any other code runs
    hijackStyleSetters();
    
    applyBaseModStyles();
    loadColors();
    createColorModalHTML(); 
    applyCurrentColors();
    
    // Check for button injection every half-second
    setInterval(injectButtons, 500); 

    console.log('MOD: Color Picker and Dev Console Mod (V6.0) is active and running.');
})();

/* --- END MOD: Local Storage Color Picker & Auto-Load (V6.0 - Preload API Fix) --- */