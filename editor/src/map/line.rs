use crate::map::sector::Sector;
use crate::map::wall::Wall;
use crate::math::vector::Vector2;
use crate::math::vector::Vector3;

pub struct Line<'a> {
    pub plus: Option<&'a Sector<'a>>,
    pub minus: Option<&'a Sector<'a>>,
    pub a: Vector3,
    pub b: Vector3,
    pub top: Wall,
    pub middle: Wall,
    pub bottom: Wall,
    pub normal: Vector2,
}

impl<'a> Line<'a> {
    pub fn new() -> Self {
        Line {
            plus: Option::None,
            minus: Option::None,
            a: Vector3::default(),
            b: Vector3::default(),
            top: Wall::new(),
            middle: Wall::new(),
            bottom: Wall::new(),
            normal: Vector2::default(),
        }
    }
}

impl Default for Line<'_> {
    fn default() -> Self {
        Line::new()
    }
}
