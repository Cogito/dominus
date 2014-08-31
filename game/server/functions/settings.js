Meteor.startup(function() {
	if (process.env.DOMINUS_WORKER == 'true') {
		Minimap.update_map_size_setting()
	}
})