Router.map(function() {
	
	this.route('index', {
		path: '/',
		action: function() {
			if (Meteor.userId()) {
				this.render('game')
			} else {
				this.render('landing')
			}
		}
	})

});