use crate::map::line::Line;
use crate::map::sector::Sector;
use crate::map::thing::Thing;
use crate::map::thing::Updatable;
use crate::map::triangulate::triangulate_sector;

use std::collections::HashSet;
use std::rc::Rc;

const WORLD_SCALE: f32 = 1.0; // 0.25;
const WORLD_CELL_SHIFT: i32 = 5;

pub struct WorldCell {
    lines: Vec<Line>,
}

pub struct World {
    things: Vec<Thing>,
    sectors: Vec<Sector>,
    cells: Vec<WorldCell>,
    cell_columns: usize,
    cell_rows: usize,
}

impl World {
    pub fn new() -> Self {
        World {
            things: Vec::new(),
            sectors: Vec::new(),
            cells: Vec::new(),
            cell_columns: 0,
            cell_rows: 0,
        }
    }
    pub fn push_sector(&mut self, sector: Sector) {
        self.sectors.push(sector);
    }

    pub fn get_sectors(&self) -> &Vec<Sector> {
        &self.sectors
    }

    fn build_sector_lines(&mut self, index: usize) {
        let sector = &self.sectors[index];
        if sector.lines.len() == 0 {
            return;
        }
    }

    pub fn build(&mut self) {
        let mut top = 0.0;
        let mut right = 0.0;
        for sector in self.sectors.iter() {
            for vec in sector.vecs.iter().copied() {
                if vec.y > top {
                    top = vec.y;
                }
                if vec.x > right {
                    right = vec.x;
                }
            }
        }
        let len = self.sectors.len();
        for i in 0..len {
            let mut list = Vec::new();
            let sector = &self.sectors[i];
            for k in 0..len {
                if i == k {
                    continue;
                }
                let other = &self.sectors[k];
                let mut contains = true;
                for vec_o in other.vecs.iter().copied() {
                    for vec_s in sector.vecs.iter() {
                        if vec_s.eq(vec_o) {
                            contains = false;
                            break;
                        }
                    }
                    if !contains {
                        break;
                    }
                    if !sector.contains(vec_o.x, vec_o.y) {
                        contains = false;
                        break;
                    }
                }
                if contains {
                    list.push(k);
                }
            }
            let mut sector = &mut self.sectors[i];
            println!("inside list {:?}", list);
            sector.inside.append(&mut list);
        }
        for i in 0..len {
            let mut dead = HashSet::new();
            {
                let inside_len = self.sectors[i].inside.len();
                for k in 0..inside_len {
                    let inside = self.sectors[i].inside[k];
                    let other_len = self.sectors[inside].inside.len();
                    for o in 0..other_len {
                        let other = self.sectors[inside].inside[o];
                        dead.insert(other);
                    }
                }
            }
            {
                let sector = &mut self.sectors[i];
                for d in dead.iter().copied() {
                    sector.inside.retain(|f| *f != d);
                }
            }
            let inside_len = self.sectors[i].inside.len();
            for k in 0..inside_len {
                let inside = self.sectors[i].inside[k];
                let inner = &mut self.sectors[inside];
                inner.outside = Some(i);
            }
        }
        let cell_size = (1 << WORLD_CELL_SHIFT) as f32;
        self.cell_rows = (top / cell_size).ceil() as usize;
        self.cell_columns = (right / cell_size).ceil() as usize;
        self.cells = Vec::with_capacity(self.cell_columns * self.cell_rows);
        for s in 0..self.sectors.len() {
            triangulate_sector(&mut self.sectors, s, WORLD_SCALE);
        }
        for i in 0..self.sectors.len() {
            self.build_sector_lines(i);
        }
    }

    pub fn update(&mut self) {
        for thing in self.things.iter_mut() {
            thing.update();
        }
    }
}
