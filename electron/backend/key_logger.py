# app_unpacked/electron/backend/key_logger.py

import sys
import json
import time
from datetime import datetime

LOG_FILE = "key_press_log.csv"

def log_data(log_entry):
    """Writes a single log entry to the CSV file."""
    # Ensure all required keys are present
    key = log_entry.get("key", "N/A")
    action = log_entry.get("action", "N/A")
    js_time = log_entry.get("time", time.time() * 1000)
    
    # Convert milliseconds to seconds and format for readability/precision
    time_sec = f"{js_time / 1000.0:.6f}"
    
    # Get a real-world timestamp for easier debugging
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]

    # Create the CSV line
    csv_line = f"{timestamp},{time_sec},{key},{action}\n"
    
    try:
        # Check if file exists to decide if we need to write the header
        is_new_file = not os.path.exists(LOG_FILE)
        
        with open(LOG_FILE, "a") as f:
            if is_new_file:
                f.write("System Timestamp,JS Performance Time (s),Key,Action\n")
            f.write(csv_line)
            
        print(f"Logged: {key} {action} at {time_sec}") # Print to stdout for Electron console
        
    except Exception as e:
        print(f"Error writing to log file: {e}", file=sys.stderr)

# --- Main loop to read from stdin (Node.js Pipe) ---
import os
def main():
    # Loop continuously to read lines (JSON strings) from the Node.js pipe
    while True:
        try:
            # Read a line from stdin
            line = sys.stdin.readline()
            
            if not line:
                # EOF: Pipe closed (Electron process terminated)
                break
                
            # Parse the JSON string
            data = json.loads(line.strip())
            
            # Process the data
            log_data(data)
            
        except json.JSONDecodeError:
            print(f"Invalid JSON received: {line.strip()}", file=sys.stderr)
        except Exception as e:
            print(f"An unexpected error occurred: {e}", file=sys.stderr)
            break

if __name__ == "__main__":
    main()