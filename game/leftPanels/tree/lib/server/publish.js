Meteor.publish('cachedTree', function() {
	return Settings.find({name:'tree'})
})
