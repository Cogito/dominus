Template.hexes.helpers({
	hexes: function() {
		Session.get('subscription_ready')
		return Hexes.find({}, {fields: {x:1, y:1, type:1}})
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
		return get_user_property("sp_show_coords")
	}
})





Template.hexes.events({
	// selecting hex to move army to
	'mouseenter .hex': function(event, template) {
		var id = $(event.currentTarget).attr('data-id')
		Session.set('mouseover_hex_id', id)
	},
	'mouseleave .hex': function(event, template) {
		Session.set('mouseover_hex_id', '');
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

	// draw hexes
	observe_hexes(self)

	// update hexes when player zooms in/out
	this.autorun(function() {
		var user = Meteor.users.findOne(Meteor.userId(), {fields: {hex_scale:1}})
		if (user && user.hex_scale) {
			set_hex_scale(user.hex_scale)
		}
	})

	// if canvas size changes redraw hexes
	this.autorun(function() {
		Session.get('canvas_size')
		self.handle.stop()
		$('#hex_container').empty()
		observe_hexes(self)
	})

	// hex selection
	// update when selected session variable changes
	this.autorun(function() {
		Session.get('update_highlight')
		if (Session.get('selected_type') == 'hex') {
				remove_all_highlights()
				var id = Session.get('selected_id')
				highlight_hex_id(id)
				//var hex = Hexes.findOne(id)	// not needed?
				Session.set('rp_template', 'rp_info_hex')
		}
	})

	// set canvas size
	// update size of map when window size changes
	this.autorun(function() {
		var canvas_size = Session.get('canvas_size')
		$('#svg_container').css('height', canvas_size.height)
		$('#svg_container').css('width', canvas_size.width)
	})


	// update session with which hex is at the center of the screen
	// used to subscribe to hexes onscreen
	this.autorun(function() {
		if (!Session.get('is_dragging_hexes')){
			if (typeof Session.get('hexes_pos') != 'undefined') {
				var hexes_pos = Session.get('hexes_pos')
				var canvas_size = Session.get('canvas_size')

				var pixel = grid_to_pixel(hexes_pos.x, hexes_pos.y)

				var coords = Hx.posToCoordinates(pixel.x, pixel.y, s.hex_size, s.hex_squish)

				var x = coords.x * -1 	// why -1???
				var y = coords.y * -1
				Session.set('center_hex', {x:x, y:y})
			}
		}
	})


	this.autorun(function() {
		var hex_scale = get_hex_scale()
		Deps.nonreactive(function() {
			var center_hex = Session.get('center_hex')
			center_on_hex(center_hex.x, center_hex.y)
		})
	})



}


Template.hexes.destroyed = function() {
	var self = this
}



observe_hexes = function(self) {
	var query = Hexes.find({}, {fields: {x:1, y:1, type:1, tileImage:1, large:1}})
	self.handle = query.observe({
		added: function(doc) {
			var canvas_size = Session.get('canvas_size')
			//$('#hex_container').find('[data-id='+doc._id+']').remove()
			
			var offset_x = -63
			var offset_y = -41

			var grid = Hx.coordinatesToPos(doc.x, doc.y, s.hex_size, s.hex_squish)
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
			hex_image.setAttribute('data-large', doc.large)
			hex_image.setAttribute('data-id', doc._id)

			if (doc.large) {
				var filename = 'hex_'+doc.type+'_large_'+doc.tileImage+'.png'
			} else {
				var filename = 'hex_'+doc.type+'_'+doc.tileImage+'.png'
			}

			hex_image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '/game_images/'+filename)
			
			container.appendChild(hex_image)

			var hex_polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
			hex_polygon.setAttribute('class', 'hex')
			var points = Hx.getHexPolygonVerts(grid.x, grid.y, s.hex_size)
			hex_polygon.setAttribute('points', points)
			hex_polygon.setAttribute('data-id', doc._id)
			hex_polygon.setAttribute('data-x', doc.x)
			hex_polygon.setAttribute('data-y', doc.y)
			hex_polygon.setAttribute('data-type', doc.type)
			hex_polygon.setAttribute('data-large', doc.large)

			container.appendChild(hex_polygon)
		},
		changed: function(doc) {
			// shouldn't be called
			//console.table(doc)
			//console.log('hex changed')
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

	var pixel = Hx.coordinatesToPos(x, y, s.hex_size, s.hex_squish)
	var points = Hx.getHexPolygonVerts(pixel.x, pixel.y, s.hex_size * 0.95)

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