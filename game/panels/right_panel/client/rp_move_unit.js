Template.rp_move_unit.helpers({
	castle_or_village: function() {
		var selected_type = Session.get('selected_type')
		return (selected_type == 'castle' || selected_type == 'village')
	},

	current_move: function() {
		var self = this
		var from = get_from_coords()
		if (from) {
			var mouseover_hex_id = Session.get('mouseover_hex_id')
			var to = id_to_coords(mouseover_hex_id, 'hex')
			if (to) {
				var distance = Hx.hexDistance(from.x, from.y, to.x, to.y)
				var army_speed = Template.instance().armySpeed.get()
				var duration = ms_to_short_time_string(army_speed * distance * 1000 * 60)
				return {from_x:from.x, from_y:from.y, to_x:to.x, to_y:to.y, distance:distance, duration:duration, num:length_of_queue()+1}
			}
		}
		return false
	},

	queued_moves: function() {
		var self = this
		var moves = get_unit_moves()
		var army_speed = Template.instance().armySpeed.get()
		var index = 0
		moves = _.map(moves, function(move) {
			move.distance = Hx.hexDistance(move.from_x, move.from_y, move.to_x, move.to_y)
			move.duration = ms_to_short_time_string(army_speed * move.distance * 1000 * 60)
			move.index = index
			move.num = index+1
			index++
			return move
		})
		return moves
	},

	total_distance: function() {
		return Template.instance().totalDistance.get()
	},

	total_duration: function() {
		return duration = ms_to_short_time_string(Template.instance().armySpeed.get() * Template.instance().totalDistance.get() * 1000 * 60)
	},

	arrive_time: function() {
		return moment(new Date()).add(Template.instance().armySpeed.get() * Template.instance().totalDistance.get() * 1000 * 60, 'ms').toDate()
	},

	final_destination: function() {
		var final_move = ''

		// last move in queue
		var moves = get_unit_moves()
		if (moves && moves.length > 0) {
			var last_move = moves[moves.length-1]
			final_move = last_move.to_x+','+last_move.to_y
		}

		return final_move
	},

	queue_not_empty: function() {
		return (length_of_queue() > 0)
	},

	num_units: function(type) {
		return get_selected_unit(type)
	},

	// TODO: do this next meteor version
	max_units: function(type) {
		return Template.parentData(1)[type]
	}
})

Template.rp_move_unit.events({
	'click #move_unit_cancel_button': function(event, template) {
		Session.set('rp_template', 'rp_info_'+Session.get('selected_type'))
	},

	'click .remove_move_button': function(event, template) {
		var button = event.currentTarget
		var index = Number($(button).attr('data-index'))
		remove_move_from_queue(index)
	},

	'input .send_units_slider, change .send_units_slider': function(event, template) {
		var type = $(event.currentTarget).attr('data-type')
		var num = Number(event.currentTarget.value)
		set_selected_unit(type, num)
	},

	'click #move_unit_button': function(event, template) {
		var selected_type = Session.get('selected_type')

		if (selected_type == 'castle' || selected_type == 'village') {
			var alert = template.find('#send_army_error')

			var num = num_selected_units()
			if (num == 0) {
				$(alert).show()
				return false
			}

			var moves = get_unit_moves()
			if (moves.length == 0) {
				return false
			}

			Meteor.call('create_army_from_building', get_selected_units(), selected_type, Session.get('selected_id'), get_unit_moves())
			Session.set('rp_template', 'rp_info_'+selected_type)
		}

		if (selected_type == 'army') {
			var moves = get_unit_moves()
			if (moves.length == 0) {
				return false
			}

			Meteor.call('create_moves', this._id, get_unit_moves())
			Session.set('rp_template', 'rp_info_army')
		}
	},
})



Template.rp_move_unit.created = function() {
	var self = this

	Session.set('mouse_mode', 'finding_path')

	// if army moves to a new hex while player is making a move
	// update the queued moves with the army's new position
	self.autorun(function() {
		if (Template.currentData()) {
			update_first_move_to_new_army_position(Template.currentData().x, Template.currentData().y)
		}
	})

	// army speed
	self.armySpeed = new ReactiveVar(0)
	self.autorun(function() {
		switch(Session.get('selected_type')) {
			case 'army':
				var speed = speed_of_army(Template.currentData())
				break
			case 'castle':
			case 'village':
				var speed = speed_of_army(get_selected_units())
				break
		}
		self.armySpeed.set(speed)
	})

	self.totalDistance = new ReactiveVar(0)
	self.autorun(function() {
		var distance = 0

		var from = get_from_coords()
		if (from) {
			var mouseover_hex_id = Session.get('mouseover_hex_id')
			var to = id_to_coords(mouseover_hex_id, 'hex')
			if (to) {
				distance += Hx.hexDistance(from.x, from.y, to.x, to.y)
			}
		}

		_.each(get_unit_moves(), function(move) {
			distance += Hx.hexDistance(move.from_x, move.from_y, move.to_x, move.to_y)
		})

		self.totalDistance.set(distance)
	})

	// update from coords when army moves
	// should only happen if there are no queued moves
	// if there are queued moves then from should stay from the last queued move's to
	self.autorun(function() {
		var moves = get_unit_moves()
		if (moves.length == 0) {
			if (Template.currentData()) {
				set_from_coords(Template.currentData().x, Template.currentData().y)
			}
		}
	})

	self.autorun(function() {
		hex_remove_highlights()
		remove_castle_highlights()
		remove_village_highlights()

		// highlight queued moves
		var moves = get_unit_moves()
		_.each(moves, function(move) {
			highlight_hex_path(move.from_x, move.from_y, move.to_x, move.to_y)
		})

		// highlight current move
		var from = get_from_coords()
		if (from) {
			var to = id_to_coords(Session.get('mouseover_hex_id'), 'hex')
			if (to) {
				highlight_hex_path(from.x, from.y, to.x, to.y)
			}
		}
	})
}


Template.rp_move_unit.rendered = function() {
	var self = this
	_.each(s.army.types, function(type) {
		set_selected_unit(type, 0)

		this.$('.send_units_slider[data-type='+type+']').attr('max', Template.currentData()[type])
		this.$('.send_units_slider[data-type='+type+']').attr('min', 0)

		if (Template.currentData()[type] == 0) {
			this.$('.send_units_slider[data-type='+type+']').prop('disabled', true)
		} else {
			this.$('.send_units_slider[data-type='+type+']').prop('disabled', false)
		}
	})
}


Template.rp_move_unit.destroyed = function() {
	Session.set('mouse_mode', 'default')

	clear_unit_moves()
}




// called in hex and castle
click_on_tile_while_finding_path = function() {
	var target_id = Session.get('mouseover_hex_id')
	var target_coords = id_to_coords(target_id, 'hex')

	// can't click on starting point
	if (JSON.stringify(target_coords) === JSON.stringify(get_from_coords())) {
		return false
	}

	add_move_to_queue(target_coords.x, target_coords.y)
}







var from_coords = null
var from_coords_dep = new Deps.Dependency
var get_from_coords = function() {
	from_coords_dep.depend()
	if (from_coords) {
		return cloneObject(from_coords)
	} else {
		return false
	}
}

// if player has already queued some moves
// from should be from the to of the last move
// otherwise it should be from army position
var set_from_coords = function(x, y) {
	check(x, validNumber)
	check(y, validNumber)
	from_coords = {x:x, y:y}
	from_coords_dep.changed()
}

var add_move_to_queue = function(x, y) {
	check(x, validNumber)
	check(y, validNumber)
	var from = get_from_coords()
	add_unit_move(from.x, from.y, x, y)
}





var add_unit_move = function(from_x, from_y, to_x, to_y) {
	check(from_x, validNumber)
	check(from_y, validNumber)
	check(to_x, validNumber)
	check(to_y, validNumber)

	unit_moves.push({
		from_x:from_x,
		from_y:from_y,
		to_x:to_x,
		to_y:to_y,
	})
	unit_moves_dep.changed()

	set_from_coords(to_x, to_y)
}




var unit_moves = []
var unit_moves_dep = new Deps.Dependency

var update_first_move_to_new_army_position = function(x,y) {
	if (unit_moves && unit_moves[0]) {
		if (unit_moves[0].from_x != x || unit_moves[0].from_y != y) {
			unit_moves[0].from_x = x
			unit_moves[0].from_y = y
			unit_moves_dep.changed()
		}
	}
}

var get_unit_moves = function() {
	unit_moves_dep.depend()
	return cloneArray(unit_moves)
}

var clear_unit_moves = function() {
	unit_moves = []
	unit_moves_dep.changed()
	from_coords = null
	from_coords_dep.changed()
}

var length_of_queue = function() {
	unit_moves_dep.depend()
	return unit_moves.length
}

var remove_move_from_queue = function(index) {
	check(index, validNumber)

	// remove first
	if (index == 0 && unit_moves.length > 1) {
		var from_x = unit_moves[index].from_x
		var from_y = unit_moves[index].from_y

		unit_moves[index+1].from_x = from_x
		unit_moves[index+1].from_y = from_y
	}

	// remove middle
	if (index > 0 && unit_moves.length > index+1) {
		var prev_move = unit_moves[index-1]

		// set next move
		unit_moves[index+1].from_x = prev_move.to_x
		unit_moves[index+1].from_y = prev_move.to_y
	}

	// remove last
	if (index != 0 && index+1 == unit_moves.length) {
		var prev = unit_moves[index-1]
		set_from_coords(prev.to_x, prev.to_y)
	}

	// remove only
	if (index == 0 && unit_moves.length == 1) {
		set_from_coords(unit_moves[0].from_x, unit_moves[0].from_y)
	}

	unit_moves.splice(index, 1)
	unit_moves_dep.changed()
}






ms_to_short_time_string = function(ms) {
	var dur = moment.duration(ms)

	var days = dur.days()
	var hours = dur.hours()
	var minutes = dur.minutes()

	var string = 0
	if (minutes > 0) {
		string = minutes + 'm '
	}
	if (hours > 0) {
		string = hours + 'h ' + string
	}
	if (days > 0) {
		string = days + 'd ' + string
	}

	return string
}
