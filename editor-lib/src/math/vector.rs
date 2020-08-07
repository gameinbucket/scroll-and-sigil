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
    pub fn angle(&self, other: Vector2) -> f32 {
        let mut angle = (self.y - other.y).atan2(self.x - other.x);
        if angle < 0.0 {
            angle += 2.0 * std::f32::consts::PI;
        }
        return angle;
    }
    pub fn interior_angle(&self, second: Vector2, third: Vector2) -> f32 {
        let angle_one = (self.y - second.y).atan2(self.x - second.x);
        let angle_two = (second.y - third.y).atan2(second.x - third.x);
        let mut interior = angle_two - angle_one;
        if interior < 0.0 {
            interior += 2.0 * std::f32::consts::PI;
        }
        return interior;
    }
}

impl Default for Vector2 {
    fn default() -> Self {
        Vector2::new(0.0, 0.0)
    }
}
