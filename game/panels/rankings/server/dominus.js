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
				notification_are_now_dominus(d._id)
			}
		} else {
			notification_are_now_dominus(d._id)
		}
	})

	// if old dominus is no longer dominus
	if (dominus) {
		if (!is_still_dominus) {
			notification_no_longer_dominus(dominus._id)
		}
	}
}


// called when new user joins the game
remove_dominus = function() {
	Meteor.users.find({is_dominus: true}).forEach(function(u) {
		notification_no_longer_dominus_new_user(u._id)
		Meteor.users.update(u._id, {$set: {is_dominus: false}})
	})
}