Cue.addJob('deleteInactiveUsers', {retryOnError:false, maxMs:1000*60*20}, function(task, done) {

    var cutoff = moment().subtract(2, 'days').toDate()

    var find = {created_at:{$lt:cutoff}, "emails.verified":false}
    var fields = {_id:1, username:1}

    Meteor.users.find(find, {fields:fields}).forEach(function(user) {
        Cue.addTask('deleteAccount', {isAsync:false, unique:true}, {user_id:user._id})
        gAlert_inactiveAccountDeleted(user.username)
    })

    done()
})
