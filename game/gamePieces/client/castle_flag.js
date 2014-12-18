Template.castle_flag.helpers({
	friend_or_foe: function() {
		var user = Meteor.users.findOne(Meteor.userId(), {fields: {lord:1, allies_above:1, allies_below:1, team:1, king:1, vassals:1}})
		if (user) {
			if (this.user_id == user._id) {
				return 'mine'
			} else if (_.indexOf(user.team, this.user_id) != -1) {

				if (_.indexOf(user.allies_above, this.user_id) != -1) {
					if (this.user_id == user.king) {
						return 'king'
					} else if (this.user_id == user.lord) {
						return 'lord'
					} else {
						return 'above'
					}
				} else if (_.indexOf(user.allies_below, this.user_id) != -1) {
					if (_.indexOf(user.vassals, this.user_id) != -1) {
						return 'vassal'
					} else {
						return 'below'
					}
				// } else if (_.indexOf(user.siblings, this.user_id) != -1) {
				// 	return 'sibling'
				} else {
					return 'team'
				}

			} else {
				return 'foe'
			}
		}
	},

	flag_points: function(x, y) {
		check(x, validNumber)
		check(y, validNumber)

		var grid = Hx.coordinatesToPos(x, y, s.hex_size, s.hex_squish)
		var offset_x = _store.castles[this.image].flag_offset_x
		var offset_y = _store.castles[this.image].flag_offset_y
		var points = ''
		points = points + (0 + grid.x + offset_x) + ',' + (0 + grid.y + offset_y) + ' '
		points = points + (0 + grid.x + offset_x) + ',' + (-8 + grid.y + offset_y) + ' '
		points = points + (16 + grid.x + offset_x) + ',' + (-8 + grid.y + offset_y) + ' '
		points = points + (0 + grid.x + offset_x) + ',' + (-1 + grid.y + offset_y)
		return points
	}
})