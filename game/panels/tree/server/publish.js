Meteor.publish('tree_panel_users', function() {
	var sub = this
	var cur = Meteor.users.find({}, {fields: {
		username: 1,
		x: 1,
		y: 1,
		castle_id: 1,
		networth:1,
		is_dominus:1,
		income:1,
		networth:1,
		lord:1,
		num_vassals:1,
	}})
	Mongo.Collection._publishCursor(cur, sub, 'tree_panel_users')
	return sub.ready();
})