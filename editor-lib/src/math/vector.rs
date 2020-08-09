use crate::math::util::float_eq;

#[derive(Copy, Clone)]
pub struct Vector3 {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

impl Vector3 {
    pub fn new(x: f32, y: f32, z: f32) -> Self {
        Vector3 { x, y, z }
    }
}

impl Default for Vector3 {
    fn default() -> Self {
        Vector3::new(0.0, 0.0, 0.0)
    }
}

#[derive(Copy, Clone)]
pub struct Vector2 {
    pub x: f32,
    pub y: f32,
}

impl Vector2 {
    pub fn new(x: f32, y: f32) -> Self {
        Vector2 { x, y }
    }
    pub fn eq(&self, other: Vector2) -> bool {
        float_eq(self.x, other.x) && float_eq(self.y, other.y)
    }
}

impl Default for Vector2 {
    fn default() -> Self {
        Vector2::new(0.0, 0.0)
    }
}
