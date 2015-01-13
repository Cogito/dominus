Template.rp_info_hex.helpers({
	battleInfoLoaded: function() {
		return Template.instance().battleInfoLoaded.get()
	},

	battle: function() {
		if (this) {
			return Battles.findOne({x:this.x, y:this.y})
		}
	},

	has_armies: function() {
		if (this) {
			if (Armies.find({x:this.x, y:this.y}).count() > 0) {
				return true
			}
		}
	},

	armies: function() {
		if (this) {
			return Armies.find({ x: this.x, y: this.y })
		}
	},

	typeName: function() {
		if (this && this.large) {
			return _.titleize('large '+this.type)
		} else {
			return _.titleize(this.type)
		}
	},

	numResources: function() {
		if (this && this.large) {
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
		var id = event.currentTarget.getAttribute('data-id')
		Session.set('selected_id', id)
		Session.set('selected_type', 'army')
	},
})



Template.rp_info_hex.created = function() {
	var self = this

	self.autorun(function() {
		if (Template.currentData()) {
			Meteor.subscribe('gamePiecesAtHex', Template.currentData().x, Template.currentData().y)
		}
	})

	// If a hex is selected and there is a Castle or Village, select it instead.
	self.autorun(function() {
		if(Template.currentData()) {
			var castle = Castles.findOne({x: Template.currentData().x, y: Template.currentData().y});
			var village = Villages.findOne({x: Template.currentData().x, y: Template.currentData().y});
			if (castle) {
				Session.set('selected_type', 'castle');
				Session.set('selected_id', castle._id);
			}
			if (village) {
				Session.set('selected_type', 'village');
				Session.set('selected_id', village._id);
			}
		}
	});

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
