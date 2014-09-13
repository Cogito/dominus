Meteor.methods({

	build_village: function(x, y) {
		check(x, Number)
		check(y, Number)

		var user = Meteor.users.findOne(Meteor.userId(), {fields: {x:1, y:1, username:1, castle_id:1, grain:1, lumber:1, ore:1, wool:1, clay:1, glass:1}})
		if (user) {
			// make sure user has an army here
			if (Armies.find({x: x, y: y, user_id: user._id}).count() == 0) {
				return {result:false, msg: 'No worker on hex.'}
			}

			if (user.grain >= s.village.cost.grain &&
				user.lumber >= s.village.cost.lumber &&
				user.ore >= s.village.cost.ore &&
				user.wool >= s.village.cost.wool &&
				user.clay >= s.village.cost.clay &&
				user.glass >= s.village.cost.glass
				) 
			{

				var hex = Hexes.findOne({x:x, y:y}, {fields: {_id:1, type:1}})
				if (hex) {
					if (hex.type != 'grain') {
						return {result:false, msg: 'Must be a grain hex.'}
					}

					if (is_hex_empty_coords(x, y)) {
						var name = names.towns.part1[_.random(names.towns.part1.length-1)] + names.towns.part2[_.random(names.towns.part2.length-1)]

						var fields = {
							x: x,
							y: y,
							user_id: user._id,
							created_at: new Date(),
							name: name,
							username: user.username,
							castle_x: user.x,
							castle_y: user.y,
							castle_id: user.castle_id
						}

						_.each(s.army.types, function(type) {
							fields[type] = 0
						})

						var id = Villages.insert(fields)

						Meteor.users.update({_id: user._id}, {$inc: {
							grain: -1 * s.village.cost.grain,
							lumber: -1 * s.village.cost.lumber,
							ore: -1 * s.village.cost.ore,
							wool: -1 * s.village.cost.wool,
							clay: -1 * s.village.cost.clay,
							glass: -1 * s.village.cost.glass
						}})

						// if army is there merge them
						Armies.find({x:x, y:y, user_id: user._id}).forEach(function(army) {
							if (is_stopped(army._id)) {
								var fields = {}

								_.each(s.army.types, function(type) {
									fields[type] = army[type]
								})

								Villages.update(id, {$inc: fields})

								Armies.remove(army._id)
								Moves.remove({army_id:army._id})
							}
						})
						
						// set hex to occupied
						Hexes.update(hex._id, {$set: {has_building: true}})
						
						return {result:true, id:id}
					} else {
						return {result:false, msg: 'Hex is not empty.'}
					}
				} else {
					return {result:false, msg: 'No hex found in db for '+x+','+y+'.'}
				}
				
			} else {
				return {result:false, msg: 'Not enough resources.'}
			}
		}
		return {result:false, msg: 'Error'}
	},



	destroy_village: function(id) {
		var res = Villages.findOne(id, {fields: {user_id:1}})
		if (res) {
			if (res.user_id == Meteor.userId()) {
				Villages.remove(id)
				return true
			}
		}
		return false
	}

})


destroy_all_villages = function() {
	Villages.remove({})
}