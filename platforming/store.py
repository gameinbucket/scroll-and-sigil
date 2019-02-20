import os
import json
import socketserver
import http.server
import base64

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

    def do_POST(self):
        try:
            data_len = int(self.headers["Content-Length"])
            raw = self.rfile.read(data_len).decode("utf-8")
            if self.path == "/api/store/save":
                try:
                    data = json.loads(raw)
                    name = data["name"]
                    with open("public/maps/" + name + ".json", "w+") as fh:
                        fh.write(raw)
                        self.send_response(200)
                        self.send_header("Content-type", "text/plain")
                        self.end_headers()
                        self.wfile.write(b"saved map")
                except FileNotFoundError:
                    self.send_response(404)
                    self.send_header("Content-type", "text/plain")
                    self.end_headers()
                    self.wfile.write(b"map not saved")
            elif self.path == "/api/sprites/list":
                try:
                    if os.path.isdir("public/sprites/" + raw):
                        sprite_list = list()
                        for item in os.listdir("public/sprites/" + raw):
                            sprite_list.append(item)
                        self.send_response(200)
                        self.send_header("Content-type", "text/plain")
                        self.end_headers()
                        sprite_string = ", ".join(sprite_list)
                        self.wfile.write(str.encode(sprite_string))
                    else:
                        raise Exception()
                except Exception as err:
                    self.send_response(404)
                    self.send_header("Content-type", "text/plain")
                    self.end_headers()
                    self.wfile.write(b"sprite not found")
                    raise err
            elif self.path == "/api/sprites/save":
                try:
                    data = json.loads(raw)
                    name = data["name"]
                    image = str.encode(data["base64"])
                    del data["base64"]
                    raw = json.dumps(data)
                    with open("public/json/" + name + ".json", "w+") as fh:
                        fh.write(raw)
                        self.send_response(200)
                        self.send_header("Content-type", "text/plain")
                        self.end_headers()
                        self.wfile.write(b"saved sprite")
                    with open("public/textures/" + name + ".png", "wb") as fh:
                        fh.write(base64.decodebytes(image))
                except Exception as err:
                    self.send_response(404)
                    self.send_header("Content-type", "text/plain")
                    self.end_headers()
                    self.wfile.write(b"sprite not saved")
                    raise err
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
