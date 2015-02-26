Cue.addJob('deleteInactiveUsers', {retryOnError:false}, function(task, done) {

    var cutoff = moment().subtract(2, 'days').toDate()

    var find = {created_at:{$lt:cutoff}, "emails.verified":false}
    var fields = {_id:1}

    Meteor.users.find(find, {fields:fields}).forEach(function(user) {
        Cue.addTask('deleteAccount', {isAsync:true, unique:true}, {user_id:user._id})
    })

    done()
})
