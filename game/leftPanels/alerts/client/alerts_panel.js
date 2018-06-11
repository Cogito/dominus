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

    timeUntilGameEnd: function() {
        Session.get('refresh_time_field')
        return moment.duration(moment(new Date(s.game_end)) - moment()).humanize()
    },

    isGameEndDateSet: function() {
        var end = Settings.findOne({name: 'gameEndDate'})
        if (end && end.value != null) {
            return true
        } else {
            return false
        }
    },

    isGameOver: function() {
        var setting = Settings.findOne({name: 'isGameOver'})
        if (setting) {
            return setting.value
        }
    },

    timeTilGameEndWhenNewDominus: function() {
        return moment.duration(s.time_til_game_end_when_new_dominus).humanize()
    },

    gameEndDate: function() {
        var end = Settings.findOne({name: 'gameEndDate'})
        return end.value
    },

    dominus: function() {
        return RankingsDominus.findOne()
    },

    previousDominus: function() {
        return AlertPreviousDominus.findOne()
    }
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

    'click .userLink': function(event, template) {
        var x = parseInt(event.currentTarget.getAttribute('data-x'))
        var y = parseInt(event.currentTarget.getAttribute('data-y'))
        var castle_id = event.currentTarget.getAttribute('data-castle_id')

        center_on_hex(x,y)
        Session.set('selected_type', 'castle')
        Session.set('selected_id', castle_id)
        Session.set('selected_coords', {x:x, y:y})
    },
})


Template.alerts_panel.created = function() {
    var self = this

    self.activeTab = new ReactiveVar('mine')

    this.autorun(function() {
        Meteor.subscribe('alertGameEndDate')
        Meteor.subscribe('isGameOver')
        Meteor.subscribe('lastDominusUserId')
        Meteor.subscribe('dominus_rankings')

        var lastDominusUserId = Settings.findOne({name:'lastDominusUserId'})
        if (lastDominusUserId) {
            Meteor.subscribe('alertPreviousDominus', lastDominusUserId.value)
        }
    })

}


Template.alerts_panel.rendered = function() {
    this.firstNode.parentNode._uihooks = leftPanelAnimation
}
