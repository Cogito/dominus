var helpers = {
    title: function() {
        return 'Game over.'
    },

    winner: function() {
        if (this) {
            return AlertUsers.findOne(this.vars.winnerUser_id)
        }
    }
}


Template.ga_gameOver.helpers(_.extend(globalAlertSharedHelpers, helpers))
Template.ga_gameOver.events = alertSharedEvents
Template.ga_gameOver.rendered = alertSharedRendered


Template.ga_gameOver.created = function() {
    var self = this

    self.isOpen = new ReactiveVar(false)

    self.autorun(function() {
        if (Template.currentData()) {
            if (self.isOpen.get()) {
                Meteor.subscribe('alertUser', Template.currentData().vars.winnerUser_id)
            }
        }
    })
}
