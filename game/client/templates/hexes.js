Template.hexes.helpers({
	hexes: function() {
		Session.get('subscription_ready')
		return Hexes.find({}, {fields: {x:1, y:1, type:1}, reactive:false})
	},

	castles: function() {
		return Castles.find({}, {fields: {x:1, y:1, user_id:1, image:1}})
	},

	armies: function() {
		return Armies.find({}, {fields: {x:1, y:1, user_id:1, last_move_at:1}})
	},

	villages: function() {
		return Villages.find({}, {fields: {x:1, y:1, user_id:1}})
	},

	//is_type_grain: function() { return this.type == 'grain' ? true: false },

	show_coords: function() {
		return Session.get('show_coords')
	}
})




// todo: maybe use mousedrag for dragging?

Template.hexes.events({
	// grid drag
	'mousedown #hexes': function(event, template) {
		if (event.which == 1) {
			// left mouse button
			dragger.start_grid_drag(event, false)
		}
	},
	'mouseup #hexes': function(event, template) { dragger.stop_grid_drag() },
	'mouseleave #hexes': function(event, template) { dragger.stop_grid_drag(); Session.set('mouseover_hex_id', ''); },
	'mousemove #hexes': function(event, template) { dragger.hexes_mouse_move(event, false) },

	'touchstart #hexes': function(event, template) {
		dragger.start_grid_drag(event, true)
	},
	'touchend #hexes': function(event, template) { dragger.stop_grid_drag() },
	'touchmove #hexes': function(event, template) { dragger.hexes_mouse_move(event, true) },

	// selecting hex to move army to
	'mouseenter .hex': function(event, template) {
		var id = $(event.currentTarget).attr('data-id')
		Session.set('mouseover_hex_id', id)
	},


	'click .hex': function(event, template) {
		var id = $(event.currentTarget).attr('data-id')
		check(id, String)
		if (!Session.get('is_dragging_hexes')) {

			if (Session.get('mouse_mode') == 'default') {

				Session.set('selected_type', 'hex')
				Session.set('selected_id', id)

			} else if (Session.get('mouse_mode') == 'finding_path') {
				click_on_tile_while_finding_path()
			} else if (Session.get('mouse_mode') == 'modal') {

			}
		}
	},
})




Template.hexes.rendered = function() {
	var self = this

	observe_hexes(self)

	self.dep_hex_scale = Deps.autorun(function() {
		var user = Meteor.users.findOne(Meteor.userId(), {fields: {hex_scale:1}})
		if (user && user.hex_scale) {
			set_hex_scale(user.hex_scale)
		}
	})

	self.dep_restart_hexes = Deps.autorun(function() {
		Session.get('canvas_size')
		self.handle.stop()
		$('#hex_container').empty()
		observe_hexes(self)
	})

	// hex selection
	self.deps_selection = Deps.autorun(function() {
		Session.get('update_highlight')
		if (Session.get('selected_type') == 'hex') {
				remove_all_highlights()
				var id = Session.get('selected_id')
				highlight_hex_id(id)
				var hex = Hexes.findOne(id)
				Session.set('rp_template', 'rp_info_hex')
		}
	})

	// set canvas size
	self.deps_canvasSize = Deps.autorun(function() {
		var canvas_size = Session.get('canvas_size')
		$('#svg_container').css('height', canvas_size.height)
		$('#svg_container').css('width', canvas_size.width)
	})


	// update session with which hex is at the center of the screen
	// used to subscribe to hexes onscreen
	self.deps_centerOfScreen = Deps.autorun(function() {
		if (!Session.get('is_dragging_hexes')){
			if (typeof Session.get('hexes_pos') != 'undefined') {
				var hexes_pos = Session.get('hexes_pos')
				var canvas_size = Session.get('canvas_size')

				// convert grid pos to screen pixel space
				// hexes_pos.x -= canvas_size.half_width
				// hexes_pos.y -= canvas_size.half_height

				var pixel = grid_to_pixel(hexes_pos.x, hexes_pos.y)

				var coords = grid_to_coordinates(pixel.x, pixel.y)

				var x = coords.x * -1 	// why -1???
				var y = coords.y * -1
				Session.set('center_hex', {x:x, y:y})
			}
		}
	})


	self.deps_hex_scale_change = Deps.autorun(function() {
		var hex_scale = get_hex_scale()
		Deps.nonreactive(function() {
			var center_hex = Session.get('center_hex')
			center_on_hex(center_hex.x, center_hex.y)
		})
	})



}


Template.hexes.destroyed = function() {
	var self = this
	if (self.deps_selection) { self.deps_selection.stop() }
	if (self.deps_selection) { self.deps_canvasSize.stop() }
	if (self.deps_selection) { self.deps_centerOfScreen.stop() }
	if (self.deps_hex_scale_change) { self.deps_hex_scale_change.stop() }
	if (self.handle) { self.handle.stop() }
	if (self.dep_hex_scale) { self.dep_hex_scale.stop() }
}



observe_hexes = function(self) {
	var query = Hexes.find({}, {fields: {x:1, y:1, type:1, tileImage:1}})
	self.handle = query.observe({
		added: function(doc) {
			var canvas_size = Session.get('canvas_size')
			//$('#hex_container').find('[data-id='+doc._id+']').remove()
			
			var offset_x = -63
			var offset_y = -41

			var grid = coordinates_to_grid(doc.x,doc.y)
			// var x = Math.round(pixel.x + canvas_size.half_width + offset_x)
			// var y = Math.round(pixel.y + canvas_size.half_height + offset_y)
			var x = grid.x + offset_x
			var y = grid.y + offset_y

			var container = document.getElementById('hex_container')
			var hex_image = document.createElementNS('http://www.w3.org/2000/svg','image')
			hex_image.setAttribute('class', 'hex_image')
			hex_image.setAttribute('x', x)
			hex_image.setAttribute('y', y)
			hex_image.setAttribute('height', 83)
			hex_image.setAttribute('width', 126)
			hex_image.setAttribute('data-id', doc._id)

			hex_image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '/game_images/hex_'+doc.type+'_'+doc.tileImage+'.png')
			
			container.appendChild(hex_image)

			var hex_polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
			hex_polygon.setAttribute('class', 'hex')
			var points = calculate_hex_polygon_points(grid.x, grid.y, s.hex_size)
			hex_polygon.setAttribute('points', points)
			hex_polygon.setAttribute('data-id', doc._id)
			hex_polygon.setAttribute('data-x', doc.x)
			hex_polygon.setAttribute('data-y', doc.y)
			hex_polygon.setAttribute('data-type', doc.type)

			container.appendChild(hex_polygon)
		},
		changed: function(doc) {
			console.log('hex changed')
		},
		removed: function(doc) {
			$('#hex_container').find('[data-id='+doc._id+']').remove()
		}
	})
}



/////////////////////////////////////////////////////////////////////////////////
// selecting
/////////////////////////////////////////////////////////////////////////////////


highlight_hex_coords = function(x, y) {
	check(x, Number)
	check(y, Number)

	var pixel = coordinates_to_grid(x,y)
	var points = calculate_hex_polygon_points(pixel.x, pixel.y, s.hex_size * 0.95)

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

	check(coords.x, Number)
	check(coords.y, Number)

	highlight_hex_coords(coords.x, coords.y)
}

calculate_hex_polygon_points = function(center_x, center_y, hex_size) {
	check(center_x, Number)
	check(center_y, Number)
	check(hex_size, Number)
	
	var points = ''
	for (var i = 0; i < 6; i++) {
		var angle = 2 * Math.PI / 6 * i

		var point_x = (hex_size * Math.cos(angle)) + center_x
		var point_y = (hex_size * Math.sin(angle) * s.hex_squish) + center_y

		if (isNaN(point_x)) {
			return false
		}

		if (i != 0) { points = points + ' '; }		// add space in-between if not first
		points = points + point_x.toString() + ',' + point_y.toString()		// concat into string
	}
	return points
}

hex_remove_highlights = function() {
	$('polygon.hex_highlight').remove()
}













/////////////////////////////////////////////////////////
/// getters setters


// hex_scale
var hex_scale = 1
var hex_scale_dep = new Deps.Dependency

get_hex_scale = function() {
	hex_scale_dep.depend()
	return hex_scale
}

var set_hex_scale = function(num) {
	check(num, Number)

	if (hex_scale != num) {
		hex_scale = num
		hex_scale_dep.changed()
	}
}