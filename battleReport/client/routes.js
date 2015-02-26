Router.route('/battle/:_id', function() {
    GAnalytics.pageview('/battle/'+this.params._id);
    this.render('battle', {
        data: {
            _id:this.params._id
            }
    })
})
