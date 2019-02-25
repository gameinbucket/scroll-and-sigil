const UNIT_COLOR_RED = 0;
const UNIT_ANIMATION_RATE = 8;
const UNIT_ANIMATION_NOT_DONE = 0;
const UNIT_ANIMATION_DONE = 1;
const UNIT_ANIMATION_ALMOST_DONE = 2;
const UNIT_STATUS_IDLE = 0;
const UNIT_STATUS_CHASE = 1;
const UNIT_STATUS_MELEE = 2;
const UNIT_STATUS_MISSILE = 3;
const UNIT_STATUS_DEAD = 4;
const UNIT_STATUS_MOVE = 5
const UNIT_STATUS_ATTACK_MOVE = 6;
const UNIT_STATUS_DOODAD = 7;
const UNIT_STATUS_STEP_ASIDE = 8;
const UNIT_GRAVITY = 0.01;
class Unit {
	constructor() {
		this.color;
		this.command;
		this.status;
		this.radius;
		this.speed;
		this.target;
		this.attack_time;
		this.attack_cooldown;
		this.range;
		this.sight;
		this.health;
		this.formation;
		this.position;
		this.holding;
		this.mirror = false;
		this.direction;
		this.sprite_id;
		this.animation_move;
		this.animation_attack;
		this.animation_death;
		this.animation;
		this.animation_mod = 16;
		this.animation_frame;
		this.x;
		this.y;
		this.z;
		this.gx;
		this.gy;
		this.gz;
		this.dx = 0;
		this.dy = 0;
		this.dz = 0;
		this.low_gx;
		this.low_gy;
		this.low_gz;
		this.high_gx;
		this.high_gy;
		this.high_gz;
		this.path_list;
		this.move_to_x;
		this.move_to_y;
		this.move_to_z;
		this.final_move_to_x;
		this.final_move_to_y;
		this.final_move_to_z;
		this.ground = false;
	}
	init(world, color, sprite_id, animation_move, x, y, z) {
		this.color = color;
		world.colors[color].push(this);
		this.status = UNIT_STATUS_IDLE;
		this.direction = 0;
		this.sprite_id = sprite_id;
		this.animation_move = animation_move;
		this.animation = this.animation_move;
		this.attack_time = 32;
		this.animation_frame = 0;
		this.x = x;
		this.y = y;
		this.z = z;
		this.move_to_x = x;
		this.move_to_y = y;
		this.move_to_z = z;
		this.gx = Math.floor(x / CHUNK_DIM);
		this.gy = Math.floor(y / CHUNK_DIM);
		this.gz = Math.floor(z / CHUNK_DIM);
		world.get_chunk(this.gx, this.gy, this.gz).add_unit(this);
		this.health = 2;
		this.radius = 0.0001;
		this.speed = 1;
		this.range = 8;
		this.sight = 10;
		this.low_gx = Math.floor((this.x - this.radius) / CHUNK_DIM);
		this.low_gy = Math.floor((this.y - this.radius) / CHUNK_DIM);
		this.low_gz = Math.floor((this.z - this.radius) / CHUNK_DIM);
		this.high_gx = Math.floor((this.x + this.radius) / CHUNK_DIM);
		this.high_gy = Math.floor((this.y + this.radius) / CHUNK_DIM);
		this.high_gz = Math.floor((this.z + this.radius) / CHUNK_DIM);
		for (let gx = this.low_gx; gx <= this.high_gx; gx++) {
			for (let gy = this.low_gy; gy <= this.high_gy; gy++) {
				for (let gz = this.low_gz; gz <= this.high_gz; gz++) {
					let c = world.get_chunk(gx, gy, gz);
					if (c !== null) {
						c.add_physical(world, this);
					}
				}
			}
		}
	}
	vision() {
		// todo
	}
	animate() {
		this.animation_mod++;
		if (this.animation_mod === UNIT_ANIMATION_RATE) {
			this.animation_mod = 0;
			this.animation_frame++;
			if (this.animation_frame === this.animation.length) {
				this.animation_frame = 0;
			}
		}
	}
	update(world) {

		this.dy -= UNIT_GRAVITY;

		this.x += this.dx;
		this.y += this.dy;
		this.z += this.dz;
		this.dx = 0;
		this.dz = 0;

		this.terrain_collision_y(world);

		this.animate();
	}
	terrain_collision_y(world) {
		this.ground = false;
		if (this.dy < 0) {
			let height = world.get_terrain_height(this.x, this.y, this.z);
			if (this.y < height) {
				this.y = height;
				this.ground = true;
				this.dy = 0;
			}
		}
	}
}