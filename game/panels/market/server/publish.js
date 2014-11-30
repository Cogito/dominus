Meteor.publish('market', function() {
	if(this.userId) {
		return Market.find()
	} else {
		this.ready()
	}
})


Meteor.publish('markethistory', function() {
	if(this.userId) {
		return Markethistory.find({}, {sort: {created_at:-1}, limit: 240})
	} else {
		this.ready()
	}
})