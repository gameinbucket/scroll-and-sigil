// Copyright (c) 2009 The Go Authors. All rights reserved.

// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:

//    * Redistributions of source code must retain the above copyright
// notice, this list of conditions and the following disclaimer.
//    * Redistributions in binary form must reproduce the above
// copyright notice, this list of conditions and the following disclaimer
// in the documentation and/or other materials provided with the
// distribution.
//    * Neither the name of Google Inc. nor the names of its
// contributors may be used to endorse or promote products derived from
// this software without specific prior written permission.

// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

package fast

var magicSin = [...]float32{
	1.58962301576546568060e-10,
	-2.50507477628578072866e-8,
	2.75573136213857245213e-6,
	-1.98412698295895385996e-4,
	8.33333333332211858878e-3,
	-1.66666666666666307295e-1,
}

var magicCos = [...]float32{
	-1.13585365213876817300e-11,
	2.08757008419747316778e-9,
	-2.75573141792967388112e-7,
	2.48015872888517045348e-5,
	-1.38888888888730564116e-3,
	4.16666666666665929218e-2,
}

// Cos32 func
func Cos32(x float32) float32 {
	const (
		PI4A = 7.85398125648498535156e-1
		PI4B = 3.77489470793079817668e-8
		PI4C = 2.69515142907905952645e-15
	)

	sign := false

	if x < 0 {
		x = -x
		sign = true
	}

	var j uint32
	var y, z float32

	j = uint32(x * (4 / Pi))
	y = float32(j)

	if j&1 == 1 {
		j++
		y++
	}
	j &= 7
	z = ((x - y*PI4A) - y*PI4B) - y*PI4C

	if j > 3 {
		j -= 4
		sign = !sign
	}
	if j > 1 {
		sign = !sign
	}

	zz := z * z
	if j == 1 || j == 2 {
		y = z + z*zz*((((((magicSin[0]*zz)+magicSin[1])*zz+magicSin[2])*zz+magicSin[3])*zz+magicSin[4])*zz+magicSin[5])
	} else {
		y = 1.0 - 0.5*zz + zz*zz*((((((magicCos[0]*zz)+magicCos[1])*zz+magicCos[2])*zz+magicCos[3])*zz+magicCos[4])*zz+magicCos[5])
	}
	if sign {
		y = -y
	}
	return y
}

// Sin32 func
func Sin32(x float32) float32 {
	const (
		PI4A = 7.85398125648498535156e-1
		PI4B = 3.77489470793079817668e-8
		PI4C = 2.69515142907905952645e-15
	)

	sign := false
	if x < 0 {
		x = -x
		sign = true
	}

	var j uint32
	var y, z float32

	j = uint32(x * (4 / Pi))
	y = float32(j)

	if j&1 == 1 {
		j++
		y++
	}
	j &= 7
	z = ((x - y*PI4A) - y*PI4B) - y*PI4C

	if j > 3 {
		sign = !sign
		j -= 4
	}
	zz := z * z
	if j == 1 || j == 2 {
		y = 1.0 - 0.5*zz + zz*zz*((((((magicCos[0]*zz)+magicCos[1])*zz+magicCos[2])*zz+magicCos[3])*zz+magicCos[4])*zz+magicCos[5])
	} else {
		y = z + z*zz*((((((magicSin[0]*zz)+magicSin[1])*zz+magicSin[2])*zz+magicSin[3])*zz+magicSin[4])*zz+magicSin[5])
	}
	if sign {
		y = -y
	}
	return y
}
