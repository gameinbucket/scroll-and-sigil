import os
import socketserver
import http.server

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
                    with open(path, "rb") as get:
                        self.send_response(200)
                        extension = path.rfind(".")
                        mime_type = mime[path[extension:]]
                        self.send_header("Content-type", mime_type)
                        self.end_headers()
                        self.wfile.write(get.read())
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

    def do_POST(self):
        try:
            data_len = int(self.headers["Content-Length"])
            data = self.rfile.read(data_len).decode("utf-8")
            if self.path == "/api/store/load":
                try:
                    with open("maps/" + data + ".json", "rb") as get:
                        self.send_response(200)
                        self.send_header("Content-type", mime[".json"])
                        self.end_headers()
                        self.wfile.write(get.read())
                except FileNotFoundError:
                    self.send_response(404)
                    self.send_header("Content-type", "text/plain")
                    self.end_headers()
                    self.wfile.write(b"map not found")
            elif self.path == "/api/store/save":
                try:
                    with open("maps/" + data + ".json", "w+") as post:
                        post.write(data)
                        self.send_response(200)
                        self.send_header("Content-type", "text/plain")
                        self.end_headers()
                        self.wfile.write(b"saved map")
                except FileNotFoundError:
                    self.send_response(404)
                    self.send_header("Content-type", "text/plain")
                    self.end_headers()
                    self.wfile.write(b"map not saved")
            else:
                self.send_response(404)
                self.send_header("Content-type", "text/plain")
                self.end_headers()
                self.wfile.write(b"invalid api request")
        except Exception as err:
            print(err)


if __name__ == '__main__':
    port = 3000
    with socketserver.TCPServer(("", port), FileServer) as server:
        print("listening on port", port)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
