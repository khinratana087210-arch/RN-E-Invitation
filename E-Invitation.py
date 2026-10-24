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

PORT = 8000

class KhmerInvitationHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and caching headers for snappy experience
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

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
