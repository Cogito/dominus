Meteor.publish('minimap_map_size', function() {
	return Settings.find({name:'map_size'})
})