Template.menu.helpers({
	summary_active: function() {
		if (Session.get('show_summary_panel')) { return 'active' } else { return '' }
	},

	has_notifications: function() {
		return NotificationsUnread.find().count() > 0
	},

	num_notifications: function() {
		return NotificationsUnread.find().count()
	},

	notifications_active: function() {
		if (Session.get('show_notifications_panel')) { return 'active' } else { return '' }
	},

	market_active: function() {
		if (Session.get('show_market_panel')) { return 'active' } else { return '' }
	},
	
	stats_active: function() {
		if (Session.get('show_stats_panel')) { return 'active' } else { return '' }
	},

	chat_active: function() {
		if (Session.get('show_chat_panel')) { return 'active' } else { return '' }
	},

	forum_active: function() {
		if (Session.get('show_forum_panel')) { return 'active' } else { return '' }
	},

	rankings_active: function() {
		if (Session.get('show_rankings_panel')) { return 'active' } else { return '' }
	},

	settings_active: function() {
		if (Session.get('show_settings_panel')) { return 'active' } else { return '' }
	},

	help_active: function() {
		if (Session.get('show_help_panel')) { return 'active' } else { return '' }
	},

	admin_active: function() {
		if (Session.get('show_admin_panel')) { return 'active' } else { return '' }
	},

	store_active: function() {
		if (Session.get('show_store_panel')) { return 'active' } else { return '' }
	},

	tree_active: function() {
		if (Session.get('show_tree_panel')) { return 'active' } else { return '' }
	},

	is_new_forum_post: function() {
		if (!Session.get('show_forum_panel')) {
			var latest_post = Latestmessages.findOne({}, {fields: {updated_at:1}, sort: {updated_at:-1}})
			if (latest_post) {
				var forum_close_date = Cookie.get('forum_close')
				if (forum_close_date) {
					if (moment(new Date(latest_post.updated_at)).isAfter(moment(new Date(forum_close_date)))) {
						return true
					}
				} else {
					return true
				}
			}
		}
		return false
	},


	is_new_chat: function() {
		var is_new = false
		var page_title = s.game_name
		var user = Meteor.users.findOne(Meteor.userId(), {fields: {chatrooms:1}})
		if (user) {
			_.each(user.chatrooms, function(room_id) {
				var latest_chat = Latestchats.findOne({room_id: room_id})
				if (latest_chat) {
					var latest_open = Cookie.get('room_'+room_id+'_open')
					if (latest_open) {
						if (moment(new Date(latest_chat.updated_at)).isAfter(moment(new Date(latest_open)))) {
							is_new = true
							page_title = '! '+s.game_name
						}
					} else {
						is_new = true
						page_title = '! '+s.game_name
					}
				}
			})
		}
		document.title = page_title
		return is_new
	}
})

Template.menu.events({
	'click #show_summary_panel_button': function(event, template) {
		if (Session.get('show_summary_panel')) {
			Session.set('show_summary_panel', false)
		} else {
			Session.set('show_summary_panel', true)
		}
	},

	'click #show_admin_panel_button': function(event, template) {
		if (Session.get('show_admin_panel')) {
			Session.set('show_admin_panel', false)
		} else {
			Session.set('show_admin_panel', true)
		}
	},

	'click #show_market_panel_button': function(event, template) {
		if (Session.get('show_market_panel')) {
			Session.set('show_market_panel', false)
		} else {
			Session.set('show_market_panel', true)
		}
	},

	'click #show_settings_panel_button': function(event, template) {
		if (Session.get('show_settings_panel')) {
			Session.set('show_settings_panel', false)
		} else {
			Session.set('show_settings_panel', true)
		}
	},

	'click #show_chat_panel_button': function(event, template) {
		if (Session.get('show_chat_panel')) {
			Session.set('show_chat_panel', false)
			Cookie.set('chat_panel_close', new Date(), {years: 10})
		} else {
			Session.set('show_chat_panel', true)
			Cookie.clear('chat_panel_close')
		}
	},

	'click #show_forum_panel_button': function(event, template) {
		if (Session.get('show_forum_panel')) {
			Session.set('show_forum_panel', false)
			Cookie.set('forum_close', new Date(), {years: 10})
		} else {
			Session.set('show_forum_panel', true)
			Cookie.clear('forum_close')
		}
	},

	'click #show_notifications_panel_button': function(event, template) {
		if (Session.get('show_notifications_panel')) {
			Session.set('show_notifications_panel', false)
		} else {
			Session.set('show_notifications_panel', true)
		}
	},

	'click #show_help_panel_button': function(event, template) {
		if (Session.get('show_help_panel')) {
			Session.set('show_help_panel', false)
		} else {
			Session.set('show_help_panel', true)
		}
	},

	'click #show_stats_panel_button': function(event, template) {
		if (Session.get('show_stats_panel')) {
			Session.set('show_stats_panel', false)
		} else {
			Session.set('show_stats_panel', true)
		}
	},

	'click #show_rankings_panel_button': function(event, template) {
		if (Session.get('show_rankings_panel')) {
			Session.set('show_rankings_panel', false)
		} else {
			Session.set('show_rankings_panel', true)
		}
	},

	'click #show_store_panel_button': function(event, template) {
		if (Session.get('show_store_panel')) {
			Session.set('show_store_panel', false)
		} else {
			Session.set('show_store_panel', true)
		}
	},

	'click #show_tree_panel_button': function(event, template) {
		if (Session.get('show_tree_panel')) {
			Session.set('show_tree_panel', false)
		} else {
			Session.set('show_tree_panel', true)
		}
	},
})



Template.menu.rendered = function() {
	if (typeof Session.get('canvas_size') != 'undefined') {
		$('#left_panels').css('height', Session.get('canvas_size').height - 40)
		$('#right_panel').css('height', Session.get('canvas_size').height - 40)
		$('#subscription_ready_panel').css('left', Session.get('canvas_size').width / 2 - 50)
		$('#welcome_screen').css('left', Session.get('canvas_size').half_width - 250)
		$('#welcome_screen').css('top', Session.get('canvas_size').half_height - 150)
	}		

	var deps_newuser_first_run = true

	this.deps_newuser = Deps.autorun(function() {
		
		if (Meteor.userId()) {
			var user = Meteor.users.findOne(Meteor.userId(), {fields: {show_welcome_screen:1, castle_id:1, x:1, y:1}})
			if (user) {

				if(typeof user.castle_id == 'undefined' || typeof user.x == 'undefined' || typeof user.y == 'undefined') {
					//console.log('no castle but no loading screen either')
					if (typeof user.show_welcome_screen != 'undefined') {

						// show modal
						Session.set('show_building_castle_modal', true)
						Session.set('mouse_mode', 'modal')
					}

				} else {
					// we've got a castle
					//console.log('got a castle')
					if (deps_newuser_first_run) {
						//console.log('first run')
						// hide building castle modal
						Session.set('show_building_castle_modal', false)
						Session.set('mouse_mode', 'default')

						// first run so center on castle
						Session.set('selected_type', 'castle')
						Session.set('selected_id', user.castle_id)
						center_on_hex(user.x, user.y)

						deps_newuser_first_run = false
					}
				}

			}
		}
	})


	this.deps_subscribe = Deps.autorun(function() {
		Meteor.subscribe('market')
		var user = Meteor.users.findOne(Meteor.userId(), {fields: {chatrooms:1}})
		if (user && user.chatrooms) {
			Meteor.subscribe('latest_chats', user.chatrooms)
		}
		Meteor.subscribe('latest_forum_posts')
	})

	this.autorun(function() {
		Meteor.subscribe('notifications_unread')
	})
}


Template.menu.destroyed = function() {
	if (this.deps_subscribe) {
		this.deps_subscribe.stop()
	}
	if (this.deps_newuser) {
		this.deps_newuser.stop()
	}
}