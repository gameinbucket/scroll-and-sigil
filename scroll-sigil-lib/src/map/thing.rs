use crate::math::vector::Vector3;

pub struct Thing {
    pub position: Vector3,
    pub delta: Vector3,
    pub area: f32,
    pub health: i32,
    pub speed: f32,
    pub ground: bool,
}

pub trait Updatable {
    fn update(&mut self);
}

impl Thing {
    pub fn new(position: Vector3) -> Self {
        Thing {
            position,
            delta: Vector3::default(),
            area: 0.0,
            health: 0,
            speed: 0.0,
            ground: false,
        }
    }
}

impl Updatable for Thing {
    fn update(&mut self) {}
}
