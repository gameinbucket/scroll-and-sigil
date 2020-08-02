use crate::math::vector::Vector3;

pub struct Sector<'a> {
    pub vecs: Vec<Vector3>,
    pub bottom: f32,
    pub inside: Vec<&'a Sector<'a>>,
    // pub outside: Option<Sector>,
}

impl<'a> Sector<'a> {
    pub fn new(vecs: Vec<Vector3>) -> Self {
        Sector {
            vecs,
            bottom: 0.0,
            inside: Vec::new(),
            // outside: Option::None,
        }
    }

    pub fn contains(&self, x: f32, y: f32) -> bool {
        let mut odd: bool = false;
        let vecs: &Vec<Vector3> = &self.vecs;
        let count: usize = vecs.len();
        let mut k: usize = count - 1;
        for i in 0..count {
            let a: &Vector3 = &vecs[i];
            let b: &Vector3 = &vecs[k];
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
}
