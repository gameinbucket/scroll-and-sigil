echo "clean"
rm ss.app
echo "build"
cd server
go build -o ss.app
cd ..
mv server/ss.app .
echo "run"
./ss.app $@
