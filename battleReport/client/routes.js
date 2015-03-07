Router.route('/battle/:_id', function() {
    this.render('battle', {
        data: {
            _id:this.params._id
            }
    })
    GAnalytics.pageview('/battle/'+this.params._id);
})
