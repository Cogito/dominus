Meteor.startup(function() {
	Deps.autorun(function() {
		if (Session.get('show_connection_lost_modal')) {
			$('#connection_lost_modal').show()
			$('#connection_lost_modal').css('left', Session.get('canvas_size').half_width - 260)
			$('#connection_lost_modal').css('top', Session.get('canvas_size').half_height - 30)
		} else {
			$('#connection_lost_modal').hide()
		}
	})

	Deps.autorun(function() {
		if (Meteor.status().connected) {
			Session.set('show_connection_lost_modal', false)
		} else {
			Session.set('show_connection_lost_modal', true)
		}
	})
})