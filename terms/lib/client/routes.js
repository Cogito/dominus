Router.route('/terms', function() {
    GAnalytics.pageview('/terms');
    this.render('terms')
})
