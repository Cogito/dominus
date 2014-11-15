Meteor.publish('left_panel_allies', function() {
	if(this.userId) {
		var sub = this
		var cur = Meteor.users.find({allies_above: this.userId}, {fields: {
				username:1,
				castle_id:1,
				x:1,
				y:1,
				networth:1
			}})
		Mongo.Collection._publishCursor(cur, sub, 'left_panel_allies')
		return sub.ready();
	} else {
		this.ready()
	}
})


Meteor.publish('left_panel_lords', function() {
	if(this.userId) {
		var sub = this
		var cur = Meteor.users.find({allies_below: this.userId}, {fields: {
				username:1,
				castle_id:1,
				x:1,
				y:1,
				networth:1,
				is_dominus:1,
				is_king:1
			}})
		Mongo.Collection._publishCursor(cur, sub, 'left_panel_lords')
		return sub.ready();
	} else {
		this.ready()
	}
})