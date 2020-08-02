use crate::math::vector::Vector3;

pub struct Wall {
    pub va: Vector3,
    pub vb: Vector3,
    pub floor: f32,
    pub ceiling: f32,
    pub texture: i32,
    pub u: f32,
    pub v: f32,
    pub s: f32,
    pub t: f32,
}

impl Wall {
    pub fn new() -> Self {
        Wall {
            va: Vector3::default(),
            vb: Vector3::default(),
            floor: 0.0,
            ceiling: 0.0,
            texture: 0,
            u: 0.0,
            v: 0.0,
            s: 0.0,
            t: 0.0,
        }
    }
}

impl Default for Wall {
    fn default() -> Self {
        Wall::new()
    }
}
