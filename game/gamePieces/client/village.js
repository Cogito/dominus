Template.village.helpers({
	friend_or_foe: function() {
		var user = Meteor.users.findOne(Meteor.userId(), {fields: {lord:1, allies_above:1, allies_below:1, team:1, king:1, vassals:1}})
		if (user) {
			if (this.user_id == user._id) {
				return 'mine'
			} else if (_.indexOf(user.team, this.user_id) != -1) {

				if (_.indexOf(user.allies_above, this.user_id) != -1) {
					if (this.user_id == user.king) {
						return 'king'
					} else if (this.user_id == user.lord) {
						return 'lord'
					} else {
						return 'above'
					}
				} else if (_.indexOf(user.allies_below, this.user_id) != -1) {
					if (_.indexOf(user.vassals, this.user_id) != -1) {
						return 'vassal'
					} else {
						return 'below'
					}
				// } else if (_.indexOf(user.siblings, this.user_id) != -1) {
				// 	return 'sibling'
				} else {
					return 'team'
				}

			} else {
				return 'foe'
			}
		}
	},

	flag_points: function(x, y) {
		check(x, validNumber)
		check(y, validNumber)

		var canvas_size = Session.get('canvas_size')

		var grid = Hx.coordinatesToPos(x, y, s.hex_size, s.hex_squish)
		var offset_x = 0
		var offset_y = 0
		var points = ''
		points = points + (0 + grid.x + offset_x) + ',' + (0 + grid.y + offset_y) + ' '
		points = points + (0 + grid.x + offset_x) + ',' + (-20 + grid.y + offset_y) + ' '
		points = points + (16 + grid.x + offset_x) + ',' + (-20 + grid.y + offset_y) + ' '
		points = points + (0 + grid.x + offset_x) + ',' + (-13 + grid.y + offset_y)
		return points
	},
})


Template.village.events({
	'click .village': function(event, template) {
		if (!Session.get('is_dragging_hexes')) {

			if (Session.get('mouse_mode') == 'default') {
				Session.set('selected_type', 'village')
				Session.set('selected_id', this._id)

			} else if (Session.get('mouse_mode') == 'finding_path') {
				click_on_tile_while_finding_path()
			}

		}
	},

	'mouseenter .village': function(event, template) {
		// so that finding path works
		var hex = Hexes.findOne({x: this.x, y: this.y}, {fields: {_id:1}})
		if (hex) {
			Session.set('mouseover_hex_id', hex._id)
		}

		// hover box
		//if (Session.get('mouse_mode') == 'default') {
			Session.set('hover_box_data', {type: 'village', x: this.x, y: this.y})
			Meteor.clearTimeout(Session.get('hover_on_object_timer'))
			Session.set('hover_on_object', true)
		//}
	},

	'mouseleave .village': function(event, template) {
		Meteor.clearTimeout(Session.get('hover_on_object_timer'))
		Session.set('hover_on_object_timer', Meteor.setTimeout(function() { Session.set('hover_on_object', false) }, 1000))
	},
})



draw_village_highlight = function(id, draw_resource_hexes) {
	check(id, String)

	var coords = id_to_coords(id, 'village')

	check(coords.x, validNumber)
	check(coords.y, validNumber)

	var grid = Hx.coordinatesToPos(coords.x, coords.y, s.hex_size, s.hex_squish)
	var points = Hx.getHexPolygonVerts(grid.x, grid.y, s.hex_size * 0.95, s.hex_squish)
	if (points != false) {
		var polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
		polygon.setAttribute('class', 'village_highlight')
		polygon.setAttribute('points', points)
		$('#village_highlights').append(polygon)
	}

	if (draw_resource_hexes) {
		var hexes = Hx.getSurroundingHexes(coords.x, coords.y, s.resource.num_rings_village)
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
				remove_all_highlights()
				draw_village_highlight(Session.get('selected_id'), (self.data.user_id == Meteor.userId()))
				Session.set('rp_template', 'rp_info_village')
			}
		}
	})
}
