echo "clean"
rm public/ss.wasm
echo "build"
cd client
GOARCH=wasm GOOS=js go build -o ss.wasm
cd ..
mv client/ss.wasm public/ss.wasm
cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" public/wasm.js
