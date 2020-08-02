use std::time::Duration;

use minifb::{Key, Window, WindowOptions};

use editor::Canvas;

use editor::map::line::Line;
use editor::map::sector::Sector;
use editor::math::vector::Vector3;

const FRAMES_PER_SECOND: u64 = 60;
const MILLISECONDS_PER_FRAME: u64 = 1000 / FRAMES_PER_SECOND;

const CANVAS_WIDTH: usize = 800;
const CANVAS_HEIGHT: usize = 600;

fn place_house() {}

fn place_grass() {
    let mut vecs = Vec::new();
    vecs.push(Vector3::new(0.0, 0.0, 0.0));
    vecs.push(Vector3::new(0.0, 127.0, 0.0));
    vecs.push(Vector3::new(127.0, 127.0, 0.0));
    vecs.push(Vector3::new(127.0, 0.0, 0.0));

    let line = Line::new();
    println!("line: {}", line.a.x);
    let sector = Sector::new(vecs);
    println!("sector: {}, {}", sector.bottom, sector.vecs.len());
}

fn main() {
    place_grass();
    place_house();

    let mut window = Window::new(
        "Scroll and Sigil Editor",
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
        WindowOptions::default(),
    )
    .expect("Error creating window");

    window.limit_update_rate(Some(Duration::from_millis(MILLISECONDS_PER_FRAME)));

    let canvas = Canvas::new(CANVAS_WIDTH, CANVAS_HEIGHT);

    let mut buffer: Vec<u32> = vec![0; CANVAS_WIDTH * CANVAS_HEIGHT];

    while window.is_open() && !window.is_key_down(Key::Escape) {
        canvas.draw(&mut buffer);

        window
            .update_with_buffer(&buffer, CANVAS_WIDTH, CANVAS_HEIGHT)
            .expect("Error updating window buffer");
    }
}
