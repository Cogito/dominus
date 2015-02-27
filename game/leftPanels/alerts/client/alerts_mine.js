Template.alerts_mine.helpers({
    alerts: function() {
        return Alerts.find({},{sort:{created_at:-1}})
    }
})


Template.alerts_mine.events({
    'click #markAllAlertsAsReadButton': function() {
        Meteor.call('markAllAlertsAsRead')
    },

    'click #showMoreButton': function() {
        Template.instance().numShow.set(Template.instance().numShow.get() + 5)
    }
})


Template.alerts_mine.created = function() {
    var self = this

    self.numShow = new ReactiveVar(10)

    self.autorun(function() {
        Meteor.subscribe('myAlerts', self.numShow.get())
    })
}
