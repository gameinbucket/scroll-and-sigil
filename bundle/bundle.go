package main

import (
	"bufio"
	"fmt"
	"image"
	"image/draw"
	"image/png"
	"io/ioutil"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

type sprite struct {
	x     int
	y     int
	image *image.RGBA
}

func main() {
	pwd, err := os.Getwd()
	if err != nil {
		panic(err)
	}
	resources := resourceBundle(pwd)
	sprites := spriteBundle(pwd)
	animations := animationBundle(pwd)
	tiles := tileBundle(pwd)

	var data strings.Builder
	data.WriteString("resources{")
	data.WriteString(resources)
	data.WriteString("},sprites{")
	data.WriteString(sprites)
	data.WriteString("},animations{")
	data.WriteString(animations)
	data.WriteString("},tiles{")
	data.WriteString(tiles)
	data.WriteString("},")

	bundle, err := os.Create(filepath.Join(pwd, "public", "wad"))
	if err != nil {
		panic(err)
	}
	defer bundle.Close()
	_, err = bundle.WriteString(data.String())
	if err != nil {
		panic(err)
	}
}

func tileBundle(pwd string) string {
	return compress(filepath.Join(pwd, "raw", "tiles"))
}

func resourceBundle(pwd string) string {
	fmt.Println("resources")

	var dir []os.FileInfo
	var err error
	var data strings.Builder

	shaders := filepath.Join(pwd, "public", "shaders")
	fmt.Println("shaders", shaders)
	dir, err = ioutil.ReadDir(shaders)
	if err != nil {
		panic(err)
	}
	data.WriteString("shaders[")
	for _, info := range dir {
		name := info.Name()
		fmt.Println(name)
		data.WriteString(name)
		data.WriteString(",")
	}
	data.WriteString("],")

	images := filepath.Join(pwd, "public", "images")
	fmt.Println("images", images)
	dir, err = ioutil.ReadDir(images)
	if err != nil {
		panic(err)
	}
	data.WriteString("images[")
	for _, info := range dir {
		name := info.Name()
		extension := filepath.Ext(name)
		base := strings.TrimSuffix(name, extension)
		fmt.Println(name)
		data.WriteString(base)
		data.WriteString(",")
	}
	data.WriteString("],")

	music := filepath.Join(pwd, "public", "music")
	fmt.Println("music", music)
	dir, err = ioutil.ReadDir(music)
	if err != nil {
		panic(err)
	}
	data.WriteString("music[")
	for _, info := range dir {
		name := info.Name()
		fmt.Println(name)
		data.WriteString(name)
		data.WriteString(",")
	}
	data.WriteString("],")

	sounds := filepath.Join(pwd, "public", "sounds")
	fmt.Println("sounds", sounds)
	dir, err = ioutil.ReadDir(sounds)
	if err != nil {
		panic(err)
	}
	data.WriteString("sounds[")
	for _, info := range dir {
		name := info.Name()
		fmt.Println(name)
		data.WriteString(name)
		data.WriteString(",")
	}
	data.WriteString("]")

	return data.String()
}

func animationBundle(pwd string) string {
	path := filepath.Join(pwd, "raw", "animations")
	fmt.Println("animations", path)

	dir, err := ioutil.ReadDir(path)
	if err != nil {
		panic(err)
	}

	var data strings.Builder
	for _, info := range dir {
		name := info.Name()
		fmt.Println(name)
		data.WriteString(name)
		data.WriteString("{")
		data.WriteString(compress(filepath.Join(path, name)))
		data.WriteString("},")
	}

	return data.String()
}

func spriteBundle(pwd string) string {
	path := filepath.Join(pwd, "raw", "sprites")
	fmt.Println("sprites", path)

	dir, err := ioutil.ReadDir(path)
	if err != nil {
		panic(err)
	}

	var data strings.Builder
	for _, info := range dir {
		name := info.Name()
		fmt.Println(name)
		data.WriteString(name)
		data.WriteString("{")
		str := spritePacker(pwd, name, filepath.Join(path, name))
		data.WriteString(str)
		data.WriteString("},")
	}

	return data.String()
}

func spritePacker(pwd, spriteName, path string) string {
	dir, err := ioutil.ReadDir(path)
	if err != nil {
		panic(err)
	}

	const limit = 1024

	var data strings.Builder
	x := 0
	y := 0
	atlasWidth := 0
	atlasHeight := 0

	images := make([]*sprite, 0)

	for _, info := range dir {
		name := info.Name()
		extension := filepath.Ext(name)
		base := strings.TrimSuffix(name, extension)
		if extension != ".png" {
			continue
		}
		fmt.Println(name)
		rgba := getPNG(filepath.Join(path, info.Name()))
		width := rgba.Rect.Size().X
		height := rgba.Rect.Size().Y

		if x+width+1 > limit {
			atlasWidth = x - 1
			x = 0
			y = atlasHeight + 1
		}

		save := &sprite{x: x, y: y, image: rgba}
		images = append(images, save)

		data.WriteString(base)
		data.WriteString("[")
		data.WriteString(strconv.Itoa(x))
		data.WriteString(",")
		data.WriteString(strconv.Itoa(y))
		data.WriteString(",")
		data.WriteString(strconv.Itoa(width))
		data.WriteString(",")
		data.WriteString(strconv.Itoa(height))
		data.WriteString("],")

		x += width + 1

		if y+height > atlasHeight {
			atlasHeight = y + height
		}
	}

	if x-1 > atlasWidth {
		atlasWidth = x - 1
	}

	power := 1
	for power < atlasWidth {
		power *= 2
	}
	atlasWidth = power

	power = 1
	for power < atlasHeight {
		power *= 2
	}
	atlasHeight = power

	bundle := image.NewRGBA(image.Rect(0, 0, atlasWidth, atlasHeight))

	for i := 0; i < len(images); i++ {
		source := images[i]
		point := image.Point{source.x, source.y}
		bounds := image.Rectangle{point, point.Add(source.image.Bounds().Size())}
		draw.Draw(bundle, bounds, source.image, image.Point{0, 0}, draw.Src)
	}

	writePNG(filepath.Join(pwd, "public", "images", spriteName+".png"), bundle)

	return data.String()
}

func getPNG(path string) *image.RGBA {
	file, err := os.Open(path)
	if err != nil {
		panic(err)
	}
	defer file.Close()
	png, err := png.Decode(file)
	if err != nil {
		panic(err)
	}
	rgba := image.NewRGBA(png.Bounds())
	draw.Draw(rgba, rgba.Bounds(), png, image.Point{0, 0}, draw.Src)
	return rgba
}

func writePNG(path string, image *image.RGBA) {
	file, err := os.Create(path)
	if err != nil {
		panic(err)
	}
	defer file.Close()
	err = png.Encode(file, image)
	if err != nil {
		panic(err)
	}
}

func compress(path string) string {
	var data strings.Builder

	file, err := os.Open(path)
	if err != nil {
		panic(err)
	}
	defer file.Close()

	scan := bufio.NewScanner(file)
	for scan.Scan() {
		line := strings.ReplaceAll(scan.Text(), " ", "")
		data.WriteString(line)
		if strings.HasSuffix(line, "]") || strings.HasSuffix(line, "}") {
			data.WriteString(",")
		}
	}

	return data.String()
}
