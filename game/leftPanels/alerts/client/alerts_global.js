Template.alerts_global.helpers({
    alerts: function() {
        return GlobalAlerts.find({},{sort:{created_at:-1}})
    }
})


Template.alerts_global.events({
    'click #showMoreButton': function() {
        Template.instance().numShow.set(Template.instance().numShow.get() + 5)
    }
})


Template.alerts_global.created = function() {
    var self = this

    self.numShow = new ReactiveVar(10)

    self.autorun(function() {
        Meteor.subscribe('globalAlerts', self.numShow.get())
    })
}
