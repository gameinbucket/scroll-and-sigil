import os
import json
import socketserver
import http.server
import base64
import sys

mime = {
    ".f": "text/plain",
    ".v": "text/plain",
    ".html": "text/html",
    ".js":   "text/javascript",
    ".css":  "text/css",
    ".png":  "image/png",
    ".jpg":  "image/jpeg",
    ".svg":  "image/svg+xml",
    ".ico":  "image/x-icon",
    ".wav":  "audio/wav",
    ".mp3":  "audio/mpeg",
    ".ogg":  "audio/ogg",
    ".json": "application/json",
    ".ttf":  "application/font-ttf",
}


class FileServer(http.server.BaseHTTPRequestHandler):

    def do_GET(self):
        try:
            cwd = os.getcwd()
            path = os.path.abspath("public" + self.path)
            if os.path.commonprefix((path, cwd)) == cwd:
                try:
                    with open(path, "rb") as fh:
                        self.send_response(200)
                        extension = path.rfind(".")
                        mime_type = mime[path[extension:]]
                        self.send_header("Content-type", mime_type)
                        self.end_headers()
                        self.wfile.write(fh.read())
                except FileNotFoundError:
                    self.send_response(404)
                    self.send_header("Content-type", "text/plain")
                    self.end_headers()
                    self.wfile.write(b"not found")
            else:
                self.send_response(403)
                self.send_header("Content-type", "text/plain")
                self.end_headers()
                self.wfile.write(b"invalid request")
        except Exception as err:
            print(err)

if __name__ == '__main__':
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    else:
        port = 3000
    with socketserver.TCPServer(("", port), FileServer) as server:
        print("listening on port", port)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
