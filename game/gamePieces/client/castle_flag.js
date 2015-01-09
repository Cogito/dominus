Template.castle_flag.helpers({
	friend_or_foe: function() {
		return Template.instance().flagColor.get()
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

Template.castle_flag.created = function() {
	var self = this

	self.flagColor = new ReactiveVar(null)
	self.autorun(function() {
		if (Template.currentData()) {
			var relation = getUnitRelationType(Template.currentData().user_id)
			self.flagColor.set(relation)
		}
	})
}
