Meteor.startup(function() {
	Deps.autorun(function() {
		if (Session.get('show_building_castle_modal')) {
			$('#building_castle_modal').show()
			$('#building_castle_modal').css('left', Session.get('canvas_size').half_width - 100)
			$('#building_castle_modal').css('top', Session.get('canvas_size').half_height - 30)
		} else {
			$('#building_castle_modal').hide()
		}
	})
})