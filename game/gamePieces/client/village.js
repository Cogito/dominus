Template.village.helpers({
	friend_or_foe: function() {
		return Template.instance().flagColor.get()
	},

	flag_points: function(x, y) {
		check(x, validNumber)
		check(y, validNumber)

		var canvas_size = Session.get('canvas_size')
		if (canvas_size) {
			var grid = Hx.coordinatesToPos(x, y, s.hex_size, s.hex_squish)
			var offset_x = 0
			var offset_y = 0
			var points = ''
			points = points + (0 + grid.x + offset_x) + ',' + (0 + grid.y + offset_y) + ' '
			points = points + (0 + grid.x + offset_x) + ',' + (-20 + grid.y + offset_y) + ' '
			points = points + (16 + grid.x + offset_x) + ',' + (-20 + grid.y + offset_y) + ' '
			points = points + (0 + grid.x + offset_x) + ',' + (-13 + grid.y + offset_y)
			return points
		}
	},
})


Template.village.events({
	'click .village': function(event, template) {
		if (!mapmover.isDraggingOrScaling) {
			var mouseMode = Session.get('mouse_mode')

			if (Session.get('mouse_mode') == 'default') {
				Session.set('selected_type', 'village')
				Session.set('selected_id', this._id)
				Session.set('selected_coords', {x:template.data.x, y:template.data.y})
			} else if (mouseMode == 'finding_path') {
				var coord = getCoordinatesFromEvent(event)

				// can't click on starting point
				if (JSON.stringify(coord) === JSON.stringify(get_from_coords())) {
					return false
				}

				add_move_to_queue(coord.x, coord.y)
			}
		}
	},

	'mouseenter .village': function(event, template) {
		// hover box
		Session.set('hover_box_data', {type:'village', x:template.data.x, y:template.data.y})
		Meteor.clearTimeout(Session.get('hover_on_object_timer'))
		Session.set('hover_on_object', true)
	},

	'mouseleave .village': function(event, template) {
		Meteor.clearTimeout(Session.get('hover_on_object_timer'))
		Session.set('hover_on_object_timer', Meteor.setTimeout(function() { Session.set('hover_on_object', false) }, 1000))
	},
})



draw_village_highlight = function(x, y, draw_resource_hexes) {
	check(x, validNumber)
	check(y, validNumber)

	var grid = Hx.coordinatesToPos(x, y, s.hex_size, s.hex_squish)
	var points = Hx.getHexPolygonVerts(grid.x, grid.y, s.hex_size * 0.95, s.hex_squish)
	if (points != false) {
		var polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
		polygon.setAttribute('class', 'village_highlight')
		polygon.setAttribute('points', points)
		$('#village_highlights').append(polygon)
	}

	if (draw_resource_hexes) {
		var hexes = Hx.getSurroundingHexes(x, y, s.resource.num_rings_village)
		_.each(hexes, function(hex) {
			var grid = Hx.coordinatesToPos(hex.x, hex.y, s.hex_size, s.hex_squish)
			var points = Hx.getHexPolygonVerts(grid.x, grid.y, s.hex_size * 0.95, s.hex_squish)
			if (points != false) {
				var polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
				polygon.setAttribute('class', 'village_resource_highlight')
				polygon.setAttribute('points', points)
				$('#village_highlights').append(polygon)
			}
		})
	}
}


remove_village_highlights = function() {
	$('polygon.village_highlight').remove()
	$('polygon.village_resource_highlight').remove()
}



Template.village.created = function() {
	var self = this

	// highlight castle if selected
	this.autorun(function() {
		Session.get('update_highlight')
		if (Session.get('selected_type') == 'village') {
			if (Session.get('selected_id') == self.data._id) {
				var coords = Session.get('selected_coords')
				if (coords) {
					remove_all_highlights()
					draw_village_highlight(coords.x, coords.y, (self.data.user_id == Meteor.userId()))
					Session.set('rp_template', 'rp_info_village')
				}
			}
		}
	})

	self.flagColor = new ReactiveVar(null)
	self.autorun(function() {
		if (Template.currentData()) {
			var relation = getUnitRelationType(Template.currentData().user_id)
			self.flagColor.set(relation)
		}
	})
}
