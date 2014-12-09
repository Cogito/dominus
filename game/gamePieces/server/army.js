Meteor.methods({
	// moves = [{from_x:0, from_y:0, to_x:0, to_y:0}, {from_x:0, from_y:0, to_x:0, to_y:0}]
	create_army_from_building: function(army, from_type, from_id, moves) {
		this.unblock()
		check(army, Object)
		check(from_type, String)
		check(from_id, String)
		check(moves, Array)

		if (from_type == 'castle') {
			var from = Castles.findOne({_id: from_id, user_id: Meteor.userId()})
		}

		if (from_type == 'village') {
			var from = Villages.findOne({_id: from_id, user_id: Meteor.userId()})
		}

		if (from) {
			// army is not 0
			var has_some = false
			_.each(s.army.types, function(type) {
				if (army[type] > 0) {
					has_some = true
				}
			})

			var has_enough = true
			_.each(s.army.types, function(type) {
				if (army[type] > from[type]) {
					has_enough = false
				}
			})

			if (has_some && has_enough) {
				var army_id = Meteor.call('create_army', army, from.x, from.y, moves)

				var fields = {}
				_.each(s.army.types, function(type) {
					fields[type] = army[type] * -1
				})

				if (from_type == 'castle') {
					Castles.update(from_id, {$inc: fields})
				}

				if (from_type == 'village') {
					Villages.update(from_id, {$inc: fields})
				}

				return army_id
			}
		}
		return false
	},

	create_army: function(army, x, y, moves) {
		this.unblock()
		check(army, Object)
		check(x, Number)
		check(y, Number)
		check(moves, Array)

		var name = names.armies.part1[_.random(names.armies.part1.length-1)] +' '+ names.armies.part2[_.random(names.armies.part2.length-1)]

		var user = Meteor.users.findOne(Meteor.userId(), {fields: {username:1, x:1, y:1, castle_id:1, allies:1, is_dominus:1}})

		var fields = {
			name: name,
			x: x,
			y: y,
			created_at: new Date(),
			last_move_at: new Date(),
			user_id: Meteor.userId(),
			username: user.username,
			castle_x: user.x,
			castle_y: user.y,
			castle_id: user.castle_id,
		}

		_.each(s.army.types, function(type) {
			check(army[type], Number)
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
							Battle.start_battle(x,y)
						}
					} else {
						if (_.indexOf(user.allies, ea.user_id) == -1) {
							// army is enemy
							// make sure army is still alive
							var attacker = Armies.findOne(id)
							if (attacker) {
								Battle.start_battle(x,y)
							}
						}
					}
				})
			}

			// still alive?
			var a = Armies.findOne(id)
			if (a) {
				Meteor.call('create_moves', a._id, moves)
			}

			return id
		}

		return false
	},


	hire_army: function(army, castle_id) {
		check(army, Object)
		check(castle_id, String)

		var user = Meteor.users.findOne(Meteor.userId(), {fields: {username:1, x:1, y:1, allies_below:1, castle_id:1, gold:1, grain:1, lumber:1, ore:1, wool:1, clay:1, glass:1}})
		if (user) {
			var fields = {user_id:1}
			_.each(s.army.types, function(type) {
				fields[type] = 1
			})

			var castle = Castles.findOne(castle_id, {fields: fields})
			if (castle) {
				// is castle mine for my ally below's
				if (castle.user_id == Meteor.userId() || _.indexOf(user.allies_below, castle.user_id) != -1) {

					// cost of army
					var cost = resource_cost_army(army)
					cost.gold = 0

					// cost of army after needed is bought
					var cost_adjusted = {}
					_.each(s.resource.types_plus_gold, function(t) {
						cost_adjusted[t] = cost[t]
					})

					// resources needed, what we need to buy with gold
					var needed = {}
					_.each(s.resource.types, function(type) {
						needed[type] = 0
					})

					// get current market prices to test if we have enough gold
					var market = {}
					var m = Market.find({}, {fields: {price:1, type:1}})
					if (m && m.count() == s.resource.types.length) {
						m.forEach(function(res) {
							market[res.type] = res.price
						})
					} else {
						return false
					}

					// do we need to buy resrouces?  if so set cost_adjusted
					_.each(s.resource.types, function(type) {
						var dif = cost[type] - user[type]
						if (dif > 0) {
							needed[type] = dif
							cost_adjusted[type] = user[type]
							cost_adjusted.gold += total_of_buy_quick(dif, market[type])
							market[type] = market[type] * Math.pow(s.market.increment + 1, dif)
						}
					})

					// test if we have enough with cost_adjusted
					var has_enough = true
					_.each(s.resource.types_plus_gold, function(type) {
						if (user[type] < cost_adjusted[type]) {
							has_enough = false
						}
					})

					if (has_enough) {
						// sell needed on market
						var error_buying = false
						_.each(s.resource.types, function(type) {
							if (needed[type] > 0) {
								var result = Meteor.call('buy_resource', type, needed[type])
								if (!result.result) {
									error_buying = true
								}
							}
						})

						if (!error_buying) {
							// update user
							var inc = {}
							_.each(s.resource.types_plus_gold, function(type) {
								inc[type] = cost[type] * -1
							})
							Meteor.users.update(user._id, {$inc: inc})

							// update castle
							var inc = {}
							_.each(s.army.types, function(type) {
								inc[type] = army[type]
							})
							Castles.update(castle._id, {$inc: inc})

							// send notification if this is not your castle
							if (user._id != castle.user_id) {
								var to = Meteor.users.findOne(castle.user_id, {fields: {gold:1, allies_below:1, username:1, castle_id:1, x:1, y:1}})
								if (to) {
									notification_sent_army(to._id, {
										to: {_id: to._id, username: to.username, castle_id: to.castle_id, x: to.x, y: to.y},
										from: {_id: user._id, username: user.username, castle_id: user.castle_id, x: user.x, y: user.y}
									}, army)
								}
							}

							return true
						}
					}
				}
			}
		}
		return false
	},
})



destroy_all_armies = function() {
	Armies.remove({})
	Moves.remove({})
}


move_army_to_hex = function(army_id, x, y) {
	check(army_id, String)
	check(x, Number)
	check(y, Number)

	var unit = Armies.findOne(army_id)
	if (!unit) {
		return false
	}

	// move
	Armies.update(army_id, {$set: {x:x, y:y, last_move_at:new Date()}})

	// entering new hex

	var has_merged = false

	//var is_stopped = (Moves.find({army_id:army_id}).count() > 0)
	if (is_stopped(unit._id)) {
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
				}
			}
		}
	}

	if (!has_merged) {

		// get user info for later
		var user = Meteor.users.findOne(unit.user_id, {fields: {allies:1, team:1, allies_below:1, is_dominus:1}})

		// check for armies
		var armies = Armies.find({x:x, y:y, user_id: {$ne: unit.user_id}}, {fields: {user_id:1}})
		if (armies.count() > 0) {
			armies.forEach(function(a) {
				var otherUser = Meteor.users.findOne(a.user_id, {fields: {is_dominus:1}})
				if (user.is_dominus || otherUser.is_dominus) {
					// dominus' armies can attack any army
					Battle.start_battle(x,y)
				} else {
					if (_.indexOf(user.allies, a.user_id) != -1) {
						// army is an ally
					// } else if (_.indexOf(user.siblings, a.user_id) != -1) {
					// 	// sibling
					} else {
						// army is enemy
						Battle.start_battle(x,y)
						//battle(unit._id, 'army', a._id, 'army')
					}
				}
			})
		}

		// check for enemy castles
		var ec = Castles.findOne({x:x, y:y, user_id: {$ne: unit.user_id}}, {fields: {user_id: 1}})
		if (ec) {
			if (_.indexOf(user.team, ec.user_id) != -1) {
				if (_.indexOf(user.allies_below, ec.user_id) != -1) {
					// castle is ally_below
				// } else if (_.indexOf(user.siblings, ec.user_id) != -1) {
				// 	// castle is sibling
				} else {
					// castle is above or enemy-ally (another branch)
					Battle.start_battle(x,y)
					//battle(unit._id, 'army', ec._id, 'castle')
				}
			} else {
				// castle is enemy
				Battle.start_battle(x,y)
				//battle(unit._id, 'army', ec._id, 'castle')
			}
		}

		// check for enemy villages
		var ev = Villages.findOne({x:x, y:y, user_id: {$ne: unit.user_id}}, {fields: {user_id: 1}})
		if (ev) {
			if (_.indexOf(user.allies, ev.user_id) != -1) {
				// village is ally
			// } else if (_.indexOf(user.siblings, ev.user_id) != -1) {
			// 		// sibling
			} else {
				// village is enemy
				Battle.start_battle(x,y)
				//battle(unit._id, 'army', ev._id, 'village')
			}
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