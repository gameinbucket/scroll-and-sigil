use crate::map::sector::Sector;

pub struct World<'a> {
    sectors: Vec<Sector<'a>>,
}

impl<'a> World<'a> {
    pub fn new() -> Self {
        World {
            sectors: Vec::new(),
        }
    }
    pub fn push_sector(&mut self, sector: Sector<'a>) {
        self.sectors.push(sector);
    }
    pub fn get_sectors(&self) -> &Vec<Sector<'a>> {
        &self.sectors
    }
    pub fn build(&mut self) {}
}
