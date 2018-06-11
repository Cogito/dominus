var helpers = {
    fromUser: function() {
        return AlertUsers.findOne(this.vars.fromUser_id)
    },

    title: function() {
        var user = AlertUsers.findOne(this.vars.fromUser_id)
        if (user) {
            return user.username+' sent you '+round_number(this.vars.amount)+' gold.'
        } else {
            return 'Someone sent you gold.'
        }
    },
}

Template.alert_receivedGoldFrom.helpers(_.extend(alertSharedHelpers, helpers))
Template.alert_receivedGoldFrom.events = alertSharedEvents
Template.alert_receivedGoldFrom.rendered = alertSharedRendered

Template.alert_receivedGoldFrom.created = function() {
    var self = this

    self.isOpen = new ReactiveVar(false)

    self.autorun(function() {
        if (Template.currentData()) {
            Meteor.subscribe('alertUser', Template.currentData().vars.fromUser_id)
        }
    })
}
