Template.forum_panel.helpers({
	forums: function() {
		return Forums.find({}, {sort: {order: 1}})
	},

	threads: function() {
		return Threads.find({}, {sort: {updated_at: -1}})
	},

	messages: function() {
		return Messages.find({}, {sort: {created_at: 1}})
	},

	show_messages: function() {
		if (Session.get('forum_current_thread')) {
			return true
		} else {
			return false
		}
	},

	show_threads: function() {
		if (Session.get('forum_current_forum') && ! Session.get('forum_current_thread')) {
			return true
		} else {
			return false
		}
	},

	show_forums: function() {
		if (!Session.get('forum_current_forum') && ! Session.get('forum_current_thread')) {
			return true
		} else {
			return false
		}
	},

	current_forum: function() {
		return Forums.findOne(Session.get('forum_current_forum'))
	},

	current_thread: function() {
		return Threads.findOne(Session.get('forum_current_thread'))
	},

	is_new_forum_post: function(id) {
		var latest = Latestmessages.findOne({forum_id:id})
		if (latest) {
			var latest_view = Cookie.get('viewed_forum_'+id)
			if (latest_view) {
				if (latest.user_id != Meteor.userId()) {
					if (moment(new Date(latest.updated_at)).isAfter(moment(new Date(latest_view)))) {
						return true
					}
				}
			} else {
				return true
			}
		}
		return false
	},

	has_description: function() {
		var forum = Forums.findOne(Session.get('forum_current_forum'), {fields: {description:1}})
		if (forum && forum.description) {
			return true
		} else {
			return false
		}
	}

})


Template.forum_panel.events({
	'click .forums_link': function(event, template) {
		var id = Session.get('forum_current_forum')
		Cookie.set('viewed_forum_'+id, new Date(), {years: 10})
		if (Session.get('forum_current_thread')) {
			Cookie.set('viewed_thread_'+Session.get('forum_current_thread'), new Date(), {years: 10})
		}
		Session.set('forum_current_forum', undefined)
		Session.set('forum_current_thread', undefined)
	},

	'click .forum_link': function(event, template) {
		var id = event.currentTarget.getAttribute('data-id')
		check(id, String)
		if (Session.get('forum_current_thread')) {
			Cookie.set('viewed_thread_'+Session.get('forum_current_thread'), new Date(), {years: 10})
		}

		Session.set('forum_current_forum', id)
		Session.set('forum_current_thread', undefined)
		Cookie.set('viewed_forum_'+id, new Date(), {years: 10})
	},

	'click .thread_link': function(event, template) {
		var id = event.currentTarget.getAttribute('data-id')
		check(id, String)
		Session.set('forum_current_thread', id)
		if (!Cookie.get('viewed_thread_'+id)) {
			Meteor.call('forum_add_view', Session.get('forum_current_thread'))
		}
		Cookie.set('viewed_thread_'+id, new Date(), {years: 10})
	},

	'click #forum_submit_thread_button': function(event, template) {
		var title = template.find('#forum_new_thread_title')
		var message = template.find('#forum_new_thread_message')
		var alert = template.find('#forum_thread_error_alert')

		var error = false
		$(alert).hide()

		if ($(title).val().length < 1) {
			error = true
			$(alert).show()
			$(alert).html('Title is too short.')
		}

		if (!error && $(message).val().length < 1) {
			error = true
			$(alert).show()
			$(alert).html('Message is too short.')
		}

		if (!error && $(title).val().length > 100) {
			error = true
			$(alert).show()
			$(alert).html('Title is too long.  Must be less than 100 characters.')
		}

		if (!error && $(message).val().length > 5000) {
			error = true
			$(alert).show()
			$(alert).html('Message is too long.  Must be less than 5000 characters.')
		}

		if (!error) {
			var button_html = $('#forum_submit_thread_button').html()
			$('#forum_submit_thread_button').attr('disabled', true)
			$('#forum_submit_thread_button').html('Please Wait')

			Meteor.apply('forum_new_thread', [$(title).val(), $(message).val(), Session.get('forum_current_forum')], {wait: false, onResultReceived:function() {
				$('#forum_submit_thread_button').attr('disabled', false)
				$('#forum_submit_thread_button').html(button_html)
			}})
			$(message).val('')
			$(title).val('')
		}
	},

	'click #forum_submit_message_button': function(event, template) {
		var message = template.find('#forum_new_message')
		var alert = template.find('#forum_message_error_alert')

		var error = false
		$(alert).hide()

		if ($(message).val().length < 1) {
			error = true
			$(alert).show()
			$(alert).html('Message is too short.')
		}

		if (!error && $(message).val().length > 5000) {
			error = true
			$(alert).show()
			$(alert).html('Message is too long.  Must be less than 5000 characters.')
		}

		if (!error) {
			var button_html = $('#forum_submit_message_button').html()
			$('#forum_submit_message_button').attr('disabled', true)
			$('#forum_submit_message_button').html('Please Wait')

			Meteor.apply('forum_new_message', [$(message).val(), Session.get('forum_current_forum'), Session.get('forum_current_thread')], {wait:false, onResultReceived: function() {
				$('#forum_submit_message_button').attr('disabled', false)
				$('#forum_submit_message_button').html(button_html)
			}})
			$(message).val('')
		}
	},

	'click #forum_show_new_thread_button': function(event, template) {
		var button = template.find('#forum_show_new_thread_button')
		var form = template.find('#new_thread_form')
		$(form).show(100)
		$(button).hide(100)
	},

	'click #forum_mark_all_read_button': function(event, template) {
		Threads.find({forum_id: Session.get('forum_current_forum')}, {fields: {_id:1}}).forEach(function(thread) {
			Cookie.set('viewed_thread_'+thread._id, new Date(), {years: 10})
		})
	},

	'click .hex-link': function(event, template) {
		event.preventDefault()
		event.stopPropagation()
		var hex = {
			x: parseInt(event.currentTarget.getAttribute('data-x')),
			y: parseInt(event.currentTarget.getAttribute('data-y'))
		}

		Meteor.call('coords_to_id', hex.x, hex.y, 'hex', function(error, hexId) {
			if (!error && hexId) {
				center_on_hex(hex.x, hex.y);
				Session.set('selected_type', 'hex');
				Session.set('selected_id', hexId);
				Session.set('selected_coords', {x:hex.x, y:hex.y})
			}
		});
	}
})



Template.forum_panel.created = function() {
	Session.set('forum_current_forum', undefined)
	Session.set('forum_current_thread', undefined)

	// subscribe
	this.autorun(function() {
		Meteor.subscribe('forums')
	})

	this.autorun(function() {
		if (Session.get('forum_current_forum')) {
			Meteor.subscribe('threads', Session.get('forum_current_forum'))
		}
	})

	this.autorun(function() {
		if (Session.get('forum_current_thread')) {
			Meteor.subscribe('messages', Session.get('forum_current_thread'))
		}
	})
}

Template.forum_panel.rendered = function() {
	this.firstNode.parentNode._uihooks = leftPanelAnimation
}
