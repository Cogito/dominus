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

notification_new_dominus = function(user, oldDominusId) {
	check(user, Object)
	check(oldDominusId, Match.Optional(String))
	create_notification_for_all_players(
		'new_dominus',
		{_id:user._id, username: user.username, x:user.x, y:user.y, castle_id:user.castle_id, oldDominusId: oldDominusId},
		user.username+' is the new Dominus'
		)
}

notification_now_a_king = function(user_id, conquered_lord) {
	check(user_id, String)
	check(conquered_lord, Object)
	check(conquered_lord._id, String)
	check(conquered_lord.username, String)
	check(conquered_lord.x, validNumber)
	check(conquered_lord.y, validNumber)
	check(conquered_lord.castle_id, String)

	create_notification_new(
		user_id,
		'now_a_king',
		filter_user_for_public_notification(conquered_lord),
		'You are now a King'
		)
}

notification_no_longer_a_king = function(user_id, king) {
	check(user_id, String)
	check(king, Object)
	check(king._id, String)
	check(king.username, String)
	check(king.x, validNumber)
	check(king.y, validNumber)
	check(king.castle_id, String)

	create_notification_new(
		user_id,
		'no_longer_a_king',
		filter_user_for_public_notification(king),
		'You are no longer a King'
		)
}

notification_lost_vassal = function(user_id, lost_vassal, vassals_new_lord) {
	check(user_id, String)
	check(lost_vassal, Object)
	check(vassals_new_lord, Object)

	create_notification_new(
		user_id,
		'lost_vassal',
		{
			lost_vassal:filter_user_for_public_notification(lost_vassal),
			vassals_new_lord:filter_user_for_public_notification(vassals_new_lord)
		},
		lost_vassal.username+' is no longer your vassal'
		)
}


notification_gained_vassal = function(user_id, new_vassal, vassals_new_lord) {
	check(user_id, String)
	check(new_vassal, Object)
	check(vassals_new_lord, Object)

	create_notification_new(
		user_id,
		'gained_vassal',
		{
			new_vassal:filter_user_for_public_notification(new_vassal),
			vassals_new_lord:filter_user_for_public_notification(vassals_new_lord)
		},
		new_vassal.username+' is now your vassal'
		)
}


notification_new_lord = function(user_id, lord) {
	check(user_id, String)
	check(lord, Object)
	check(lord._id, String)
	check(lord.username, String)
	check(lord.x, validNumber)
	check(lord.y, validNumber)
	check(lord.castle_id, String)

	create_notification_new(user_id,
		'new_lord',
		filter_user_for_public_notification(lord),
		lord.username+' is your new lord'
		)
}


notification_sent_gold = function(user_id, userData, amount) {
	check(user_id, String)
	check(userData, Object)
	check(userData.to._id, String)
	check(userData.to.username, String)
	check(userData.to.x, validNumber)
	check(userData.to.y, validNumber)
	check(userData.to.castle_id, String)
	check(userData.from._id, String)
	check(userData.from.username, String)
	check(userData.from.x, validNumber)
	check(userData.from.y, validNumber)
	check(userData.from.castle_id, String)
	check(amount, validNumber)

	userData.from = filter_user_for_public_notification(userData.from)
	userData.to = filter_user_for_public_notification(userData.to)
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
	check(userData.to.x, validNumber)
	check(userData.to.y, validNumber)
	check(userData.to.castle_id, String)
	check(userData.from._id, String)
	check(userData.from.username, String)
	check(userData.from.x, validNumber)
	check(userData.from.y, validNumber)
	check(userData.from.castle_id, String)
	check(army, Object)

	userData.from = filter_user_for_public_notification(userData.from)
	userData.to = filter_user_for_public_notification(userData.to)
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
	check(other_user.x, validNumber)
	check(other_user.y, validNumber)
	check(other_user.castle_id, String)

	create_notification_new(user_id,
		'new_chatroom_user',
		filter_user_for_public_notification(other_user),
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
		title: title
	})
}

create_notification_for_all_players = function(type, vars, title) {
	Meteor.users.find({}, {fields: {_id:1}}).forEach(function(user) {
		create_notification_new(user._id, type, vars, title)
	})
}



delete_old_notifications = function() {
	var begin = moment().add(-15, 'days').toDate()
	Notifications.remove({read: true, created_at: {$lt: begin}})
}



// make sure notifications don't include secret user attributes
filter_user_for_public_notification = function(user) {

	var user_field_whitelist = [
		'allies',
		'allies_above',
		'allies_below',
		'castle_id',
		'is_dominus',
		'is_king',
		'lord',
		'num_allies',
		'num_allies_above',
		'num_allies_below',
		'num_vassals',
		'vassals',
		'x',
		'y',
		'king',
		'siblings',
		'team',
		'username',
		'_id'
		]

	return _.pick(user, user_field_whitelist)
}
