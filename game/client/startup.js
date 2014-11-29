// hexes and grid
Session.setDefault('hexes_pos', {x: 0, y: 0})	//	x,y that the svg hex group #hexes is translated to
Session.setDefault('canvas_size', {width: 0, height: 0, half_width: 0, half_height: 0})
Session.setDefault('center_hex', {x: 0, y: 0})	// the hex that is in the center of the screen

// set these to select something
// this is the only thing you need to do to select something
Session.setDefault('selected_type', undefined)
Session.setDefault('selected_id', undefined)

Session.setDefault('mouseover_hex_id', '')	// the id of the hex the mouse is over

// used when selecting army path
Session.setDefault('finding_path_target_id', '')	// target that path goes to
Session.setDefault('finding_path_target_x', '')
Session.setDefault('finding_path_target_y', '')
Session.setDefault('finding_path_from_x', '')
Session.setDefault('finding_path_from_y', '')

Session.setDefault('is_dragging_hexes', false)

Session.setDefault('mouse_mode', 'default')	// used when selecting a hex to send army

Session.setDefault('rp_template', 'none')	// what to show in right panel



// summary box
Session.setDefault('show_summary_hover_box', false)
Session.setDefault('summary_hover_box_top', 0)
Session.setDefault('summary_hover_box_contents', '')

// true when the onscreen subscription is ready
// used to draw loading alert
Session.setDefault('subscription_ready', false)	

// flag box
Session.setDefault('hover_box_data', null)
Session.setDefault('hover_on_object', false)
Session.setDefault('hover_on_hover_box', false)
Session.setDefault('draw_hover_box', false)
Session.setDefault('hover_on_object_timer', null)

Session.setDefault('show_building_castle_modal', false)
Session.setDefault('show_connection_lost_modal', false)

// refresh templates that use time
Meteor.setInterval(function() {
	Session.set('refresh_time_field', Random.fraction())
}, 5000)

Session.setDefault('num_villages', null)	// the number of villages that player has

Session.setDefault('dupes', [])	// duplicate users


// selected units reactive variable
// can't use reactive div, reactive div doesn't support objects
Meteor.startup(function() {
	var selected_units = {}
	var selected_units_dep = new Deps.Dependency

	_.each(s.army.types, function(type) {
		selected_units[type] = 0
	})

	get_selected_units = function() {
		selected_units_dep.depend()
		return selected_units
	}

	get_selected_unit = function(type) {
		selected_units_dep.depend()
		return selected_units[type]
	}

	set_selected_unit = function(type, num) {
		if (selected_units[type] != num) {
			selected_units[type] = num
			selected_units_dep.changed()
		}
	}

	num_selected_units = function() {
		selected_units_dep.depend()
		var num = 0
		_.each(s.army.types, function(type) {
			num += selected_units[type]
		})
		return num
	}
})