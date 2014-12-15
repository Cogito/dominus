Meteor.methods({
	split_armies: function(id, new_army) {
		var fields = {castle_id:1, x:1, y:1}

		_.each(s.army.types, function(type) {
			fields[type] = 1
		})

		var res = Armies.findOne({_id: id, user_id: Meteor.userId()}, {fields: fields})
		if (res) {
			var oldNum = 0
			_.each(s.army.types, function(type) {
				oldNum += res[type]
			})

			// if (oldNum == 0) {
			// 	throw new Meteor.Error('Old army must still have at least one soldier.')
			// }

			var newNum = 0
			_.each(s.army.types, function(type) {
				newNum += new_army[type]
			})

			if (newNum == 0) {
				throw new Meteor.Error('New army must have at least one soldier.')
			}

			if (newNum >= oldNum) {
				throw new Meteor.Error('Old army must still have at least one soldier.')
			}

			var fut = new Future()
			Meteor.call('create_army', new_army, res.x, res.y, [], function(error, result) {
				if (error) {
					fut.throw(error)
				} else {
					if (result) {
						var set = {}
						_.each(s.army.types, function(type) {
							set[type] = res[type] - new_army[type]
						})

						Armies.update(res._id, {$set: set})
						fut.return(result)
					} else {
						fut.throw('Could not create army.')
					}
				}
			})
			return fut.wait();
		} else {
			throw new Meteor.Error('Could not find army.')
		}
	},

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


	hire_army: function(army, building_id, building_type) {
		check(army, Object)
		check(building_id, String)
		check(building_type, String)

		// don't allow buying catapults at villages
		if (building_type == 'village' && army.catapults) {
			if (army.catapults > 0) {
				throw new Meteor.Error("Can't buy catapults at villages.")
			}
		}

		var user = Meteor.users.findOne(Meteor.userId(), {fields: {username:1, x:1, y:1, allies_below:1, castle_id:1, gold:1, grain:1, lumber:1, ore:1, wool:1, clay:1, glass:1}})
		if (user) {
			var fields = {user_id:1}
			_.each(s.army.types, function(type) {
				fields[type] = 1
			})

			if (building_type == 'castle') {
				var building = Castles.findOne(building_id, {fields: fields})
			} else if (building_type == 'village') {
				var building = Villages.findOne(building_id, {fields: fields})
			}

			if (building) {
				// is castle mine for my ally below's
				if (building.user_id == Meteor.userId() || _.indexOf(user.allies_below, building.user_id) != -1) {

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
						throw new Meteor.Error('Not enough resources.')
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

					_.each(s.resource.types_plus_gold, function(type) {
						if (user[type] < cost_adjusted[type]) {
							throw new Meteor.Error('Not enough resources.')
						}
					})


					// sell needed on market
					_.each(s.resource.types, function(type) {
						if (needed[type] > 0) {
							var result = Meteor.call('buy_resource', type, needed[type])
							if (!result.result) {
								error_buying = true
								throw new Meteor.Error('Error selling resources on market.')
							}
						}
					})

					// update user
					var inc = {}
					_.each(s.resource.types_plus_gold, function(type) {
						inc[type] = cost[type] * -1
					})
					Meteor.users.update(user._id, {$inc: inc})

					// update building
					var inc = {}
					_.each(s.army.types, function(type) {
						inc[type] = army[type]
					})

					if (building_type == 'castle') {
						Castles.update(building._id, {$inc: inc})
					} else if (building_type == 'village') {
						Villages.update(building._id, {$inc: inc})
					}
					

					// send notification if this is not your building
					if (user._id != building.user_id) {
						var to = Meteor.users.findOne(building.user_id, {fields: {gold:1, allies_below:1, username:1, castle_id:1, x:1, y:1}})
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
		throw new Meteor.Error('Error hiring.')
	},
})