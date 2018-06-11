Template.lp_armies.helpers({
	armies: function() {
		return LeftPanelArmies.find({}, {sort: {name: 1}})
	},
})


Template.lp_army.helpers({

	unit_count: function() {
		var self = this
		var unit_count = 0
		_.each(s.army.types, function(type) {
			unit_count += self[type]
		})
		return unit_count
	},

	time_to_destination: function() {
		var self = this

		if (self) {
			Session.get('refresh_time_field')
			var time_to_destination = null

			var moves = Moves.find({army_id:self._id})
			if (moves.count() > 0) {
				var army_speed = speed_of_army(self)

				var distance = 0
				var last_move_at
				moves.forEach(function(move) {
					if (move.index == 0) {
						var d = Hx.hexDistance(self.x, self.y, move.to_x, move.to_y)
						last_move_at = move.last_move_at
					} else {
						var d = Hx.hexDistance(move.from_x, move.from_y, move.to_x, move.to_y)
					}
					distance += d
				})

				var move_time = moment(new Date(last_move_at)).add(distance * army_speed, 'minutes')
				if (move_time < moment()) {
					time_to_destination = 'soon'
				} else {
					time_to_destination = move_time.fromNow()
				}
			}

			return time_to_destination
		}
	}
})


Template.lp_armies.created = function() {
	this.autorun(function() {
		Meteor.subscribe('left_panel_armies')
		Meteor.subscribe('user_moves')
	})
}
