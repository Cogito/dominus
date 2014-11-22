Template.not_battle_start.events({
	'click .battle_report_goto_user': function(event, template) {
		Session.set('selected_type', 'castle')

		if (this.type == 'castle') {
			center_on_hex(this.x, this.y)
			Session.set('selected_id', this._id)
		} else {
			center_on_hex(this.castle_x, this.castle_y)
			Session.set('selected_id', this.castle_id)
		}
	},

	'click .battle_report_goto_hex': function() {
		center_on_hex(this.x, this.y)
		Session.set('selected_type', 'hex')
		var id = coords_to_id(this.x, this.y, 'hex')
		Session.set('selected_id', id)
	}
})