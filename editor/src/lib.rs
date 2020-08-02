pub mod map;
pub mod math;

#[allow(dead_code)]
pub struct Canvas {
    width: usize,
    height: usize,
    pixels: Vec<u32>,
}

impl Canvas {
    pub fn new(width: usize, height: usize) -> Self {
        let mut pixels = vec![0; width * height];
        for i in 0..width {
            pixels[(height - 1) * width + i] = 36;
        }
        Canvas {
            width,
            height,
            pixels,
        }
    }
    #[allow(unused)]
    pub fn draw(&self, buffer: &mut [u32]) {}
}
