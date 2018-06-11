Cue.addJob('create_castle', {retryOnError:true, maxMs:1000*60*5}, function(task, done) {
	create_castle(task.data.user_id)
	done()
})


create_castle = function(user_id) {
	check(user_id, String)

	if (Castles.find({user_id: user_id}).count() > 0) {
		console.error('user but already a castle')
		return false
	}

	var user = Meteor.users.findOne(user_id, {fields: {username: 1}})
	if (!user) {
		console.error('create_castle called but no user found for this id')
		return false
	}

	// if there are no hexes then this is a new game
	// create a new map and reset market
	// set game end date to null
	if (Hexes.find().count() == 0) {
		console.log('--- creating new game ---')
		generate_hexes(12)
		reset_market()
		Settings.upsert({name: 'gameEndDate'}, {$set: {name: 'gameEndDate', value: null}})
		Settings.upsert({name: 'lastDominusUserId'}, {$set: {name: 'lastDominusUserId', value: null}})
		Settings.upsert({name: 'taxesCollected'}, {$set: {name:'taxesCollected', value:0}})
		Settings.upsert({name: 'hasGameOverAlertBeenSent'}, {$set: {name: 'hasGameOverAlertBeenSent', value:false}})
		Settings.upsert({name: 'isGameOver'}, {$set: {name: 'isGameOver', value:false}})
	}

	var found = false
	var built_castle = false
	var has_added_rings = false
	while (!found) {

		var hexes = Hexes.find({type: 'grain', has_building: false, nearby_buildings: false, is_border:false})
		hexes.forEach(function(hex) {
			found = true
			if (!built_castle) {

				if (found && Armies.find({x: hex.x, y: hex.y}, {fields: {_id:1}}).count() != 0) {
					found = false
				}

				if (found) {
					var nearby_buildings = Hexes.find({x: {$gte: hex.x-s.create_castle.check_buildings_num_rings, $lte: hex.x+s.create_castle.check_buildings_num_rings}, y: {$gte: hex.y-s.create_castle.check_buildings_num_rings, $lte: hex.y+s.create_castle.check_buildings_num_rings}, has_building: true})
					if (nearby_buildings.count() > 0) {
						Hexes.update(hex._id, {$set: {nearby_buildings: true}})
						found = false
					}
				}

				if (found) {
					var nearby_armies = Armies.find({x: {$gte: hex.x-s.create_castle.check_workers_army_num_rings, $lte: hex.x+s.create_castle.check_workers_army_num_rings}, y: {$gte: hex.y-s.create_castle.check_workers_army_num_rings, $lte: hex.y+s.create_castle.check_workers_army_num_rings}})
					if (nearby_armies.count() > 0) {
						found = false
					}
				}

				if (found) {

					var castle_check = Castles.findOne({x: hex.x, y: hex.y})
					if (castle_check) {
						found = false
					} else {
						var name = names.towns.part1[_.random(names.towns.part1.length-1)] + names.towns.part2[_.random(names.towns.part2.length-1)]

						var fields = {
							name: name,
							x: hex.x,
							y: hex.y,
							created_at: new Date(),
							user_id: user._id,
							username: user.username,
							image: s.castle.starting_image
						}

						_.each(s.army.types, function(type) {
							fields[type] = s.castle.starting_garrison[type]
						})

						// build castle
						var id = Castles.insert(fields)

						Meteor.users.update(user._id, {$set: {x: hex.x, y: hex.y, castle_id: id}})

						// mark hex as having building
						Hexes.update({x: hex.x, y: hex.y}, {$set: {has_building: true}})

						built_castle = true		// forEach is async?

						if (has_added_rings) {
							// add some rings of border hexes so that new people aren't on the edge
							add_ring(true)
							add_ring(true)
							add_ring(true)
							add_ring(true)
							add_ring(true)

							var numHexes = Hexes.find().count()
							var numRings = Hexes.findOne({}, {sort:{x:-1}, limit:1}).x
							gAlert_mapExpanded(numHexes, numRings)

							// rebake map
							Meteor.defer(function() {
								var mapbaker = new Mapbaker();
								mapbaker.bakeHexes();
							});

						}

						Cue.addTask('updateNetCastle', {isAsync:true, unique:false}, {user_id: user._id})

						return true
					}
				}
			}
		})

		if (!built_castle) {
			add_ring(false)
			Hexes.update({is_border:true}, {$set: {is_border:false}}, {multi:true})
			has_added_rings = true
		}
	}

	return false
}
