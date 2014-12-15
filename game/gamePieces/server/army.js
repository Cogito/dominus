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
			var res = Villages.findOne({under_construction:false, x:x, y:y, user_id: unit.user_id}, {fields: {_id: 1}})
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