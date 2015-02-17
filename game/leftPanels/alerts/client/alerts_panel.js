Template.alerts_panel.helpers({
    mineActive: function() {
        if (Template.instance().activeTab.get() == 'mine') {
            return 'active'
        }
    },

    globalActive: function() {
        if (Template.instance().activeTab.get() == 'global') {
            return 'active'
        }
    },

    battlesActive: function() {
        if (Template.instance().activeTab.get() == 'battles') {
            return 'active'
        }
    },

    numUnreadAlerts: function() {
        return UnreadAlerts.find().count()
    },
})


Template.alerts_panel.events({
    'click #mineButton': function(event, template) {
        event.preventDefault()
        Template.instance().activeTab.set('mine')
    },

    'click #globalButton': function(event, template) {
        event.preventDefault()
        Template.instance().activeTab.set('global')
    },

    'click #battlesButton': function(event, template) {
        event.preventDefault()
        Template.instance().activeTab.set('battles')
    },
})


Template.alerts_panel.created = function() {
    var self = this

    self.activeTab = new ReactiveVar('mine')
}
