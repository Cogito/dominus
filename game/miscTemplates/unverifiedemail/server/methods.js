Meteor.methods({
    resendVerificationEmail: function() {
        var userId = Meteor.userId()
        check(userId, String)
        Accounts.sendVerificationEmail(userId)
        return true
    }
})
