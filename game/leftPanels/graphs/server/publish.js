Meteor.publish('my_dailystats', function() {
	if(this.userId) {
		return Dailystats.find({user_id: this.userId})
	} else {
		this.ready()
	}
})

Meteor.publish('stats_gamestats', function() {
	if(this.userId) {
		return Gamestats.find({}, {fields: {num_users:1, num_active_users:1, created_at:1, soldierWorth:1}})
	} else {
		this.ready()
	}
})
