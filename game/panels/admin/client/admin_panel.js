Template.admin_panel.helpers({
	num_hexes_loaded: function() {
		return Hexes.find().count()
	},

	center_hex_x: function() { return Session.get('center_hex').x },
	center_hex_y: function() { return Session.get('center_hex').y },

	users: function() {
		Meteor.subscribe('all_users')
		return Meteor.users.find()
	},

	mouseover_hex_id: function() { return Session.get('mouseover_hex_id') },
	mouse_mode: function() { return Session.get('mouse_mode') },
})



Template.admin_panel.events({
	'click #gen_hexes_button': function (event, template) {
		var num_of_rings_input = template.find('#num_of_rings_input')
		var num_of_rings = $(num_of_rings_input).val()
 
		if (!isNaN(num_of_rings) && num_of_rings > 0 && num_of_rings < 100) {
			Meteor.call('generate_hexes', num_of_rings)
		}
	},

	'click #add_ring_button': function(event, template) {
		Meteor.call('add_ring')
	},

	'click .delete_user_button': function(event, template) {
		var user_id = $(event.currentTarget).attr('data-userid')
		Meteor.call('delete_user', user_id)
	},

	'click #reset_market_button': function(event, template) {
		Meteor.call('reset_market')
	},

	'click #give_gold_button': function(event, template) {
		Meteor.call('give_gold', 1000)
	},

	'click #delete_all_users_button': function(event, template) {
		Meteor.call('delete_all_users')
	},

	'click #reset_everyone_resources_button': function(event, template) {
		Meteor.call('reset_everyone_resources')
	},

	'click #debug_create_50_armies': function(event, template) {
		Meteor.call('debug_create_50_armies')
	}
})