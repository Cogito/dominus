Router.map(function() {
	this.route('game', {path: '/'})

	this.route('admin')

	this.route('admin_forums', {
		path: '/admin/forums',
		waitOn: function() { return Meteor.subscribe('admin_forums') }
	})

	this.route('admin_charges', {
		path: '/admin/charges',
		waitOn: function() { return Meteor.subscribe('admin_charges') }
	})

	this.route('admin_facts', {
		path: '/admin/facts'
	})

	this.route('admin_gamestats', {
		path: '/admin/gamestats',
		waitOn: function() { return Meteor.subscribe('admin_gamestats') }
	})

	this.route('admin_jobstats', {
		path: '/admin/jobstats',
		waitOn: function() { return Meteor.subscribe('admin_jobstats') }
	})

	this.route('admin_mailchimp_list', {
		path: '/admin/admin_mailchimp_list',
		waitOn: function() { return Meteor.subscribe('admin_mailchimp_list') }
	})

	this.route('admin_users_online', {
		path: '/admin/admin_users_online',
		waitOn: function() { return Meteor.subscribe('admin_users_online') }
	})

	this.route('admin_jobqueue', {
		path: '/admin/admin_jobqueue',
		waitOn: function() { return Meteor.subscribe('admin_jobqueue')}
	})

	this.route('admin_commands', {
		path: '/admin/admin_commands',
	})

	this.route('presskit', {
		path: '/presskit'
	})

});