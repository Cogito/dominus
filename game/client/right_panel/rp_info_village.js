Template.rp_info_village.helpers({
	battle: function() {
		return Battles.findOne({x:this.x, y:this.y})
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
			gold:s.resource.gold_gained_at_village,
			grain:0,
			lumber:0,
			ore:0,
			wool:0,
			clay:0,
			glass:0
		}
		
		var hexes = Hx.getSurroundingHexes(this.x, this.y, s.resource.num_rings_village)
		_.each(hexes, function(hex) {
			var h = Hexes.findOne({x:hex.x, y:hex.y}, {fields:{type:1}})
			if (h) {
				res[h.type] += s.resource.gained_at_hex
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



Template.rp_info_village.rendered = function() {
	Session.set('mouse_mode', 'default')
	Session.set('update_highlight', Random.fraction())

	logevent('right_panel', 'open', 'info_village')

	this.autorun(function() {
		// if (self.data) is a hack, shouldn't be run until it's loaded
		// this probably makes the autorun run everytime anything in data is changed
		if (self.data) {
			Meteor.subscribe('battle_notifications_at_hex', self.data.x, self.data.y)
		}
	})
}