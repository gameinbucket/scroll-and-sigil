echo "clean"
rm sse.app
echo "build"
cd editor
go build -o sse.app
cd ..
mv editor/sse.app .
echo "run"
./sse.app $@
