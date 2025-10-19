/* --- START MOD: 05_Speed_Tracer_Mod (V3 - Aggressive Debugger Hook) --- */
(function() {

const SPEED_DISPLAY_SELECTOR = '.speedometer .container span span'; // Targets the element showing the speed '0'

/**
 * Attemps to override the property setter (textContent or innerHTML) on the element.
 * @param {HTMLElement} element The target DOM element.
 * @param {string} propName The property to hook ('textContent' or 'innerHTML').
 */
function hookSetter(element, propName) {
    try {
        const originalDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, propName);
        if (!originalDescriptor || !originalDescriptor.set) {
            console.warn(`MOD: Speed Tracer: Failed to find original setter for ${propName}.`);
            return false;
        }

        const originalSetter = originalDescriptor.set;
        
        // Define a new setter on the specific element to intercept the write
        Object.defineProperty(element, propName, {
            configurable: true,
            set: function(newValue) {
                const speedMatch = String(newValue).match(/(\d+\.?\d*)/);
                const newSpeed = speedMatch ? parseFloat(speedMatch[0]) : NaN;
                
                // Only trigger if we have a valid, non-zero speed
                if (!isNaN(newSpeed) && newSpeed > 0.1) { 
                    
                    // --- SUCCESS: PAUSE EXECUTION AND DISPLAY CALL STACK ---
                    console.error(`MOD: SPEED SOURCE FOUND: ${newSpeed.toFixed(2)} km/h. GAME IS PAUSED. Check the CALL STACK panel!`);
                    
                    // The 'debugger;' command is the most reliable way to find the source.
                    debugger; 
                    
                    // Restoration logic will now be handled manually in the console after inspection.

                    // Execute the original setter
                    return originalSetter.call(this, newValue);
                }
                
                // Always execute the original setter to update the display
                return originalSetter.call(this, newValue);
            }
        });
        console.log(`MOD: Speed Tracer: Successfully hooked ${propName}.`);
        return true;
        
    } catch (e) {
        console.error(`MOD: Speed Tracer: Critical error hooking ${propName}.`, e);
        return false;
    }
}


function traceSpeedUpdate() {
    const targetElement = document.querySelector(SPEED_DISPLAY_SELECTOR);

    if (!targetElement) {
        // Continue retrying until the element is found
        setTimeout(traceSpeedUpdate, 500); 
        return;
    }

    // Try hooking innerHTML (which you know works)
    const success = hookSetter(targetElement, 'innerHTML');

    if (!success) {
        console.error('MOD: Speed Tracer: Failed to hook innerHTML. Debugging impossible.');
    }
}

// Initial setup
(function initSpeedTracerMod() {
    setTimeout(traceSpeedUpdate, 1000); 
    console.log('MOD: 05_Speed_Tracer_Mod is active. Prepare to drive and immediately pause!');
})();

})(); 
/* --- END MOD: 05_Speed_Tracer_Mod (V3 - Aggressive Debugger Hook) --- */