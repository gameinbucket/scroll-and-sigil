pub struct Canvas {
    pub width: usize,
    pub height: usize,
    pub pixels: Vec<u32>,
}

pub fn rgb(r: u8, g: u8, b: u8) -> u32 {
    ((r as u32) << 16) | ((g as u32) << 8) | (b as u32)
}

impl Canvas {
    pub fn new(width: usize, height: usize) -> Self {
        let pixels = vec![0; width * height];
        Canvas {
            width,
            height,
            pixels,
        }
    }
    pub fn clear(&mut self, rgb: u32) {
        let size: usize = self.pixels.len();
        for i in 0..size {
            self.pixels[i] = rgb;
        }
    }
    pub fn line(&mut self, rgb: u32, x0: i32, y0: i32, x1: i32, y1: i32) {
        let dx = (x1 - x0).abs();
        let sx = if x0 < x1 { 1 } else { -1 };
        let dy = (y1 - y0).abs();
        let sy = if y0 < y1 { 1 } else { -1 };
        let mut err = (if dx > dy { dx } else { -dy }) / 2;
        let mut err2: i32;
        let mut x = x0;
        let mut y = y0;
        loop {
            self.pixels[x as usize + y as usize * self.width] = rgb;
            if x == x1 && y == y1 {
                break;
            }
            err2 = err;
            if err2 > -dx {
                err -= dy;
                x += sx;
            }
            if err2 < dy {
                err += dx;
                y += sy;
            }
        }
    }
}
