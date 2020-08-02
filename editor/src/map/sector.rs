use crate::map::line::Line;
use crate::map::triangle::Triangle;
use crate::math::vector::Vector2;

pub struct Sector<'a> {
    pub bottom: f32,
    pub floor: f32,
    pub ceiling: f32,
    pub top: f32,
    pub floor_texture: i32,
    pub ceiling_texture: i32,
    pub vecs: Vec<Vector2>,
    pub lines: Vec<Line<'a>>,
    pub triangles: Vec<Triangle>,
    pub inside: Vec<&'a Sector<'a>>,
    pub outside: Option<&'a Sector<'a>>,
}

impl<'a> Sector<'a> {
    pub fn new(
        bottom: f32,
        floor: f32,
        ceiling: f32,
        top: f32,
        floor_texture: i32,
        ceiling_texture: i32,
        vecs: Vec<Vector2>,
        lines: Vec<Line<'a>>,
    ) -> Self {
        Sector {
            bottom,
            floor,
            ceiling,
            top,
            floor_texture,
            ceiling_texture,
            vecs,
            lines,
            triangles: Vec::new(),
            inside: Vec::new(),
            outside: Option::None,
        }
    }

    pub fn update_triangles(&mut self, triangles: Vec<Triangle>) {
        self.triangles = triangles;
    }

    pub fn contains(&self, x: f32, y: f32) -> bool {
        let mut odd: bool = false;
        let vecs: &Vec<Vector2> = &self.vecs;
        let count: usize = vecs.len();
        let mut k: usize = count - 1;
        for i in 0..count {
            let a: &Vector2 = &vecs[i];
            let b: &Vector2 = &vecs[k];
            if (a.y > y) != (b.y > y) {
                let value: f32 = (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x;
                if x < value {
                    odd = !odd;
                }
            }
            k = i;
        }
        odd
    }
    pub fn find(&self, x: f32, y: f32) -> &Sector {
        let inside: &Vec<&Sector> = &self.inside;
        let count: usize = inside.len();
        for i in 0..count {
            if inside[i].contains(x, y) {
                return inside[i].find(x, y);
            }
        }
        self
    }
    pub fn has_floor(&self) -> bool {
        self.floor_texture >= 0
    }
    pub fn has_ceiling(&self) -> bool {
        self.ceiling_texture >= 0
    }
}
