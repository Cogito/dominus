
// hexes and grid
Session.setDefault('hexes_pos', {x: 0, y: 0})	//	x,y that the hex group is translated
Session.setDefault('canvas_size', {width: 0, height: 0, half_width: 0, half_height: 0})
Session.setDefault('center_hex', {x: 0, y: 0})

Session.setDefault('selected_type', undefined)
Session.setDefault('selected_id', undefined)

Session.setDefault('mouseover_hex_id', '')
Session.setDefault('finding_path_target_id', '')	// target that path goes to
Session.setDefault('finding_path_target_x', '')
Session.setDefault('finding_path_target_y', '')
Session.setDefault('finding_path_from_x', '')
Session.setDefault('finding_path_from_y', '')

Session.setDefault('is_dragging_hexes', false)

Session.setDefault('mouse_mode', 'default')	// used when selecting a hex to send army

Session.setDefault('rp_template', 'none')	// what to show in right panel

Session.setDefault('show_summary_panel', true)
Session.setDefault('show_help_panel', false)
Session.setDefault('show_notifications_panel', false)
Session.setDefault('show_admin_panel', false)
Session.setDefault('show_market_panel', false)
Session.setDefault('show_debug_symbols', false)
Session.setDefault('show_settings_panel', false)
Session.setDefault('show_forum_panel', false)
Session.setDefault('show_chat_panel', false)
Session.setDefault('show_rankings_panel', false)
Session.setDefault('show_stats_panel', false)
Session.setDefault('show_store_panel', false)
Session.setDefault('show_tree_panel', false)
Session.setDefault('show_coords', false)

// summary box
Session.setDefault('show_summary_hover_box', false)
Session.setDefault('summary_hover_box_top', 0)
Session.setDefault('summary_hover_box_contents', '')

Session.setDefault('subscription_ready', false)

Session.setDefault('user_ids_onscreen', [])

// flag box
Session.setDefault('hover_box_data', null)
Session.setDefault('hover_on_object', false)
Session.setDefault('hover_on_hover_box', false)
Session.setDefault('draw_hover_box', false)
Session.setDefault('hover_on_object_timer', null)

//Session.setDefault('left_panel_rendered', false) // used to tell when someone is logging in

Session.setDefault('show_building_castle_modal', false)
Session.setDefault('show_connection_lost_modal', false)

Meteor.setInterval(function() {
	Session.set('refresh_time_field', Random.fraction())
}, 5000)

// left panel
Session.setDefault('show_castle_group', true)
Session.setDefault('show_armies_group', true)
Session.setDefault('show_villages_group', true)
Session.setDefault('show_lord_group', true)
Session.setDefault('show_vassals_group', true)

Session.setDefault('current_notification_id', undefined)

Session.setDefault('num_villages', null)

Session.setDefault('page_title_alert', null)

Session.setDefault('notifications_show_mine', true)

Session.setDefault('dupes', [])


// selected units reactive variable

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