var minimap_size = 300

UI.registerHelper('minimap_coord_to_pixel_x', function(x,y) {
	check(x, validNumber)
	check(y, validNumber)

	var hex_size = get_hex_size()
	var coords = minimap_coordinates_to_grid(x, y, hex_size)
	return coords.x
})

UI.registerHelper('minimap_coord_to_pixel_y', function(x,y) {
	check(x, validNumber)
	check(y, validNumber)

	var hex_size = get_hex_size()
	var coords = minimap_coordinates_to_grid(x, y, hex_size)
	return coords.y
})

UI.registerHelper('relationship', function(user_id) {
	return getUnitRelationType(user_id)
})



Template.minimap.helpers({
	moves: function() {
		return Moves.find()
	},

	bg_points: function() {
		var points = ''
		for (var i = 0; i < 6; i++) {
			var angle = 2 * Math.PI / 6 * i

			var point_x = (minimap_size/2 * Math.sin(angle)) + minimap_size/2
			var point_y = (minimap_size/2 * Math.cos(angle) * s.hex_squish) + minimap_size/2

			if (isNaN(point_x)) {
				return false
			}

			if (i != 0) { points = points + ' '; }		// add space in-between if not first
			points = points + point_x.toString() + ',' + point_y.toString()		// concat into string
		}
		return points
	},

	castles: function() {
		return LeftPanelCastle.find()
	},

	villages: function() {
		return LeftPanelVillages.find()
	},

	armies: function() {
		return LeftPanelArmies.find({}, {fields: {x:1, y:1}})
	},

	lords: function() {
		return LeftPanelLords.find()
	},

	allies: function() {
		return LeftPanelAllies.find()
	},

	viewport_size: function() {
		return get_viewport_size()
	},

	viewport_position: function() {
		var center_hex = Session.get('center_hex')
		if (center_hex) {
			var viewport_size = get_viewport_size()
			var coords = minimap_coordinates_to_grid(center_hex.x, center_hex.y, hex_size)
			coords.x = coords.x - viewport_size.width/2
			coords.y = coords.y - viewport_size.height/2
			return coords
		}
	}
})



Template.minimap.events({
	'click #minimap_bg': function(event, template) {
		var x = event.originalEvent.hasOwnProperty('offsetX') ? event.originalEvent.offsetX : event.originalEvent.layerX
		var y = event.originalEvent.hasOwnProperty('offsetY') ? event.originalEvent.offsetY : event.originalEvent.layerY
		var coords = pixel_to_coordinates(x, y)
		center_on_hex(coords.x,coords.y)
	}
})


Template.minimap.created = function() {
	var self = this

	this.autorun(function() {
		Meteor.subscribe('minimap_map_size')
	})

	this.autorun(function() {
		var map_size = Settings.findOne({name:'map_size'})
		if (map_size && map_size.value) {
			var hex_size = ((minimap_size / 2) / map_size.value) / 2
			set_hex_size(hex_size)
		}
	})

	this.autorun(function() {
		var mini_hex_size = get_hex_size()
		var canvas_size = Session.get('canvas_size')
		var hex_scale = Session.get('hexScale')

		if (canvas_size && hex_scale) {
			var hex_size = s.hex_size * hex_scale

			var hex_width = hex_size * 2
			var hex_height = Math.sqrt(3)/2 * hex_width

			var mini_hex_width = mini_hex_size * 2
			var mini_hex_height = Math.sqrt(3)/2 * mini_hex_width

			var tiles_onscreen_wide = canvas_size.width / (hex_size * 3/2)
			var tiles_onscreen_high = canvas_size.height / ((Math.sqrt(3) * s.hex_squish) * hex_size)

			var mini_canvas_width = (canvas_size.width / hex_width) * mini_hex_width
			var mini_canvas_height = (canvas_size.height / hex_height) * mini_hex_height

			set_viewport_size(mini_canvas_width, mini_canvas_height)
		}
	})
}



// viewport size
var viewport_size = {width:0, height:0}
var viewport_size_dep = new Deps.Dependency

get_viewport_size = function() {
	viewport_size_dep.depend()
	return viewport_size
}

set_viewport_size = function(width, height) {
	check(width, Number)
	check(height, Number)
	if (viewport_size.width != width || viewport_size.height != height) {
		viewport_size = {width:width, height:height}
		viewport_size_dep.changed()
	}
}


// hex size
var hex_size = 0
var hex_size_dep = new Deps.Dependency

get_hex_size = function() {
	hex_size_dep.depend()
	return hex_size
}

set_hex_size = function(num) {
	check(num, validNumber)
	if (hex_size != num) {
		hex_size = num
		hex_size_dep.changed()
	}
}




var minimap_coordinates_to_grid = function(x, y, hex_size) {
	check(x, validNumber)
	check(y, validNumber)

	var pixel_x = hex_size * 3/2 * x
	var pixel_y = hex_size * (Math.sqrt(3) * s.hex_squish) * (y + x/2)

	pixel_x += minimap_size/2
	pixel_y += minimap_size/2

	return {
		x: pixel_x,
		y: pixel_y
	}
}


var pixel_to_coordinates = function(pixel_x, pixel_y) {
	var x = pixel_x - minimap_size/2
	var y = pixel_y - minimap_size/2

	var q = 2/3 * x / get_hex_size()
	var r = (1/3 * (Math.sqrt(3) / s.hex_squish) * y - 1/3 * x) / get_hex_size()

	// just rounding doesn't work, must convert to cube coords then round then covert to axial
	var cube = Hx.convertAxialToCubeCoordinates(q,r)
	var round = Hx.roundCubeCoordinates(cube.x, cube.y, cube.z)
	var axial = Hx.convertCubeToAxialCoordinates(round.x, round.y, round.z)

	return {
		x:axial.x,
		y:axial.y
	}
}
