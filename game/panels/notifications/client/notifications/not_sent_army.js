Template.not_sent_army.helpers({
	has_army: function() {
		return Template.parentData(1).vars.army[this] > 0
	},

	num_army: function() {
		return Template.parentData(1).vars.army[this]
	}
})

Template.not_sent_army.events({
	'click .sent_army_goto_from_link': function(event, template) {
		center_on_hex(this.vars.from.x, this.vars.from.y)
		Session.set('selected_type', 'castle')
		Session.set('selected_id', this.vars.from.castle_id)
	},

	'click .sent_army_goto_to_link': function(event, template) {
		center_on_hex(this.vars.to.x, this.vars.to.y)
		Session.set('selected_type', 'castle')
		Session.set('selected_id', this.vars.to.castle_id)
	},
})