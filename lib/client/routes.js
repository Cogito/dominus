Router.map(function() {

	this.route('index', {
		path: '/',
		action: function() {
			GAnalytics.pageview();
			if (Meteor.userId()) {
				this.render('game')
			} else {
				this.render('landing')
			}
		}
	})

});
