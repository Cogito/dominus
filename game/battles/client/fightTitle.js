Template.fightTitle.helpers({
    isOpen: function() {
        return Template.instance().isOpen.get()
    },

    fight: function() {
        return Fights.findOne(this._id)
    }
})

Template.fightTitle.events({
    'click .fightOpenButton': function() {
        if (Template.instance().isOpen.get()) {
            Template.instance().isOpen.set(false)
        } else {
            Template.instance().isOpen.set(true)
        }
    }
})


Template.fightTitle.created = function() {
    var self = this

    self.isOpen = new ReactiveVar(false)
    self.subs = new ReadyManager()

    self.autorun(function() {
        if (self.isOpen.get()) {
            self.subs.subscriptions([{
                groupName: 'fight',
                subscriptions: [ Meteor.subscribe('fight', Template.currentData()._id).ready() ]
            }])
        }
    })
}
