Template.lp_villages.helpers({
	villages: function() {
		var fields = {name:1, x:1, y:1}

		_.each(s.army.types, function(type) {
			fields[type] = 1
		})

		var res =  Villages.find({user_id: Meteor.userId()}, {sort: {name: 1}, fields: fields})
		if (res && res.count() > 0) {
			res = res.map(function(a) {
				a.unit_count = 0

				_.each(s.army.types, function(type) {
					a.unit_count += a[type]
				})

				return a
			})
			return res
		} else {
			return false
		}
	},
})