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
				return RightPanelCastle.findOne(Session.get('selected_id'))
				break;
			case 'village':
				return RightPanelVillages.findOne(Session.get('selected_id'))
				break;
			case 'army':
				return RightPanelArmies.findOne(Session.get('selected_id'))
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
	show_chatrooms_panel: function() { return Session.get('show_chatrooms_panel') },
	show_forum_panel: function() { return Session.get('show_forum_panel') },
	show_rankings_panel: function() { return Session.get('show_rankings_panel') },
	show_notifications_panel: function() { return Session.get('show_notifications_panel') },
	show_help_panel: function() { return Session.get('show_help_panel') },
	show_stats_panel: function() { return Session.get('show_stats_panel') },
	show_store_panel: function() { return Session.get('show_store_panel') },
	show_tree_panel: function() { return Session.get('show_tree_panel') },
})


Template.game.created = function() {
	var self = this


	// round to nearest x so that there is more of a chance of subscribing to a previous subscription
	var roundTo = 5
	self.roundedCenterHex_x = new ReactiveVar(0)
	self.roundedCenterHex_y = new ReactiveVar(0)
	this.autorun(function() {
		if (!mapmover.isDraggingOrScalingReactive.get()) {
			var center_hex = Session.get('center_hex')
			if (center_hex) {
				self.roundedCenterHex_x.set(Math.round(center_hex.x / roundTo) * roundTo)
				self.roundedCenterHex_y.set(Math.round(center_hex.y / roundTo) * roundTo)
			}
		}
	})


	// subscribe to what's onscreen
	// uses meteor package meteorhacks:subs-manager
	var subman = new SubsManager({cacheLimit:10, expireIn:5})
	var submanHexbakes = new SubsManager({cacheLimit:10, expireIn:5})


	// when user changes show coords setting create new subscription
	// SubsManager.reset() isn't working
	self.showCoords = new ReactiveVar(false)
	self.autorun(function() {
		var user = Meteor.users.findOne(Meteor.userId(), {fields: {sp_show_coords:1}})
		if (user) {
			submanHexbakes = new SubsManager({cacheLimit:10, expireIn:5})
			self.showCoords.set(user.sp_show_coords)
		}
	})


	self.autorun(function() {
		var roundedCenterHex_x = self.roundedCenterHex_x.get()
		var roundedCenterHex_y = self.roundedCenterHex_y.get()
		check(roundedCenterHex_x, validNumber)
		check(roundedCenterHex_y, validNumber)
		var canvas_size = Session.get('canvas_size')
		var hex_scale = Session.get('hexScale')
		if (canvas_size && hex_scale) {

			var subBakes = submanHexbakes.subscribe('onScreenHexbakes', roundedCenterHex_x, roundedCenterHex_y, canvas_size.width, canvas_size.height, hex_scale, self.showCoords.get())

			var sub = subman.subscribe('on_screen', roundedCenterHex_x, roundedCenterHex_y, canvas_size.width, canvas_size.height, hex_scale)
			// var sub_hexes = subman.subscribe('on_screen_hexes', roundedCenterHex_x, roundedCenterHex_y, canvas_size.width, canvas_size.height, hex_scale)

			Session.set('subscription_ready', sub.ready() && subBakes.ready())
		}
	})

	// keep track of how many villages you have
	this.autorun(function() {
		var num_villages = LeftPanelVillages.find({user_id:Meteor.userId()}).count()
		if (num_villages) {
			Session.set('num_villages', num_villages)
		} else {
			Session.set('num_villages', 0)
		}
	})
}




Template.game.rendered = function() {

	this.autorun(function() {
		var canvasSize = Session.get('canvas_size')
		if (canvasSize) {
			$('#left_panels').css('height', canvasSize.height - 40)
			$('#right_panel').css('height', canvasSize.height - 40)
		}
	})


	window.onresize = function() {
		var width = $(window).outerWidth(true)
		var height = $(window).outerHeight(true)
		Session.set('canvas_size', {width: width, height: height})

		Session.set('screenWidth', screen.width)

		if (screen.width < 700) {
			var pageWidth = 1000

			var zoom = screen.width / pageWidth
			if (zoom < 1) {
				var tag = document.getElementById('viewport')
				var content = 'initial-scale='+zoom+', maximum-scale='+zoom*3+', minimum-scale='+zoom+', user-scalable=yes, width='+pageWidth
				tag.setAttribute('content', content)
			}

		} else {
			var pageWidth = 850

			var zoom = screen.width / pageWidth
			if (zoom < 1) {
				var tag = document.getElementById('viewport')
				var content = 'initial-scale='+zoom+', maximum-scale='+zoom+', minimum-scale='+zoom+', user-scalable=no, width='+pageWidth
				tag.setAttribute('content', content)
			}
		}

	}
	window.onresize()
}


Meteor.startup(function () {
	Meteor.subscribe('user_data')
})
