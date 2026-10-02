"""
RoadGuard AI - Python Launcher / Compatibility Entry Point
-----------------------------------------------------------
This file ensures that if Render starts the service in a Python environment,
it safely delegates and starts the Node.js production server (server.ts).
"""
import os
import sys
import subprocess
import shutil

def main():
    port = os.environ.get("PORT", "3000")
    print(f"[RoadGuard AI] Booting RoadGuard AI full-stack service on port {port}...")

    # Ensure frontend build exists if npm is present
    if not os.path.exists(os.path.join(os.path.dirname(__file__), "dist")):
        print("[RoadGuard AI] dist folder missing, executing npm run build...")
        subprocess.call(["npm", "run", "build"])

    npm_path = shutil.which("npm") or shutil.which("npx")
    if npm_path:
        print("[RoadGuard AI] Starting Node.js server via npm start...")
        env = os.environ.copy()
        env["PORT"] = port
        sys.exit(subprocess.call(["npm", "start"], env=env))
    else:
        print("[RoadGuard AI] Warning: Node.js/npm not found in current PATH.")

if __name__ == "__main__":
    main()
