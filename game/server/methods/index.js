Meteor.methods({
	
	change_username: function(username) {
		username = _.clean(username)
		username = username.replace(/\W/g, '')
		
		if (username.length < 3) {
			return {result: false, msg: 'New username must be at least 3 characters long.'}
		}

		if (username.length > 30) {
			return {result: false, msg: 'New username is too long.'}
		}

		if (Meteor.users.find({username: username}).count() > 0) {
			return {result: false, msg: 'A user exists with this username, try another.'}
		}

		// if (username == 'danimal' || username == 'danlmal' || username == 'Danlmal' || username.indexOf('danimal') > -1 || username.indexOf('Danimal') > -1) {
		// 	return {result: false, msg: 'Username not allowed.'}
		// }

		
		Chats.update({user_id: Meteor.userId()}, {$set: {username: username}}, {multi: true})
		Castles.update({user_id: Meteor.userId()}, {$set: {username: username}})
		Villages.update({user_id: Meteor.userId()}, {$set: {username: username}}, {multi: true})
		Armies.update({user_id: Meteor.userId()}, {$set: {username: username}}, {multi: true})
		Threads.update({user_id: Meteor.userId()}, {$set: {username: username}}, {multi: true})
		Threads.update({last_post_username: Meteor.user().username}, {$set: {last_post_username: username}}, {multi: true})
		Messages.update({user_id: Meteor.userId()}, {$set: {username: username}}, {multi: true})
		Charges.update({user_id: Meteor.userId()}, {$set: {user_username: username}}, {multi: true})
		Meteor.users.update(Meteor.userId(), {$set: {username: username}})

		return {result: true}
	},
	

	generate_hexes: function(num_of_rings) {
		if (Meteor.user().admin) {
			generate_hexes(num_of_rings)
		}
	},

	
})


generate_hexes = function(num_of_rings) {
	delete_all_hexes()
	destroy_all_castles()
	destroy_all_armies()
	destroy_all_villages()

	// create hexes
	var pos = assign_properties_to_hex()
	pos.x = 0
	pos.y = 0
	pos.is_border = false
	Hexes.insert(pos)

	for (var k = 1; k <= num_of_rings; k++) {
		// move out a ring, has to be direction 4
		pos = get_neighbor(pos.x, pos.y, 4)
		for (var i =  0; i < 6; i++) {
			for (var j = 0; j < k; j++) {
				var hex = assign_properties_to_hex()
				hex.x = pos.x
				hex.y = pos.y
				hex.is_border = false
				Hexes.insert(hex)
				// move to neighbor in direction i
				pos = get_neighbor(pos.x, pos.y, i)
			}
		}
	}
}


add_ring = function(is_border) {
	var h = Hexes.findOne({}, {sort: {x: 1, y: -1}})
	var k = h.y + 1

	var pos = get_neighbor(h.x, h.y, 4)
	for (var i =  0; i < 6; i++) {
		for (var j = 0; j < k; j++) {
			var hex = assign_properties_to_hex()
			hex.x = pos.x
			hex.y = pos.y
			hex.is_border = is_border	// keep track of hexes on the edge of map so that people don't get castles on the edge
			var id = Hexes.insert(hex)
			// move to neighbor in direction i
			pos = get_neighbor(pos.x, pos.y, i)
		}
	}

	Minimap.update_map_size_setting()
}




delete_all_hexes = function() {
	Hexes.remove({})
}





function assign_properties_to_hex() {
	var r = Random.fraction()
	
	var hex = {}

	hex.has_building = false,
	hex.nearby_buildings = false

	if (r >= s.gen.grain_min && r <= s.gen.grain_max) {
		hex.type = 'grain'
	}
	if (r > s.gen.lumber_min && r <= s.gen.lumber_max) {
		hex.type = 'lumber'
	}
	if (r > s.gen.ore_min && r <= s.gen.ore_max) {
		hex.type = 'ore'
	}
	if (r > s.gen.clay_min && r <= s.gen.clay_max) {
		hex.type = 'clay'
	}
	if (r > s.gen.glass_min && r <= s.gen.glass_max) {
		hex.type = 'glass'
	}
	if (r > s.gen.wool_min && r <= s.gen.wool_max) {
		hex.type = 'wool'
	}

	// pick a random number for which image to use
	 var rand = Math.floor(Math.random() * s.resource.numTileImages[hex.type]) + 1
	 rand = _.lpad(rand, 2, '0')
	 hex.tileImage = rand 

	return hex
}