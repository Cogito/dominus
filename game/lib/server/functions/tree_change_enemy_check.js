// this can create an infinite loop
// if lord and vassal have armies on each others castles which are empty
// vassal take's lord's castle

// TODO: is there a way to check for enemies with mongodb queries?  use $or maybe
// $nin team $or in team but not in allies


Cue.addJob('enemy_on_building_check', {retryOnError:false, maxMs:1000*60*5}, function(task, done) {
	enemy_on_building_check()
	done()
})


enemy_on_building_check = function() {

	Castles.find({}, {fields: {_id:1, user_id:1, x:1, y:1}}).forEach(function(res) {
		check_for_enemies_here(res, 'castle')
	})

	Villages.find({}, {fields: {_id:1, user_id:1, x:1, y:1}}).forEach(function(res) {
		check_for_enemies_here(res, 'village')
	})
}


var check_for_enemies_here = function(building, type) {
	var armies = Armies.find({x:building.x, y:building.y, user_id: {$ne: building.user_id}}, {fields: {user_id:1}})
	if (armies.count() > 0) {
		armies.forEach(function(army) {
			var relation = getPlayersRelationType_server(army.user_id, building.user_id)

			if (type == 'village') {
				var canAttack = ['enemy', 'enemy_ally']
			}

			if (type == 'castle') {
				var canAttack = ['king', 'direct_lord', 'lord', 'enemy', 'enemy_ally']
			}

			if (_.contains(canAttack, relation)) {
				if (!attackCreatesLoop(building.x,building.y)) {
					Cue.addTask('startBattle', {isAsync:false, unique:true}, {x:building.x, y:building.y})
				}
			}
		})
	}
}



Cue.addJob('enemies_together_check', {retryOnError:false, maxMs:1000*60*5}, function(task, done) {
	enemy_on_building_check()
	done()
})

// loop through every army and check if there are any enemies on the same hex, if so they fight
enemies_together_check = function() {

	Armies.find({}, {fields: {user_id:1, x:1, y:1}}).forEach(function(army) {

		// find armies here except this one
		Armies.find({x:army.x, y:army.y, _id: {$ne: army._id}, user_id: {$ne: army.user_id}}, {fields: {user_id:1}}).forEach(function(other_army) {

			// make sure army still exists
			var a = Armies.findOne(army._id, {fields: {user_id:1}})
			if (a) {

				// if one of them is dominus then they fight
				var user = Meteor.users.findOne(a.user_id, {fields: {is_dominus:1}})
				var otherUser = Meteor.users.findOne(other_army.user_id, {fields: {is_dominus:1}})
				if (user && otherUser) {
					if (user.is_dominus || otherUser.is_dominus) {
						// dominus' armies can attack any army
						Cue.addTask('startBattle', {isAsync:false, unique:true}, {x:army.x, y:army.y})

					} else {
						var relation = getPlayersRelationType_server(user._id, otherUser._id)
						var canAttack = ['enemy', 'enemy_ally']
						if (_.contains(canAttack, relation)) {

							if (!attackCreatesLoop(army.x, army.y)) {
								Cue.addTask('startBattle', {isAsync:false, unique:true}, {x:army.x, y:army.y})
							}
						}
					}
				}
			}
		})
	})
}


var attackCreatesLoop = function(x, y) {
	var isLoop = false

	var castleHere = Castles.findOne({x:x, y:y}, {fields: {user_id:1}})
	if (castleHere) {

		var armiesHere = Armies.find({x:x, y:y}, {fields: {user_id:1}})
		armiesHere.forEach(function(armyHere) {

			// don't check armies on their own castle
			if (castleHere.user_id != armyHere.user_id) {

				// get their castle
				var castle = Castles.findOne({user_id:armyHere.user_id}, {fields: {x:1, y:1}})
				if (castle) {

					// is there an army at their castle owned by castleHere
					if (Armies.find({x:castle.x, y:castle.y, user_id:castleHere.user_id}).count() > 0) {
						isLoop = true
					}
				}
			}
		})
	}

	return isLoop
}
