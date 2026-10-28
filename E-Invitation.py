"""
=============================================================================
 Khmer E-Invitation Web Application Server
 គេហទំព័រធៀបការអាពាហ៍ពិពាហ៍ឌីជីថលបែបខ្មែរ
=============================================================================
 ដំណើរការ server ក្នុងកុំព្យូទ័រ និងបើក Browser ដោយស្វ័យប្រវត្តិ
"""

import os
import sys
import webbrowser
import socket
from http.server import HTTPServer, SimpleHTTPRequestHandler

import json
import base64

PORT = 8000

class KhmerInvitationHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and caching headers for snappy experience
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        if self.path in ('/api/upload', '/api/save-file'):
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                payload = json.loads(post_data.decode('utf-8'))

                filename = payload.get('filename')
                data = payload.get('content')
                if not filename or data is None:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json; charset=utf-8')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'Missing filename or content'}).encode('utf-8'))
                    return

                # Security: prevent path traversal out of workspace
                clean_filename = os.path.basename(filename)
                
                # Check if data URL format (e.g. data:image/jpeg;base64,...)
                if isinstance(data, str) and ',' in data and data.startswith('data:'):
                    data = data.split(',', 1)[1]

                # Decode base64 or encode text
                if isinstance(data, str):
                    try:
                        file_bytes = base64.b64decode(data)
                    except Exception:
                        file_bytes = data.encode('utf-8')
                else:
                    file_bytes = bytes(data)

                with open(clean_filename, 'wb') as f:
                    f.write(file_bytes)

                print(f" [✓] បានរក្សាទុកឯកសារ {clean_filename} ចូល Folder ដោយជោគជ័យ ({len(file_bytes)} bytes)")

                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': True,
                    'filename': clean_filename,
                    'size': len(file_bytes),
                    'message': f'Saved {clean_filename} successfully'
                }).encode('utf-8'))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
                return

        self.send_response(404)
        self.end_headers()

    def guess_type(self, path):
        # Ensure correct MIME type for SVG and Fonts
        if path.endswith('.svg'):
            return 'image/svg+xml'
        if path.endswith('.js'):
            return 'application/javascript; charset=utf-8'
        if path.endswith('.css'):
            return 'text/css; charset=utf-8'
        if path.endswith('.html'):
            return 'text/html; charset=utf-8'
        if path.endswith('.mp4'):
            return 'video/mp4'
        if path.endswith('.mp3'):
            return 'audio/mpeg'
        return super().guess_type(path)


def find_available_port(start_port=8000):
    port = start_port
    while port < 65535:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('localhost', port)) != 0:
                return port
            port += 1
    return start_port


def main():
    # Set current working directory to the directory of this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    port = find_available_port(PORT)
    url = f"http://localhost:{port}"

    print("=" * 65)
    print(" 💍 គេហទំព័រធៀបការឌីជីថលបែបខ្មែរ (Khmer E-Invitation Builder)")
    print("=" * 65)
    print(f" ► កំពុងដំណើរការ Local Server នៅ: {url}")
    print(" ► ចុច Ctrl + C លើ Terminal ដើម្បីបញ្ឈប់ (Stop)")
    print("=" * 65)

    # Automatically launch default browser
    try:
        webbrowser.open(url)
    except Exception as e:
        print(f"Note: Could not auto-launch browser ({e}). Please open {url} manually.")

    # Start HTTP Server
    server_address = ('', port)
    httpd = HTTPServer(server_address, KhmerInvitationHandler)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n [!] បានបិទ Server រួចរាល់។ សូមអរគុណ!")
        sys.exit(0)


if __name__ == '__main__':
    main()
