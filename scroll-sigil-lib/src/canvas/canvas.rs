use std::cmp::max;
use std::cmp::min;

pub struct Canvas {
    pub width: usize,
    pub height: usize,
    pub pixels: Vec<u32>,
}

pub fn rgb(r: u8, g: u8, b: u8) -> u32 {
    ((r as u32) << 16) | ((g as u32) << 8) | (b as u32)
}

fn orient(x0: i32, y0: i32, x1: i32, y1: i32, x2: i32, y2: i32) -> i32 {
    return (x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0);
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
    pub fn clear(&mut self, color: u32) {
        let size: usize = self.pixels.len();
        for i in 0..size {
            self.pixels[i] = color;
        }
    }
    pub fn line(&mut self, color: u32, x0: i32, y0: i32, x1: i32, y1: i32) {
        let dx = (x1 - x0).abs();
        let sx = if x0 < x1 { 1 } else { -1 };
        let dy = (y1 - y0).abs();
        let sy = if y0 < y1 { 1 } else { -1 };
        let mut err = (if dx > dy { dx } else { -dy }) / 2;
        let mut err2: i32;
        let mut x = x0;
        let mut y = y0;
        loop {
            if x < 0 || y < 0 {
                return;
            }
            let pixel_x = x as usize;
            let pixel_y = y as usize;
            if pixel_x >= self.width || pixel_y >= self.height {
                return;
            }
            self.pixels[pixel_x + pixel_y * self.width] = color;
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
    pub fn triangle(&mut self, color: u32, x0: i32, y0: i32, x1: i32, y1: i32, x2: i32, y2: i32) {
        let min_x = max(min(min(x0, x1), x2), 0) as usize;
        let min_y = max(min(min(y0, y1), y2), 0) as usize;
        let max_x = min(max(max(x0, x1), x2) as usize, self.width - 1);
        let max_y = min(max(max(y0, y1), y2) as usize, self.height - 1);
        for p_y in min_y..=max_y {
            for p_x in min_x..=max_x {
                let w0 = orient(x1, y1, x2, y2, p_x as i32, p_y as i32);
                let w1 = orient(x2, y2, x0, y0, p_x as i32, p_y as i32);
                let w2 = orient(x0, y0, x1, y1, p_x as i32, p_y as i32);
                if (w0 >= 0 && w1 >= 0 && w2 >= 0) {
                    self.pixels[p_x + p_y * self.width] = color;
                }
            }
        }
    }
}
