use std::time::Duration;

use minifb::{Key, Window, WindowOptions};

use editor::Canvas;

use editor::map::line::Line;
use editor::map::sector::Sector;
use editor::map::triangulate::triangulate_sector;
use editor::math::vector::Vector2;

const FRAMES_PER_SECOND: u64 = 60;
const MILLISECONDS_PER_FRAME: u64 = 1000 / FRAMES_PER_SECOND;

const CANVAS_WIDTH: usize = 800;
const CANVAS_HEIGHT: usize = 600;

const SECTOR_SCALE: f32 = 1.0;

const SECTOR_NO_SURFACE: i32 = -1;
const LINE_NO_WALL: i32 = -1;
const TEXTURE_GRASS: i32 = 0;
const TEXTURE_STONE: i32 = 1;

fn place_house(x: f32, y: f32) {
    const COUNT: usize = 12;
    let mut vecs = Vec::with_capacity(COUNT);
    vecs.push(Vector2::new(x, y));
    vecs.push(Vector2::new(x, y + 20.0));
    vecs.push(Vector2::new(x + 6.0, y + 20.0));
    vecs.push(Vector2::new(x + 6.0, y + 19.0));
    vecs.push(Vector2::new(x + 1.0, y + 19.0));
    vecs.push(Vector2::new(x + 1.0, y + 1.0));
    vecs.push(Vector2::new(x + 19.0, y + 1.0));
    vecs.push(Vector2::new(x + 19.0, y + 19.0));
    vecs.push(Vector2::new(x + 14.0, y + 19.0));
    vecs.push(Vector2::new(x + 14.0, y + 20.0));
    vecs.push(Vector2::new(x + 20.0, y + 20.0));
    vecs.push(Vector2::new(x + 20.0, y));
    let mut lines = Vec::with_capacity(COUNT);
    let mut k: usize = COUNT - 1;
    for i in 0..COUNT {
        lines.push(Line::new(
            LINE_NO_WALL,
            TEXTURE_STONE,
            LINE_NO_WALL,
            vecs[k],
            vecs[i],
        ));
        k = i;
    }
    let bottom: f32 = 0.0;
    let floor: f32 = 0.0;
    let ceiling: f32 = 10.0;
    let top: f32 = 0.0;
    let sector = Sector::new(
        bottom,
        floor,
        ceiling,
        top,
        TEXTURE_GRASS,
        SECTOR_NO_SURFACE,
        vecs,
        lines,
    );
    println!("sector: {}, {}", sector.bottom, sector.vecs.len());
}

fn place_grass() {
    let mut vecs = Vec::with_capacity(4);
    vecs.push(Vector2::new(0.0, 0.0));
    vecs.push(Vector2::new(0.0, 127.0));
    vecs.push(Vector2::new(127.0, 127.0));
    vecs.push(Vector2::new(127.0, 0.0));
    let lines = Vec::new();
    let bottom: f32 = 0.0;
    let floor: f32 = 0.0;
    let ceiling: f32 = 10.0;
    let top: f32 = 0.0;
    let mut sector = Sector::new(
        bottom,
        floor,
        ceiling,
        top,
        TEXTURE_GRASS,
        SECTOR_NO_SURFACE,
        vecs,
        lines,
    );
    println!("sector: {}, {}", sector.bottom, sector.vecs.len());
    triangulate_sector(&mut sector, SECTOR_SCALE);
}

fn main() {
    // let mut world = World::new();
    place_grass();
    place_house(0.0, 0.0);
    // world.build();

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
