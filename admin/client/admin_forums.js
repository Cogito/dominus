Template.adminForums.helpers({
	forums: function() {
		return Forums.find({}, {sort: {order: 1}})
	}
})

Template.adminForums.events({
	'click #add_forum_button': function(event, template) {
		var input = template.find('#add_forum_input')
		var desc = template.find('#add_form_description')
		Meteor.call('admin_create_forum', $(input).val(), $(desc).val())
		$(input).val('')
		$(desc).val('')
	},

	'click #delete_forum_button': function(event, template) {
		var id = $(event.currentTarget).attr('data-id')
		Meteor.call('admin_delete_forum', id)
	},

	'click #up_forum_button': function(event, template) {
		var id = $(event.currentTarget).attr('data-id')
		Meteor.call('admin_forum_move_up', id)
	},

	'click #down_forum_button': function(event, template) {
		var id = $(event.currentTarget).attr('data-id')
		Meteor.call('admin_forum_move_down', id)
	},

	'click #setupDefaultButton': function(event, template) {
		Meteor.call('admin_setupDefaultForums')
	}
})
