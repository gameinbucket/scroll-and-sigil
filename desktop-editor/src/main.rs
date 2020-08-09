use minifb::{Key, MouseMode, Window, WindowOptions};
use rand::prelude::*;
use std::thread;
use std::time::Duration;

use editor::canvas::canvas::rgb;
use editor::canvas::canvas::Canvas;
use editor::map::line::Line;
use editor::map::sector::Sector;
use editor::map::triangle::Triangle;
use editor::map::world::World;
use editor::math::vector::Vector2;

const FRAMES_PER_SECOND: u64 = 60;
const MILLISECONDS_PER_FRAME: u64 = 1000 / FRAMES_PER_SECOND;

const CANVAS_WIDTH: usize = 800;
const CANVAS_HEIGHT: usize = 600;

const SECTOR_NO_SURFACE: i32 = -1;
const LINE_NO_WALL: i32 = -1;
const TEXTURE_GRASS: i32 = 0;
const TEXTURE_STONE: i32 = 1;

fn place_house(world: &mut World, x: f32, y: f32) {
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
    world.push_sector(sector);
}
fn place_grass(world: &mut World) {
    let mut vecs = Vec::with_capacity(4);
    vecs.push(Vector2::new(0.0, 0.0));
    vecs.push(Vector2::new(0.0, 50.0));
    vecs.push(Vector2::new(60.0, 50.0));
    vecs.push(Vector2::new(60.0, 0.0));
    let lines = Vec::new();
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
    world.push_sector(sector);
}
const WORLD_DRAW_SCALE: i32 = 10;
fn px(i: f32) -> i32 {
    i as i32 * WORLD_DRAW_SCALE
}
fn draw_triangle(canvas: &mut Canvas, camera: (i32, i32), color: u32, triangle: &Triangle) {
    canvas.triangle(
        color,
        px(triangle.a.x) + camera.0,
        px(triangle.a.y) + camera.1,
        px(triangle.b.x) + camera.0,
        px(triangle.b.y) + camera.1,
        px(triangle.c.x) + camera.0,
        px(triangle.c.y) + camera.1,
    );
}
fn draw_line(canvas: &mut Canvas, camera: (i32, i32), color: u32, line: &Line) {
    canvas.line(
        color,
        px(line.a.x) + camera.0,
        px(line.a.y) + camera.1,
        px(line.b.x) + camera.0,
        px(line.b.y) + camera.1,
    );
}
fn draw_world(canvas: &mut Canvas, camera: (i32, i32), world: &World) {
    let color = rgb(255, 0, 0);
    for sector in world.get_sectors().iter() {
        for triangle in sector.triangles.iter() {
            let color = rgb(0, rand::thread_rng().gen_range(0, 255), 0);
            draw_triangle(canvas, camera, color, triangle);
        }
        for line in sector.lines.iter() {
            draw_line(canvas, camera, color, line);
        }
    }
}
fn draw_cursor(canvas: &mut Canvas, x: i32, y: i32) {
    let color = rgb(0, 0, 225);
    canvas.triangle(color, x, y, x + 4, y, x + 2, y + 4);
}
fn main() {
    let mut world = World::new();
    place_grass(&mut world);
    place_house(&mut world, 10.0, 10.0);
    place_house(&mut world, 35.0, 10.0);
    world.build();

    let mut window = Window::new(
        "Scroll and Sigil Editor",
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
        WindowOptions::default(),
    )
    .expect("Error creating window");

    window.limit_update_rate(Some(Duration::from_millis(MILLISECONDS_PER_FRAME)));

    let mut camera = (0, 0);

    let mut canvas = Canvas::new(CANVAS_WIDTH, CANVAS_HEIGHT);

    let mut dirty = true;

    while window.is_open() && !window.is_key_down(Key::Escape) {
        if window.is_key_down(Key::W) {
            camera.1 -= 1;
            dirty = true;
        }
        if window.is_key_down(Key::A) {
            camera.0 -= 1;
            dirty = true;
        }
        if window.is_key_down(Key::S) {
            camera.1 += 1;
            dirty = true;
        }
        if window.is_key_down(Key::D) {
            camera.0 += 1;
            dirty = true;
        }
        if dirty {
            canvas.clear(0);
            draw_world(&mut canvas, camera, &world);
            let mouse = window.get_mouse_pos(MouseMode::Clamp).unwrap_or((0.0, 0.0));
            draw_cursor(&mut canvas, mouse.0 as i32, mouse.1 as i32);
        }
        window
            .update_with_buffer(&canvas.pixels, CANVAS_WIDTH, CANVAS_HEIGHT)
            .expect("Error updating window buffer");

        dirty = false;
    }
}
