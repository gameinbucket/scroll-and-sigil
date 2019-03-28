echo "clean..."
rm bundler.app
echo "build..."
go build -o bundler.app
echo "run..."
./bundler.app $1
