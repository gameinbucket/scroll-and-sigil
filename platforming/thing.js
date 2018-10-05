const ANIMATION_RATE = 8
const GRAVITY = 0.55
const AIR_DRAG = 0.99

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
		this.old_x = x
		this.old_y = y
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
		this.old_x = this.x
		this.old_y = this.y
		this.x += this.dx
		this.y += this.dy
		this.ground = false
		this.remove_from_blocks(world)
		this.tile_collision(world)
		this.thing_collision(world)
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
	tile_x_collision(world) {
		let bottom_gy = Math.floor(this.y / TILE_SIZE)
		let top_gy = Math.floor((this.y + this.height) / TILE_SIZE)
		if (this.dx > 0) {
			let gx = Math.floor((this.x + this.width) / TILE_SIZE)
			for (let gy = bottom_gy; gy <= top_gy; gy++) {
				let tile = world.get_tile(gx, gy)
				if (Tile.Empty(tile))
					continue
				this.dx = 0
				return gx * TILE_SIZE - this.width
			}
		} else {
			let gx = Math.floor((this.x - this.width) / TILE_SIZE)
			for (let gy = bottom_gy; gy <= top_gy; gy++) {
				let tile = world.get_tile(gx, gy)
				if (Tile.Empty(tile))
					continue
				this.dx = 0
				return (gx + 1) * TILE_SIZE + this.width
			}
		}
		return 0
	}
	tile_y_collision(world) {
		let left_gx = Math.floor((this.x - this.width) / TILE_SIZE)
		let right_gx = Math.floor((this.x + this.width) / TILE_SIZE)
		if (this.dy > 0) {
			return 0
		} else {
			let gy = Math.floor(this.y / TILE_SIZE)
			for (let gx = left_gx; gx <= right_gx; gx++) {
				let tile = world.get_tile(gx, gy)
				if (Tile.Empty(tile))
					continue
				this.ground = true
				let height = Tile.Floor(tile)
				return gy * TILE_SIZE + height
			}
		}
		return 0
	}
	tile_collision(world) {

		let dyy = this.tile_y_collision(world)
		if (dyy !== 0) this.y = dyy + 1

		let dxx = this.tile_x_collision(world)
		if (dxx !== 0) this.x = dxx

		// let dxx = this.tile_x_collision(world)
		// let dyy = this.tile_y_collision(world)
		// if (dxx === 0 && dyy === 0) return
		// if (Math.abs(dxx - this.x) < Math.abs(dyy - this.y)) {
		// 	this.x = dxx
		// 	this.y = this.tile_y_collision(world)
		// } else {
		// 	this.y = dyy
		// 	this.x = this.tile_x_collision(world)
		// }

		// let gx
		// if (this.dx > 0) gx = Math.floor((this.x + this.width) / TILE_SIZE)
		// else gx = Math.floor((this.x - this.width) / TILE_SIZE)

		// let gy
		// if (this.dy > 0) gy = Math.floor((this.y + this.height) / TILE_SIZE)
		// else gy = Math.floor(this.y / TILE_SIZE)

		// let left_gx = Math.floor((this.x - this.width) / TILE_SIZE)
		// let right_gx = Math.floor((this.x + this.width) / TILE_SIZE)
		// let bottom_gy = Math.floor(this.y / TILE_SIZE)
		// let top_gy = Math.floor((this.y + this.height) / TILE_SIZE)
		// for (let x = left_gx; x <= right_gx; x++) {
		// 	for (let y = bottom_gy; y <= top_gy; y++) {
		// 		let tile = world.get_tile(x, y)
		// 		if (!Tile.Closed(tile.type))
		// 			continue

		// 		let xx
		// 		if (this.dx > 0) xx = x * TILE_SIZE
		// 		else if (this.dx < 0) xx = (x + 1) * TILE_SIZE
		// 		else xx = this.x

		// 		let yy
		// 		if (this.dy > 0) yy = y * TILE_SIZE
		// 		else if (this.dy < 0) yy = (y + 1) * TILE_SIZE
		// 		else yy = this.y

		// 		let dxx = xx - this.x
		// 		let dyy = yy - this.y

		// 		console.log('dxx', dxx, 'dyy', dyy)
		// 		if (Math.abs(dxx) > Math.abs(dyy)) {
		// 			if (this.dx > 0) {
		// 				let xx = x * TILE_SIZE
		// 				let dxx = xx - this.x
		// 				this.x += dxx
		// 			} else {
		// 				let xx = (x + 1) * TILE_SIZE
		// 				let dxx = xx - this.x
		// 				this.x += dxx
		// 			}
		// 		} else {
		// 			let yy = (y + 1) * TILE_SIZE
		// 			let dyy = yy - this.y
		// 			this.y += dyy
		// 			this.ground = true
		// 		}

		// 		let xx = x * TILE_SIZE
		// 		let yy = y * TILE_SIZE

		// 		let close_x = this.x
		// 		if (close_x < xx)
		// 			close_x = xx
		// 		else if (close_x > xx + TILE_SIZE)
		// 			close_x = xx + TILE_SIZE

		// 		let close_y = this.y
		// 		if (close_y < yy)
		// 			close_y = y
		// 		else if (close_y > yy + TILE_SIZE)
		// 			close_y = yy + TILE_SIZE

		// 		let dxx = this.x - close_x
		// 		let dyy = this.y - close_y

		// 		if (this.dy > 0) {
		// 			this.y -= dyy
		// 		} else {
		// 			this.y += dyy
		// 		}

		// 		if (Math.abs(this.dx) > Math.abs(this.dy)) {
		// 			if (this.dx > 0) {
		// 				this.x += dxx
		// 			} else {
		// 				this.x -= dxx
		// 			}
		// 		} else {
		// 			if (this.dy > 0) {
		// 				this.y -= dyy
		// 			} else {
		// 				this.y += dyy
		// 			}
		// 		}
		// 	}
		// }
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