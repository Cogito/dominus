Meteor.publish('minimap_map_size', function() {
	return Settings.find({name:'map_size'})
})

Meteor.startup(function () {  
	Settings._ensureIndex({map_size:1})
})