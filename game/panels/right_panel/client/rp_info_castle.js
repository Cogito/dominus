Template.rp_info_castle.helpers({
	battle: function() {
		return Battles.findOne({x:this.x, y:this.y})
	},
	
	image_radio_is_checked: function() {
		if (UI._parentData(1).image == this.toString()) {
			return 'checked'
		}
	},

	more_than_one_owned_image: function() {
		var user = Meteor.users.findOne(Meteor.userId(), {fields: {'purchases.castles':1}})
		if (user && user.purchases && user.purchases.castles) {
			return user.purchases.castles.length > 1
		}
	},

	owned_images: function() {
		var user = Meteor.users.findOne(Meteor.userId(), {fields: {'purchases.castles':1}})
		if (user && user.purchases && user.purchases.castles) {
			return user.purchases.castles
		}
	},

	image_name: function(id) {
		return _store.castles[id].name
	},

	is_owner: function() {
		if (this.user_id == Meteor.userId()) {
			return true
		} else {
			return false
		}
	},

	no_soldiers: function() {
		var self = this
		var count = 0

		_.each(s.army.types, function(type) {
			count += self[type]
		})

		return (count == 0)
	},

	resources_per_interval: function() {
		var res = {
			gold:s.resource.gold_gained_at_castle,
			grain:0,
			lumber:0,
			ore:0,
			wool:0,
			clay:0,
			glass:0
		}

		var hexes = Hx.getSurroundingHexes(this.x, this.y, s.resource.num_rings_castle)
		_.each(hexes, function(hex) {
			var h = Hexes.findOne({x:hex.x, y:hex.y}, {fields:{type:1, large:1}})
			if (h) {
				if (h.large) {
					res[h.type] += s.resource.gained_at_hex * s.resource.large_resource_multiplier
				} else {
					res[h.type] += s.resource.gained_at_hex
				}
			}
		})

		return res
	},

	is_vassal: function() {
		var res = Meteor.users.findOne(Meteor.userId(), {fields: {vassals: 1}})
		if (res) {
			if (_.indexOf(res.vassals, this.user_id) != -1) {
				return true
			}
		}
		return false
	},

	is_ally_below: function() {
		var res = Meteor.users.findOne(Meteor.userId(), {fields: {allies_below: 1}})
		if (res) {
			if (_.indexOf(res.allies_below, this.user_id) != -1) {
				return true
			}
		}
		return false
	},

	is_lord: function() {
		var res = Meteor.users.findOne(Meteor.userId(), {fields: {lord: 1}})
		if (res) {
			if (this.user_id == res.lord) {
				return true
			}
		}
		return false
	},

	interval: function() {
		return moment.duration(s.resource.interval).humanize()
	},

	dupes: function() {
		return Session.get('dupes')
	},

	user: function() {
		return Meteor.users.findOne(this.user_id)
	}
})



Template.rp_info_castle.events({
	'click #send_army_from_castle_button': function(event, template) {
		Session.set('rp_template', 'rp_move_unit')
	},

	'click #hire_army_from_castle_button': function(event, template) {
		Session.set('rp_template', 'rp_hire_army_from_castle')

	},

	'click #send_gold_button': function(event, template) {
		Session.set('rp_template', 'rp_send_gold')
	},

	'change .image_radios': function(event, template) {
		var castle_id = UI._templateInstance().data._id
		Meteor.call('set_unit_image', castle_id, 'castles', this.toString())
	}
})


Template.rp_info_castle.rendered = function() {
	var self = this

	Session.set('mouse_mode', 'default')
	Session.set('update_highlight', Random.fraction())

	logevent('right_panel', 'open', 'info_castle')

	this.autorun(function() {
		Session.set('dupes', [])

		// can't use self.data here because it does change if you have a castle selected and you click on another castle
		// the template wasn't destroyed so self.data doesn't update
		var castle = Castles.findOne(Session.get('selected_id'), {fields: {user_id:1}})
		if (castle) {
			Meteor.call('get_duplicate_users', castle.user_id, function(error, result) {
				if (!error) {
					Session.set('dupes', result)
				}
			})

			// get networth, income... for right panel
			Meteor.subscribe('castle_user', castle.user_id)

			Meteor.subscribe('battle_notifications_at_hex', castle.x, castle.y)
		}
	})

}
