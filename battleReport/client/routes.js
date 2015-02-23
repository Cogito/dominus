Router.route('/battle/:_id', function() {
    this.wait(Meteor.subscribe('battle', this.params._id))
    GAnalytics.pageview('/battle/'+this.params._id);
    if (this.ready()) {
        this.render('battle', {
            data: function() {
                return Battles.findOne(this.params._id)
            }
        })
    } else {
        this.render('battleLoading')
    }
})
