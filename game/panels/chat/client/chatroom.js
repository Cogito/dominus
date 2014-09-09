Template.chatroom.helpers({
	name_is_everyone: function() {
		return this.name == 'Everyone'
	},

	chats: function() {
		return Chats.find({room_id: this._id}, {sort: {created_at: -1}})
	},

	is_new_chat: function() {
		//if (!Session.get('room_'+this._id+'_open')) {
			var latest_chat = Latestchats.findOne({room_id: this._id})
			if (latest_chat) {
				var latest_open = Cookie.get('room_'+this._id+'_open')
				if (latest_open) {
					if (moment(new Date(latest_chat.updated_at)).isAfter(moment(new Date(latest_open)))) {
						return true
					}
				} else {
					return true
				}
			}
		//}
		return false
	}
})



Template.chatroom.events({
	'click .chat_send_button': function(event, template) {
		event.preventDefault()
		event.stopPropagation()
		var input = template.find('.chat_input')

		var message = _.clean($(input).val())

		if (message.length == 0) {
			return
		}

		var date = new Date(TimeSync.serverTime())

		var user = Meteor.users.findOne(Meteor.userId(), {fields: {username:1, x:1, y:1, castle_id:1}})
		Chats.insert({
			room_id: this._id,
			created_at: date,
			user_id: Meteor.userId(),
			username: user.username,
			castle_x: user.x,
			castle_y: user.y,
			text: message,
			castle_id: user.castle_id
		})

		// record date of latest chat
		var latestchat = Latestchats.findOne({room_id: this._id})
		if (latestchat) {
			Latestchats.update(latestchat._id, {$set: {updated_at: date}})
		} else {
			Latestchats.insert({room_id: this._id, updated_at: date})
		}

		Cookie.set('room_'+this._id+'_open', moment(date).add(1, 's').toDate(), {years: 10})

		$(input).val('')

		logevent('chat', 'insert')
	},

	// same as click function
	'keyup .chat_input': function(event, template) {
		if (event.keyCode === 13) {
			var input = template.find('.chat_input')

			var message = _.clean($(input).val())

			if (message.length == 0) {
				return
			}

			var date = new Date(TimeSync.serverTime())
			
			var user = Meteor.users.findOne(Meteor.userId(), {fields: {username:1, x:1, y:1, castle_id:1}})
			Chats.insert({
				room_id: this._id,
				created_at: date,
				user_id: Meteor.userId(),
				username: user.username,
				castle_x: user.x,
				castle_y: user.y,
				text: message,
				castle_id: user.castle_id
			})

			// record date of latest chat
			var latestchat = Latestchats.findOne({room_id: this._id})
			if (latestchat) {
				Latestchats.update(latestchat._id, {$set: {updated_at: date}})
			} else {
				Latestchats.insert({room_id: this._id, updated_at: date})
			}

			Cookie.set('room_'+this._id+'_open', moment(date).add(1, 's').toDate(), {years: 10})

			$(input).val('')

			logevent('chat', 'insert')
		}
	},

	'click .leave_chatroom_button': function(event, template) {
		Meteor.call('leave_chatroom_button', this._id)
		logevent('chat', 'leave_chatroom')
	},

	'click .username_click_link': function(event, template) {
		event.preventDefault()
		event.stopPropagation()
		center_on_hex(this.castle_x, this.castle_y)
		Session.set('selected_type', 'castle')
		Session.set('selected_id', this.castle_id)
	},

	'show.bs.collapse .panel-collapse': function(event, template) {
		Session.set('room_'+this._id+'_open', true)
		var date = new Date(TimeSync.serverTime())
		Cookie.set('room_'+this._id+'_open', moment(date).add('s',1).toDate(), {years: 10})
	},

	'hide.bs.collapse .panel-collapse': function(event, template) {
		Session.set('room_'+this._id+'_open', false)
		var date = new Date(TimeSync.serverTime())
		Cookie.set('room_'+this._id+'_open', moment(date).add(1, 's').toDate(), {years: 10})
	},

	// click on chatroom background to clear alerts
	'click .chat_body': function(event, template) {
		var date = new Date(TimeSync.serverTime())
		Cookie.set('room_'+this._id+'_open', moment(date).add(1, 's').toDate(), {years: 10})
	}
})



Template.chatroom.rendered = function() {
	var self = this

	this.deps_resize = Deps.autorun(function() {
		$('.chats_container').css('max-height', Session.get('canvas_size').height - 325)
	})

	this.deps_subscribe = Deps.autorun(function() {
		if (Session.get('room_'+self.data._id+'_open')) {
			Meteor.subscribe('chats_in_room', self.data._id)
		}
	})
}

Template.chatroom.destroyed = function() {
	if (this.deps_resize) {
		this.deps_resize.stop()
	}
	if (this.deps_subscribe) {
		this.deps_subscribe.stop()
	}
}