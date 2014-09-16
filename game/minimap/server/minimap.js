Minimap = {
	update_map_size_setting: function() {
		var max_hex = Hexes.findOne({}, {fields: {x:1}, sort:{x:-1}})
		if (max_hex) {
			Settings.upsert({name: 'map_size'}, {$set: {name: 'map_size', value:max_hex.x}})
		}
	}
}

Meteor.publish('minimap_map_size', function() {
	return Settings.find({name:'map_size'})
})


Meteor.startup(function() {
	if (process.env.DOMINUS_WORKER == 'true') {
		Minimap.update_map_size_setting()
	}
})