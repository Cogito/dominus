Template.game.helpers({
	rp_template: function() {
		var template = Session.get('rp_template')
		if (template) {
			return template
		} else {
			return 'empty_template'
		}
	},

	rp_template_data: function() {
		switch (Session.get('selected_type')) {
			case 'castle':
				return Castles.findOne(Session.get('selected_id'))
				break;
			case 'village':
				return Villages.findOne(Session.get('selected_id'))
				break;
			case 'army':
				return Armies.findOne(Session.get('selected_id'))
				break;
			case 'hex':
				return Hexes.findOne(Session.get('selected_id'))
				break;
		}
		return {}
	},

	show_summary_panel: function() { return Session.get('show_summary_panel') },
	show_admin_panel: function() { return Session.get('show_admin_panel') },
	show_market_panel: function() { return Session.get('show_market_panel') },
	show_settings_panel: function() { return Session.get('show_settings_panel') },
	show_chat_panel: function() { return Session.get('show_chat_panel') },
	show_chatrooms_panel: function() { return Session.get('show_chatrooms_panel') },
	show_forum_panel: function() { return Session.get('show_forum_panel') },
	show_rankings_panel: function() { return Session.get('show_rankings_panel') },
	show_notifications_panel: function() { return Session.get('show_notifications_panel') },
	show_help_panel: function() { return Session.get('show_help_panel') },
	show_stats_panel: function() { return Session.get('show_stats_panel') },
	show_store_panel: function() { return Session.get('show_store_panel') },
	show_tree_panel: function() { return Session.get('show_tree_panel') },


	show_welcome_screen: function() {
		if (!Session.get('show_building_castle_modal')) {
			var res = Meteor.users.findOne(Meteor.userId(), {fields: {show_welcome_screen: 1}})
			if (res) {
				if (res.show_welcome_screen) {
					return true
				}
			}
			return false
		}
	},


})

Template.game.events({
	// grid drag. Only start dragging if starting within #hex_body; continue dragging everywhere.
	'mousedown #hex_body': function(event, template) {
		if (event.which == 1) { // left mouse button
			dragger.start_grid_drag(event, false)
		}
	},
	'mouseup': function(event, template) { dragger.stop_grid_drag() },
	'mousemove': function(event, template) { dragger.hexes_mouse_move(event, false) },

	'touchstart #hex_body': function(event, template) { dragger.start_grid_drag(event, true) },
	'touchend': function(event, template) { dragger.stop_grid_drag() },
	'touchmove': function(event, template) { dragger.hexes_mouse_move(event, true) }
})




var width = $(window).outerWidth(true)
var height = $(window).outerHeight(true)
Session.set('canvas_size', {width: 0, height: 0, half_width: 0, half_height: 0})	// set to zero so that deps.autorun will run again
Session.set('canvas_size', {width: width, height: height, half_width: width/2, half_height: height/2})

Template.game.rendered = function() {

	window.onresize = function() {
		var width = $(window).outerWidth(true)
		var height = $(window).outerHeight(true)
		Session.set('canvas_size', {width: width, height: height, half_width: width/2, half_height: height/2})
	}


	// show loading map panel
	this.deps_showLoading = Deps.autorun(function() {
		if (Session.get('subscription_ready')) {
			$('#subscription_ready_panel').fadeOut(50)
		} else {
			$('#subscription_ready_panel').fadeIn(50)
		}
	})


	// subscribe to what's onscreen
	// uses meteorhacks:subs-manager
	this.deps_onscreenSubscribe = Deps.autorun(function() {
		if (!Session.get('is_dragging_hexes')){
			var center_hex = Session.get('center_hex')
			var canvas_size = Session.get('canvas_size')
			var hex_scale = get_hex_scale()
			var sub = subs.subscribe('on_screen', center_hex.x, center_hex.y, s.hex_size, canvas_size.width, canvas_size.height, hex_scale)
			var sub_hexes = subs.subscribe('on_screen_hexes', center_hex.x, center_hex.y, s.hex_size, canvas_size.width, canvas_size.height, hex_scale)
			if (sub_hexes.ready()) {
				Session.set('subscription_ready', true)
			} else {
				Session.set('subscription_ready', false)
			}
		}
	})

	// keep track of how many villages you have
	this.deps_num_villages = Deps.autorun(function() {
		var num_villages = Villages.find({user_id: Meteor.userId()}).count()
		if (num_villages) {
			Session.set('num_villages', num_villages)
		} else {
			Session.set('num_villages', 0)
		}
	})
}




// hexes subscription manager
// uses meteor package meteorhacks:subs-manager
subs = new SubsManager()

// subscribe to what's onscreen but with a rate limit
on_screen_last_subscribed_at = new Date(0)
on_screen_subscribe_timer = ''
Session.set('on_screen_delayed', Session.get('center_hex'))
on_screen_subscribe_delay = function() {
	Meteor.clearTimeout(on_screen_subscribe_timer)

	if (new Date() - on_screen_last_subscribed_at > 200) {
		Session.set('on_screen_delayed', Session.get('center_hex'))
		on_screen_last_subscribed_at = new Date()
	} else {
		on_screen_subscribe_timer = Meteor.setTimeout(function() {
			on_screen_subscribe_delay()
		}, 50)
	}

}

Meteor.startup(function () {
	Meteor.subscribe('user_data')
})
