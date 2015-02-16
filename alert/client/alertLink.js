Template.alertLink.helpers({
    alert: function() {
        return GlobalAlerts.findOne(this._id)
    }
})
