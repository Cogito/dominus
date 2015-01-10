// global so that functions can check isDragging
var lastPos = {x:null,y:null}

mapmover = new Mapmover(function(x,y,scale) {
	// beginning of move
	beginPos = {x:x,y:y}

}, function(x,y,scale) {
	// during move
	offset_hexes(x-lastPos.x, y-lastPos.y)
	setHexScale(scale)
	lastPos = {x:x, y:y}

}, function(x,y,scale) {
	// end of move
	offset_hexes(x-lastPos.x, y-lastPos.y)
	setHexScale(scale)
})

mapmover.minScale = s.hex_scale_min
mapmover.maxScale = s.hex_scale_max


Template.hexes.helpers({
	// this is only used for the hex coordinates
	// not used to draw the hexes
	hexes: function() {
		return Hexes.find()
	},

	castles: function() {
		return Castles.find()
	},

	armies: function() {
		return Armies.find()
	},

	villages: function() {
		return Villages.find()
	},

	hexbakes: function() {
		return Hexbakes.find()
	},

	show_coords: function() {
		return get_user_property("sp_show_coords")
	}
})





Template.hexes.events({
	'mousemove': function(event, template) {
		var mouseMode = Session.get('mouse_mode')
		if (mouseMode == 'finding_path') {
			var coord = getCoordinatesFromEvent(event)
			Session.set('mouseOverHexCoords', coord)
		}
	},

	'mouseleave': function(event, template) {
		Session.set('mouseOverHexCoords', null)
	},

	'click #hexbakes': function(event, template) {
		if (!mapmover.isDraggingOrScaling) {

			var coord = getCoordinatesFromEvent(event)

			var mouseMode = Session.get('mouse_mode')
			if (mouseMode == 'default') {

				Meteor.call('coords_to_id', coord.x, coord.y, 'hex', function(error, hexId) {
					Session.set('selected_type', 'hex')
					Session.set('selected_id', hexId)
				})

			} else if (mouseMode == 'finding_path') {
				// can't click on starting point
				if (JSON.stringify(coord) === JSON.stringify(get_from_coords())) {
					return false
				}

				add_move_to_queue(coord.x, coord.y)

			} else if (mouseMode == 'modal') {

			}
		}
	},
})



Template.hexes.created = function() {
	// if hexScale is undefined then set it and center on castle
	this.autorun(function() {
		if (Session.get('canvas_size')) {
			if (!Session.get('hexScale')) {
				var user = Meteor.users.findOne(Meteor.userId(), {fields: {castle_id:1, hex_scale:1, x:1, y:1}})
				if (user && user.hex_scale) {
					Session.set('hexScale', user.hex_scale)
					Session.set('selected_type', 'castle')
					Session.set('selected_id', user.castle_id)
					center_on_hex(user.x, user.y)
				}
			}
		}
	})

	this.autorun(function() {
		var hexScale = Session.get('hexScale')
		if (hexScale) {
			mapmover.scale = hexScale
		}
	})
}



Template.hexes.rendered = function() {
	var self = this

	mapmover.start($('#svg_container'))

	// hex selection
	// update when selected session variable changes
	this.autorun(function() {
		Session.get('update_highlight')
		if (Session.get('selected_type') == 'hex' && Session.get('selected_id')) {
				remove_all_highlights()
				highlight_hex_id(Session.get('selected_id'))
				Session.set('rp_template', 'rp_info_hex')
		}
	})

	// if hexScale changes center on hex which will change the scale
	this.autorun(function() {
		if (Session.get('hexScale')) {
			Tracker.nonreactive(function() {
				var centerHex = Session.get('center_hex')
				if (centerHex) {
					center_on_hex(centerHex.x, centerHex.y)
				}
			})
		}
	})

	// set canvas size
	// update size of map when window size changes
	// if canvas size changes redraw hexes
	this.autorun(function() {
		var canvas_size = Session.get('canvas_size')
		if (canvas_size) {
			$('#svg_container').css('height', canvas_size.height)
			$('#svg_container').css('width', canvas_size.width)
		}
	})


	// update session with which hex is at the center of the screen
	// used to subscribe to hexes onscreen
	this.autorun(function() {
		var hexes_pos = Session.get('hexes_pos')
		if (typeof hexes_pos != 'undefined') {
			var canvas_size = Session.get('canvas_size')
			if (canvas_size) {
				var pixel = grid_to_pixel(hexes_pos.x, hexes_pos.y)
				var coords = Hx.posToCoordinates(pixel.x, pixel.y, s.hex_size, s.hex_squish)

				var x = coords.x * -1 	// why -1???
				var y = coords.y * -1
				Session.set('center_hex', {x:x, y:y})
			}
		}
	})
}


Template.hexes.destroyed = function() {
	var self = this
	mapmover.stop()
}



/////////////////////////////////////////////////////////////////////////////////
// selecting
/////////////////////////////////////////////////////////////////////////////////


getCoordinatesFromEvent = function(event) {
	// get click position
	// if is a touch event
	if (_.contains(['touchstart', 'touchend', 'touchcancel', 'touchmove'], event.type)) {
		var x = event.originalEvent.touches[0].pageX
		var y = event.originalEvent.touches[0].pageY
	} else {
		var x = event.clientX || event.pageX
		var y = event.clientY || event.pageY
	}

	var hexesPos = Session.get('hexes_pos')
	var hexScale = s.hex_size * Session.get('hexScale')

	if (hexesPos && hexScale) {
		// get hex coordinates
		var coord = Hx.posToCoordinates(x-hexesPos.x, y-hexesPos.y, hexScale, s.hex_squish)

		return coord
	}
}


highlight_hex_coords = function(x, y) {
	check(x, validNumber)
	check(y, validNumber)

	var pixel = Hx.coordinatesToPos(x, y, s.hex_size, s.hex_squish)
	var points = Hx.getHexPolygonVerts(pixel.x, pixel.y, s.hex_size * 0.95, s.hex_squish)

	if (points != false) {
		var polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
		polygon.setAttribute('class', 'hex_highlight')
		polygon.setAttribute('points', points)
		$('#hex_highlights').append(polygon)
	}
}

highlight_hex_id = function(hex_id) {
	check(hex_id, String)

	var coords = id_to_coords(hex_id, 'hex')

	// coords are false if couldn't find hex
	if (!coords) {
		return false
	}

	check(coords.x, validNumber)
	check(coords.y, validNumber)

	highlight_hex_coords(coords.x, coords.y)
}


hex_remove_highlights = function() {
	$('polygon.hex_highlight').remove()
}
