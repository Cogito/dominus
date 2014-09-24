Template.not_sent_gold.events({
	'click .sent_gold_goto_from_link': function(event, template) {
		center_on_hex(this.vars.from.x, this.vars.from.y)
		Session.set('selected_type', 'castle')
		Session.set('selected_id', this.vars.from.castle_id)
	},

	'click .sent_gold_goto_to_link': function(event, template) {
		center_on_hex(this.vars.to.x, this.vars.to.y)
		Session.set('selected_type', 'castle')
		Session.set('selected_id', this.vars.to.castle_id)
	},
})