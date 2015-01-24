Template.army.helpers({
	//only draw guy that has been there the longest
	draw: function() {
		return Template.instance().draw.get()
	}
})



Template.army.events({
	'click .army': function(event, template) {
		if (!mapmover.isDraggingOrScaling) {

			if (Session.get('mouse_mode') == 'default') {
				Session.set('selected_type', 'army')
				Session.set('selected_id', Template.currentData()._id)
				Session.set('selected_coords', {x:template.data.x, y:template.data.y})
			}

		}
	},

	'mouseenter .army': function(event, template) {
		Session.set('hover_box_data', {type: 'army', x:template.data.x, y:template.data.y})
		Meteor.clearTimeout(Session.get('hover_on_object_timer'))
		Session.set('hover_on_object', true)
	},

	'mouseleave .army': function(event, template) {
		Meteor.clearTimeout(Session.get('hover_on_object_timer'))
		Session.set('hover_on_object_timer', Meteor.setTimeout(function() { Session.set('hover_on_object', false) }, 1000))
	},
})


Template.army.created = function() {
	var self = this

	self.draw = new ReactiveVar(true)
	self.autorun(function() {
		if (Template.currentData()) {
			var armies = Armies.find({x: Template.currentData().x, y: Template.currentData().y, _id: {$ne: Template.currentData()._id}}, {fields: {last_move_at:1}})

			if (armies.count() == 0) {
				self.draw.set(true)
			} else {
				self.draw.set(true)
				armies.forEach(function(res) {
					if (Template.currentData().last_move_at > res.last_move_at) {
						self.draw.set(false)
					}
				})
			}
		}
	})

	this.autorun(function() {
		Session.get('update_highlight')
		var mouse_mode = Deps.nonreactive(function () { return Session.get('mouse_mode'); })
		if (mouse_mode != 'finding_path') {
			if (Session.get('selected_type') == 'army') {
				var selected_id = Session.get('selected_id')
				if (selected_id == self.data._id) {
					Session.set('rp_template', 'rp_info_army')
				}
			}
		}
	})

	// highlight past moves
	this.autorun(function() {
		var offsetPath = {x:12, y:30}
		var coords = []
		Session.get('refresh_time_field')

		if (Template.currentData()) {
			removeArmyPathHighlights(Template.currentData()._id)

			var pastMoves = Template.currentData().pastMoves
			if (pastMoves && pastMoves.length > 1) {
				_.each(pastMoves, function(move) {
					var cutoff = moment(new Date()).subtract(s.army.pastMovesMsLimit, 'ms')
					if (moment(new Date(move.moveDate)).isAfter(cutoff)) {
						coords.push({x:move.x, y:move.y})
					}
				})
			}

			if (coords.length > 1) {
				var d = ""
				var first = true

				_.each(coords, function(coord) {
					var pos = Hx.coordinatesToPos(coord.x, coord.y, s.hex_size, s.hex_squish)

					pos.x += offsetPath.x
					pos.y += offsetPath.y

					if (first) {
						d += 'M '+pos.x+' '+pos.y
					} else {
						d += ' L '+pos.x+' '+pos.y
					}

					var ellipse = document.createElementNS('http://www.w3.org/2000/svg',"ellipse")
					ellipse.setAttributeNS(null, 'cx', pos.x)
					ellipse.setAttributeNS(null, 'cy', pos.y)
					ellipse.setAttributeNS(null, 'rx', 4)
					ellipse.setAttributeNS(null, 'ry', 2.8)
					ellipse.setAttribute('class', 'armyPathLinePoint')
					ellipse.setAttribute('data-id', Template.currentData()._id)
					$('#armyPaths').append(ellipse)

					first = false
				})

				var path = document.createElementNS('http://www.w3.org/2000/svg',"path")
				path.setAttributeNS(null, "d", d);
				path.setAttribute('class', 'armyPathLine')
				path.setAttribute('data-id', Template.currentData()._id)
				$('#armyPaths').append(path)
			}
		}
	})
}


Template.army.destroyed = function() {
	removeArmyPathHighlights(Template.currentData()._id)
}


draw_army_highlight = function(army_id) {
	check(army_id, String)
	$('.army_highlight[data-id='+army_id+']').show()
}


remove_army_highlights = function() {
	$('.army_highlight').hide()
}
