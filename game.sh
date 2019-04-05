echo "clean"
rm ss.app
echo "build"
go build -o ss.app
echo "run"
./ss.app $@
