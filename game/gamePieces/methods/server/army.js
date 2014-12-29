Meteor.methods({

	returnToCastle: function(army_id) {
		var user_id = Meteor.userId()
		if (user_id) {
			var army = Armies.findOne({_id:army_id, user_id:Meteor.userId()})
			if (army) {
				var castle = Castles.findOne({user_id:user_id})
				if (castle) {
					if (castle.x == army.x && castle.y == army.y) {
						Meteor.call('army_join_building', army._id)
					} else {
						var moves = [{
							from_x:army.x,
							from_y:army.y,
							to_x:castle.x,
							to_y:castle.y
						}]
						Meteor.call('create_moves', army._id, moves)
					}
				} else {
					throw new Meteor.Error('Could not find castle.')
				}
			} else {
				throw new Meteor.Error('Could not find army.')
			}
		} else {
			throw new Meteor.Error('Could not find user.')
		}
	},

	army_join_building: function(army_id) {
		this.unblock()
		check(army_id, String)

		var user_id = Meteor.userId()

		var fields = {x:1, y:1}

		_.each(s.army.types, function(type) {
			fields[type] = 1
		})

		var army = Armies.findOne({_id:army_id, user_id:user_id}, {fields: fields})
		if (army) {
			var inc = {}
			_.each(s.army.types, function(type) {
				inc[type] = army[type]
			})

			var castle = Castles.findOne({x:army.x, y:army.y, user_id:user_id}, {fields: {_id:1}})
			if (castle) {
				Castles.update(castle._id, {$inc:inc})
				Armies.remove(army._id)
				Moves.remove({army_id:army._id})
			} else {
				var village = Villages.findOne({x:army.x, y:army.y, user_id:user_id}, {fields: {_id:1}})
				if (village) {

					Villages.update(village._id, {$inc: inc})
					Armies.remove(army._id)
					Moves.remove({army_id:army._id})
				} else {
					throw new Meteor.Error('Could not find building.')
				}
			}
		} else {
			throw new Meteor.Error('Could not find army.')
		}
	},


	// do this on server only because the army might not be in client db
	split_armies: function(id, new_army) {
		check(id, String)

		// check values
		_.each(s.army.types, function(type) {
			if (!new_army[type]) {
				new_army[type] = 0
			}
			check(new_army[type], validNumber)
		})

		var fields = {castle_id:1, x:1, y:1}

		_.each(s.army.types, function(type) {
			fields[type] = 1
		})

		var res = Armies.findOne({_id: id, user_id: Meteor.userId()}, {fields: fields})
		if (res) {

			// make sure new_army isn't more than army or less than 0
			_.each(s.army.types, function(type) {
				if (new_army[type] > res[type]) {
					throw new Meteor.Error('Too many '+type+'.')
				}

				if (new_army[type] < 0) {
					throw new Meteor.Error('Too few '+type+'.')
				}
			})

			var oldNum = 0
			_.each(s.army.types, function(type) {
				oldNum += res[type]
			})

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

			var aid = create_army(Meteor.userId(), new_army, res.x, res.y, [])
			if (aid) {
				var set = {}
				_.each(s.army.types, function(type) {
					set[type] = res[type] - new_army[type]
				})

				Armies.update(res._id, {$set: set})

				return aid
			} else {
				throw new Meteor.Error('Could not create army.')
			}

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
				var army_id = create_army(Meteor.userId(), army, from.x, from.y, moves)
				if (army_id) {
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
				} else {
					return false
				}


			}
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

							worker.enqueue('update_networth', {user_id: user._id})
							worker.enqueue('update_networth', {user_id: to._id})
						}
					}

					return true
				}
			}
		}
		throw new Meteor.Error('Error hiring.')
	},
})
