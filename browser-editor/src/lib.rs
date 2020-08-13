#![allow(unused)]
#![allow(dead_code)]

use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{console, WebGlProgram, WebGlRenderingContext, WebGlShader};

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
            let color = rgb(0, 255, 0);
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

pub fn compile_shader(
    context: &WebGlRenderingContext,
    shader_type: u32,
    source: &str,
) -> Result<WebGlShader, String> {
    let shader = context
        .create_shader(shader_type)
        .ok_or_else(|| String::from("Unable to create shader object"))?;
    context.shader_source(&shader, source);
    context.compile_shader(&shader);

    if context
        .get_shader_parameter(&shader, WebGlRenderingContext::COMPILE_STATUS)
        .as_bool()
        .unwrap_or(false)
    {
        Ok(shader)
    } else {
        Err(context
            .get_shader_info_log(&shader)
            .unwrap_or_else(|| String::from("Unknown error creating shader")))
    }
}

pub fn link_program(
    context: &WebGlRenderingContext,
    vert_shader: &WebGlShader,
    frag_shader: &WebGlShader,
) -> Result<WebGlProgram, String> {
    let program = context
        .create_program()
        .ok_or_else(|| String::from("Unable to create shader object"))?;

    context.attach_shader(&program, vert_shader);
    context.attach_shader(&program, frag_shader);
    context.link_program(&program);

    if context
        .get_program_parameter(&program, WebGlRenderingContext::LINK_STATUS)
        .as_bool()
        .unwrap_or(false)
    {
        Ok(program)
    } else {
        Err(context
            .get_program_info_log(&program)
            .unwrap_or_else(|| String::from("Unknown error creating program object")))
    }
}

#[wasm_bindgen(start)]
pub fn main() -> Result<(), JsValue> {
    console::log_1(&"foobar".into());

    let mut world = World::new();
    place_grass(&mut world);
    place_house(&mut world, 10.0, 10.0);
    place_house(&mut world, 35.0, 10.0);
    world.build();

    let camera = (0, 0);

    let mut canvas = Canvas::new(CANVAS_WIDTH, CANVAS_HEIGHT);

    canvas.clear(0);
    draw_world(&mut canvas, camera, &world);

    let document = web_sys::window().unwrap().document().unwrap();
    let canvas = document.get_element_by_id("canvas").unwrap();
    let canvas: web_sys::HtmlCanvasElement = canvas.dyn_into::<web_sys::HtmlCanvasElement>()?;

    let context = canvas
        .get_context("webgl")?
        .unwrap()
        .dyn_into::<WebGlRenderingContext>()?;

    let vert_shader = compile_shader(
        &context,
        WebGlRenderingContext::VERTEX_SHADER,
        r#"
       attribute vec4 position;
       void main() {
           gl_Position = position;
       }
   "#,
    )?;
    let frag_shader = compile_shader(
        &context,
        WebGlRenderingContext::FRAGMENT_SHADER,
        r#"
       void main() {
           gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
       }
   "#,
    )?;
    let program = link_program(&context, &vert_shader, &frag_shader)?;
    context.use_program(Some(&program));

    let vertices: [f32; 9] = [-0.7, -0.7, 0.0, 0.7, -0.7, 0.0, 0.0, 0.7, 0.0];

    let buffer = context.create_buffer().ok_or("failed to create buffer")?;
    context.bind_buffer(WebGlRenderingContext::ARRAY_BUFFER, Some(&buffer));

    unsafe {
        let vert_array = js_sys::Float32Array::view(&vertices);

        context.buffer_data_with_array_buffer_view(
            WebGlRenderingContext::ARRAY_BUFFER,
            &vert_array,
            WebGlRenderingContext::STATIC_DRAW,
        );
    }

    context.vertex_attrib_pointer_with_i32(0, 3, WebGlRenderingContext::FLOAT, false, 0, 0);
    context.enable_vertex_attrib_array(0);

    context.clear_color(0.0, 0.0, 0.0, 1.0);
    context.clear(WebGlRenderingContext::COLOR_BUFFER_BIT);

    context.draw_arrays(
        WebGlRenderingContext::TRIANGLES,
        0,
        (vertices.len() / 3) as i32,
    );
    Ok(())
}
