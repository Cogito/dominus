Meteor.methods({

	build_village: function(x, y) {
		check(x, validNumber)
		check(y, validNumber)

		var fields = {
			x:1, y:1, username:1, castle_id:1
		}

		_.each(s.resource_types, function(type) {
			fields[type] = 1
		})

		var user = Meteor.users.findOne(Meteor.userId(), {fields: fields})
		if (user) {
			// make sure user doesn't have max villages already
			if (Villages.find({user_id:user._id}).count() >= s.village.max_can_have) {
				throw new Meteor.Error('Already have max villages.')
			}

			// make sure user has an army here
			if (Armies.find({x: x, y: y, user_id: user._id}).count() == 0) {
				throw new Meteor.Error('No army on hex.')
			}

			var hasEnoughRes = true

			_.each(s.resource.types, function(type) {
				if (user[type] < s.village.cost.level1[type]) {
					hasEnoughRes = false
				}
			})

			if (hasEnoughRes) {

				var hex = Hexes.findOne({x:x, y:y}, {fields: {_id:1, type:1}})
				if (hex) {
					if (hex.type != 'grain') {
						throw new Meteor.Error('Must be a grain hex.')
					}

					if (is_hex_empty_except_allies_coords(x, y)) {
						var name = names.towns.part1[_.random(names.towns.part1.length-1)] + names.towns.part2[_.random(names.towns.part2.length-1)]

						// find how much the village makes
						var income = {}

						_.each(s.resource.types_plus_gold, function(type) {
							income[type] = 0
						})

						income.gold = s.resource.gold_gained_at_village

						var hexes = Hx.getSurroundingHexes(x,y,s.resource.num_rings_village)
						_.each(hexes, function(hx) {
							var h = Hexes.findOne({x:hx.x, y:hx.y}, {fields:{type:1, large:1}})
							if (h) {
								if (h.large) {
									income[h.type] += s.resource.gained_at_hex * s.resource.large_resource_multiplier
								} else {
									income[h.type] += s.resource.gained_at_hex
								}
							}
						})

						var fields = {
							x: x,
							y: y,
							user_id: user._id,
							created_at: new Date(),
							name: name,
							username: user.username,
							castle_x: user.x,
							castle_y: user.y,
							castle_id: user.castle_id,
							income: income,
							under_construction:true,
							constructionStarted: new Date(),
							level: 0	// villages are level 0 until finished building
						}

						_.each(s.army.types, function(type) {
							fields[type] = 0
						})

						var id = Villages.insert(fields)

						// take away resources for buying
						var inc = {}

						_.each(s.resource.types, function(type) {
							inc[type] = -1 * s.village.cost.level1[type]
						})

						Meteor.users.update({_id: user._id}, {$inc: inc})

						// set hex to occupied
						// this makes building castles faster
						Hexes.update(hex._id, {$set: {has_building: true}})

						// if army is there merge them
						Armies.find({x:x, y:y, user_id:user._id}).forEach(function(army) {
							if (is_stopped(army._id)) {
								var fields = {}

								_.each(s.army.types, function(type) {
									fields[type] = army[type]
								})

								Villages.update(id, {$inc: fields})
								Armies.remove(army._id)
								Moves.remove({army_id:army._id})

								Cue.addTask('updateNetArmies', {isAsync:true, unique:true}, {user_id: user._id})
							}
						})

						Cue.addTask('updateNetVillages', {isAsync:true, unique:true}, {user_id: user._id})
						Cue.addTask('updateNetUser', {isAsync:true, unique:true}, {user_id: user._id})

						return id
					} else {
						throw new Meteor.Error('Hex is not empty.')
					}
				} else {
					throw new Meteor.Error('No hex found in db for '+x+','+y+'.')
				}

			} else {
				throw new Meteor.Error('Not enough resources.')
			}
		}
		throw new Meteor.Error('No user found.')
	},



	// return the id of the army created or false
	destroy_village: function(id) {
		this.unblock()

		check(id, String)

		var fields = {user_id:1}

		var village = Villages.findOne(id, {fields: fields})
		if (village) {
			if (village.user_id == Meteor.userId()) {
				return destroyVillage(village._id)
			}
		}

		return false
	}

})


finish_building_village = function(village_id) {
	check(village_id, String)

	var village = Villages.findOne(village_id)
	if (village) {

		// if army is there merge them
		Armies.find({x:village.x, y:village.y, user_id: village.user_id}).forEach(function(army) {
			if (is_stopped(army._id)) {
				var fields = {}

				_.each(s.army.types, function(type) {
					fields[type] = army[type]
				})

				Villages.update(village_id, {$inc: fields})
				Armies.remove(army._id)
				Moves.remove({army_id:army._id})
				Cue.addTask('updateNetArmies', {isAsync:true, unique:true}, {user_id: village.user_id})
			}
		})

		// increment level
		// remove under construction flag
		Villages.update(village_id, {$set: {under_construction:false}, $inc: {level:1}})

		Cue.addTask('updateNetVillages', {isAsync:true, unique:true}, {user_id: village.user_id})

		// TODO: send notification

	} else {
		throw new Meteor.Error('Could not find village.')
	}
}



Cue.addJob('villageConstructionJob', {retryOnError:false, maxMs:1000*60*5}, function(task, done) {
	villageConstructionJob()
	done()
})


villageConstructionJob = function() {
	Villages.find({under_construction:true}, {fields: {level:1,constructionStarted:1}}).forEach(function(village) {
		var timeToBuild = s.village.cost['level'+(village.level+1)].timeToBuild
		var finishAt = moment(new Date(village.constructionStarted)).add(timeToBuild, 'ms')
		if (moment().isAfter(finishAt)) {
			finish_building_village(village._id)
		}
	})
}



destroyVillage = function(village_id) {
	check(village_id, String)

	var fields = {user_id:1}
	_.each(s.army.types, function(type) {
		fields[type] = 1
	})

	var village = Villages.findOne(village_id, {fields: fields})
	if (village) {
		// spit out army
		var army_id = Meteor.call('create_army_from_building', village, 'village', village._id, [])
		Villages.remove(village._id)
		Hexes.update({x:village.x, y:village.y}, {$set: {has_building:false, nearby_buildings:false}})
		Cue.addTask('updateNetVillages', {isAsync:true, unique:true}, {user_id: village.user_id})
		Cue.addTask('updateNetUser', {isAsync:true, unique:true}, {user_id: village.user_id})
		return army_id
	}

	return false
}
