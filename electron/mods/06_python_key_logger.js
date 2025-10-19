/* --- START MOD: 06_Python_Key_Logger --- */
(function() {

function handleKeyDown(event) {
    // Only track common keys, not modifiers like Shift, Ctrl, Alt
    if (event.key.length === 1 || ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
        if (window.electron && window.electron.logKey) {
            window.electron.logKey(event.key, 'down', performance.now());
        }
    }
}

function handleKeyUp(event) {
    if (event.key.length === 1 || ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
        if (window.electron && window.electron.logKey) {
            window.electron.logKey(event.key, 'up', performance.now());
        }
    }
}

// Initialization (Auto-enables the key listeners)
(function initPythonKeyLogger() {
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    console.log('MOD: Python Key Logger active. Pressing keys will send data to the Python backend.');
})();

})(); 
/* --- END MOD: 06_Python_Key_Logger --- */