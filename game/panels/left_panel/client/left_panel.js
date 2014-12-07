Template.left_panel.helpers({
	gold: function() {
		var res = Meteor.users.findOne(Meteor.userId(), {fields: {gold: 1}})
		if (res) {
			return res.gold
		}
	},

	grain: function() {
		var res = Meteor.users.findOne(Meteor.userId(), {fields: {grain: 1}})
		if (res) {
			return res.grain
		}
	},

	lumber: function() {
		var res = Meteor.users.findOne(Meteor.userId(), {fields: {lumber: 1}})
		if (res) {
			return res.lumber
		}
	},

	ore: function() {
		var res = Meteor.users.findOne(Meteor.userId(), {fields: {ore: 1}})
		if (res) {
			return res.ore
		}
	},

	wool: function() {
		var res = Meteor.users.findOne(Meteor.userId(), {fields: {wool: 1}})
		if (res) {
			return res.wool
		}
	},

	clay: function() {
		var res = Meteor.users.findOne(Meteor.userId(), {fields: {clay: 1}})
		if (res) {
			return res.clay
		}
	},

	glass: function() {
		var res = Meteor.users.findOne(Meteor.userId(), {fields: {glass: 1}})
		if (res) {
			return res.glass
		}
	},

	resources_last_interval: function() {
		var res = Meteor.users.findOne(Meteor.userId(), {fields: {res_update: 1}})
		if (res && res.res_update && res.res_update.from_vassal) {
			var income = {}
			_.each(s.resource.types_plus_gold, function(type) {
				income[type] = round_number(res.res_update[type] - res.res_update.from_vassal[type]) +' / '+ round_number(res.res_update.from_vassal[type])
			})
			return income
		}
	},

	show_armies_group: function() {
		return get_user_property("lp_show_armies")
	},

	show_lords_group: function() {
		return get_user_property("lp_show_lords")
	},

	show_allies_group: function() {
		return get_user_property("lp_show_allies")
	},

	time_til_update: function() {
		Session.get('refresh_time_field')
		var stat = Jobstats.findOne()
		if (stat) {
			var will_run_at = moment(new Date(stat.updated_at)).add(s.resource.interval, 'milliseconds')
			return will_run_at.fromNow()
		}
	},

	num_villages: function() {
		return Session.get('num_villages')
	},

	num_vassals: function() {
		var res = Meteor.users.findOne(Meteor.userId(), {fields: {num_allies_below: 1}})
		if (res) {
			return res.num_allies_below
		}
	}

	
})


Template.left_panel.events({
	'click #castle_group_link': function(event, template) {
		if (get_user_property("lp_show_castle")) {
			Meteor.call('hide_castle')
		} else {
			Meteor.call('show_castle')
		}
	},

	'click #village_group_link': function(event, template) {
		if (get_user_property("lp_show_villages")) {
			Meteor.call('hide_villages')
		} else {
			Meteor.call('show_villages')
		}
	},

	'click #armies_group_link': function(event, template) {
		if (get_user_property("lp_show_armies")) {
			Meteor.call('hide_armies')
		} else {
			Meteor.call('show_armies')
		}
	},

	'click #lords_group_link': function(event, template) {
		if (get_user_property("lp_show_lords")) {
			Meteor.call('hide_lords')
		} else {
			Meteor.call('show_lords')
		}
	},

	'click #allies_group_link': function(event, template) {
		if (get_user_property("lp_show_allies")) {
			Meteor.call('hide_allies')
		} else {
			Meteor.call('show_allies')
		}
	},

	'mouseenter .summary_hover': function(event, template) {
		var self = this

		Session.set('show_summary_hover_box', true)
		Session.set('summary_hover_box_top', $(event.currentTarget).offset().top - $(event.currentTarget).outerHeight(true) - 10)

		var has_units = false
		var contents = '<table><tbody>'

		_.each(s.army.types, function(type) {
			if (self[type]) {
				contents += '<tr><td class="summary_box_type">'+_.capitalize(type)+'</td><td class="summary_box_num">'+self[type]+'</td>'
				has_units = true
			}
		})

		if (!has_units) {
			contents += '<tr><td>No&nbsp;units.</td></tr>'
		}
		contents += '</tbody></table>'
		Session.set('summary_hover_box_contents', contents)
	},

	'mouseleave .summary_hover': function(event, template) {
		Session.set('show_summary_hover_box', false)
	},
	
})



Template.left_panel.created = function() {
	this.autorun(function() {
		if (Meteor.userId()) {
			var user = Meteor.users.findOne(Meteor.userId(), {fields: {lord:1, vassals:1, lp_show_armies:1, lp_show_lords:1, lp_show_allies:1}})
			if (user) {
				Meteor.subscribe('gather_resources_jobstat')

				if (user.lp_show_lords) {
					Meteor.subscribe('left_panel_lords')
				}

				if (user.lp_show_allies) {
					Meteor.subscribe('left_panel_allies')
				}
			}
		}
	})
}

Template.left_panel.rendered = function() {
	this.firstNode.parentNode._uihooks = leftPanelAnimation
}