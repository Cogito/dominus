Template.connection_lost_alert.created = function() {
	this.autorun(function() {
		if (Meteor.status().connected) {
			Session.set('show_connection_lost_modal', false)
		} else {
			Session.set('show_connection_lost_modal', true)
		}
	})
}

Template.connection_lost_alert.rendered = function() {
	this.autorun(function() {
		if (Session.get('show_connection_lost_modal')) {
			var canvasSize = Session.get('canvas_size')
			if (canvasSize) {
				$('#connection_lost_modal').show()
				$('#connection_lost_modal').css('left', canvasSize.width/2 - 260)
				$('#connection_lost_modal').css('top', canvasSize.height/2 - 30)
			}
		} else {
			$('#connection_lost_modal').hide()
		}
	})
}
