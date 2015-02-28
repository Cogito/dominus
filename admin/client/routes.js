Router.map(function() {

	this.route('admin')

	this.route('adminForums', {
		path: '/admin/forums',
		waitOn: function() { return Meteor.subscribe('admin_forums') }
	})

	this.route('adminCharges', {
		path: '/admin/charges',
		waitOn: function() { return Meteor.subscribe('admin_charges') }
	})

	this.route('adminFacts', {
		path: '/admin/facts'
	})

	this.route('adminGamestats', {
		path: '/admin/gamestats',
		waitOn: function() { return Meteor.subscribe('admin_gamestats') }
	})

	this.route('adminJobs', {
		path: '/admin/jobs'
	})

	this.route('adminJobqueue', {
		path: '/admin/admin_jobqueue',
	})

	this.route('adminJobstats', {
		path: '/admin/jobstats',
		waitOn: function() { return Meteor.subscribe('admin_jobstats') }
	})

	this.route('adminMailchimpList', {
		path: '/admin/admin_mailchimp_list',
		waitOn: function() { return Meteor.subscribe('admin_mailchimp_list') }
	})

	this.route('adminUsersOnline', {
		path: '/admin/admin_users_online',
		waitOn: function() { return Meteor.subscribe('admin_users_online') }
	})

	this.route('adminCommands', {
		path: '/admin/admin_commands',
	})

	this.route('adminChatrooms', {
		path: '/admin/admin_chatrooms',
		waitOn: function() { return Meteor.subscribe('admin_chatrooms')}
	})

});
