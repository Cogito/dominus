// used in rp_info_castle
Meteor.publish('castle_user', function(user_id) {
	if(this.userId) {
		var fields = {username:1, num_allies_below:1, is_dominus:1, is_king:1, income:1, networth:1, losses_worth:1}
		return Meteor.users.find(user_id, {fields: fields})
	} else {
		this.ready()
	}
})