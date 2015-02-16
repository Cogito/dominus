Template.alerts_global.helpers({
    alerts: function() {
        return GlobalAlerts.find({},{sort:{created_at:-1}})
    }
})


Template.alerts_global.events({

})


Template.alerts_global.created = function() {
    var self = this

    self.autorun(function() {
        Meteor.subscribe('globalAlerts')
    })
}
