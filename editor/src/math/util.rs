pub const FLOAT_PRECISION: f32 = 0.00000001;

pub fn float_eq(x: f32, y: f32) -> bool {
    (x - y).abs() < FLOAT_PRECISION
}

pub fn float_zero(x: f32) -> bool {
    x.abs() < FLOAT_PRECISION
}
