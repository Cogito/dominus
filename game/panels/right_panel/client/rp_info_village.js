Template.rp_info_village.helpers({
	infoLoaded: function() {
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
}