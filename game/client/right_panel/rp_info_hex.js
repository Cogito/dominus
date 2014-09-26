Template.rp_info_hex.helpers({
	battle: function() {
		return Battles.findOne({x:this.x, y:this.y})
	},

	has_armies: function() {
		if (Armies.find({x:this.x, y:this.y}).count() > 0) {
			return true
		}
		return false
	},

	armies: function() {
		return Armies.find({ x: this.x, y: this.y })
	},

	typeName: function() {
		if (this.large) {
			return _.titleize('large '+this.type)
		} else {
			return _.titleize(this.type)
		}
	},

	numResources: function() {
		if (this.large) {
			return s.resource.gained_at_hex * s.resource.large_resource_multiplier
		} else {
			return s.resource.gained_at_hex
		}
	},

	interval: function() {
		return moment.duration(s.resource.interval).humanize()
	}

})



Template.rp_info_hex.events({
	'click #select_army_button': function(event, template) {
		var id = $(event.currentTarget).attr('data-id')
		Session.set('selected_id', id)
		Session.set('selected_type', 'army')
	},
})



Template.rp_info_hex.rendered = function() {
	var self = this

	Session.set('mouse_mode', 'default')
	Session.set('update_highlight', Random.fraction())

	logevent('right_panel', 'open', 'info_hex')

	self.autorun(function() {
		if (self.data) {
			Meteor.subscribe('battle_notifications_at_hex', self.data.x, self.data.y)
		}
	})
	
}