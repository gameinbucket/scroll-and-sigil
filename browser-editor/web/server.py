import http.server
import socketserver

handle = http.server.SimpleHTTPRequestHandler
handle.extensions_map.update({
    '.wasm': 'application/wasm',
})

port = 3000

socketserver.TCPServer.allow_reuse_address = True

with socketserver.TCPServer(("", port), handle) as httpd:
    httpd.allow_reuse_address = True
    print("serving at port", port)
    httpd.serve_forever()

