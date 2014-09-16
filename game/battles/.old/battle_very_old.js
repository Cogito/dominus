// this is the old battle system, not used anymore

old_battle = function(attacker_id, attacker_type, defender_id, defender_type) {
	check(attacker_id, String)
	check(attacker_type, String)
	check(defender_id, String)
	check(defender_type, String)

	if (attacker_type == 'army') {
		var attacker = Armies.findOne(attacker_id)

		if (!attacker) {
			return
		}

		var a = {type: 'army'}
		_.each(s.army.types, function(type) {
			a[type] = attacker[type]
		})
	}

	if (defender_type == 'army') {
		var defender = Armies.findOne(defender_id)

		if (!defender) {
			return
		}

		var d = {type: 'army'}
		_.each(s.army.types, function(type) {
			d[type] = defender[type]
		})
	}


	if (defender_type == 'castle') {
		var defender = Castles.findOne(defender_id)

		if (!defender) {
			return
		}

		var d = {type: 'castle'}
		_.each(s.army.types, function(type) {
			d[type] = defender[type]
		})
	}

	if (defender_type == 'village') {
		var defender = Villages.findOne(defender_id)

		if (!defender) {
			return
		}

		var d = {type: 'village'}
		_.each(s.army.types, function(type) {
			d[type] = defender[type]
		})
	}

	// find total
	a.total = 0
	_.each(s.army.types, function(type) {
		a.total += a[type]
	})

	d.total = 0
	_.each(s.army.types, function(type) {
		d.total += d[type]
	})

	// check if to continue
	// if multiple armies are in one hex then this can happen
	if (a.total == 0) {
		return false
	}

	// get user info
	a.user = Meteor.users.findOne(attacker.user_id)
	d.user = Meteor.users.findOne(defender.user_id)

	// for notifications
	a.name = attacker.name
	d.name = defender.name
	a.username = attacker.username
	d.username = defender.username
	a.user_id = attacker.user_id
	d.user_id = defender.user_id
	a.x = attacker.x
	a.y = attacker.y
	d.x = defender.x
	d.y = defender.y
	a._id = attacker._id
	d._id = defender._id
	var hex = Hexes.findOne({x:attacker.x, y: attacker.y}, {fields: {_id: 1}})
	if (hex) {
		d.hex_id = hex._id
		a.hex_id = hex._id
	}
	a.castle_id = a.user.castle_id
	d.castle_id = d.user.castle_id
	a.castle_x = a.user.x
	a.castle_y = a.user.y
	d.castle_x = d.user.x
	d.castle_y = d.user.y

	// add up power
	a.base_power = {total:0}
	d.base_power = {total:0}

	_.each(s.army.types, function(type) {
		a.base_power[type] = s.army.stats[type].offense * a[type]
		d.base_power[type] = s.army.stats[type].defense * d[type]

		a.base_power.total += s.army.stats[type].offense * a[type]
		d.base_power.total += s.army.stats[type].defense * d[type]
	})


	// bonus
	// ---------



	// find percentages
	a.percentage = {}
	d.percentage = {}

	_.each(s.army.types, function(type) {
		if (a.total == 0) {
			a.percentage[type] = 0
		} else {
			a.percentage[type] = a[type] / a.total
		}
	})

	_.each(s.army.types, function(type) {
		if (d.total == 0) {
			d.percentage[type] = 0
		} else {
			d.percentage[type] = d[type] / d.total
		}
	})


	// bonuses
	a.bonus = {}
	a.bonus.archers = a.base_power.archers * a.percentage.archers * d.percentage.footmen
	a.bonus.pikemen = a.base_power.pikemen * a.percentage.pikemen * d.percentage.cavalry
	a.bonus.cavalry = a.base_power.cavalry * a.percentage.cavalry * (d.percentage.archers + d.percentage.footmen)

	// catapults
	if (defender_type == 'castle' || defender_type == 'village') {
		a.bonus.catapults = a.base_power.catapults * s.army.stats.catapults.bonus_against_buildings
	} else {
		a.bonus.catapults = 0
	}

	a.bonus.bonus = a.bonus.archers + a.bonus.pikemen + a.bonus.cavalry + a.bonus.catapults

	d.bonus = {}
	d.bonus.archers = d.base_power.archers * d.percentage.archers * a.percentage.footmen
	d.bonus.pikemen = d.base_power.pikemen * d.percentage.pikemen * a.percentage.cavalry
	d.bonus.cavalry = d.base_power.cavalry * d.percentage.cavalry * (a.percentage.archers + a.percentage.footmen)

	d.bonus.bonus = d.bonus.archers + d.bonus.pikemen + d.bonus.cavalry

	// final power
	a.power = a.base_power.total + a.bonus.bonus
	d.power = d.base_power.total + d.bonus.bonus

	// bonus for castle
	if (defender_type == 'castle') {
		d.power = d.power * s.castle.defense_bonus
	}

	// bonus for village
	if (defender_type == 'village') {
		d.power = d.power * s.village.defense_bonus
	}

	// bonus for ally's castle or village
	if (defender_type == 'army') {
		var u = Meteor.users.findOne(defender.user_id, {fields: {allies: 1, allies_below:1}})
		if (u.allies_below) {
			check(u.allies_below, Array)
			if (u.allies_below.length > 0) {
				if (Castles.find({x: defender.x, y: defender.y, user_id: {$in: u.allies_below}}).count() > 0) {
					d.power = d.power * s.castle.ally_defense_bonus
				}
			}
		}
		if (u.allies) {
			check(u.allies, Array)
			if (u.allies.length > 0) {
				if (Villages.find({x: defender.x, y: defender.y, user_id: {$in: u.allies}}).count() > 0) {
					d.power = d.power * s.village.ally_defense_bonus
				}
			}
		}
	}

	var dif = a.power - d.power


	// number to divide survive_percentage by
	a.num_types = 0
	d.num_types = 0

	_.each(s.army.types, function(type) {
		if (a[type] > 0) { a.num_types++ }
		if (d[type] > 0) { d.num_types++ }
	})


	if (dif > 0) {
		// ----------------
		// attacker wins
		// ----------------

		var survive_percentage = dif / a.power
		var num_dead = a.total - Math.ceil(a.total * survive_percentage)

		if (defender_type == 'castle') {
			num_dead = Math.floor(num_dead / 2)
		}

		a.survivors = {}
		_.each(s.army.types, function(type) {
			a.survivors[type] = a[type]
		})

		// pick who dies for attacker
		var i=0
		var total = a.total
		while (i < num_dead) {
			var rand = Math.floor(Math.random() * s.army.types.length)
			var type = s.army.types[rand]
			check(a.survivors[type], Number)

			if (a.survivors[type] > 0) {
				a.survivors[type]--
				total--
				i++
			}

			// if everyone is dead stop
			if (total == 0) {
				i = num_dead
			}
		}



		var n = 0
		_.each(a.survivors, function(s) {
			n += s
		})
		if (n == 0) {
			dif = 0
		} else {
			if (attacker_type == 'army') {
				var set = {}
				_.each(s.army.types, function(type) {
					set[type] = a.survivors[type]
				})

				Armies.update(attacker._id, {$set: set})
			}

			if (defender_type == 'army') {
				Armies.remove(defender._id)
				Moves.remove({army_id:defender._id})
			}

			if (defender_type == 'castle') {
				set_lord_and_vassal(a.user, d.user)

				d.survivors = {}
				// if castle loses then castle only loses half
				_.each(s.army.types, function(type) {
					d.survivors[type] = Math.floor(d[type] / 2)
				})

				// if defender is a castle he should have some survivors so that lower allies can't conquer him right after
				var set = {}
				_.each(s.army.types, function(type) {
					set[type] = d.survivors[type]
				})
				Castles.update(defender._id, {$set: set})
			}

			if (defender_type == 'village') {
				Villages.remove(defender_id)
				Hexes.update({x: attacker.x, y: attacker.y}, {$set: {has_building: false}})
			}
		}

	}

	if (dif < 0) {
		// ----------------
		// defender wins
		// ----------------

		var survive_percentage = Math.abs(dif) / d.power
		var num_dead = d.total - Math.ceil(d.total * survive_percentage)

		d.survivors = {}
		_.each(s.army.types, function(type) {
			d.survivors[type] = d[type]
		})

		// pick who dies
		var i=0
		var total = d.total
		while (i < num_dead) {
			var rand = Math.floor(Math.random() * s.army.types.length)
			var type = s.army.types[rand]
			check(d.survivors[type], Number)

			if (d.survivors[type] > 0) {
				d.survivors[type]--
				total--
				i++
			}

			// if everyone is dead stop
			if (total == 0) {
				i = num_dead
			}
		}

		var n = 0
		_.each(s.army.types, function(type) {
			n += d.survivors[type]
		})
		if (n == 0) {
			dif = 0
		} else {
			if (attacker_type == 'army') {
				Armies.remove(attacker._id)
				Moves.remove({army_id:attacker._id})
			}

			var set = {}
			_.each(s.army.types, function(type) {
				set[type] = d.survivors[type]
			})

			if (defender_type == 'army') {
				Armies.update(defender._id, {$set: set})
			}

			if (defender_type == 'castle') {
				Castles.update(defender._id, {$set: set})
			}

			if (defender_type == 'village') {
				Villages.update(defender._id, {$set: set})
			}
		}
	}

	if (dif == 0) {
		// ----------------
		// tie
		// ----------------

		if (attacker_type == 'army') {
			Armies.remove(attacker._id)
			Moves.remove({army_id:attacker._id})
		}

		if (defender_type == 'army') {
			Armies.remove(defender._id)
			Moves.remove({army_id:defender._id})
		}

		var set = {}
		_.each(s.army.types, function(type) {
			set[type] = 0
		})
		if (defender_type == 'castle') {
			Castles.update(defender._id, {$set: set})
		}

		if (defender_type == 'village') {
			Villages.remove(defender._id)
			Hexes.update({x: attacker.x, y: attacker.y}, {$set: {has_building: false}})
		}
	}

	//debug
	// console.log(' ====================================================')
	// console.log(a)
	// console.log('-----------------------------------------------------')
	// console.log(d)

	// don't send these to client, don't need them
	a.user = null
	d.user = null
	notification_battle_results(attacker.user_id, a, d, dif)
	notification_battle_results(defender.user_id, a, d, dif)

	//update_networth(attacker.user_id)
	//update_networth(defender.user_id)
	worker.enqueue('update_networth', {user_id: attacker.user_id})
	worker.enqueue('update_networth', {user_id: defender.user_id})
}
