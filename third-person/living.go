package main

// Living struct
type Living struct {
	*Thing
	Me     interface{}
	Speed  float32
	Health int
	Target *Thing
}

// Damage func
func (me *Living) Damage(amount int) {
}
