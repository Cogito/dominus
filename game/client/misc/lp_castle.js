Template.lp_castle.helpers({
	castle: function() {
		var fields = {name:1, x:1, y:1}

		_.each(s.army.types, function(type) {
			fields[type] = 1
		})

		var res = Castles.findOne({user_id: Meteor.userId()}, {fields: fields})
		if (res) {
			res.unit_count = 0

			_.each(s.army.types, function(type) {
				res.unit_count += res[type]
			})

			return res
		}
		return false
	},
})