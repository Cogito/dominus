Template.rp_info_castle.helpers({
	unitRelationType: function() {
		if (Template.instance()) {
			var type = Template.instance().relationship.get()
			if (type && type != 'mine') {
				return type
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

	castleUserLoaded: function() {
		return Template.instance().castleUserLoaded.get()
	},

	castleInfoLoaded: function() {
		return Session.get('rightPanelInfoLoaded')
	},

	battleInfoLoaded: function() {
		return Template.instance().battleInfoLoaded.get()
	},

	battle: function() {
		if (this) {
			return Battles.findOne({x:this.x, y:this.y})
		}
	},
	
	image_radio_is_checked: function() {
		if (Template.parentData(1).image == this.toString()) {
			return 'checked'
		}
	},

	more_than_one_owned_image: function() {
		if (Template.instance().userData) {
			return Template.instance().userData.get().purchases.castles.length > 1
		}
	},

	owned_images: function() {
		if (Template.instance().userData) {
			return Template.instance().userData.get().purchases.castles
		}
	},

	image_name: function(id) {
		return _store.castles[id].name
	},

	is_owner: function() {
		if (Template.instance().userData && Template.currentData()) {
			if (Template.currentData().user_id == Template.instance().userData.get()._id) {
				return true
			}
		}
		return false
	},

	no_soldiers: function() {
		if (this) {
			var self = this
			var count = 0

			_.each(s.army.types, function(type) {
				count += self[type]
			})

			return (count == 0)
		}
	},

	resInfoLoaded: function() {
		return Template.instance().resInfoLoaded.get()
	},

	resources_per_interval: function() {
		return Template.instance().resInfo.get()
	},

	is_vassal: function() {
		if (Template.instance().userData && Template.currentData()) {
			var type = Template.instance().relationship.get()
			return type == 'vassal'
		}
		return false
	},

	interval: function() {
		return moment.duration(s.resource.interval).humanize()
	},

	dupes: function() {
		return Template.instance().dupes.get()
	},

	user: function() {
		if (Template.currentData()) {
			return Meteor.users.findOne(Template.currentData().user_id)
		}
	}
})



Template.rp_info_castle.events({
	'click #send_army_from_castle_button': function(event, template) {
		Session.set('rp_template', 'rp_move_unit')
	},

	'click #hire_army_from_castle_button': function(event, template) {
		Session.set('rp_template', 'rp_hire_army')

	},

	'click #send_gold_button': function(event, template) {
		Session.set('rp_template', 'rp_send_gold')
	},

	'change .image_radios': function(event, template) {
		var castle_id = UI._templateInstance().data._id
		Meteor.call('set_unit_image', castle_id, 'castles', this.toString())
	}
})


Template.rp_info_castle.created = function() {
	var self = this

	self.autorun(function() {
		if (Template.currentData()) {
			Meteor.subscribe('gamePiecesAtHex', Template.currentData().x, Template.currentData().y)
		}
	})

	Session.set('mouse_mode', 'default')
	Session.set('update_highlight', Random.fraction())

	self.dupes = new ReactiveVar(false)
	self.castleUserLoaded = new ReactiveVar(false)
	self.battleInfoLoaded = new ReactiveVar(false)

	this.autorun(function() {
		if (Template.currentData()) {
			Meteor.call('get_duplicate_users', Template.currentData().user_id, function(error, result) {
				if (!error) {
					self.dupes.set(result)
				}
			})
		}
	})

	this.autorun(function() {
		if (Template.currentData()) {
			if (Template.currentData().user_id != Meteor.userId()) {
				// get networth, income... for right panel
				var castleUserHandle = Meteor.subscribe('castle_user', Template.currentData().user_id)
				self.castleUserLoaded.set(castleUserHandle.ready())
			}

			var battleInfoHandle = Meteor.subscribe('battle_notifications_at_hex', Template.currentData().x, Template.currentData().y)
			self.battleInfoLoaded.set(battleInfoHandle.ready())
		}
	})


	self.resInfoLoaded = new ReactiveVar(false)
	self.resInfo = new ReactiveVar(false)
	this.autorun(function() {
		if (Template.currentData()) {
			var res = {
				gold:s.resource.gold_gained_at_castle,
				grain:0,
				lumber:0,
				ore:0,
				wool:0,
				clay:0,
				glass:0
			}

			var hexes = Hx.getSurroundingHexes(Template.currentData().x, Template.currentData().y, s.resource.num_rings_castle)
			_.each(hexes, function(hex) {
				var h = Hexes.findOne({x:hex.x, y:hex.y}, {fields:{type:1, large:1}, reactive:false})
				if (h) {
					if (h.large) {
						res[h.type] += s.resource.gained_at_hex * s.resource.large_resource_multiplier
					} else {
						res[h.type] += s.resource.gained_at_hex
					}
				}
			})

			self.resInfo.set(res)
			self.resInfoLoaded.set(true)
		}
	})



	self.userData = new ReactiveVar(null)
	this.autorun(function() {
		var fields = {'purchases.castles':1, vassals: 1, allies_below: 1, lord: 1}
		var user = Meteor.users.findOne(Meteor.userId(), {fields: fields})
		if (user) {
			self.userData.set(user)
		}
	})


	self.power = new ReactiveVar(null)
	self.autorun(function() {
		if (Template.currentData()) {
			Tracker.nonreactive(function() {
				var basePower = getUnitBasePower(Template.currentData())
				var locationMultiplier = getUnitLocationBonusMultiplier(Template.currentData(), Session.get('selected_type'))

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
				self.relationship.set(getUnitRelationType(Template.currentData()))
			})
		}
	})
}