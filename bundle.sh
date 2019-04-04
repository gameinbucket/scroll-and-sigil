cd bundle
echo "clean"
rm bundle.app
echo "build"
go build -o bundle.app
echo "run"
./bundle.app $1
cd ..
