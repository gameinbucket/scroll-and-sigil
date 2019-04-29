package main

import (
	"syscall/js"
)

// Input var
var (
	InputKeys = map[string]bool{}
)

// InputIsKeyDown func`
func InputIsKeyDown(key string) bool {
	return InputKeys[key]
}

// InputIsKeyPress func
func InputIsKeyPress(key string) bool {
	return InputKeys[key]
}

// InputSetKeyUp func
func InputSetKeyUp() js.Func {
	return js.FuncOf(func(self js.Value, args []js.Value) interface{} {
		console("key down!")
		InputKeys[args[0].String()] = true
		return nil
	})
}

// InputSetKeyDown func
func InputSetKeyDown() js.Func {
	return js.FuncOf(func(self js.Value, args []js.Value) interface{} {
		console("key up!")
		InputKeys[args[0].String()] = true
		return nil
	})
}
