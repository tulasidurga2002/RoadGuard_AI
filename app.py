"""
RoadGuard AI - Python & WSGI Reverse Proxy Adapter
--------------------------------------------------
Enables seamless execution under Render's Python runtime with:
  - 'gunicorn app:app'
  - 'python app.py'
  - 'npm start'

Spawns the Node.js production server (server.ts) on an internal port
and reverse-proxies HTTP requests directly to it.
"""
import os
import sys
import time
import socket
import subprocess
import shutil
import urllib.request
import urllib.error

NODE_INTERNAL_PORT = 3001
_node_process = None

def is_port_open(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex(('127.0.0.1', port)) == 0

def ensure_node_server():
    global _node_process
    if is_port_open(NODE_INTERNAL_PORT):
        return

    root_dir = os.path.dirname(os.path.abspath(__file__))
    dist_index = os.path.join(root_dir, "dist", "index.html")
    npm = shutil.which("npm") or "npm"

    # Build dist if it was not created during the build step
    if not os.path.exists(dist_index):
        print("[RoadGuard AI] Frontend 'dist' build not found. Running build now...", flush=True)
        try:
            subprocess.run([npm, "install", "--include=dev"], cwd=root_dir, check=False)
            subprocess.run([npm, "run", "build"], cwd=root_dir, check=False)
        except Exception as e:
            print(f"[RoadGuard AI] Build step warning: {e}", flush=True)

    print(f"[RoadGuard AI] Starting Node.js backend on internal port {NODE_INTERNAL_PORT}...", flush=True)
    env = os.environ.copy()
    env["PORT"] = str(NODE_INTERNAL_PORT)
    env["NODE_ENV"] = "production"

    try:
        _node_process = subprocess.Popen(
            [npm, "start"],
            cwd=root_dir,
            env=env,
            stdout=sys.stdout,
            stderr=sys.stderr
        )
    except Exception as e:
        print(f"[RoadGuard AI] Failed to spawn Node.js server: {e}", flush=True)
        return

    # Wait up to 25 seconds for the Node server to be healthy
    start_time = time.time()
    while time.time() - start_time < 25:
        if is_port_open(NODE_INTERNAL_PORT):
            print(f"[RoadGuard AI] Node.js backend is active on port {NODE_INTERNAL_PORT}!", flush=True)
            return
        time.sleep(0.5)

    print("[RoadGuard AI] Warning: Node backend did not respond within timeout, proceeding anyway.", flush=True)

# Start Node server when imported by Gunicorn
ensure_node_server()

def app(environ, start_response):
    """
    WSGI application callable for 'gunicorn app:app'.
    Proxies all HTTP requests to the internal Node.js backend.
    """
    ensure_node_server()

    path = environ.get('PATH_INFO', '/')
    query_string = environ.get('QUERY_STRING', '')
    target_url = f"http://127.0.0.1:{NODE_INTERNAL_PORT}{path}"
    if query_string:
        target_url += f"?{query_string}"

    method = environ.get('REQUEST_METHOD', 'GET')

    # Read incoming request payload
    content_length = environ.get('CONTENT_LENGTH')
    body = None
    if content_length and content_length.isdigit() and int(content_length) > 0:
        body = environ['wsgi.input'].read(int(content_length))

    # Forward headers
    headers = {}
    for key, val in environ.items():
        if key.startswith('HTTP_'):
            hdr_name = key[5:].replace('_', '-').title()
            if hdr_name.lower() not in ('host', 'content-length', 'connection'):
                headers[hdr_name] = val
        elif key in ('CONTENT_TYPE', 'CONTENT_LENGTH'):
            hdr_name = key.replace('_', '-').title()
            headers[hdr_name] = val

    req = urllib.request.Request(
        target_url,
        data=body,
        headers=headers,
        method=method
    )

    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            status = f"{resp.status} {resp.reason}"
            hop_by_hop = {'connection', 'keep-alive', 'transfer-encoding', 'te', 'upgrade', 'proxy-authorization', 'proxy-authenticate'}
            resp_headers = [
                (k, v) for k, v in resp.getheaders()
                if k.lower() not in hop_by_hop
            ]
            resp_body = resp.read()
            start_response(status, resp_headers)
            return [resp_body]
    except urllib.error.HTTPError as e:
        status = f"{e.code} {e.reason}"
        resp_headers = [
            (k, v) for k, v in e.headers.items()
            if k.lower() not in ('transfer-encoding', 'connection')
        ]
        resp_body = e.read()
        start_response(status, resp_headers)
        return [resp_body]
    except Exception as ex:
        status = "502 Bad Gateway"
        start_response(status, [('Content-Type', 'text/plain')])
        return [f"RoadGuard AI Gateway Error: {str(ex)}".encode('utf-8')]

if __name__ == "__main__":
    port = os.environ.get("PORT", "3000")
    npm = shutil.which("npm") or "npm"
    print(f"[RoadGuard AI] Running directly on port {port}...", flush=True)
    env = os.environ.copy()
    env["PORT"] = port
    env["NODE_ENV"] = "production"
    sys.exit(subprocess.call([npm, "start"], env=env))
