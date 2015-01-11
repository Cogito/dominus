Meteor.methods({
    hide_welcome_screen: function() {
        Meteor.users.update(Meteor.userId(), {$set: {show_welcome_screen: false}})
    }
})
