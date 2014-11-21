Template.top_panel.rendered = function() {
	var self = this

	self.deps_setCanvasSize = Deps.autorun(function() {
		if (Meteor.userId()) {
			if (typeof Session.get('canvas_size') != 'undefined') {
				$('#left_panels').css('height', Session.get('canvas_size').height - 40)
				$('#right_panel').css('height', Session.get('canvas_size').height - 40)
				$('#subscription_ready_panel').css('left', Session.get('canvas_size').width / 2 - 50)
			}
		}
	})

	self.deps_hide_velocity = Deps.autorun(function() {
		var hide = true
		var user = Meteor.users.findOne(Meteor.userId(), {fields: {admin:1}})
		if (user && user.admin) {
			hide = false
		}
		if (hide) {
			$('#velocity-status-widget').hide()
		} else {
			$('#velocity-status-widget').show()
		}
	})
}



Template.top_panel.destroyed = function() {
	var self = this

	if (self.deps_setCanvasSize) {
		self.deps_setCanvasSize.stop()
	}

	if (self.deps_hide_velocity) {
		self.deps_hide_velocity.stop()
	}
}