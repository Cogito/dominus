Template.not_header.helpers({
	date_nice: function() {
		Session.get('refresh_time_field')
		return moment(new Date(this.created_at)).calendar()
	},

	show_mine: function() {
		return (Session.get('notifications_type') == 'notifications_mine')
	},

	title: function() {
		var self = this
		if (this.type == 'battle') {
			var mine = (Session.get('notifications_type') == 'notifications_mine')

			var unit = self.vars.battle.unit

			if (mine) {
				var str = unit.type
			} else {
				var str = unit.username+"'s "+unit.type
			}

			if (unit.dif > 0) {
				str += ' won '
			} else {
				str += ' lost '
			}

			str += 'a battle at hex '+unit.x+', '+unit.y

			return str
		}

		if (this.type == 'lost_vassal_loop') {
			return this.vars.username+' is no longer your vassal'
		}

		if (this.type == 'lost_vassal_to_another') {
			return this.vars.lost_vassal.username+' is no longer your vassal'
		}

		if (this.type == 'new_chatroom_lords') {
			return 'New Chatroom'
		}

		if (this.type == 'new_chatroom_lords_room') {
			return 'New Chatroom'
		}

		if (this.type == 'new_chatroom_kings') {
			return 'New Chatroom'
		}

		if (this.type == 'new_chatroom_kings_room') {
			return 'New Chatroom'
		}

		if (this.type == 'new_chatroom_user') {
			return 'New Chatroom with '+this.vars.username
		}

		if (this.type == 'new_lord') {
			return this.vars.username+' is your new lord'
		}

		if (this.type == 'new_vassal') {
			return this.vars.username+' is now your vassal'
		}

		if (this.type == 'no_longer_a_king') {
			return 'No longer a King'
		}

		if (this.type == 'no_longer_dominus') {
			return 'No longer Dominus'
		}

		if (this.type == 'no_longer_dominus_new_user') {
			return 'No longer Dominus'
		}

		if (this.type == 'now_a_king') {
			return 'You are a King'
		}

		if (this.type == 'now_dominus') {
			if (Session.get('notifications_show_mine')) {
				return 'You are the Dominus'
			} else {
				return 'New Dominus'
			}
		}

		if (this.type == 'sent_gold') {
			return this.vars.from_username+' Sent You '+this.vars.amount+' Gold'
		}
	},


})