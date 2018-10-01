const UNIT_ANIMATION_RATE = 8
const UNIT_ANIMATION_NOT_DONE = 0
const UNIT_ANIMATION_DONE = 1
const UNIT_ANIMATION_ALMOST_DONE = 2
const UNIT_STATUS_IDLE = 0
const UNIT_STATUS_CHASE = 1
const UNIT_STATUS_MELEE = 2
const UNIT_STATUS_MISSILE = 3
const UNIT_STATUS_DEAD = 4
const UNIT_STATUS_MOVE = 5
const UNIT_STATUS_ATTACK_MOVE = 6
const UNIT_STATUS_DOODAD = 7
const UNIT_STATUS_STEP_ASIDE = 8
const UNIT_GRAVITY = 0.01
class Thing {
	constructor(world, sprite_id, animation_move, x, y) {
		this.command
		this.radius
		this.speed
		this.target
		this.attack_time
		this.attack_cooldown
		this.range
		this.sight
		this.health
		this.formation
		this.position
		this.holding
		this.mirror = false
		this.sprite
		this.animations
		this.animation_mod = 16
		this.animation_frame
		this.gx
		this.gy
		this.dx = 0
		this.dy = 0
		this.low_gx
		this.low_gy
		this.high_gx
		this.high_gy
		this.ground = false

		world.things.push(this)
		this.status = UNIT_STATUS_IDLE
		this.sprite_id = sprite_id
		this.animation_move = animation_move
		this.sprite = this.animation_move
		this.sprite_id = 'footman'
		this.attack_time = 32
		this.animation_frame = 0
		this.x = x
		this.y = y
		this.move_to_x = x
		this.move_to_y = y
		this.gx = Math.floor(x / BLOCK_SIZE)
		this.gy = Math.floor(y / BLOCK_SIZE)
		world.get_block(this.gx, this.gy).add_thing(this)
		this.health = 2
		this.radius = 0.0001
		this.speed = 1
		this.range = 8
		this.sight = 10
		this.low_gx = Math.floor((this.x - this.radius) / BLOCK_SIZE)
		this.low_gy = Math.floor((this.y - this.radius) / BLOCK_SIZE)
		this.high_gx = Math.floor((this.x + this.radius) / BLOCK_SIZE)
		this.high_gy = Math.floor((this.y + this.radius) / BLOCK_SIZE)
		for (let gx = this.low_gx; gx <= this.high_gx; gx++) {
			for (let gy = this.low_gy; gy <= this.high_gy; gy++) {
				let block = world.get_block(gx, gy)
				if (block !== null) {
					block.add_physical(world, this)
				}
			}
		}
	}
	animate() {
		this.animation_mod++
		if (this.animation_mod === UNIT_ANIMATION_RATE) {
			this.animation_mod = 0
			this.animation_frame++
			if (this.animation_frame === this.animation.length) {
				this.animation_frame = 0
			}
		}
	}
	update(world) {
		this.dy -= UNIT_GRAVITY

		this.x += this.dx
		this.y += this.dy
		this.dx = 0
		this.dz = 0

		this.terrain_collision_y(world)

		this.animate()
	}
	terrain_collision_y(world) {
		this.ground = false
		if (this.dy < 0) {
			let height = 0
			if (this.y < height) {
				this.y = height
				this.ground = true
				this.dy = 0
			}
		}
	}
}