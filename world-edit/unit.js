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
const UNIT_STATUS_STEP_ASIDE  = 8;
class Unit
{
	constructor() {
		this.color;
		this.command;
		this.status;
		this.radius;
		this.speed;
		this.target;
		this.attack_time;
		this.Attack_cooldown;
		this.range;
		this.sight;
		this.health;
		this.formation;
		this.position;
		this.holding;
		this.mirror;
		this.direction;
		this.sprite_id;
		this.animation_move;
		this.animation_attack;
		this.animation_death;
		this.animation;
		this.animation_rate;
		this.animation_frame;
        this.x;
        this.y;
		this.z;
		this.gx;
		this.gy;
		this.gz;
		this.dx;
		this.dy;
		this.dz;
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
	}
	init(world, sprite_id, x, y, z) {
		this.color = color;
		this.status = UNIT_STATUS_IDLE;
		this.sprite_id = sprite_id;
		this.animation_move = animation_move;
		this.animation = this.animation_move;
		this.attack_time = 32;
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
		this.radius = 32;
		this.speed = 1;
		this.range = 8;
		this.sight = 10;
		this.low_gx = Math.floor(this.x - this.radius) / CHUNK_DIM;
		this.low_gy = Math.floor(this.y - this.radius) / CHUNK_DIM;
		this.low_gz = Math.floor(this.z - this.radius) / CHUNK_DIM;
		this.high_gx = Math.floor(this.x + this.radius) / CHUNK_DIM;
		this.high_gy = Math.floor(this.y + this.radius) / CHUNK_DIM;
		this.high_gz = Math.floor(this.z + this.radius) / CHUNK_DIM;
		for (let gx = this.low_gx; gx <= this.high_gx; gx++) {
			for (let gy = this.low_gy; gy <= this.high_gy; gy++) {
				for (let gz = this.low_gz; gz <= this.high_gz; gz++) {
					world.get_chunk(gx, gy, gz).add_physical(this);
				}
			}	
		}
	}
	vision() {

	}
	update() {

	}
}