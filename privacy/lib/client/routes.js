Router.route('/privacy', function() {
    GAnalytics.pageview('/privacy');
    this.render('privacy')
})
