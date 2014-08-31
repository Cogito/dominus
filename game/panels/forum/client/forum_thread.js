Template.forum_thread.helpers({
	is_new: function() {
		if (this.last_post_username != Meteor.user().username) {
			var lastest_view = Cookie.get('viewed_thread_'+this._id)
			if (lastest_view) {
				if (moment(new Date(this.updated_at)).isAfter(moment(lastest_view))) {
					return true
				}
			} else {
				return true
			}
		}
		return false
	}
})