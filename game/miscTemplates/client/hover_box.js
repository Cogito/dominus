Template.hover_box.helpers({
	draw: function() {
		if (Session.get('hover_on_object') || Session.get('hover_on_hover_box')) {
			return true
		}
		return false
	},

	left: function() {
		var x = Session.get('hover_box_data').x
		var y = Session.get('hover_box_data').y

		check(x, validNumber)
		check(y, validNumber)

		var grid = Hx.coordinatesToPos(x, y, s.hex_size, s.hex_squish)

		var offset = 0

		if (Session.get('hover_box_data').type == 'army') {
			offset = -10

		} else if (Session.get('hover_box_data').type == 'castle') {
			offset = -40

		} else if (Session.get('hover_box_data').type == 'village') {
			offset = -40
		}

		// this is outside of #hexes so it needs to be scaled
		var x = grid.x * Session.get('hexScale')

		return Session.get('hexes_pos').x + x + offset
	},

	top: function() {
		var x = Session.get('hover_box_data').x
		var y = Session.get('hover_box_data').y

		check(x, validNumber)
		check(y, validNumber)

		var grid = Hx.coordinatesToPos(x, y, s.hex_size, s.hex_squish)

		var offset = 0

		if (Session.get('hover_box_data').type == 'army') {
			offset = 35

		} else if (Session.get('hover_box_data').type == 'castle') {
			offset = -50

		} else if (Session.get('hover_box_data').type == 'village') {
			offset = -50
		}

		// this is outside of #hexes so it needs to be scaled
		var y = grid.y * Session.get('hexScale')

		return Session.get('hexes_pos').y + y + offset
	},

	objects: function() {
		if (Meteor.userId()) {
			var fields = {
				username:1,
				user_id:1,
				name:1
			}

			_.each(s.army.types, function(type) {
				fields[type] = 1
			})

			if (Session.get('hover_box_data').type == 'army') {
				var res = Armies.find({x: Session.get('hover_box_data').x, y: Session.get('hover_box_data').y}, {fields: fields})

			} else if (Session.get('hover_box_data').type == 'castle') {
				var res = Castles.find({x: Session.get('hover_box_data').x, y: Session.get('hover_box_data').y}, {fields: fields})

			}  else if (Session.get('hover_box_data').type == 'village') {
				var res = Villages.find({x: Session.get('hover_box_data').x, y: Session.get('hover_box_data').y}, {fields: fields})
			}


			// units, username and type
			res = res.map(function(object) {
				var units = ''

				_.each(s.army.types, function(type) {
					if (object[type] && object[type] > 0) {
						units += _.capitalize(type)+': '+round_number(object[type])+' &nbsp;'
					}
				})

				object.units = units

				object.type = Session.get('hover_box_data').type

				return object
			})



			// flag type
			var user = Meteor.users.findOne(Meteor.userId(), {fields: {lord:1, allies_above:1, allies_below:1, team:1, king:1, vassals:1}})
			if (user) {
				res = res.map(function(object) {
					if (object.user_id == user._id) {
						object.flag_type = 'mine'
						object.flag_name = 'Mine'
					} else if (_.indexOf(user.team, object.user_id) != -1) {

						if (_.indexOf(user.allies_above, object.user_id) != -1) {

							var oUser = Meteor.users.findOne(object.user_id, {fields: {is_dominus:1}})

							if (oUser && oUser.is_dominus) {
								object.flag_type = 'dominus'
								object.flag_name = 'Dominus'
							} else if (object.user_id == user.king) {
								object.flag_type = 'king'
								object.flag_name = 'King'
							} else if (object.user_id == user.lord) {
								object.flag_type = 'lord'
								object.flag_name = 'Lord'
							} else {
								object.flag_type = 'above'
								object.flag_name = 'Upper Lord'
							}

						} else if (_.indexOf(user.allies_below, object.user_id) != -1) {

							if (_.indexOf(user.vassals, object.user_id) != -1) {
								object.flag_type = 'vassal'
								object.flag_name = 'Vassal'
							} else {
								object.flag_type = 'below'
								object.flag_name = 'Lower Vassal'
							}

						} else {
							object.flag_type = 'team'
							object.flag_name = 'Enemy Ally'
						}

					} else {
						object.flag_type = 'foe'
						object.flag_name = 'Enemy'
					}

					return object

				})
			}

			return res
		}
	}
})



Template.hover_box.events({
	'mouseenter #hover_box': function(event, template) {
		Meteor.clearTimeout(Session.get('hover_on_object_timer'))
		Session.set('hover_on_hover_box', true)
		Session.set('hover_on_object', false)
	},

	'mouseleave #hover_box': function(event, template) {
		Meteor.clearTimeout(Session.get('hover_on_object_timer'))
		Session.set('hover_on_hover_box', false)
	},

	'click .hover_box_object_link': function(event, template) {
		var data = Session.get('hover_box_data')
		var id = event.currentTarget.getAttribute('data-id')
		Session.set('selected_type', data.type)
		Session.set('selected_id', id)
		Session.set('selected_coords', {x:data.x, y:data.y})
		Session.set('hover_on_hover_box', false)
	}
})


// flag box
Session.setDefault('hover_box_data', null)
Session.setDefault('hover_on_object', false)
Session.setDefault('hover_on_hover_box', false)
Session.setDefault('draw_hover_box', false)
Session.setDefault('hover_on_object_timer', null)
