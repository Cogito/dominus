////////////////////////////////////////////////////////////
// hex functions
////////////////////////////////////////////////////////////

// offset your position on the map
// this is pixel position not coordinates
offset_hexes = function(offset_x, offset_y) {
	check(offset_x, Number)
	check(offset_y, Number)

	var hexes_pos = Session.get('hexes_pos')

	x = hexes_pos.x + offset_x
	y = hexes_pos.y + offset_y

	move_hexes_to(x, y)
}


// move the map to a position
// this is pixel position not coordinates
move_hexes_to = function(pixel_x, pixel_y) {
	check(pixel_x, Number)
	check(pixel_y, Number)
	if (isNaN(pixel_x) || isNaN(pixel_y)) {
		return false
	}

	var hex_scale = get_hex_scale()

	$(hexes).attr('transform', 'translate('+pixel_x+','+pixel_y+') scale('+hex_scale+')')
	
	Session.set('hexes_pos', {x:pixel_x, y:pixel_y})
}

// center the map on a hex
// give coordinates of a hex 3,-5
// why * -1 ?????
center_on_hex = function(x, y) {
	check(x, Number)
	check(y, Number)
	var hex_scale = get_hex_scale()
	var canvas_size = Session.get('canvas_size')
	var grid = Hx.coordinatesToPos(x, y, s.hex_size, s.hex_squish)

	var x = canvas_size.half_width
	var y = canvas_size.half_height

	x += grid.x * hex_scale * -1
	y += grid.y * hex_scale * -1

	move_hexes_to(x, y)
}


highlight_hex_path = function(from_x, from_y, to_x, to_y) {
	check(from_x, Number)
	check(from_y, Number)
	check(to_x, Number)
	check(to_y, Number)

	var from_pos = Hx.coordinatesToPos(from_x, from_y, s.hex_size, s.hex_squish)
	var to_pos = Hx.coordinatesToPos(to_x, to_y, s.hex_size, s.hex_squish)

	// draw debug line
	// if (Session.get('show_debug_symbols')) {
	// 	var newLine = document.createElementNS('http://www.w3.org/2000/svg','line')
	// 	newLine.setAttribute('id','select_hex_to_move_army_line')
	// 	newLine.setAttribute('x1', from_pos.x + Session.get('canvas_size').half_width)
	// 	newLine.setAttribute('y1', from_pos.y + Session.get('canvas_size').half_height)
	// 	newLine.setAttribute('x2', to_pos.x + Session.get('canvas_size').half_width)
	// 	newLine.setAttribute('y2', to_pos.y + Session.get('canvas_size').half_height)
	// 	$("#hexes").append(newLine);
	// }

	// get distance
	var distance = Hx.hexDistance(from_x, from_y, to_x, to_y)

	for (i = 0; i <= distance; i++) {
		// pick points along line
		var x = from_pos.x * (1 - i/distance) + to_pos.x * i/distance
		var y = from_pos.y * (1 - i/distance) + to_pos.y * i/distance

		// draw debug circles
		// if (Session.get('show_debug_symbols')) {
		// 	var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
		// 	circle.setAttribute('class', 'select_hex_to_move_army_circle')
		// 	circle.setAttribute('cx', x + Session.get('canvas_size').half_width)
		// 	circle.setAttribute('cy', y + Session.get('canvas_size').half_height)
		// 	circle.setAttribute('r', 5)
		// 	$('#hexes').append(circle)
		// }

		//sample hexes at circles
		var coords = Hx.posToCoordinates(x, y, s.hex_size, s.hex_squish)
		highlight_hex_coords(coords.x, coords.y)

		var castle = Castles.findOne({x: coords.x, y: coords.y}, {fields: {_id: 1}})
		if (castle) {
			draw_castle_highlight(castle._id)
		}

		var village = Villages.findOne({x: coords.x, y: coords.y}, {fields: {_id: 1}})
		if (village) {
			draw_village_highlight(village._id)
		}

	}
}










remove_all_highlights = function() {
	hex_remove_highlights()
	remove_castle_highlights()
	remove_army_highlights()
	remove_village_highlights()
}


deselect_all = function() {
	Session.set('mouse_mode', 'default')
	Session.set('selected_id', undefined)
	Session.set('selected_type', undefined)
	Session.set('rp_template', undefined)
}





/////////////////////////////////////////////////////////////////////////////////
// dragging
/////////////////////////////////////////////////////////////////////////////////


// should dragging be changed to has mouse moved since mousedown?
// should this be inside a deps.autorun?

dragger = (function () {
	var mouse_down = false
	var last_mouse_pos = {x: 0, y: 0}
	var last_drag_update = new Date(0)

	var point_from_event = function (event, is_touch) {
		if (is_touch && event.originalEvent.touches[0]) {
			return {
				x: event.originalEvent.touches[0].pageX,
				y: event.originalEvent.touches[0].pageY
			}
		} else {
			return {
				x: event.clientX,
				y: event.clientY
			}
		}
	}

	// delay to figure out if this is a click or a drag
	var start_grid_drag = function(event, is_touch) {
		mouse_down = true
		Meteor.setTimeout(function() {
			if (mouse_down) {
				event.preventDefault()
				last_mouse_pos = point_from_event(event, is_touch)
				Session.set('is_dragging_hexes', true)
			}
		}, 150)
	}

	var stop_grid_drag = function() {
		// hexes mouseup sometimes fires before hex click
		// do this so that hex click always knows if we're dragging
		Meteor.setTimeout(function() {
			mouse_down = false
			Session.set('is_dragging_hexes', false)
		}, 0)
	}

	var hexes_mouse_move = function(event, is_touch) {
		if (Session.get('is_dragging_hexes')) {
			event.preventDefault()
			if (last_mouse_pos.x != 0 || last_mouse_pos.y != 0) {
				if (new Date() - last_drag_update > 50) {
					var point = point_from_event(event, is_touch)
					var offset = {
						x: point.x - last_mouse_pos.x,
						y: point.y - last_mouse_pos.y
					}
					offset_hexes(offset.x, offset.y)
					last_drag_update = new Date()
					last_mouse_pos = point
				}
			}
		}
	}

	return {
		start_grid_drag: start_grid_drag,
		stop_grid_drag: stop_grid_drag,
		hexes_mouse_move: hexes_mouse_move
	};
})();
