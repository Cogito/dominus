Template.ga_nameChange.helpers({
    user: function() {
        return AlertUsers.findOne(this.vars.user_id)
    },

    title: function() {
        var user = AlertUsers.findOne(this.vars.user_id)
        if (user) {
            return this.vars.previousName +"'s new name is "+user.username
        }
    },

    isOpen: function() {
        return Template.instance().isOpen.get()
    }
})


Template.ga_nameChange.events = alertSharedEvents


Template.ga_nameChange.created = function() {
    var self = this

    self.isOpen = new ReactiveVar(false)

    self.autorun(function() {
        if (Template.currentData()) {
            Meteor.subscribe('alertUser', Template.currentData().vars.user_id)
        }
    })
}
