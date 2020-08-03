#[derive(Copy, Clone)]
pub struct Point3 {
    pub x: i32,
    pub y: i32,
    pub z: i32,
}

impl Point3 {
    pub fn new(x: i32, y: i32, z: i32) -> Self {
        Point3 { x, y, z }
    }
}

impl Default for Point3 {
    fn default() -> Self {
        Point3::new(0, 0, 0)
    }
}

#[derive(Copy, Clone)]
pub struct Point2 {
    pub x: i32,
    pub y: i32,
}

impl Point2 {
    pub fn new(x: i32, y: i32) -> Self {
        Point2 { x, y }
    }
}

impl Default for Point2 {
    fn default() -> Self {
        Point2::new(0, 0)
    }
}
