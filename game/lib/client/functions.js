setHexScale = function(scale) {
	Session.set('hexScale', scale)
	_saveHexScale()
}

_saveHexScale = _.debounce(function() {
	Meteor.call('set_hex_scale', Session.get('hexScale'))
}, 500)

////////////////////////////////////////////////////////////
// hex functions
////////////////////////////////////////////////////////////

// offset your position on the map
// this is pixel position not coordinates
offset_hexes = function(offset_x, offset_y) {
	check(offset_x, validNumber)
	check(offset_y, validNumber)

	var hexes_pos = Session.get('hexes_pos')

	x = hexes_pos.x + offset_x
	y = hexes_pos.y + offset_y

	move_hexes_to(x, y)
}


// move the map to a position
// this is pixel position not coordinates
move_hexes_to = function(pixel_x, pixel_y) {
	check(pixel_x, validNumber)
	check(pixel_y, validNumber)
	if (isNaN(pixel_x) || isNaN(pixel_y)) {
		return false
	}

	$(hexes).attr('transform', 'translate('+pixel_x+','+pixel_y+') scale('+Session.get('hexScale')+')')

	Session.set('hexes_pos', {x:pixel_x, y:pixel_y})
}

// center the map on a hex
// give coordinates of a hex 3,-5
// why * -1 ?????
center_on_hex = function(x, y) {
	check(x, validNumber)
	check(y, validNumber)
	var hex_scale = Session.get('hexScale')
	var canvas_size = Session.get('canvas_size')
	var grid = Hx.coordinatesToPos(x, y, s.hex_size, s.hex_squish)

	var x = canvas_size.half_width
	var y = canvas_size.half_height

	x += grid.x * hex_scale * -1
	y += grid.y * hex_scale * -1

	move_hexes_to(x, y)
}


highlight_hex_path = function(from_x, from_y, to_x, to_y) {
	check(from_x, validNumber)
	check(from_y, validNumber)
	check(to_x, validNumber)
	check(to_y, validNumber)

	var hexes = Hx.getHexesAlongLine(from_x, from_y, to_x, to_y, s.hex_size, s.hex_squish)

	_.each(hexes, function(hex) {

		highlight_hex_coords(hex.x, hex.y)

		var castle = Castles.findOne({x: hex.x, y: hex.y}, {fields: {_id: 1}})
		if (castle) {
			draw_castle_highlight(castle._id)
		}

		var village = Villages.findOne({x: hex.x, y: hex.y}, {fields: {_id: 1}})
		if (village) {
			draw_village_highlight(village._id)
		}

	})
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
