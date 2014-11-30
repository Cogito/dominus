Meteor.methods({
	edit_name: function(type, id, name) {
		var error = false

		if (name.length < 1 || name.length > 30) {
			error = true
		}

		if (!error) {
			name = _.clean(name)

			switch(type) {
				case 'castle':
					var res = Castles.findOne(id, {fields: {user_id:1}})
					if (res) {
						if (res.user_id == Meteor.userId()) {
							Castles.update(id, {$set: {name: name}})
							return true
						}
					}
					break;
				case 'village':
					var res = Villages.findOne(id, {fields: {user_id:1}})
					if (res) {
						if (res.user_id == Meteor.userId()) {
							Villages.update(id, {$set: {name: name}})
							return true
						}
					}
					break;
				case 'army':
					var res = Armies.findOne(id, {fields: {user_id:1}})
					if (res) {
						if (res.user_id == Meteor.userId()) {
							Armies.update(id, {$set: {name: name}})
							return true
						}
					}
					break;
			}
		}

		return false
	},
})
