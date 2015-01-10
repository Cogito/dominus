Meteor.startup(function() {
	Deps.autorun(function() {
		if (Session.get('show_building_castle_modal')) {
			var canvasSize = Session.get('canvas_size')
			if (canvasSize) {
				$('#building_castle_modal').show()
				$('#building_castle_modal').css('left', canvasSize.width/2 - 100)
				$('#building_castle_modal').css('top', canvasSize.height/2 - 30)
			}
		} else {
			$('#building_castle_modal').hide()
		}
	})
})
