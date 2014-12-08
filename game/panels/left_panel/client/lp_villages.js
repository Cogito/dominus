Template.lp_villages.helpers({
	villages: function() {
		var res =  LeftPanelVillages.find({}, {sort: {name: 1}})
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