// these functions are so that things like email alsets can happen when you get a notification

notification_no_longer_dominus = function(user_id, user) {
	check(user_id, String)
	create_notification_new(user_id,
		'no_longer_dominus',
		{_id:user._id, username: user.username, x:user.x, y:user.y, castle_id:user.castle_id},
		user.username+' is no longer the Dominus'
		)
}

notification_no_longer_dominus_new_user = function(user_id, user) {
	check(user_id, String)
	create_notification_new(user_id,
		'no_longer_dominus_new_user',
		{_id:user._id, username: user.username, x:user.x, y:user.y, castle_id:user.castle_id},
		user.username+' is no longer the Dominus'
		)
}

notification_are_now_dominus = function(user_id, user) {
	check(user_id, String)
	create_notification_new(user_id,
		'now_dominus',
		{_id:user._id, username: user.username, x:user.x, y:user.y, castle_id:user.castle_id},
		user.username+' is the new Dominus'
		)
}

notification_now_a_king = function(user_id, conquered_lord) {
	check(user_id, String)
	check(conquered_lord, Object)
	check(conquered_lord._id, String)
	check(conquered_lord.username, String)
	check(conquered_lord.x, Number)
	check(conquered_lord.y, Number)
	check(conquered_lord.castle_id, String)

	create_notification_new(user_id, 'now_a_king', conquered_lord, 'You are now a King')
}

notification_no_longer_a_king = function(user_id, king) {
	check(user_id, String)
	check(king, Object)
	check(king._id, String)
	check(king.username, String)
	check(king.x, Number)
	check(king.y, Number)
	check(king.castle_id, String)

	create_notification_new(user_id, 'no_longer_a_king', king, 'You are no longer a King')
}

// no longer sent
notification_lost_vassal_to_another = function(user_id, lost_vassal, vassals_new_lord) {
	// check(user_id, String)

	// check(lost_vassal, Object)
	// check(lost_vassal._id, String)
	// check(lost_vassal.username, String)
	// check(lost_vassal.x, Number)
	// check(lost_vassal.y, Number)
	// check(lost_vassal.castle_id, String)

	// check(vassals_new_lord, Object)
	// check(vassals_new_lord._id, String)
	// check(vassals_new_lord.username, String)
	// check(vassals_new_lord.x, Number)
	// check(vassals_new_lord.y, Number)
	// check(vassals_new_lord.castle_id, String)

	// create_notification_new(user_id,
	// 	'lost_vassal_to_another',
	// 	{lost_vassal: lost_vassal, vassals_new_lord: vassals_new_lord},
	// 	lost_vassal.username+' is no longer your vassal'
	// 	)
}

// no longer sent
notification_new_vassal = function(user_id, vassal) {
	// check(user_id, String)
	// check(vassal, Object)
	// check(vassal._id, String)
	// check(vassal.username, String)
	// check(vassal.x, Number)
	// check(vassal.y, Number)
	// check(vassal.castle_id, String)

	// create_notification_new(user_id,
	// 	'new_vassal',
	// 	vassal,
	// 	vassal.username+' is now your vassal'
	// 	)
}

notification_new_lord = function(user_id, lord) {
	check(user_id, String)
	check(lord, Object)
	check(lord._id, String)
	check(lord.username, String)
	check(lord.x, Number)
	check(lord.y, Number)
	check(lord.castle_id, String)

	create_notification_new(user_id,
		'new_lord',
		lord,
		lord.username+' is your new lord'
		)
}

notification_sent_gold = function(user_id, userData, amount) {
	check(user_id, String)
	check(userData, Object)
	check(userData.to._id, String)
	check(userData.to.username, String)
	check(userData.to.x, Number)
	check(userData.to.y, Number)
	check(userData.to.castle_id, String)
	check(userData.from._id, String)
	check(userData.from.username, String)
	check(userData.from.x, Number)
	check(userData.from.y, Number)
	check(userData.from.castle_id, String)
	check(amount, Number)

	userData.amount = amount

	create_notification_new(user_id,
		'sent_gold',
		userData,
		userData.from.username+' sent '+userData.to.username+' '+amount+' Gold'
		)
}

notification_sent_army = function(user_id, userData, army) {
	check(user_id, String)
	check(userData, Object)
	check(userData.to._id, String)
	check(userData.to.username, String)
	check(userData.to.x, Number)
	check(userData.to.y, Number)
	check(userData.to.castle_id, String)
	check(userData.from._id, String)
	check(userData.from.username, String)
	check(userData.from.x, Number)
	check(userData.from.y, Number)
	check(userData.from.castle_id, String)
	check(army, Object)

	userData.army = army

	create_notification_new(user_id,
		'sent_army',
		userData,
		userData.from.username+' sent '+userData.to.username+' an army'
		)
}

notification_new_chatroom_user = function(user_id, other_user) {
	check(user_id, String)
	check(other_user, Object)
	check(other_user._id, String)
	check(other_user.username, String)
	check(other_user.x, Number)
	check(other_user.y, Number)
	check(other_user.castle_id, String)

	create_notification_new(user_id,
		'new_chatroom_user',
		other_user,
		'New chatroom with '+other_user.username
		)
}

notification_new_chatroom_kings_room = function(user_id) {
	check(user_id, String)
	create_notification_new(user_id,
		'new_chatroom_kings_room',
		{},
		'New chatroom'
		)
}

notification_new_chatroom_kings = function(user_id) {
	check(user_id, String)
	create_notification_new(
		user_id,
		'new_chatroom_kings',
		{},
		'New chatroom'
		)
}

notification_battle = function(user_id, battle) {
	check(user_id, String)
	check(battle, Object)

	if (battle.unit.dif > 0) {
		var str = ' won '
	} else {
		var str = ' lost '
	}

	create_notification_new(
		user_id,
		'battle',
		{battle:battle},
		battle.unit.username+"'s "+battle.unit.type+str+' a battle at '+battle.unit.x+', '+battle.unit.y
		)
}

notification_battle_start = function(user_id, battle) {
	check(user_id, String)
	check(battle, Object)
	check(battle.unit, Object)

	create_notification_new(
		user_id,
		'battle_start',
		{battle:battle},
		battle.unit.username+"'s "+battle.unit.type+' entered a battle at '+battle.unit.x+', '+battle.unit.y
		)
}


///////////////////////////////////////////////////////

create_notification_new = function(user_id, type, vars, title) {
	check(user_id, String)
	check(type, String)
	check(vars, Object)
	check(title, String)
	
	Notifications.insert({
		user_id: user_id,
		created_at: new Date(),
		read: false,
		type: type,
		vars: vars,
		title:title
	})
}



delete_old_notifications = function() {
	var begin = moment().add(-15, 'days').toDate()
	Notifications.remove({read: true, created_at: {$lt: begin}})
}