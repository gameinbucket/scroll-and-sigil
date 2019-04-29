package main

// light struct
type light struct {
	x   int
	y   int
	z   int
	rgb int32
}

// lightInit func
func lightInit(x, y, z uint8, rgb int32) *light {
	l := &light{}
	l.x = int(x)
	l.y = int(y)
	l.z = int(z)
	l.rgb = rgb
	return l
}
