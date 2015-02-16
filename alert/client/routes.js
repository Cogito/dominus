Router.route('/alert/:_id', function() {
    this.wait(Meteor.subscribe('globalAlert', this.params._id))

    if (this.ready()) {
        this.render('alertLink', {
            data: function() {
                return GlobalAlerts.findOne(this.params._id)
            }
        })
    } else {
        this.render('battleLoading')
    }
})
