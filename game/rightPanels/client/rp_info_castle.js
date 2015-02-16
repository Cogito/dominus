Template.rp_info_castle.helpers({
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
	
	showUnverifiedEmailAlert: function() {
		if (Template.currentData()) {
			var user = RightPanelUser.findOne(Template.currentData().user_id)
			if (user) {
				return !user.emails[0].verified
			}
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

	castleInfoLoaded: function() {
		return Session.get('rightPanelInfoLoaded')
	},

	battle: function() {
		if (this) {
			return Battles.findOne({x:this.x, y:this.y, isOver:false})
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

	is_vassal: function() {
		if (Template.instance().userData && Template.currentData()) {
			var type = Template.instance().relationship.get()
			return type == 'vassal' || type == 'direct_vassal'
		}
	},

	user: function() {
		if (Template.currentData()) {
			return RightPanelUser.findOne(Template.currentData().user_id)
		}
	}
})



Template.rp_info_castle.events({
	'click #send_army_from_castle_button': function(event, template) {
		Session.set('addToExistingArmyMoves', false)
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
	},

	'click #createChatButton': function(event, template) {
		Meteor.call('startChatroomWith', template.data.username)
	}
})


Template.rp_info_castle.created = function() {
	var self = this
	self.subs = new ReadyManager()

	Session.set('mouse_mode', 'default')
	Session.set('update_highlight', Random.fraction())

	self.autorun(function() {
		if (Template.currentData()) {
			self.subs.subscriptions([{
				groupName: 'gamePiecesAtHex',
				subscriptions: [ Meteor.subscribe('gamePiecesAtHex', Template.currentData().x, Template.currentData().y).ready() ]
			}, {
				groupName: 'rightPanelUser',
				subscriptions: [ Meteor.subscribe('rightPanelUser', Template.currentData().user_id).ready() ]
			}, {
				groupName: 'battleInfo',
				subscriptions: [ Meteor.subscribe('battle_notifications_at_hex', Template.currentData().x, Template.currentData().y).ready() ]
			}, {
				groupName: 'forMinimap',
				subscriptions: [ Meteor.subscribe('user_buildings_for_minimap', Template.currentData().user_id).ready() ]
			}, {
				groupName: 'rightPanelTree',
				subscriptions: [ Meteor.subscribe('rightPanelTree', Template.currentData().user_id).ready() ]
			}])
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
				self.relationship.set(getUnitRelationType(Template.currentData().user_id))
			})
		}
	})
}
