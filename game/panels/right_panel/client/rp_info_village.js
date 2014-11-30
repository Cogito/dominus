Template.rp_info_village.helpers({
	infoLoaded: function() {
		return Template.instance().infoLoaded.get()
	},

	battleInfoLoaded: function() {
		return Template.instance().battleInfoLoaded.get()
	},

	battle: function() {
		return Battles.findOne({x:Template.currentData().x, y:Template.currentData().y})
	},
	
	is_owner: function() {
		if (Template.currentData().user_id == Meteor.userId()) {
			return true
		} else {
			return false
		}
	},

	no_soldiers: function() {
		var self = this
		var count = 0

		_.each(s.army.types, function(type) {
			count += Template.currentData()[type]
		})

		return (count == 0)
	},

	resources_per_interval: function() {
		var res = {
			gold:s.resource.gold_gained_at_village,
			grain:0,
			lumber:0,
			ore:0,
			wool:0,
			clay:0,
			glass:0
		}
		
		var hexes = Hx.getSurroundingHexes(Template.currentData().x, Template.currentData().y, s.resource.num_rings_village)
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

	interval: function() {
		return moment.duration(s.resource.interval).humanize()
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

	Session.set('mouse_mode', 'default')
	Session.set('update_highlight', Random.fraction())
	self.battleInfoLoaded = new ReactiveVar(false)

	self.infoLoaded = new ReactiveVar(false)
	this.autorun(function() {
		var infoHandle = Meteor.subscribe('villageForHexInfo', Session.get('selected_id'))
		self.infoLoaded.set(infoHandle.ready())
	})
	
	this.autorun(function() {
		if (Template.currentData()) {
			var battleInfoHandle = Meteor.subscribe('battle_notifications_at_hex', Template.currentData().x, Template.currentData().y)
			self.battleInfoLoaded.set(battleInfoHandle.ready())
		}
	})
}