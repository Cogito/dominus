check_for_dominus = function() {
	var num_users = Meteor.users.find({castle_id: {$exists: true}}).count()
	var dominus = Meteor.users.findOne({is_dominus: true}, {fields: {_id:1}})
	var is_still_dominus = false

	// set everyone to not dominus
	Meteor.users.find({is_dominus: true}).forEach(function(u) {
		Meteor.users.update(u._id, {$set: {is_dominus: false}})
	})

	// find dominus
	Meteor.users.find({num_allies_below: num_users-1}).forEach(function(d) {
		Meteor.users.update(d._id, {$set: {is_dominus: true}})

		if (dominus) {
			if (d._id == dominus._id) {
				is_still_dominus = true
			} else {
				new_dominus_event(d)
			}
		} else {
			new_dominus_event(d)
		}
	})

	// if old dominus is no longer dominus
	// there is a new dominus
	if (dominus) {
		if (!is_still_dominus) {
			notification_no_longer_dominus(dominus._id, dominus)
			alert_noLongerDominus(dominus._id)
		}
	}
}


// called when new user joins the game
remove_dominus = function() {
	var dominus = Meteor.users.findOne({is_dominus:true}, {fields:{_id:1}})
	if (dominus) {
		gAlert_noLongerDominusNewUser(dominus._id)
		alert_noLongerDominusNewUser(dominus._id)
		Meteor.users.update(dominus._id, {$set: {is_dominus: false}})
	}
}


// happens when there is a new dominus
new_dominus_event = function(dominus_user) {
	check(dominus_user, Object)
	check(dominus_user._id, String)

	// make sure dominus and last dominus are not the same
	var lastDominus = Settings.findOne({name: 'lastDominusUserId'})

	if (lastDominus) {
		var lastDominusUserId = lastDominus.value
	} else {
		var lastDominusUserId = null
	}

	if (dominus_user._id != lastDominusUserId) {

		// set game end date
		var endDate = moment(new Date()).add(s.time_til_game_end_when_new_dominus, 'ms').toDate()
		Settings.upsert({name: 'gameEndDate'}, {$set: {name: 'gameEndDate', value: endDate}})
		Settings.upsert({name: 'lastDominusUserId'}, {$set: {name: 'lastDominusUserId', value: dominus_user._id}})
	}

	// send notifications
	notification_new_dominus(dominus_user, lastDominusUserId)
	gAlert_newDominus(dominus_user._id, lastDominusUserId)
	alert_youAreDominus(dominus_user._id)
}
