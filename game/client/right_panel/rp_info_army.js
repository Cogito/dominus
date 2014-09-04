Template.rp_info_army.helpers({
	battle: function() {
		return Battles.findOne({x:this.x, y:this.y})
	},

	moves: function() {
		var self = this

		var moves = Moves.find({army_id:self._id})
		var army_speed = speed_of_army(self)
		var index = 0
		moves = moves.map(function(move) {
			move.distance = Hx.hexDistance(move.from_x, move.from_y, move.to_x, move.to_y)
			move.duration = ms_to_short_time_string(army_speed * move.distance * 1000 * 60)
			move.index = index
			move.num = index+1
			index++
			return move
		})
		return moves
	},

	is_moving: function() {
		var self = this
		return (Moves.find({army_id:self._id}).count() > 0)
	},

	total_distance: function() {
		var self = this
		var distance = 0

		var moves = Moves.find({army_id:self._id})
		moves.forEach(function(move) {
			distance += Hx.hexDistance(move.from_x, move.from_y, move.to_x, move.to_y)
		})

		return distance
	},

	total_duration: function() {
		var self = this
		var distance = 0
		var army_speed = speed_of_army(self)

		var moves = Moves.find({army_id:self._id})
		moves.forEach(function(move) {
			distance += Hx.hexDistance(move.from_x, move.from_y, move.to_x, move.to_y)
		})

		var duration = ms_to_short_time_string(army_speed * distance * 1000 * 60)
		return duration
	},

	has_enough_to_split: function() {
		var self = this

		var count = 0
		_.each(s.army.types, function(type) {
			count += self[type]
		})

		return (count > 1)
	},

	is_owner: function() {
		if (this.user_id == Meteor.userId()) {
			return true
		} else {
			return false
		}
	},

	next_move_at: function() {
		Session.get('refresh_time_field')
		var move = Moves.findOne({army_id:this._id, index:0})
		if (move) {
			var army_speed = speed_of_army(this)
			var move_time = moment(new Date(move.last_move_at)).add('minutes', army_speed)
			if (move_time < moment()) {
				return 'soon'
			} else {
				return move_time.fromNow()
			}
		}
	},

	reach_destination_at: function() {
		var self = this
		Session.get('refresh_time_field')
		var moves = Moves.find({army_id:self._id}, {sort:{index:1}})

		if (moves.count() == 0) {
			return 0
		}

		var distance = 0
		var last_move_at
		moves.forEach(function(move) {
			if (move.index == 0) {
				var d = Hx.hexDistance(self.x, self.y, move.to_x, move.to_y)
				last_move_at = move.last_move_at
			} else {
				var d = Hx.hexDistance(move.from_x, move.from_y, move.to_x, move.to_y)
			}
			distance += d
		})

		var army_speed = speed_of_army(self)
		var move_time = moment(new Date(last_move_at)).add('minutes', distance * army_speed)
		if (move_time < moment()) {
			return 'soon'
		} else {
			return move_time.fromNow()
		}
	},

	is_another_army_here: function() {
		if (Armies.find({user_id: Meteor.userId(), x: this.x, y: this.y}).count() > 1) {
			return true
		} else {
			return false
		}
	},


	is_on_grain_hex: function() {
		var hex = Hexes.findOne({x:this.x, y:this.y}, {fields: {type:1}})
		if (hex && hex.type == 'grain') {
			if (Castles.find({x:this.x, y:this.y}).count() == 0) {
				if (Villages.find({x:this.x, y:this.y}).count() == 0) {
					return true
				}
			}
		} else {
			return false
		}
	},

	is_on_village: function() {
		var num_villages = Villages.find({x:this.x, y:this.y}).count()
		if (num_villages && num_villages > 0) {
			return true
		} else {
			return false
		}
	},

	village_cost: function() {
		return s.village.cost
	},

	has_enough_grain: function() {
		var user = Meteor.users.findOne(Meteor.userId(), {fields: {grain:1}})
		if (user && user.grain >= s.village.cost.grain) {
			return true
		} else {
			return false
		}
	},

	has_enough_lumber: function() {
		var user = Meteor.users.findOne(Meteor.userId(), {fields: {lumber:1}})
		if (user && user.lumber >= s.village.cost.lumber) {
			return true
		} else {
			return false
		}
	},

	has_enough_ore: function() {
		var user = Meteor.users.findOne(Meteor.userId(), {fields: {ore:1}})
		if (user && user.ore >= s.village.cost.ore) {
			return true
		} else {
			return false
		}
	},

	has_enough_wool: function() {
		var user = Meteor.users.findOne(Meteor.userId(), {fields: {wool:1}})
		if (user && user.wool >= s.village.cost.wool) {
			return true
		} else {
			return false
		}
	},

	has_enough_clay: function() {
		var user = Meteor.users.findOne(Meteor.userId(), {fields: {clay:1}})
		if (user && user.clay >= s.village.cost.clay) {
			return true
		} else {
			return false
		}
	},

	has_enough_glass: function() {
		var user = Meteor.users.findOne(Meteor.userId(), {fields: {glass:1}})
		if (user && user.glass >= s.village.cost.glass) {
			return true
		} else {
			return false
		}
	},

	how_many_villages_can_i_build: function() {
		return s.village.max_can_have - Session.get('num_villages')
	},

	has_less_than_max_villages: function() {
		return (Session.get('num_villages') < s.village.max_can_have)
	},

	max_villages_can_have: function() {
		return s.village.max_can_have
	}
})



Template.rp_info_army.events({
	'click #join_village_button': function(event, template) {
		Meteor.call('army_join_building', this._id)
	},

	'click #disband_army_button': function(event, template) {
		Session.set('rp_template', 'rp_disband_army_confirm')
	},

	'click #move_army_button': function(event, template) {
		Session.set('rp_template', 'rp_move_unit')
	},

	'click #return_to_castle_button': function(event, template) {
		var castle = Castles.findOne({user_id: Meteor.userId()})
		if (castle) {
			if (this.x == castle.x && this.y == castle.y) {
				Meteor.call('army_join_building', this._id)
			} else {
				var moves = [{
					from_x:this.x,
					from_y:this.y,
					to_x:castle.x,
					to_y:castle.y
				}]
				Meteor.call('create_moves', this._id, moves)
			}
		}
	},

	'click #stop_movement_button': function(event, template) {
		Meteor.call('remove_all_moves', this._id)
	},

	'click #combine_armies_button': function(event, template) {
		Meteor.call('combine_armies', this._id)
	},

	'click #split_armies_button': function(event, template) {
		Session.set('rp_template', 'rp_split_armies')
	},

	'click #build_village_button': function(event, template) {
		var alert = template.find('#build_village_error_alert')
		var button = template.find('#build_village_button')

		$(alert).hide()

		var button_html = $(button).html()
		$(button).attr('disabled', true)
		$(button).html('Please Wait')

		Meteor.call('build_village', this.x, this.y, function(error, result) {
			if (error) {
				$(alert).show()
				$(alert).html('Error when building village.')
				$(button).attr('disabled', false)
				$(button).html(button_html)
			} else {
				if (result.result) {
					Session.set('selected_type', 'village')
					Session.set('selected_id', result.id)
				} else {
					$(alert).show()
					$(alert).html(result.msg)
					$(button).attr('disabled', false)
					$(button).html(button_html)
				}
			}
		})
	},

	'click .remove_move_button': function(event, template) {
		Meteor.call('remove_move', this._id, this.index)
	}
})



Template.rp_info_army.rendered = function() {
	var self = this

	if (self.data) {
		this.autorun(function() {
			Meteor.subscribe('army_moves', self.data._id)
			Meteor.subscribe('battle_notifications_at_hex', self.data.x, self.data.y)
		})

		Session.set('mouse_mode', 'default')
		Session.set('update_highlight', Random.fraction())

		this.autorun(function() {
			Session.get('update_highlight')
			if (Session.get('mouse_mode') != 'finding_path') {
				if (Session.get('selected_type') == 'army') {
					var selected_id = Session.get('selected_id')
					remove_all_highlights()
					draw_army_highlight(selected_id)
					var moves = Moves.find({army_id:selected_id})
					if (moves && moves.count() > 0) {
						moves.forEach(function(move) {
							highlight_hex_path(move.from_x, move.from_y, move.to_x, move.to_y)
						})
					}
				}
			} else {
				// if army dies remove highlights
				remove_all_highlights()
			}
		})

		logevent('right_panel', 'open', 'info_army')
	}

}
