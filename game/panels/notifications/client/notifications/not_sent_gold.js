Template.not_sent_gold.events({
	'click .sent_gold_goto_link': function(event, template) {
		center_on_hex(this.vars.from_x, this.vars.from_y)
		Session.set('selected_type', 'castle')
		Session.set('selected_id', this.vars.from_castle_id)
	}
})