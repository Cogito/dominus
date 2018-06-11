Template.summary_hover_box.helpers({
	left: function() {
		return $('#left_panel').width() + 15
	},

	top: function() {
		return Session.get('summary_hover_box_top')
	},

	draw: function() {
		return Session.get('show_summary_hover_box')
	},

	contents: function() {
		return Session.get('summary_hover_box_contents')
	}
})

Session.setDefault('show_summary_hover_box', false)
Session.setDefault('summary_hover_box_top', 0)
Session.setDefault('summary_hover_box_contents', '')
