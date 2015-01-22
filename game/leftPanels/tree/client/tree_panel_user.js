Template.tree_panel_user.events({
	'click .username': function(event, template) {
		center_on_hex(this.x, this.y)
		Session.set('selected_type', 'castle')
		Session.set('selected_id', this.castle_id)
		Session.set('selected_coords', {x:this.x, y:this.y})
	}
})
