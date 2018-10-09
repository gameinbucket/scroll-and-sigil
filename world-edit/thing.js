const ANIMATION_RATE = 8
const GRAVITY = 0.55
const AIR_DRAG = 0.99

class Resolution {
	constructor() {
		this.resolve = false
		this.delta = 0
		this.finite = false
	}
}

class Thing {
	constructor(world, sprite_id, animation_move, x, y) {
		this.command
		this.width = 8
		this.height = 31
		this.speed = 4
		this.health = 1
		this.mirror = false
		this.sprite = animation_move
		this.sprite_id = sprite_id
		this.animations = [animation_move]
		this.frame = 0
		this.x = x
		this.y = y
		this.dx = 0
		this.dy = 0
		this.ground = false
		world.add_thing(this)
		this.block_borders()
		this.add_to_blocks(world)
	}
	block_borders() {
		this.left_gx = Math.floor((this.x - this.width) / GRID_SIZE)
		this.right_gx = Math.floor((this.x + this.width) / GRID_SIZE)
		this.bottom_gy = Math.floor(this.y / GRID_SIZE)
		this.top_gy = Math.floor((this.y + this.height) / GRID_SIZE)
	}
	add_to_blocks(world) {
		for (let gx = this.left_gx; gx <= this.right_gx; gx++) {
			for (let gy = this.bottom_gy; gy <= this.top_gy; gy++) {
				world.get_block(gx, gy).add_thing(this)
			}
		}
	}
	remove_from_blocks(world) {
		for (let gx = this.left_gx; gx <= this.right_gx; gx++) {
			for (let gy = this.bottom_gy; gy <= this.top_gy; gy++) {
				world.get_block(gx, gy).remove_thing(this)
			}
		}
	}
	move_left() {
		this.mirror = true
		if (this.ground) this.dx -= this.speed
		else this.dx -= this.speed * 0.01
	}
	move_right() {
		this.mirror = false
		if (this.ground) this.dx += this.speed
		else this.dx += this.speed * 0.01
	}
	jump() {
		if (!this.ground) return
		this.dy += 7.5
		if (this.mirror) this.dx -= this.speed * 0.25
		else this.dx += this.speed * 0.25
	}
	update(world) {
		this.dy -= GRAVITY
		this.x += this.dx
		this.y += this.dy
		this.ground = false
		this.remove_from_blocks(world)
		this.tile_collision(world)
		// this.thing_collision(world)
		this.block_borders()
		this.add_to_blocks(world)
		if (this.ground) {
			this.dx = 0
			this.dy = 0
		} else {
			this.dx *= AIR_DRAG
			this.dy *= AIR_DRAG
		}
	}
	tile_x_collision(world, res) {
		let bottom_gy = Math.floor(this.y / TILE_SIZE)
		let top_gy = Math.floor((this.y + this.height) / TILE_SIZE)
		res.finite = true
		res.resolve = false
		if (this.dx > 0) {
			let gx = Math.floor((this.x + this.width) / TILE_SIZE)
			for (let gy = bottom_gy; gy <= top_gy; gy++) {
				if (Tile.Empty(world.get_tile(gx, gy)))
					continue
				res.resolve = true
				res.delta = gx * TILE_SIZE - this.width
				if (!Tile.Empty(world.get_tile(gx - 1, gy))) {
					res.finite = false
					return
				}
			}
		} else {
			let gx = Math.floor((this.x - this.width) / TILE_SIZE)
			for (let gy = bottom_gy; gy <= top_gy; gy++) {
				let tile = world.get_tile(gx, gy)
				if (Tile.Empty(tile))
					continue
				res.resolve = true
				res.delta = (gx + 1) * TILE_SIZE + this.width
				if (!Tile.Empty(world.get_tile(gx + 1, gy))) {
					res.finite = false
					return
				}
			}
		}
	}
	tile_y_collision(world, res) {
		let left_gx = Math.floor((this.x - this.width) / TILE_SIZE)
		let right_gx = Math.floor((this.x + this.width) / TILE_SIZE)
		res.finite = true
		res.resolve = false
		if (this.dy > 0) {
			res.resolve = false
		} else {
			let gy = Math.floor(this.y / TILE_SIZE)
			for (let gx = left_gx; gx <= right_gx; gx++) {
				if (Tile.Empty(world.get_tile(gx, gy)))
					continue
				res.resolve = true
				res.delta = (gy + 1) * TILE_SIZE
				if (!Tile.Empty(world.get_tile(gx, gy + 1))) {
					res.finite = false
					return
				}
			}
		}
	}
	tile_collision(world) {
		let dxx = new Resolution()
		let dyy = new Resolution()
		this.tile_x_collision(world, dxx)
		this.tile_y_collision(world, dyy)

		if (dxx.resolve) {
			if (dyy.resolve) {
				if (!dxx.finite && !dyy.finite) {
					this.x = dxx.delta
					this.y = dyy.delta
					if (this.dy < 0) this.ground = true
					this.dx = 0
					this.dy = 0
				} else if (dxx.finite && !dyy.finite) {
					this.x = dxx.delta
					this.dx = 0
					this.tile_y_collision(world, dyy)
					if (dyy.resolve && dyy.finite) {
						this.y = dyy.delta
						if (this.dy < 0) this.ground = true
						this.dy = 0
					}
				} else if (dyy.finite && !dxx.finite) {
					this.y = dyy.delta
					if (this.dy < 0) this.ground = true
					this.dy = 0
					this.tile_x_collision(world, dxx)
					if (dxx.resolve && dxx.finite) {
						this.x = dxx.delta
						this.dx = 0
					}
				} else if (Math.abs(dxx.delta - this.x) < Math.abs(dyy.delta - this.y)) {
					this.x = dxx.delta
					this.dx = 0
					this.tile_y_collision(world, dyy)
					if (dyy.resolve && dyy.finite) {
						this.y = dyy.delta
						if (this.dy < 0) this.ground = true
						this.dy = 0
					}
				} else {
					this.y = dyy.delta
					this.dy = 0
					this.tile_x_collision(world, dxx)
					if (dxx.resolve && dxx.finite) {
						this.x = dxx.delta
						this.dx = 0
					}
				}
			} else {
				this.x = dxx.delta
				this.dx = 0
				this.tile_y_collision(world, dyy)
				if (dyy.resolve && dyy.finite) {
					this.y = dyy.delta
					if (this.dy < 0) this.ground = true
					this.dy = 0
				}
			}
		} else if (dyy.length > 0) {
			this.y = dyy.delta
			if (this.dy < 0) this.ground = true
			this.dy = 0
			this.tile_x_collision(world, dxx)
			if (dxx.resolve && dxx.finite) {
				this.x = dxx.delta
				this.dx = 0
			}
		}
	}
	resolve_collision_thing(b) {
		if (!this.overlap_thing(b)) return

		if (Math.abs(this.old_x - b.x) > Math.abs(this.old_y - b.y)) {
			if (this.old_x - b.x < 0) this.x = b.x - this.width - b.width
			else this.x = b.x + this.width + b.width
			this.dx = 0
		} else {
			if (this.old_y - b.y < 0) this.y = b.y - this.height
			else {
				this.y = b.y + b.height
				this.ground = true
			}
			this.dy = 0
		}
	}
	overlap_thing(b) {
		return this.x + this.width > b.x - b.width && this.x - this.width < b.x + b.width &&
			this.y + this.height > b.y && this.y < b.y + b.height
	}
	thing_collision(world) {

		let collided = new Array()
		let searched = new Set()

		for (let gx = this.left_gx; gx <= this.right_gx; gx++) {
			for (let gy = this.bottom_gy; gy <= this.top_gy; gy++) {
				let block = world.get_block(gx, gy)
				for (let i = 0; i < block.thing_count; i++) {
					let thing = block.things[i]
					if (searched.has(thing)) continue
					if (this.overlap_thing(thing)) collided.push(thing)
					searched.add(thing)
				}
			}
		}

		while (collided.length > 0) {
			let closest = null
			let manhattan = Number.MAX_VALUE
			for (let i = 0; i < collided.length; i++) {
				let thing = collided[i]
				let dist = Math.abs(this.old_x - thing.x) + Math.abs(this.old_y - thing.y)
				if (dist < manhattan) {
					manhattan = dist
					closest = thing
				}
			}
			this.resolve_collision_thing(closest)
			collided.splice(closest)
		}
	}
}