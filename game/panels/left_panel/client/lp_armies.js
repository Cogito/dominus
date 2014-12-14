Template.lp_armies.helpers({
	armies: function() {
		return LeftPanelArmies.find({}, {sort: {name: 1}})
	},
})


Template.lp_army.helpers({
	onAllyBuilding: function() {
		var castle = Castles.findOne({x:this.x, y:this.y})
		if (castle) {
			var relationship = getUnitRelationType(castle)
			if (relationship == 'mine' || relationship == 'vassal') {
				return true
			}
		}

		var village = Villages.findOne({x:this.x, y:this.y})
		if (village) {
			var relationship = getUnitRelationType(village)
			if (relationship == 'mine' || relationship == 'vassal') {
				return true
			}
		}
	},

	inBattle: function() {
		return Battles.findOne({x:this.x, y:this.y}, {fields: {_id:1}})
	},

	unit_count: function() {
		var self = this
		var unit_count = 0
		_.each(s.army.types, function(type) {
			unit_count += self[type]
		})
		return unit_count
	},

	time_to_destination: function() {
		Session.get('refresh_time_field')
		var time_to_destination = null

		var moves = Moves.find({army_id:this._id})
		if (moves.count() > 0) {
			this.is_moving = true
			var army_speed = speed_of_army(this)

			var distance = 0
			var last_move_at
			moves.forEach(function(move) {
				if (move.index == 0) {
					var d = Hx.hexDistance(this.x, this.y, move.to_x, move.to_y)
					last_move_at = move.last_move_at
				} else {
					var d = Hx.hexDistance(move.from_x, move.from_y, move.to_x, move.to_y)
				}
				distance += d
			})

			var move_time = moment(new Date(last_move_at)).add(distance * army_speed, 'minutes')
			if (move_time < moment()) {
				time_to_destination = 'soon'
			} else {
				time_to_destination = move_time.fromNow()
			}
		}

		return time_to_destination
	}
})


Template.lp_armies.created = function() {
	this.autorun(function() {
		Meteor.subscribe('left_panel_armies')
		Meteor.subscribe('user_moves')
	})
}

Template.lp_army.created = function() {
	if (Template.currentData()) {
		Meteor.subscribe('battle_notifications_at_hex', Template.currentData().x, Template.currentData().y)
		Meteor.subscribe('gamePiecesAtHex', Template.currentData().x, Template.currentData().y)
	}
}