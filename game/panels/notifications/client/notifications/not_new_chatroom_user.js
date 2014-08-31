Template.not_new_chatroom_user.helpers({
	vars: function() {
		return this.vars
	}
})

Template.not_new_chatroom_user.events({
	'click .not_new_chatroom_user_goto': function() {
		center_on_hex(this.vars.x, this.vars.y)
		Session.set('selected_type', 'castle')
		Session.set('selected_id', this.vars.castle_id)
	}
})