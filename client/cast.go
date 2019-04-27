package main

// import (
// 	"math"
// )

// const (
// 	printDebugRayCast = false
// )

// type Ray struct {
// 	dtDx  float32
// 	dtDy  float32
// 	dtDz  float32
// 	incX  int
// 	incY  int
// 	incZ  int
// 	nextX float32
// 	nextY float32
// 	nextZ float32
// 	x     int
// 	y     int
// 	z     int
// 	toX   int
// 	toY   int
// 	toZ   int
// }

// func raycast(obj *Chunk, fromX, fromY, fromZ, toX, toY, toZ float32) bool {
// 	x := int(fromX)
// 	y := int(fromY)
// 	z := int(fromZ)
// 	var dtDx, dtDy, dtDz float32
// 	var incX, incY, incZ int
// 	var nextX, nextY, nextZ float32
// 	dx := toX - fromX
// 	if dx == 0 {
// 		incX = 0
// 		nextX = math.MaxFloat32
// 	} else if dx > 0 {
// 		incX = 1
// 		dtDx = 1.0 / dx
// 		nextX = (float32(x) + 1 - fromX) * dtDx
// 	} else {
// 		incX = -1
// 		dtDx = 1.0 / -dx
// 		nextX = (fromX - float32(x)) * dtDx
// 	}
// 	dy := toY - fromY
// 	if dy == 0 {
// 		incY = 0
// 		nextY = math.MaxFloat32
// 	} else if dy > 0 {
// 		incY = 1
// 		dtDy = 1.0 / dy
// 		nextY = (float32(y) + 1 - fromY) * dtDy
// 	} else {
// 		incY = -1
// 		dtDy = 1.0 / -dy
// 		nextY = (fromY - float32(y)) * dtDy
// 	}
// 	dz := toZ - fromZ
// 	if dz == 0 {
// 		incZ = 0
// 		nextZ = math.MaxFloat32
// 	} else if dz > 0 {
// 		incZ = 1
// 		dtDz = 1.0 / dz
// 		nextZ = (float32(z) + 1 - fromZ) * dtDz
// 	} else {
// 		incZ = -1
// 		dtDz = 1.0 / -dz
// 		nextZ = (fromZ - float32(z)) * dtDz
// 	}
// 	for {
// 		if BlockClosed(obj.GetBlockUnsafe(x, y, z)) {
// 			return false
// 		} else if x == int(toX) && y == int(toY) && z == int(toZ) {
// 			return true
// 		}
// 		if nextX < nextY {
// 			if nextX < nextZ {
// 				x += incX
// 				if x < 0 || x >= chunkSize {
// 					return false
// 				}
// 				nextX += dtDx
// 			} else {
// 				z += incZ
// 				if z < 0 || z >= chunkSize {
// 					return false
// 				}
// 				nextZ += dtDz
// 			}
// 		} else {
// 			if nextY < nextZ {
// 				y += incY
// 				if y < 0 || y >= chunkSize {
// 					return false
// 				}
// 				nextY += dtDy
// 			} else {
// 				z += incZ
// 				if z < 0 || z >= chunkSize {
// 					return false
// 				}
// 				nextZ += dtDz
// 			}
// 		}
// 	}
// }

// func raycastXYZ(fromX, fromY, fromZ, toX, toY, toZ float32) (float32, float32, float32) {
// 	x := int(fromX)
// 	y := int(fromY)
// 	z := int(fromZ)
// 	var dtDx, dtDy, dtDz float32
// 	var incX, incY, incZ int
// 	var nextX, nextY, nextZ float32
// 	dx := toX - fromX
// 	if dx == 0 {
// 		incX = 0
// 		nextX = math.MaxFloat32
// 	} else if dx > 0 {
// 		incX = 1
// 		dtDx = 1.0 / dx
// 		nextX = (float32(x) + 1 - fromX) * dtDx
// 	} else {
// 		incX = -1
// 		dtDx = 1.0 / -dx
// 		nextX = (fromX - float32(x)) * dtDx
// 	}
// 	dy := toY - fromY
// 	if dy == 0 {
// 		incY = 0
// 		nextY = math.MaxFloat32
// 	} else if dy > 0 {
// 		incY = 1
// 		dtDy = 1.0 / dy
// 		nextY = (float32(y) + 1 - fromY) * dtDy
// 	} else {
// 		incY = -1
// 		dtDy = 1.0 / -dy
// 		nextY = (fromY - float32(y)) * dtDy
// 	}
// 	dz := toZ - fromZ
// 	if dz == 0 {
// 		incZ = 0
// 		nextZ = math.MaxFloat32
// 	} else if dz > 0 {
// 		incZ = 1
// 		dtDz = 1.0 / dz
// 		nextZ = (float32(z) + 1 - fromZ) * dtDz
// 	} else {
// 		incZ = -1
// 		dtDz = 1.0 / -dz
// 		nextZ = (fromZ - float32(z)) * dtDz
// 	}
// 	for {
// 		if x == int(toX) && y == int(toY) && z == int(toZ) {
// 			return toX, toY, toZ
// 		}
// 		if nextX < nextY {
// 			if nextX < nextZ {
// 				x += incX
// 				if x < 0 || x >= worldBlocksX {
// 					return float32(x) + 0.5, float32(y) + 0.5, float32(z) + 0.5
// 				}
// 				cx := x >> chunkShift
// 				cy := y >> chunkShift
// 				cz := z >> chunkShift
// 				bx := x % chunkSize
// 				by := y % chunkSize
// 				bz := z % chunkSize
// 				if BlockClosed(WorldGetBlock(cx, cy, cz, bx, by, bz)) {
// 					x -= incX
// 					return float32(x) + 0.5, float32(y) + 0.5, float32(z) + 0.5
// 				}
// 				nextX += dtDx
// 			} else {
// 				z += incZ
// 				if z < 0 || z >= worldBlocksZ {
// 					return float32(x) + 0.5, float32(y) + 0.5, float32(z) + 0.5
// 				}
// 				cx := x >> chunkShift
// 				cy := y >> chunkShift
// 				cz := z >> chunkShift
// 				bx := x % chunkSize
// 				by := y % chunkSize
// 				bz := z % chunkSize
// 				if BlockClosed(WorldGetBlock(cx, cy, cz, bx, by, bz)) {
// 					z -= incZ
// 					return float32(x) + 0.5, float32(y) + 0.5, float32(z) + 0.5
// 				}
// 				nextZ += dtDz
// 			}
// 		} else {
// 			if nextY < nextZ {
// 				y += incY
// 				if y < 0 || y >= worldBlocksY {
// 					return float32(x) + 0.5, float32(y) + 0.5, float32(z) + 0.5
// 				}
// 				cx := x >> chunkShift
// 				cy := y >> chunkShift
// 				cz := z >> chunkShift
// 				bx := x % chunkSize
// 				by := y % chunkSize
// 				bz := z % chunkSize
// 				if BlockClosed(WorldGetBlock(cx, cy, cz, bx, by, bz)) {
// 					y -= incY
// 					return float32(x) + 0.5, float32(y) + 0.5, float32(z) + 0.5
// 				}
// 				nextY += dtDy
// 			} else {
// 				z += incZ
// 				if z < 0 || z >= worldBlocksZ {
// 					return float32(x) + 0.5, float32(y) + 0.5, float32(z) + 0.5
// 				}
// 				cx := x >> chunkShift
// 				cy := y >> chunkShift
// 				cz := z >> chunkShift
// 				bx := x % chunkSize
// 				by := y % chunkSize
// 				bz := z % chunkSize
// 				if BlockClosed(WorldGetBlock(cx, cy, cz, bx, by, bz)) {
// 					z -= incZ
// 					return float32(x) + 0.5, float32(y) + 0.5, float32(z) + 0.5
// 				}
// 				nextZ += dtDz
// 			}
// 		}
// 	}
// }

// func (obj *Ray) Init(fromX, fromY, fromZ, toX, toY, toZ float32) {
// 	obj.x = int(fromX)
// 	obj.y = int(fromY)
// 	obj.z = int(fromZ)
// 	obj.toX = int(toX)
// 	obj.toY = int(toY)
// 	obj.toZ = int(toZ)
// 	dx := toX - fromX
// 	if dx == 0 {
// 		obj.incX = 0
// 		obj.nextX = math.MaxFloat32
// 	} else if dx > 0 {
// 		obj.incX = 1
// 		obj.dtDx = 1.0 / dx
// 		obj.nextX = (float32(obj.x) + 1 - fromX) * obj.dtDx
// 	} else {
// 		obj.incX = -1
// 		obj.dtDx = 1.0 / -dx
// 		obj.nextX = (fromX - float32(obj.x)) * obj.dtDx
// 	}
// 	dy := toY - fromY
// 	if dy == 0 {
// 		obj.incY = 0
// 		obj.nextY = math.MaxFloat32
// 	} else if dy > 0 {
// 		obj.incY = 1
// 		obj.dtDy = 1.0 / dy
// 		obj.nextY = (float32(obj.y) + 1 - fromY) * obj.dtDy
// 	} else {
// 		obj.incY = -1
// 		obj.dtDy = 1.0 / -dy
// 		obj.nextY = (fromY - float32(obj.y)) * obj.dtDy
// 	}
// 	dz := toZ - fromZ
// 	if dz == 0 {
// 		obj.incZ = 0
// 		obj.nextZ = math.MaxFloat32
// 	} else if dz > 0 {
// 		obj.incZ = 1
// 		obj.dtDz = 1.0 / dz
// 		obj.nextZ = (float32(obj.z) + 1 - fromZ) * obj.dtDz
// 	} else {
// 		obj.incZ = -1
// 		obj.dtDz = 1.0 / -dz
// 		obj.nextZ = (fromZ - float32(obj.z)) * obj.dtDz
// 	}
// }

// func (obj *Ray) Step() bool {
// 	/*if obj.x < 0 || obj.x >= WorldChunksX || obj.y < 0 || obj.y >= WorldChunksY || obj.z < 0 || obj.z >= WorldChunksZ {
// 		return true
// 	}*/
// 	if obj.x == obj.toX && obj.y == obj.toY && obj.z == obj.toZ {
// 		return true
// 	}
// 	if obj.nextX < obj.nextY {
// 		if obj.nextX < obj.nextZ {
// 			obj.x += obj.incX
// 			/*if obj.x < 0 || obj.x >= WorldChunksX {
// 				return true
// 			}*/
// 			obj.nextX += obj.dtDx
// 		} else {
// 			obj.z += obj.incZ
// 			/*if obj.z < 0 || obj.z >= WorldChunksZ {
// 				return true
// 			}*/
// 			obj.nextZ += obj.dtDz
// 		}
// 	} else {
// 		if obj.nextY < obj.nextZ {
// 			obj.y += obj.incY
// 			/*if obj.y < 0 || obj.y >= WorldChunksY {
// 				return true
// 			}*/
// 			obj.nextY += obj.dtDy
// 		} else {
// 			obj.z += obj.incZ
// 			/*if obj.z < 0 || obj.z >= WorldChunksZ {
// 				return true
// 			}*/
// 			obj.nextZ += obj.dtDz
// 		}
// 	}
// 	return false
// }
