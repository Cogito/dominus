Template.alertLink.helpers({
    alert: function() {
        return GlobalAlerts.findOne(this._id)
    }
})

Template.alertLink.rendered = function() {
    document.body.style.backgroundColor = '#333';
}
