Template.chatroom_open.helpers({
	chatroomChatsReady: function() {
		return Template.instance().chatroomChatsReady.get()
	},

	membersReady: function() {
		return Template.instance().chatroomMembersReady.get()
	},

	numPeople: function() {
		return Template.currentData().members.length
	},

	showLeaveConfirm: function() {
		return Template.instance().showLeaveConfirm.get() ? 'block' : 'none'
	},

	showInviteBox: function() {
		return Template.instance().showInviteBox.get() ? 'block' : 'none'
	},

	showRenameBox: function() {
		return Template.instance().showRenameBox.get() ? 'block' : 'none'
	},

	showChatBox: function() {
		return Template.instance().showChatBox.get() ? 'block' : 'none'
	},

	roomChats: function() {
		var room_id = Session.get('selectedChatroomId')
		var chats = Roomchats.find({room_id:room_id}, {sort: {created_at: -1}})
		return chats.map(function(chat) {
			var user = RoomMembers.findOne(chat.user_id)
			if (user) {
				chat.username = user.username
				chat.castle_id = user.castle_id
				chat.x = user.x
				chat.y = user.y
			}
			return chat
		})
	},

	roomOwner: function() {
		if (Template.currentData().type != 'everyone') {
			if (Template.currentData().owner) {
				return RoomMembers.findOne(Template.currentData().owner)
			}
		}
	},

	roomAdmins: function() {
		if (Template.currentData().type == 'normal') {
			if (Template.currentData().admins.length > 0) {
				return RoomMembers.find({_id: {$in:Template.currentData().admins}})
			}
		}
	},

	roomMembers: function() {
		if (Template.currentData().type == 'everyone') {
			// return everyone
			return RoomMembers.find()
		} else {
			// reject admins and owner
			var members = RoomMembers.find().fetch()
			return members.filter(function(member) {
				if (member._id != Template.currentData().owner) {
					if (!_.contains(Template.currentData().admins, member._id)) {
						return true
					}
				}
				return false
			})
		}
	},

	showMembers: function() {
		return Template.instance().showMembers.get()
	},

	// admins and owner can invite people
	showInviteButton: function() {
		var room_type = Template.currentData().type
		if (room_type == 'king' || room_type == 'everyone') {
			return false
		}

		var user_id = Meteor.userId()

		// if owner
		if (user_id == Template.currentData().owner) {
			return true
		}

		// if admin
		if (_.contains(Template.currentData().admins, user_id)) {
			return true
		}

		return false
	},

	// owner can rename room
	showRenameButton: function() {
		var room_type = Template.currentData().type
		if (room_type == 'king' || room_type == 'everyone') {
			return false
		}

		var user_id = Meteor.userId()

		// if owner
		if (user_id == Template.currentData().owner) {
			return true
		}

		return false
	},

	showLeaveButton: function() {
		return Template.currentData().type == 'normal'
	},

	showNewNotification: function() {
		if (Session.get('windowHasFocus') && Session.get('selectedChatroomId') == this._id) {
			var date = new Date(TimeSync.serverTime(null, 5000))
			Cookie.set('room_'+this._id+'_open', moment(date).add(1, 's').toDate(), {years: 10})
			return false
		}

		var recent = Recentchats.findOne({room_id:Template.currentData()._id})
		if (recent) {
			var latest_open = Cookie.get('room_'+this._id+'_open')
			if (latest_open) {
				if (moment(new Date(recent.updated_at)).isAfter(moment(new Date(latest_open)))) {
					return true
				}
			} else {
				return true
			}
		}
		return false
	}
})


Template.chatroom_open.events({
	'click .leaveChatroomButton': function(event, template) {
		if (template.showLeaveConfirm.get()) {
			template.showLeaveConfirm.set(false)
			template.showChatBox.set(true)
		} else {
			template.showChatBox.set(false)
			template.showRenameBox.set(false)
			template.showInviteBox.set(false)
			template.showLeaveConfirm.set(true)
		}
	},

	'click .chatroomLeaveNoButton': function(event, template) {
		template.showLeaveConfirm.set(false)
		template.showChatBox.set(true)
	},

	'click .chatroomLeaveYesButton': function(event, template) {
		Meteor.call('leaveChatroom', template.data._id)
	},

	'click .showMembersButton': function(event, template) {
		template.showMembers.set(!template.showMembers.get())
	},

	'click .renameButton': function(event, template) {
		if (template.showRenameBox.get()) {
			template.showRenameBox.set(false)
			template.showChatBox.set(true)
		} else {
			template.showChatBox.set(false)
			template.showLeaveConfirm.set(false)
			template.showInviteBox.set(false)
			template.showRenameBox.set(true)
		}
	},

	'click .renameCancelButton': function(event, template) {
		template.showRenameBox.set(false)
		template.showChatBox.set(true)
	},

	'click .renameSaveButton': function(event, template) {
		var name = template.find('.renameInput')
		var errorAlert = template.find('.renameErrorAlert')
		var button = event.currentTarget
		var button_html = $(button).html()

		$(errorAlert).hide()

		$(button).attr('disabled', true)
		$(button).html('Please Wait')

		Meteor.call('renameChatroom', template.data._id, $(name).val(), function(error, result) {
			$(button).attr('disabled', false)
			$(button).html(button_html)

			if (error) {
				$(errorAlert).show()
				$(errorAlert).html(error.error)
			} else {
				template.showRenameBox.set(false)
				template.showChatBox.set(true)
			}
		})
	},

	'click .inviteButton': function(event, template) {
		if (template.showInviteBox.get()) {
			template.showInviteBox.set(false)
			template.showChatBox.set(true)
		} else {
			template.showChatBox.set(false)
			template.showLeaveConfirm.set(false)
			template.showRenameBox.set(false)
			template.showInviteBox.set(true)
		}
	},

	'click .inviteCancelButton': function(event, template) {
		template.showInviteBox.set(false)
		template.showChatBox.set(true)
	},

	'click .inviteSaveButton': function(event, template) {
		var name = template.find('.inviteInput')
		var errorAlert = template.find('.inviteErrorAlert')
		var button = event.currentTarget
		var button_html = $(button).html()

		$(errorAlert).hide()

		$(button).attr('disabled', true)
		$(button).html('Please Wait')

		Meteor.call('inviteToChatroom', template.data._id, $(name).val(), function(error, result) {
			$(button).attr('disabled', false)
			$(button).html(button_html)

			if (error) {
				$(errorAlert).show()
				$(errorAlert).html(error.error)
			} else {
				$(name).val('')
				template.showInviteBox.set(false)
				template.showChatBox.set(true)
			}
		})
	},

	'click .sendChatButton': function(event, template) {
		event.preventDefault()
		event.stopPropagation()

		var input = template.find('.chatInput')

		var message = _.clean($(input).val())

		if (message.length == 0) {
			return
		}

		if (message.length > 400) {
			return;
		}

		var date = new Date(TimeSync.serverTime(null, 5000))

		Roomchats.insert({
			room_id: template.data._id,
			created_at: date,
			user_id: Meteor.userId(),
			text: message
		})

		$(input).val('')

		Meteor.call('updateRecentChat', template.data._id)
		Cookie.set('room_'+this._id+'_open', moment(date).add(1, 's').toDate(), {years: 10})
	},

	'click .usernameLink': function(event, template) {
		event.preventDefault()
		event.stopPropagation()
		center_on_hex(this.x, this.y)
		Session.set('selected_type', 'castle')
		Session.set('selected_id', this.castle_id)
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
	},

	// same as click function
	'keyup .chatInput': function(event, template) {
		if (event.keyCode === 13) {
			event.preventDefault()
			event.stopPropagation()

			var input = template.find('.chatInput')

			var message = _.clean($(input).val())

			if (message.length == 0) {
				return
			}

			if (message.length > 400) {
				return;
			}

			var date = new Date(TimeSync.serverTime(null, 5000))

			Roomchats.insert({
				room_id: template.data._id,
				created_at: date,
				user_id: Meteor.userId(),
				text: message
			})

			$(input).val('')

			Meteor.call('updateRecentChat', template.data._id)
			Cookie.set('room_'+this._id+'_open', moment(date).add(1, 's').toDate(), {years: 10})
		}
	}
})



Template.chatroom_open.created = function() {
	var self = this

	this.showLeaveConfirm = new ReactiveVar(false)
	this.showRenameBox = new ReactiveVar(false)
	this.showInviteBox = new ReactiveVar(false)
	this.showMembers = new ReactiveVar(false)
	this.showChatBox = new ReactiveVar(true)

	self.chatroomChatsReady = new ReactiveVar(false)
	this.autorun(function() {
		var selected_id = Session.get('selectedChatroomId')
		if (selected_id) {
			var chatroomChatsHandle = Meteor.subscribe('roomchats', selected_id)
			self.chatroomChatsReady.set(chatroomChatsHandle.ready())
		}
	})

	self.chatroomMembersReady = new ReactiveVar(false)
	this.autorun(function() {
		if (Template.currentData()) {
			if (Template.currentData().type == 'everyone') {
				var roomMembersHandle = Meteor.subscribe('room_members_everyone', Template.currentData().members)
			} else {
				var roomMembersHandle = Meteor.subscribe('room_members', Template.currentData().members)
			}
		}
		self.chatroomMembersReady.set(roomMembersHandle.ready())
	})
}
