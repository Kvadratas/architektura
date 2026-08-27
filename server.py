#!/usr/bin/env python3
"""
ARCHITEKTŪRA Web Server & Local Launcher
"""
import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def run():
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"\n=======================================================")
        print(f"🌲 ARCHITEKTŪRA - Medienos Optimizavimo Sistema")
        print(f"🌍 Serveris veikia: http://localhost:{PORT}")
        print(f"📁 Darbinis katalogas: {DIRECTORY}")
        print(f"=======================================================\n")
        
        # Try auto open browser
        try:
            webbrowser.open(f"http://localhost:{PORT}")
        except Exception:
            pass

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServeris sustabdytas.")
            sys.exit(0)

if __name__ == "__main__":
    run()
