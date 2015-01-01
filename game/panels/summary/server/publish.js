Meteor.publish('left_panel_allies', function() {
	if(this.userId) {
		var sub = this
		var cur = Meteor.users.find({allies_above: this.userId}, {fields: {
				username:1,
				castle_id:1,
				x:1,
				y:1,
				income:1,	// sort by income
				inBattle:1
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
				income:1,
				inBattle:1
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

		var fields = {name:1, x:1, y:1, user_id:1, inBattle:1}
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
		var fields = {name:1, x:1, y:1, to_x:1, to_y:1, from_x:1, from_x:1, last_move_at:1, inBattle:1}

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
		var fields = {name:1, x:1, y:1, user_id:1, inBattle:1}

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


Meteor.publish('user_buildings_for_minimap', function(user_id) {
	if(this.userId && user_id != this.userId) {
		var sub = this
		var fields = {name:1, x:1, y:1, user_id:1}

		_.each(s.army.types, function(type) {
			fields[type] = 1
		})

		var curVillages = Villages.find({user_id: user_id}, {fields: fields})
		Mongo.Collection._publishCursor(curVillages, sub, 'left_panel_villages')

		var curCastle = Castles.find({user_id: user_id}, {fields: fields})
		Mongo.Collection._publishCursor(curCastle, sub, 'left_panel_castle')

		return sub.ready()
	} else {
		this.ready()
	}
})
