Template.alerts_mine.helpers({
    alerts: function() {
        return Alerts.find({},{sort:{created_at:-1}})
    }
})


Template.alerts_mine.events({
    'click #markAllAlertsAsReadButton': function() {
        Meteor.call('markAllAlertsAsRead')
    }
})


Template.alerts_mine.created = function() {
    var self = this

    self.autorun(function() {
        Meteor.subscribe('myAlerts')
    })
}
