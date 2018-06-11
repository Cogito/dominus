// helpers that are used everywhere
// needs to be cleaned up

UI.registerHelper('coord_to_pixel_x', function(x, y, offset) {
	check(x, validNumber)
	check(y, validNumber)
	check(offset, validNumber)

	var grid = Hx.coordinatesToPos(x, y, s.hex_size, s.hex_squish)
	//return Math.round(pixel.x +  canvas_center_x + offset)
	return grid.x +  offset
})

UI.registerHelper('coord_to_pixel_y', function(x, y, offset) {
	check(x, validNumber)
	check(y, validNumber)
	check(offset, validNumber)

	var grid = Hx.coordinatesToPos(x, y, s.hex_size, s.hex_squish)
	//return Math.round(pixel.y +  canvas_center_y + offset)
	return grid.y +  offset
})


UI.registerHelper('s.hex_size', function() { return s.hex_size })


UI.registerHelper('grid_x', function() { return Session.get('hexes_pos').x })
UI.registerHelper('grid_y', function() { return Session.get('hexes_pos').y })
UI.registerHelper('negative_grid_x', function() { return Session.get('hexes_pos').x * -1 })	// used for fog
UI.registerHelper('negative_grid_y', function() { return Session.get('hexes_pos').y * -1 })
UI.registerHelper('canvas_width', function() {
	var canvasSize = Session.get('canvas_size')
	if (canvasSize) {
		return canvasSize.width
	}
})
UI.registerHelper('canvas_height', function() {
	var canvasSize = Session.get('canvas_size')
	if (canvasSize) {
		return canvasSize.height
	}
})
UI.registerHelper('half_canvas_width', function() {
	var canvasSize = Session.get('canvas_size')
	if (canvasSize) {
		return canvasSize.width/2
	}
})
UI.registerHelper('half_canvas_height', function() {
	var canvasSize = Session.get('canvas_size')
	if (canvasSize) {
		return canvasSize.half_height
	}
})

// draw the outline for the hex
UI.registerHelper('hex_points', function(x, y) {
	var grid = Hx.coordinatesToPos(x, y, s.hex_size, s.hex_squish)
	return Hx.getHexPolygonVerts(grid.x, grid.y, s.hex_size, s.hex_squish)
})

UI.registerHelper('game_name', function() {
	return s.game_name
})


UI.registerHelper('vassal_tax', function() {
	return s.vassal_tax * 100
})

UI.registerHelper('castle_defense_bonus', function() {
	return s.castle.defense_bonus
})

UI.registerHelper('village_defense_bonus', function() {
	return s.village.defense_bonus
})

UI.registerHelper('ally_castle_defense_bonus', function() {
	return s.castle.ally_defense_bonus
})

UI.registerHelper('resource_interval', function() {
	return moment.duration(s.resource.interval).humanize()
})

UI.registerHelper('s_battle_interval', function() {
	return moment.duration(s.battle_interval).humanize()
})

UI.registerHelper('resources_at_large_hexes', function() {
	return s.resource.large_resource_multiplier * s.resource.gained_at_hex
})
