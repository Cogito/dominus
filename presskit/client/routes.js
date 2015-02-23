Router.route('/presskit', function() {
	GAnalytics.pageview('/presskit');
	this.render('presskit')
})
