Template.rp_info_village.helpers({
	unitRelationType: function() {
		if (Template.instance()) {
			var type = Template.instance().relationship.get()
			if (type && type != 'mine') {
				return getNiceRelationType(type)
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

	timeTilFinishedBuilding: function() {
		if (this) {
			Session.get('refresh_time_field')
			var finishAt = moment(new Date(this.created_at)).add(s.village.time_to_build, 'ms')
			if (moment().isAfter(finishAt)) {
				return 'soon'
			} else {
				return finishAt.fromNow()
			}
		}
	},

	battleInfoLoaded: function() {
		return Template.instance().battleInfoLoaded.get()
	},

	battle: function() {
		if (this) {
			return Battles.findOne({x:this.x, y:this.y})
		}
	},
	
	is_owner: function() {
		if (this) {
			return this.user_id == Meteor.userId()
		}
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

	resources_per_interval: function() {
		if (this) {
			return this.income
		}
	},

	interval: function() {
		return moment.duration(s.resource.interval).humanize()
	},

	incomeInGold: function() {
		if (this) {
			var income = this.income
			if (income) {
				var gold = income.gold
				gold += resources_to_gold(income.grain, income.lumber, income.ore, income.wool, income.clay, income.glass)
				return gold
			}
		}
	}

})



Template.rp_info_village.events({
	'click #send_army_from_village_button': function(event, template) {
		Session.set('rp_template', 'rp_move_unit')
	},

	'click #destroy_village_button': function() {
		Session.set('rp_template', 'rp_destroy_village_confirm')
	},

	'click #hireArmyButton': function(event, template) {
		Session.set('rp_template', 'rp_hire_army')
	}
})



Template.rp_info_village.created = function() {
	var self = this

	self.autorun(function() {
		if (Template.currentData()) {
			Meteor.subscribe('gamePiecesAtHex', Template.currentData().x, Template.currentData().y)
		}
	})

	Session.set('mouse_mode', 'default')
	Session.set('update_highlight', Random.fraction())

	self.battleInfoLoaded = new ReactiveVar(false)
	this.autorun(function() {
		if (Template.currentData()) {
			var battleInfoHandle = Meteor.subscribe('battle_notifications_at_hex', Template.currentData().x, Template.currentData().y)
			self.battleInfoLoaded.set(battleInfoHandle.ready())
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