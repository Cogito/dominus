// last_move_at is optional
create_army = function(user_id, army, x, y, moves, last_move_at) {
	check(army, Object)
	check(x, validNumber)
	check(y, validNumber)
	check(moves, Array)

	// set last_move_at to now if not set
	last_move_at = typeof last_move_at !== 'undefined' ? last_move_at : new Date()

	var name = names.armies.part1[_.random(names.armies.part1.length-1)] +' '+ names.armies.part2[_.random(names.armies.part2.length-1)]

	var user = Meteor.users.findOne(user_id, {fields: {username:1, x:1, y:1, castle_id:1, allies:1, is_dominus:1}})

	var fields = {
		name: name,
		x: x,
		y: y,
		created_at: new Date(),
		last_move_at: last_move_at,
		pastMoves: [{x:x, y:y, moveDate:new Date()}],
		user_id: user_id,
		username: user.username,
		castle_x: user.x,
		castle_y: user.y,
		castle_id: user.castle_id
	}

	_.each(s.army.types, function(type) {
		if (!army[type]) {
			army[type] = 0
		}
		check(army[type], validNumber)
		fields[type] = army[type]
	})

	var num_units = 0
	_.each(s.army.types, function(type) {
		num_units += army[type]
	})

	if (num_units == 0) {
		return false
	}

	var id = Armies.insert(fields)

	if (id) {
		// check for enemy armies
		var eas = Armies.find({x:x, y:y, user_id: {$ne:user._id}}, {fields: {_id:1, user_id:1}})
		if (eas) {
			eas.forEach(function(ea) {

				// dominus' armies can attack any army
				var otherUser = Meteor.users.findOne(ea.user_id, {fields: {is_dominus:1}})
				if (user.is_dominus || otherUser.is_dominus) {
					// make sure army is still alive
					var attacker = Armies.findOne(id)
					if (attacker) {
						Cue.addTask('startBattle', {isAsync:true, unique:true}, {x:x, y:y})
					}
				} else {
					if (_.indexOf(user.allies, ea.user_id) == -1) {
						// army is enemy
						// make sure army is still alive
						var attacker = Armies.findOne(id)
						if (attacker) {
							Cue.addTask('startBattle', {isAsync:true, unique:true}, {x:x, y:y})
						}
					}
				}
			})
		}

		// still alive?
		var a = Armies.findOne(id)
		if (a) {
			var res = Meteor.call('create_moves', a._id, moves)
			if (!res) {
				Armies.remove(id)
				Moves.remove({army_id:id})
				return false
			}
		}

		return id
	}

	return false
}

destroy_all_armies = function() {
	Armies.remove({})
	Moves.remove({})
}


move_army_to_hex = function(army_id, x, y) {
	check(army_id, String)
	check(x, validNumber)
	check(y, validNumber)

	var unit = Armies.findOne(army_id)
	if (!unit) {
		return false
	}

	// move
	Armies.update(army_id, {$set: {x:x, y:y, last_move_at:new Date()}})

	// entering new hex

	var has_merged = false

	if (is_stopped(unit._id)) {
		// for alerts
		var joinedCastle = null
		var joinedVillage = null
		var joinedArmy = null
		var userId = unit.user_id

		// check for my castle
		var res = Castles.findOne({x:x, y:y, user_id: unit.user_id}, {fields: {_id: 1}})
		if (res) {
			// merge with
			var inc = {}
			_.each(s.army.types, function(type) {
				inc[type] = unit[type]
			})

			Castles.update(res._id, {$inc: inc})
			Armies.remove(unit._id)
			Moves.remove({army_id:unit._id})
			has_merged = true
			joinedCastle = res._id
		}

		// check for my village
		if (!has_merged) {
			var res = Villages.findOne({x:x, y:y, user_id: unit.user_id}, {fields: {_id: 1}})
			if (res) {
				// merge with
				var inc = {}
				_.each(s.army.types, function(type) {
					inc[type] = unit[type]
				})

				Villages.update(res._id, {$inc: inc})
				Armies.remove(unit._id)
				Moves.remove({army_id:unit._id})
				has_merged = true
				joinedVillage = res._id
			}
		}


		// check for my armies to merge with
		if (!has_merged) {
			var res = Armies.findOne({x:x, y:y, user_id: unit.user_id, _id: {$ne: unit._id}})
			if (res) {
				// make sure they're stopped
				if (Moves.find({army_id:res._id}).count() == 0) {
					var inc = {}
					_.each(s.army.types, function(type) {
						inc[type] = unit[type]
					})

					Armies.update(res._id, {$inc: inc})
					Armies.remove(unit._id)
					Moves.remove({army_id:unit._id})

					// we still need to check for enemies
					// replace unit with combined one
					unit = res

					joinedArmy = res._id
				}
			}
		}

		// send alert
		alert_armyFinishedAllMoves(userId, army_id, x, y, joinedCastle, joinedVillage, joinedArmy)
	}

	if (!has_merged) {

		// update army with move
		var pastMoves = unit.pastMoves || []
		pastMoves.unshift({x:x, y:y, moveDate:new Date()})
		if (pastMoves.length > s.army.pastMovesToShow) {
			pastMoves.pop()
		}
		Armies.update(unit._id, {$set: {pastMoves:pastMoves}})

		// get user info for later
		var user = Meteor.users.findOne(unit.user_id, {fields: {allies:1, team:1, allies_below:1, is_dominus:1}})

		// so that battle isn't called once for each enemy in hex
		var startBattle = false

		// check for armies
		var armies = Armies.find({x:x, y:y, user_id: {$ne: unit.user_id}}, {fields: {user_id:1}})
		if (armies.count() > 0) {

			armies.forEach(function(a) {
				var otherUser = Meteor.users.findOne(a.user_id, {fields: {is_dominus:1}})
				if (user.is_dominus || otherUser.is_dominus) {
					// dominus' armies can attack any army
					startBattle = true
				} else {
					if (_.indexOf(user.allies, a.user_id) == -1) {
						// army is enemy
						startBattle = true
					}
				}
			})
		}

		// check for enemy castles
		var ec = Castles.findOne({x:x, y:y, user_id: {$ne: unit.user_id}}, {fields: {user_id: 1}})
		if (ec) {
			if (_.indexOf(user.team, ec.user_id) != -1) {
				if (_.indexOf(user.allies_below, ec.user_id) == -1) {
					// castle is above or enemy-ally (another branch)
					startBattle = true
				}
			} else {
				// castle is enemy
				startBattle = true
			}
		}

		// check for enemy villages
		var ev = Villages.findOne({x:x, y:y, user_id: {$ne: unit.user_id}}, {fields: {user_id: 1}})
		if (ev) {
			if (_.indexOf(user.allies, ev.user_id) == -1) {
				startBattle = true
			}
		}

		if (startBattle) {
			Cue.addTask('startBattle', {isAsync:true, unique:true}, {x:x, y:y})
		}
	}
}



is_stopped = function(army_id) {
	check(army_id, String)

	var army = Armies.findOne(army_id, {fields: {x:1, y:1}})
	if (army) {


		var moves = Moves.find({army_id:army._id})
		var count = moves.count()

		if (count == 0) {
			return true
		}

		if (count == 1) {
			var move = moves.fetch()[0]
			if (move) {
				if (army.x == move.to_x && army.y == move.to_y) {
					return true
				}
			}
		}
	}

	return false
}



Cue.addJob('armyMovementJob', {retryOnError:false, maxMs:1000*60*5}, function(task, done) {
	Moves.find({index:0}).forEach(function(move) {
		var army = Armies.findOne(move.army_id)
		if (army) {
			var army_speed = speed_of_army(army)
			if (moment(new Date(move.last_move_at)).add(army_speed, 'minutes') < moment()) {

				// we're somewhere along path
				// test until we find where
				var from_pos = Hx.coordinatesToPos(move.from_x, move.from_y, s.hex_size, s.hex_squish)
				var to_pos = Hx.coordinatesToPos(move.to_x, move.to_y, s.hex_size, s.hex_squish)

				// get distance
				var distance = Hx.hexDistance(move.from_x, move.from_y, move.to_x, move.to_y)

				// get move again to make sure it still exists
				move = Moves.findOne(move._id)
				if (move) {
					var move_army_to_next_hex = false
					var move_is_finished = false
					var foundArmyPosition = false

					// march along move
					for (i = 0; i <= distance; i++) {
						// pick point along line
						var x = from_pos.x * (1 - i/distance) + to_pos.x * i/distance
						var y = from_pos.y * (1 - i/distance) + to_pos.y * i/distance

						// find hex at point
						var coords = Hx.posToCoordinates(x, y, s.hex_size, s.hex_squish)

						// move army
						if (move_army_to_next_hex) {
							move_army_to_hex(army._id, coords.x, coords.y)
							move_army_to_next_hex = false
							Moves.update(move._id, {$set: {last_move_at:new Date()}})

							// check if this is last move
							if (coords.x == move.to_x && coords.y == move.to_y) {
								move_is_finished = true
							}
						}

						// is this the spot we're at?
						// if so then next time we loop move army
						if (army.x == coords.x && army.y == coords.y) {
							move_army_to_next_hex = true
							foundArmyPosition = true
						}
					}

					// if this is still false then the army isn't on the path
					// something is broke, move army to start of path to fix
					if (!foundArmyPosition) {
						move_army_to_hex(army._id, move.from_x, move.from_y)
						Moves.update(move._id, {$set: {last_move_at:new Date()}})
						console.log('Error: Army '+army._id+' was not on path.')
					}

					// if this is last hex in this move
					if (move_is_finished) {
						// remove this move
						Moves.remove(move._id)

						// update index numbers and last_move_at of other moves
						var i = 0
						Moves.find({army_id:army._id}, {sort: {index:1}}).forEach(function(m) {
							Moves.update(m._id, {$set: {index:i, last_move_at:new Date()}})
							i++
						})
					}
				}
			}
		}
	})

	done()
})
