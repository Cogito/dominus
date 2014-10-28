// this can create an infinite loop
// if lord and vassal have armies on each others castles which are empty
// vassal take's lord's castle

// answer?  check other guy's castle and if you have an army there then nobody fights?

// TODO: is there a way to check for enemies with mongodb queries?  use $or maybe
// $nin team $or in team but not in allies or siblings

// loop through every castle and village
// if there are enemies here they should attack
enemy_on_building_check = function() {
	Castles.find({}, {fields: {_id:1, user_id:1, x:1, y:1}}).forEach(function(res) {
		check_for_enemies_here(res, 'castle')
	})

	Villages.find({}, {fields: {_id:1, user_id:1, x:1, y:1}}).forEach(function(res) {
		check_for_enemies_here(res, 'village')
	})
}


check_for_enemies_here = function(building, type) {
	var armies = Armies.find({x:building.x, y:building.y, user_id: {$ne: building.user_id}}, {fields: {user_id:1}})
	if (armies.count() > 0) {
		var user = Meteor.users.findOne(building.user_id, {fields: {allies:1}})
		armies.forEach(function(army) {
			if (_.indexOf(user.allies, army.user_id) == -1) {
				// enemy here
				if (!is_army_on_castle(building.user_id, army.user_id)) {
					Battle.start_battle(building.x,building.y)
					//battle(army._id, 'army', building._id, type)
				}
			}
		})
	}
}


// this stops infinite loop
// if both players have an army on each other's castle
// it will create an infinite loop
is_army_on_castle = function(army_user_id, castle_user_id) {
	var castle = Castles.findOne({user_id: castle_user_id}, {fields: {username:1, x:1, y:1}})
	if (castle) {
		if (Armies.find({user_id: army_user_id, x:castle.x, y:castle.y}).count() > 0) {
			return true
		}
	}
	return false
}




// loop through every army and check if there are any enemies on the same hex, if so they fight
enemies_together_check = function() {
	Armies.find({}, {fields: {user_id:1, _id:1, x:1, y:1}}).forEach(function(army) {
		// find armies here except this one
		Armies.find({x:army.x, y:army.y, _id: {$ne: army._id}, user_id: {$ne: army.user_id}}, {fields: {user_id:1}}).forEach(function(other_army) {
			// make sure army still exists
			var a = Armies.findOne(army._id, {fields: {user_id:1}})
			if (a) {
				var user = Meteor.users.findOne(a.user_id, {fields: {allies:1, is_dominus:1}})
				if (user) {
					if (user.is_dominus) {
						// dominus' armies can attack any army
						Battle.start_battle(army.x,army.y)
					} else {
						if (_.indexOf(user.allies, other_army.user_id) == -1) {
							// enemy here
							Battle.start_battle(army.x,army.y)
						}
					}
				}
			}
		})
	})
}
