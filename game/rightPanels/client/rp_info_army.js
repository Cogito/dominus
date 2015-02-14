Template.rp_info_army.helpers({
	unitRelationType: function() {
		if (Template.instance()) {
			var type = Template.instance().relationship.get()
			if (type && type != 'mine') {
				return getNiceRelationType(type)
			}
		}
	},

	offensePower: function() {
		if (Template.instance()) {
			var power = Template.instance().power.get()
			if (power) {
				return power.offense
			}
		}
	},

	defensePower: function() {
		if (Template.instance()) {
			var power = Template.instance().power.get()
			if (power) {
				return power.defense
			}
		}
	},

	infoLoaded: function() {
		return Session.get('rightPanelInfoLoaded')
	},

	battleInfoReady: function() {
		return Template.instance().battleInfoReady.get()
	},

	battle: function() {
		if (this) {
			return Battles.findOne({x:this.x, y:this.y, isOver:false})
		}
	},

	moves: function() {
		return Template.instance().moves.get()
	},

	is_moving: function() {
		return (Template.instance().moves.get().length > 0)
	},

	total_distance: function() {
		return Template.instance().totalDistance.get()
	},

	total_duration: function() {
		return ms_to_short_time_string(Template.instance().totalDuration.get())
	},

	has_enough_to_split: function() {
		if (this) {
			var self = this

			var count = 0
			_.each(s.army.types, function(type) {
				count += self[type]
			})

			return (count > 1)
		}
	},

	is_owner: function() {
		if (this && this.user_id == Meteor.userId()) {
			return true
		}
	},

	next_move_at: function() {
		Session.get('refresh_time_field')
		var move = Template.instance().moves.get()[0]
		if (move) {
			var army_speed = Template.instance().speed.get()
			var move_time = moment(new Date(move.last_move_at)).add(army_speed, 'minutes')
			if (move_time < moment()) {
				return 'soon'
			} else {
				return move_time.fromNow()
			}
		}
	},

	reach_destination_at: function() {
		if (this) {
			var self = this
			Session.get('refresh_time_field')
			var moves = Template.instance().moves.get()

			if (moves.length == 0) {
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

			var army_speed = Template.instance().speed.get()
			var move_time = moment(new Date(last_move_at)).add(distance * army_speed, 'minutes')
			if (move_time < moment()) {
				return 'soon'
			} else {
				return move_time.fromNow()
			}
		}
	},

	is_another_army_here: function() {
		if (this) {
			if (Armies.find({user_id: Meteor.userId(), x: this.x, y: this.y}).count() > 1) {
				return true
			}
		}
	},


	is_on_grain_hex: function() {
		var hex = Hexes.findOne({x:this.x, y:this.y}, {fields: {type:1}})
		if (hex && hex.type == 'grain') {
			if (Castles.find({x:this.x, y:this.y}, {reactive:false}).count() == 0) {
				if (Villages.find({x:this.x, y:this.y}).count() == 0) {
					return true
				}
			}
		}
	},

	is_on_village: function() {
		var user = Template.instance().userData.get()
		var village = Villages.findOne({x:this.x, y:this.y, user_id:user._id, under_construction:false})
		if (village) {
			return true
		}
	},

	has_enough_grain: function() {
		var user = Template.instance().userData.get()
		if (user && user.grain >= s.village.cost.level1.grain) {
			return true
		}
	},

	has_enough_lumber: function() {
		var user = Template.instance().userData.get()
		if (user && user.lumber >= s.village.cost.level1.lumber) {
			return true
		}
	},

	has_enough_ore: function() {
		var user = Template.instance().userData.get()
		if (user && user.ore >= s.village.cost.level1.ore) {
			return true
		}
	},

	has_enough_wool: function() {
		var user = Template.instance().userData.get()
		if (user && user.wool >= s.village.cost.level1.wool) {
			return true
		}
	},

	has_enough_clay: function() {
		var user = Template.instance().userData.get()
		if (user && user.clay >= s.village.cost.level1.clay) {
			return true
		}
	},

	has_enough_glass: function() {
		var user = Template.instance().userData.get()
		if (user && user.glass >= s.village.cost.level1.glass) {
			return true
		}
	},

	how_many_villages_can_i_build: function() {
		return s.village.max_can_have - Session.get('num_villages')
	},

	has_less_than_max_villages: function() {
		return (Session.get('num_villages') < s.village.max_can_have)
	},

	villageWorth: function() {
		return Template.instance().worthOfHex.get()
	},


})



Template.rp_info_army.events({
	'click #join_village_button': function(event, template) {
		Meteor.call('army_join_building', this._id)
	},

	'click #disband_army_button': function(event, template) {
		Session.set('rp_template', 'rp_disband_army_confirm')
	},

	'click #move_army_button': function(event, template) {
		Session.set('addToExistingArmyMoves', false)
		Session.set('rp_template', 'rp_move_unit')
	},

	'click #return_to_castle_button': function(event, template) {
		Meteor.call('returnToCastle', this._id)
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
				$(alert).html(error.error)
				$(button).attr('disabled', false)
				$(button).html(button_html)
			} else {
				Session.set('selected_type', 'village')
				Session.set('selected_id', result)
			}
		})
	},

	'click .remove_move_button': function(event, template) {
		Meteor.call('remove_move', this._id, this.index)
	},

	'click #addMoveButton': function(event, template) {
		var moves = Moves.find({army_id:template.data._id}, {sort:{index:1}})
		var movesArray = []
		if (moves.count() > 0) {
			moves.forEach(function(move) {
				movesArray.push({from_x:move.from_x, from_y:move.from_y, to_x:move.to_x, to_y:move.to_y, index:move.index})
			})
			Session.set('addToExistingArmyMoves', movesArray)
		} else {
			Session.set('addToExistingArmyMoves', false)
		}

		Session.set('rp_template', 'rp_move_unit')
	}
})



Template.rp_info_army.created = function() {
	var self = this
	self.subs = new ReadyManager()

	self.autorun(function() {
		if (Template.currentData()) {
			self.subs.subscriptions([{
				groupName: 'rightPanelTree',
				subscriptions: [ Meteor.subscribe('rightPanelTree', Template.currentData().user_id).ready() ]
			}, {
				groupName: 'rightPanelUser',
				subscriptions: [ Meteor.subscribe('rightPanelUser', Template.currentData().user_id).ready() ]
			}])
		}
	})

	self.worthOfHex = new ReactiveVar(0)
	self.autorun(function() {
		if (Template.currentData()) {
			Meteor.call('getWorthOfHex', Template.currentData().x, Template.currentData().y, function(error, worth) {
				self.worthOfHex.set(worth + s.resource.gold_gained_at_village)
			})
		}
	})

	self.gamePiecesAtHexLoaded = new ReactiveVar(false)
	//self.armyUserLoaded = new ReactiveVar(false)
	self.autorun(function() {
		if (Template.currentData()) {
			var handle = Meteor.subscribe('gamePiecesAtHex', Template.currentData().x, Template.currentData().y)
			self.gamePiecesAtHexLoaded.set(handle.ready())

			// if (Template.currentData().user_id == Meteor.userId()) {
			// 	self.armyUserLoaded.set(true)
			// } else {
			// 	// this is used to tell if castle/village in this hex is our ally
			// 	var castleUserHandle = Meteor.subscribe('rightPanelUser', Template.currentData().user_id)
			// 	self.armyUserLoaded.set(castleUserHandle.ready())
			// }
		}
	})

	// set army speed
	// check for selected type keeps it from erroring when selecting army then a hex
	self.speed = new ReactiveVar(0)
	self.autorun(function() {
		if (Template.currentData() && Session.get('selected_type') == 'army') {
			self.speed.set(speed_of_army(Template.currentData()))
		}
	})


	// used to tell if army can build village
	self.userData = new ReactiveVar(null)
	this.autorun(function() {
		var userId = Meteor.userId()
		if (Template.currentData() && Template.currentData().user_id == userId) {
			var fields = {}
			_.each(s.resource.types, function(type) {
				fields[type] = 1
			})
			var user = Meteor.users.findOne(userId, {fields: fields})
			if (user) {
				self.userData.set(user)
			}
		}
	})


	self.moves = new ReactiveVar(null)
	self.totalDistance = new ReactiveVar(0)
	self.totalDuration = new ReactiveVar(0)
	self.autorun(function() {
		if (Template.currentData()) {
			var moves = Moves.find({army_id:Template.currentData()._id})
			var index = 0
			var totalDistance = 0
			var totalDuration = 0
			moves = moves.map(function(move) {
				move.distance = Hx.hexDistance(move.from_x, move.from_y, move.to_x, move.to_y)
				check(move.distance, validNumber)
				totalDistance += move.distance
				var dur = self.speed.get() * move.distance * 1000 * 60
				check(dur, validNumber)
				move.duration = ms_to_short_time_string(dur)
				totalDuration += dur
				move.index = index
				move.num = index+1
				index++
				return move
			})
			self.moves.set(moves)
			self.totalDistance.set(totalDistance)
			self.totalDuration.set(totalDuration)
		}
	})


	self.battleInfoReady = new ReactiveVar(false)
	self.autorun(function() {
		if (Template.currentData()) {
			var handle = Meteor.subscribe('battle_notifications_at_hex', Template.currentData().x, Template.currentData().y)
			self.battleInfoReady.set(handle.ready())
		}
	})


	self.autorun(function() {
		if (Template.currentData()) {
			Meteor.subscribe('army_moves', Template.currentData()._id)

			Session.set('mouse_mode', 'default')
			Session.set('update_highlight', Random.fraction())

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
		}
	})


	// offense and defense power
	self.power = new ReactiveVar(null)
	self.autorun(function() {
		if (Template.currentData() && self.gamePiecesAtHexLoaded.get() && Template.currentData().user_id) {
			var basePower = getUnitBasePower(Template.currentData())

			Meteor.call('getUnitLocationBonusMultiplier', Template.currentData(), 'army', function(error, locationMultiplier) {
				var power = {
					offense: basePower.offense.total * locationMultiplier,
					defense: basePower.defense.total * locationMultiplier
				}

				self.power.set(power)
			})
		}
	})



	self.relationship = new ReactiveVar(null)
	self.autorun(function() {
		if (Template.currentData() && Template.currentData().user_id) {
			Tracker.nonreactive(function() {
				self.relationship.set(getUnitRelationType(Template.currentData().user_id))
			})
		}
	})


	// add this player's units to minimap
	self.autorun(function() {
		if (Template.currentData() && Template.currentData().user_id) {
			Meteor.subscribe('user_buildings_for_minimap', Template.currentData().user_id)
		}
	})

}
