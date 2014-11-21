Template.castle.helpers({
	image: function() {
		return _store.castles[this.image].image
	}
})

Template.castle.events({
	'click .castle': function(event, template) {
		if (!Session.get('is_dragging_hexes')) {

			if (Session.get('mouse_mode') == 'default') {
				Session.set('selected_type', 'castle')
				Session.set('selected_id', this._id)

			} else if (Session.get('mouse_mode') == 'finding_path') {
				click_on_tile_while_finding_path()
			}

		}
	},

	'mouseenter .castle': function(event, template) {
		// so that finding path works
		var hex = Hexes.findOne({x: this.x, y: this.y}, {fields: {_id:1}})
		if (hex) {
			Session.set('mouseover_hex_id', hex._id)
		}

		// hover box
		//if (Session.get('mouse_mode') == 'default') {
			Session.set('hover_box_data', {type: 'castle', x: this.x, y: this.y})
			Meteor.clearTimeout(Session.get('hover_on_object_timer'))
			Session.set('hover_on_object', true)
		//}
	},

	'mouseleave .castle': function(event, template) {
		Meteor.clearTimeout(Session.get('hover_on_object_timer'))
		Session.set('hover_on_object_timer', Meteor.setTimeout(function() { Session.set('hover_on_object', false) }, 1000))
	},
})


draw_castle_highlight = function(castle_id, draw_resource_hexes) {
	check(castle_id, String)

	var coords = id_to_coords(castle_id, 'castle')

	check(coords.x, Number)
	check(coords.y, Number)

	var grid = Hx.coordinatesToPos(coords.x, coords.y, s.hex_size, s.hex_squish)
	var points = Hx.getHexPolygonVerts(grid.x, grid.y, s.hex_size * 0.95)
	if (points != false) {
		var polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
		polygon.setAttribute('class', 'castle_highlight')
		polygon.setAttribute('points', points)
		$('#castle_highlights').append(polygon)
	}

	if (draw_resource_hexes) {
		var hexes = Hx.getSurroundingHexes(coords.x, coords.y, s.resource.num_rings_castle)
		_.each(hexes, function(hex) {
			var grid = Hx.coordinatesToPos(hex.x, hex.y, s.hex_size, s.hex_squish)
			var points = Hx.getHexPolygonVerts(grid.x, grid.y, s.hex_size * 0.95)
			if (points != false) {
				var polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
				polygon.setAttribute('class', 'castle_resource_highlight')
				polygon.setAttribute('points', points)
				$('#castle_highlights').append(polygon)
			}
		})
	}
}



remove_castle_highlights = function() {
	$('polygon.castle_highlight').remove()
	$('polygon.castle_resource_highlight').remove()
}




Template.castle.rendered = function() {
	var self = this

	// highlight castle if selected
	self.deps_highlight = Deps.autorun(function() {
		Session.get('update_highlight')
		if (Session.get('selected_type') == 'castle') {
			if (Session.get('selected_id') == self.data._id) {
				remove_all_highlights()
				draw_castle_highlight(Session.get('selected_id'), (self.data.user_id == Meteor.userId()))
				Session.set('rp_template', 'rp_info_castle')
			}
		}
	})
}

Template.castle.destroyed = function() {
	var self = this
	if (self.deps_highlight) {
		self.deps_highlight.stop()
	}
}
