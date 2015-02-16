Template.rp_info_village.helpers({
	// for progress bar
	villageUpgradeProgress: function() {
		if (this) {
			Session.get('refresh_time_field')
			var timeToBuild = s.village.cost['level'+(this.level+1)].timeToBuild
			var startedAt = moment(new Date(this.constructionStarted))
			var diff = moment().diff(startedAt)
			var percentage = diff / timeToBuild
			return percentage * 100
		}
	},

	productionBonus: function() {
		if (this) {
			return s.village.productionBonus['level'+this.level]
		}
	},

	resourcesTypePerInterval: function() {
		var village = Template.parentData(1)
		if (village) {
			return village.income[this] //* s.village.productionBonus['level'+village.level]
		}
	},

	incomeTypeGreaterThanZero: function() {
		var village = Template.parentData(1)
		if (village) {
			if (village.income[this] > 0) {
				return true
			}
		}
	},

	canUpgrade: function() {
		if (this) {
			if (this.level < s.village.maxLevel) {
				if (!this.under_construction) {
					return true
				}
			}
		}
	},

	levelPlusOne: function() {
		if (this) {
			return this.level+1
		}
	},

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
			var timeToBuild = s.village.cost['level'+(this.level+1)].timeToBuild
			var finishAt = moment(new Date(this.constructionStarted)).add(timeToBuild, 'ms')
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
			return Battles.findOne({x:this.x, y:this.y, isOver:false})
		}
	},

	is_owner: function() {
		if (this) {
			return this.user_id == Meteor.userId()
		}
	},

	hasSoldierType: function() {
		var village = Template.parentData(1)
		if (village) {
			return village[this] > 0
		}
	},

	numSoldierType: function() {
		var village = Template.parentData(1)
		if (village) {
			return village[this]
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

	interval: function() {
		return moment.duration(s.resource.interval).humanize()
	},

	incomeInGold: function() {
		if (this) {
			var income = this.income
			if (income) {
				var gold = s.resource.gold_gained_at_village
				gold += resources_to_gold(income.grain, income.lumber, income.ore, income.wool, income.clay, income.glass)
				return gold
			}
		}
	}

})



Template.rp_info_village.events({
	'click #upgradeVillageButton': function(event, template) {
		Session.set('rp_template', 'rp_village_upgrade')
	},

	'click #send_army_from_village_button': function(event, template) {
		Session.set('addToExistingArmyMoves', false)
		Session.set('rp_template', 'rp_move_unit')
	},

	'click #destroy_village_button': function() {
		Session.set('rp_template', 'rp_destroy_village_confirm')
	},

	'click #hireArmyButton': function(event, template) {
		Session.set('rp_template', 'rp_hire_army')
	},

	'click #createChatButton': function(event, template) {
		Meteor.call('startChatroomWith', template.data.username)
	}
})



Template.rp_info_village.created = function() {
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
