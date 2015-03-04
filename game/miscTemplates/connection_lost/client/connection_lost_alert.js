Template.connection_lost_alert.helpers({
    show: function() {
        return !Meteor.status().connected
    }
})
