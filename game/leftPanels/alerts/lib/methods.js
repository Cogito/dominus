Meteor.methods({
    markAlertAsRead: function(alert_id) {
        Alerts.update({_id:alert_id, "user_ids.user_id":Meteor.userId()}, {$set:{"user_ids.$.read":true}})
    },

    markAllAlertsAsRead: function() {
        Alerts.update({"user_ids.user_id":Meteor.userId()}, {$set:{"user_ids.$.read":true}}, {multi:true})
    }
})
