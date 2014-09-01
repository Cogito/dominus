set_lord_and_vassal = function(winner, loser) {
	check(winner, Object)
	check(loser, Object)

	// keep track of this so that we can update_allies on him later
	var loser_prev_lord_id = null


	// vassal is no longer a king, he had no lord, now he does
	// destroy king chatroom
	// send notification
	if (loser.is_king) {
		if (loser.king_chatroom) {
			destroy_chatroom(loser.king_chatroom)
		}
		Meteor.users.update(loser._id, {$set: {is_king: false, king_chatroom:null}})
		notification_no_longer_a_king(loser._id, {_id:winner._id, username:winner.username, x:winner.x, y:winner.y, castle_id:winner.castle_id})
	}
	

	// is loser above winner
	// he is either above winner or he is in a different branch
	if (_.indexOf(winner.allies_above, loser._id) != -1) {

		// winner is conquering his lord, moving up the tree
		// chatrooms stay the same
		remove_lord_and_vassal(winner.lord, winner._id)

		// loser's lord is now winner's lord
		if (loser.lord) {
			remove_lord_and_vassal(loser.lord, loser._id)
			create_lord_and_vassal(loser.lord, winner._id)
		}


	// winner is stealing loser from another lord
	// remove connection between loser and his lord
	// create notification for old lord that he lost a vassal
	// remove loser from old king's chatroom
	} else if (loser.lord) {

		remove_lord_and_vassal(loser.lord, loser._id)

		notification_lost_vassal_to_another(
			loser.lord,
			{_id: loser._id, username: loser.username, x: loser.x, y: loser.y, castle_id: loser.castle_id},
			{_id: winner._id, username: winner.username, x: winner.x, y: winner.y, castle_id: winner.castle_id}
			)

		// used later to update his allies
		loser_prev_lord_id = loser.lord

		// remove loser from old king's chatroom if king is different
		if (!loser.is_king && loser.king && loser.king != winner.king) {
			var loser_king = Meteor.users.findOne(loser.king, {fields: {king_chatroom:1}})
			if (loser_king) {
				leave_chatroom(loser._id, loser_king.king_chatroom)
			}
		}
	}


	// create connection between winner and loser
	create_lord_and_vassal(winner._id, loser._id)


	// is winner a new king
	// has he conquered his lord?
	if (winner.king == loser._id) {
		Meteor.users.update(winner._id, {$set: {is_king:true}})
		notification_now_a_king(winner._id, {_id: loser._id, username: loser.username, x: loser.x, y: loser.y, castle_id: loser.castle_id})
	}


	// send notification
	notification_new_vassal(winner._id, {_id: loser._id, username: loser.username, x: loser.x, y: loser.y, castle_id: loser.castle_id})
	notification_new_lord(loser._id, {_id: winner._id, username: winner.username, x: winner.x, y: winner.y, castle_id: winner.castle_id})

	worker.enqueue('update_allies', {user_id: winner._id})

	if (loser_prev_lord_id) {
		worker.enqueue('update_allies', {user_id: loser_prev_lord_id})
	}

	worker.enqueue('enemies_together_check', {})
	worker.enqueue('enemy_on_building_check', {})
}




remove_lord_and_vassal = function(lord_id, vassal_id) {
	check(lord_id, String)
	check(vassal_id, String)

	Meteor.users.update(lord_id, {$pull: {
		vassals: vassal_id
	}})

	Meteor.users.update(vassal_id, {$set: {
		lord: null
	}})

	update_vassal_ally_count(lord_id)
	update_vassal_ally_count(vassal_id)
}

create_lord_and_vassal = function(lord_id, vassal_id) {
	check(lord_id, String)
	check(vassal_id, String)

	// set lord
	Meteor.users.update(vassal_id, {$set: {
		lord: lord_id
	}})

	// set vassal
	Meteor.users.update(lord_id, {$addToSet: {
		vassals: vassal_id
	}})

}




// used for rankings
update_vassal_ally_count = function(user_id) {
	check(user_id, String)

	var user = Meteor.users.findOne(user_id, {fields: {team:1, siblings:1, vassals:1, allies:1, allies_above:1, allies_below:1}})
	if (user) {
		if (user.vassals) {
			var num_vassals = user.vassals.length
		} else {
			//console.log('WTF: why is vassals empty for '+user_id)
			var num_vassals = 0
		}

		if (user.allies) {
			var num_allies = user.allies.length
		} else {
			//console.log('WTF: why is allies empty for '+user_id)
			var num_allies = 0
		}

		if (user.allies_above) {
			var num_allies_above = user.allies_above.length
		} else {
			//console.log('WTF: why is num_allies_above empty for '+user_id)
			var num_allies_above = 0
		}

		if (user.allies_below) {
			var num_allies_below = user.allies_below.length
		} else {
			//console.log('WTF: why is allies_below empty for '+user_id)
			var num_allies_below = 0
		}

		if (user.team) {
			var num_team = user.team.length
		} else {
			var num_team = 0
		}

		if (user.siblings) {
			var num_siblings = user.siblings.length
		} else {
			var num_siblings = 0
		}

		Meteor.users.update(user_id, {$set: {num_team:num_team, num_siblings:num_siblings, num_vassals: num_vassals, num_allies: num_allies, num_allies_above: num_allies_above, num_allies_below: num_allies_below}})
	}
}

