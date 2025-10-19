/* --- START MOD: 04_Car_Speed_Mod --- */
(function() {

const MOD_FILE_NAME = 'car_speed_mod.js';
const SPEED_MULTIPLIER = 100.0; // The car will be 5 times faster/more powerful
const DEFAULT_MULTIPLIER = 10.0; // The original speed factor

/**
 * Attempts to locate and modify the car's core speed/acceleration property.
 * @param {number} value The acceleration/speed multiplier to set.
 * @returns {boolean} True if a property was successfully modified.
 */
function modifyCarSpeed(value) {
    
    // --- STEP 1: FIND THE GLOBAL GAME OBJECT ---
    // You might need to adjust 'window.Game' based on what you find in DevTools.
    const game = window.Game || window.App; 
    
    if (!game) {
        console.error('MOD: Car Speed Mod: Could not find global game object (window.Game/App).');
        return false;
    }

    // --- STEP 2: HYPOTHETICAL PROPERTY PATH (MUST BE REPLACED!) ---
    // The exact variable controlling max speed or acceleration is in the minified main bundle.
    // Use DevTools (F12) to inspect the global object (window.Game) while the game runs.

    // 🚩🚩🚩 REPLACE THIS SECTION WITH THE CORRECT PATH YOU FIND! 🚩🚩🚩
    try {
        const speedPropertyPath = game.car?.physics?.accelerationFactor;
        
        if (speedPropertyPath !== undefined) {
            // Example of a successful patch (replace the path)
            game.car.physics.accelerationFactor = value; 
            console.log(`MOD: Car Speed Mod: Acceleration factor patched to ${value}.`);
            return true;
        } 
        
        // --- Fallback example (if the variable is global) ---
        if (window.MAX_CAR_VELOCITY !== undefined) {
             window.MAX_CAR_VELOCITY = value * 100;
             console.log(`MOD: Car Speed Mod: MAX_CAR_VELOCITY set to ${window.MAX_CAR_VELOCITY}.`);
             return true;
        }

    } catch (e) {
        console.error('MOD: Car Speed Mod: Error modifying car speed property. Verify the property path.', e);
        return false;
    }
    // 🚩🚩🚩 END OF REPLACEMENT SECTION 🚩🚩🚩

    console.warn('MOD: Car Speed Mod: Target speed property not found. Use DevTools to locate it.');
    return false;
}

// Mod Toggle Handler (Called by the Mod Manager)
function toggleCarSpeed(enabled) {
    if (enabled) {
        // Set speed to the multiplier value
        modifyCarSpeed(SPEED_MULTIPLIER);
    } else {
        // Revert to default speed
        modifyCarSpeed(DEFAULT_MULTIPLIER);
    }
}

// Initialization
(function initCarSpeedMod() {
    
    // Register with the Mod Manager (assuming 00_mod_manager.js is loaded)
    if (window.modManager && window.modManager.registerMod) {
        window.modManager.registerMod(MOD_FILE_NAME, toggleCarSpeed);
    } else {
        console.error("MOD: Mod Manager not found. Running Car Speed Mod without manager control.");
        // Fallback: Enable by default if manager isn't present
        toggleCarSpeed(true);
    }

    console.log('MOD: Car Speed Mod is ready and registered.');
})();

})(); 
/* --- END MOD: 04_Car_Speed_Mod --- */