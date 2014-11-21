Template.navigation_panel.helpers({
	show_minimap: function() { return get_user_property("sp_show_minimap") }
})


Template.navigation_panel.events({
	// grid movement
	'mousedown #move_grid_left_button': function(event, template) { Session.set('move_map', 'left') },
	'mouseup #move_grid_left_button': function(event, template) { Session.set('move_map', null) },
	'mouseleave #move_grid_left_button': function(event, template) { Session.set('move_map', null) },

	'mousedown #move_grid_up_button': function(event, template) { Session.set('move_map', 'up') },
	'mouseup #move_grid_up_button': function(event, template) { Session.set('move_map', null) },
	'mouseleave #move_grid_up_button': function(event, template) { Session.set('move_map', null) },

	'mousedown #move_grid_right_button': function(event, template) { Session.set('move_map', 'right') },
	'mouseup #move_grid_right_button': function(event, template) { Session.set('move_map', null) },
	'mouseleave #move_grid_right_button': function(event, template) { Session.set('move_map', null) },

	'mousedown #move_grid_down_button': function(event, template) { Session.set('move_map', 'down') },
	'mouseup #move_grid_down_button': function(event, template) { Session.set('move_map', null) },
	'mouseleave #move_grid_down_button': function(event, template) { Session.set('move_map', null) },

	'click #move_grid_goto_button': function(event, template) {
		var x = Number($(template.find('#move_grid_x')).val())
		var y = Number($(template.find('#move_grid_y')).val())

		if (!isNaN(x) && !isNaN(y)) {
			center_on_hex(x,y)
			$(template.find('#move_grid_x')).val('')
			$(template.find('#move_grid_y')).val('')
		}
	},

	'click #increase_scale_button': function(event, template) {
		increase_hex_scale()
	},

	'click #decrease_scale_button':function(event, template) {
		decrease_hex_scale()
	},
})


grid_move_timer = undefined

Template.navigation_panel.rendered = function() {

	// arrow keys to scroll map
	Session.set('move_map', null)
	$(document).keydown(function(event) {
		if (event.keyCode == 38) {
			Session.set('move_map', 'up')
		}

		if (event.keyCode == 39) {
			Session.set('move_map', 'right')
		}

		if (event.keyCode == 40) {
			Session.set('move_map', 'down')
		}

		if (event.keyCode == 37) {
			Session.set('move_map', 'left')
		}
	})

	$(document).keyup(function(event) {
		if (event.keyCode == 37 || event.keyCode == 38 || event.keyCode == 39 || event.keyCode == 40) {
			Session.set('move_map', false)
		}
	})

	// arrow keys to scroll map
	this.deps_move_map = Deps.autorun(function() {
		if (Session.get('show_chat_panel') || Session.get('show_forum_panel') || Session.get('show_market_panel') || Session.get('show_settings_panel')) {
			return false
		}

		// watch for when move_map changes
		var direction = Session.get('move_map')

		if (direction == null) {
			if (typeof(grid_move_timer) != "undefined") {
				Meteor.clearInterval(grid_move_timer)
			}
		} else {
			Meteor.clearInterval(grid_move_timer)
			grid_move_timer = Meteor.setInterval(function() {
				Deps.nonreactive(function() {
					var hexes_pos = Session.get('hexes_pos')

					var x = hexes_pos.x
					var y = hexes_pos.y

					switch(direction) {
						case 'left':
							x = x + s.hex_move_speed
							break;
						case 'up':
							y = y + s.hex_move_speed
							break;
						case 'right':
							x = x - s.hex_move_speed
							break;
						case 'down':
							y = y - s.hex_move_speed
							break;
					}

					move_hexes_to(x, y)
				})
			}, 75)
		}
	})
}


Template.navigation_panel.destroyed = function() {
	$(document).unbind('keydown')
	$(document).unbind('keyup')
	if (this.deps_move_map) {
		this.deps_move_map.stop()
	}
}


decrease_hex_scale = function() {
	var hex_scale = get_hex_scale()
	hex_scale -= 0.1
	if (hex_scale < s.hex_scale_min) {
		hex_scale = s.hex_scale_min
	}
	Meteor.call('set_hex_scale', hex_scale)
}

increase_hex_scale = function() {
	var hex_scale = get_hex_scale()
	hex_scale += 0.1
	if (hex_scale > s.hex_scale_max) {
		hex_scale = s.hex_scale_max
	}
	Meteor.call('set_hex_scale', hex_scale)
}