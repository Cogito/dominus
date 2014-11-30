Meteor.publish('store_charges', function() {
	if (this.userId) {
		return Charges.find({}, {fields: {amount:1}})
	} else {
		this.ready()
	}
})

Meteor.publish('my_castle', function() {
	if(this.userId) {
		var fields = {name:1, user_id:1, x:1, y:1, username:1, image:1}

		_.each(s.army.types, function(type) {
			fields[type] = 1
		})

		return Castles.find({user_id: this.userId}, {fields: fields})
	} else {
		this.ready()
	}
})

Meteor.publish('my_armies', function() {
	if(this.userId) {
		var fields = {name:1, user_id:1, x:1, y:1, to_x:1, to_y:1, from_x:1, from_x:1, last_move_at:1, username:1, castle_x:1, castle_y:1, castle_id:1}

		_.each(s.army.types, function(type) {
			fields[type] = 1
		})

		return Armies.find({user_id: this.userId}, {fields: fields})
	} else {
		this.ready()
	}
})

Meteor.publish('my_villages', function() {
	if(this.userId) {
		var fields = {name:1, user_id:1, x:1, y:1, username:1, castle_x:1, castle_y:1, castle_id:1}

		_.each(s.army.types, function(type) {
			fields[type] = 1
		})

		return Villages.find({user_id: this.userId}, {fields: fields})
	} else {
		this.ready()
	}
})