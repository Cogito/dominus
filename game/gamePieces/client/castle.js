Template.castle.helpers({
	image: function() {
		return _store.castles[this.image].image
	}
})

Template.castle.events({

	'click .castle': function(event, template) {
		if (!mapmover.isDraggingOrScaling) {
			var mouseMode = Session.get('mouse_mode')

			if (mouseMode == 'default') {
				Session.set('selected_type', 'castle')
				Session.set('selected_id', this._id)
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

	'mouseenter .castle': function(event, template) {
		// hover box
		Session.set('hover_box_data', {type: 'castle', x: this.x, y: this.y})
		Meteor.clearTimeout(Session.get('hover_on_object_timer'))
		Session.set('hover_on_object', true)
	},

	'mouseleave .castle': function(event, template) {
		Meteor.clearTimeout(Session.get('hover_on_object_timer'))
		Session.set('hover_on_object_timer', Meteor.setTimeout(function() { Session.set('hover_on_object', false) }, 1000))
	},
})


draw_castle_highlight = function(castle_id) {
	check(castle_id, String)

	var coords = id_to_coords(castle_id, 'castle')

	check(coords.x, validNumber)
	check(coords.y, validNumber)

	var grid = Hx.coordinatesToPos(coords.x, coords.y, s.hex_size, s.hex_squish)
	var points = Hx.getHexPolygonVerts(grid.x, grid.y, s.hex_size * 0.95, s.hex_squish)
	if (points != false) {
		var polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
		polygon.setAttribute('class', 'castle_highlight')
		polygon.setAttribute('points', points)
		$('#castle_highlights').append(polygon)
	}
}



remove_castle_highlights = function() {
	$('polygon.castle_highlight').remove()
}




Template.castle.created = function() {
	var self = this

	// highlight castle if selected
	this.autorun(function() {
		Session.get('update_highlight')

		if (Session.get('selected_type') == 'castle') {
			if (Session.get('selected_id') == self.data._id){
				remove_all_highlights()
				draw_castle_highlight(Session.get('selected_id'))
				Session.set('rp_template', 'rp_info_castle')
			}
		}
	})
}
