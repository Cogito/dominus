Meteor.publish('left_panel_allies', function() {
	if(this.userId) {
		var sub = this
		var cur = Meteor.users.find({allies_above: this.userId}, {fields: {
				username:1,
				castle_id:1,
				x:1,
				y:1,
				income:1
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
				income:1
			}})
		Mongo.Collection._publishCursor(cur, sub, 'left_panel_lords')
		return sub.ready();
	} else {
		this.ready()
	}
})

Meteor.publish('left_panel_castle', function() {
	if(this.userId) {
		var sub = this

		var fields = {name:1, x:1, y:1}
		_.each(s.army.types, function(type) {
			fields[type] = 1
		})

		var cur = Castles.find({user_id: this.userId}, {fields: fields})
		Mongo.Collection._publishCursor(cur, sub, 'left_panel_castle')
		return sub.ready()
	} else {
		this.ready()
	}
})

Meteor.publish('left_panel_armies', function() {
	if(this.userId) {
		var sub = this
		var fields = {name:1, x:1, y:1, to_x:1, to_y:1, from_x:1, from_x:1, last_move_at:1}

		_.each(s.army.types, function(type) {
			fields[type] = 1
		})

		var cur = Armies.find({user_id: this.userId}, {fields: fields})
		Mongo.Collection._publishCursor(cur, sub, 'left_panel_armies')
		return sub.ready()
	} else {
		this.ready()
	}
})

Meteor.publish('left_panel_villages', function() {
	if(this.userId) {
		var sub = this
		var fields = {name:1, x:1, y:1}

		_.each(s.army.types, function(type) {
			fields[type] = 1
		})

		var cur = Villages.find({user_id: this.userId}, {fields: fields})
		Mongo.Collection._publishCursor(cur, sub, 'left_panel_villages')
		return sub.ready()
	} else {
		this.ready()
	}
})