package graphics

import (
	"math"
)

type Animation struct {
	RX float32
	RY float32
}

type Bone struct {
	Root         *Bone
	Leafs        []*Bone
	Width        float32
	Height       float32
	Length       float32
	PlaneOffsetX float32
	PlaneOffsetY float32
	PlaneOffsetZ float32
	BoneOffsetX  float32
	BoneOffsetY  float32
	BoneOffsetZ  float32
	LocalRx      float32
	LocalRy      float32
	AggregateRx  float32
	AggregateRy  float32
	SinX         float32
	CosX         float32
	SinY         float32
	CosY         float32
	WorldX       float32
	WorldY       float32
	WorldZ       float32
}

type Model struct {
	Bones      []Bone
	Animations [][]Animation
}

func (o *Bone) RecursiveInit(from *Bone) {
	if from != nil {
		o.Root = from
	}
	if o.Leafs != nil {
		for i := 0; i < len(o.Leafs); i++ {
			o.Leafs[i].RecursiveInit(o)
		}
	}
}

func (o *Bone) RecursivePrePass() {
	if o.Root == nil {
		o.AggregateRx = o.LocalRx
		o.AggregateRy = o.LocalRy
	} else {
		sinX := float32(math.Sin(float64(o.Root.AggregateRx)))
		cosX := float32(math.Cos(float64(o.Root.AggregateRx)))
		sinY := float32(math.Sin(float64(o.Root.AggregateRy)))
		cosY := float32(math.Cos(float64(o.Root.AggregateRy)))
		x := o.BoneOffsetX
		y := o.BoneOffsetY
		z := o.BoneOffsetZ
		yy := y*cosX - z*sinX
		z = y*sinX + z*cosX
		y = yy
		xx := x*cosY + z*sinY
		z = z*cosY - x*sinY
		x = xx
		o.WorldX = x + o.Root.WorldX
		o.WorldY = y + o.Root.WorldY
		o.WorldZ = z + o.Root.WorldZ

		o.AggregateRx = o.LocalRx + o.Root.AggregateRx
		o.AggregateRy = o.LocalRy + o.Root.AggregateRy
	}

	o.SinX = float32(math.Sin(float64(o.AggregateRx)))
	o.CosX = float32(math.Cos(float64(o.AggregateRx)))
	o.SinY = float32(math.Sin(float64(o.AggregateRy)))
	o.CosY = float32(math.Cos(float64(o.AggregateRy)))

	if o.Leafs != nil {
		for i := 0; i < len(o.Leafs); i++ {
			o.Leafs[i].RecursivePrePass()
		}
	}
}
