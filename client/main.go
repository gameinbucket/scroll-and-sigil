package main

import (
	"fmt"
)

func main() {
	fmt.Println("hello wasm")
	foo := "a[poop]"
	bar := ParserRead([]byte(foo))
	fmt.Println(bar)
	fmt.Println(bar["a"])
	th := &Thing{}
	fmt.Println(th)
}
