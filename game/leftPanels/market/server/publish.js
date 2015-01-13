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



if (Meteor.isServer) {
	Market.allow({insert: false, update: false, remove: false})
	Markethistory.allow({insert: false, update: false, remove: false})
}
