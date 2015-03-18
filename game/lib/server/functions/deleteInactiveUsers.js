// old
// Cue.addJob('deleteInactiveUsers', {retryOnError:false, maxMs:1000*60*20}, function(task, done) {
//
//     var cutoff = moment().subtract(2, 'days').toDate()
//
//     var find = {created_at:{$lt:cutoff}, "emails.verified":false}
//     var fields = {_id:1, username:1}
//
//     Meteor.users.find(find, {fields:fields}).forEach(function(user) {
//         Cue.addTask('deleteAccount', {isAsync:false, unique:true}, {user_id:user._id})
//         gAlert_inactiveAccountDeleted(user.username)
//     })
//
//     done()
// })


Cue.addJob('deleteInactiveUsers_new', {retryOnError:false, maxMs:1000*60*20}, function(task, done) {

    // don't find people who have logged in in the past 23 hours
    var cutoff_min = moment().subtract(23, 'hours').toDate();

    var cutoff_unverified = moment().subtract(s.inactives.deleteCutoff.unverifiedEmail, 'ms').toDate();
    var cutoff_noVillagesOrVassals = moment().subtract(s.inactives.deleteCutoff.noVillagesOrVassals, 'ms').toDate();
    var cutoff_everyonElse = moment().subtract(s.inactives.deleteCutoff.everyoneElse, 'ms').toDate();

    var reminderCutoff_unverified = moment().subtract(s.inactives.reminderCutoff.unverifiedEmail, 'ms').toDate();
    var reminderCutoff_noVillagesOrVassals = moment().subtract(s.inactives.reminderCutoff.noVillagesOrVassals, 'ms').toDate();
    var reminderCutoff_everyonElse = moment().subtract(s.inactives.reminderCutoff.everyoneElse, 'ms').toDate();

    var fields = {_id:1, username:1, emails:1, num_vassals:1, status:1, lastActive:1, accountDelNotificationSent:1};
    var find = {"status.online":false, lastActive: {$lt:cutoff_min}};

    Meteor.users.find(find, {fields:fields}).forEach(function(user) {

        // lastAcive is also updated when user logs out
        var lastLogin = null;
        if (user.lastActive) {
            lastLogin = moment(new Date(user.lastActive));
        } else {
            lastLogin = moment(new Date(user.status.lastLogin.date));
        }

        if (user.emails[0].verified) {
            var finished = false;

            // no vassals?
            if (!user.num_vassals) {

                // no villages?
                if (!Villages.find({user_id:user._id}).count()) {

                    // double check vassals
                    if (!Meteor.users.find({lord:user._id}).count()) {

                        if (lastLogin.isBefore(cutoff_noVillagesOrVassals)) {
                            delete_noVillagesOrVassals(user);
                            finished = true;
                        } else if (lastLogin.isBefore(reminderCutoff_noVillagesOrVassals)) {
                            reminder_noVillagesOrVassals(user);
                            finished = true;
                        }
                    }
                }
            }

            // check if longer than cutoff_everyonElse
            if (!finished) {
                if (lastLogin.isBefore(cutoff_everyonElse)) {
                    delete_everyoneElse(user);
                } else if (lastLogin.isBefore(reminderCutoff_everyonElse)) {
                    reminder_everyoneElse(user);
                }
            }
        } else {

            // email not verified
            if (lastLogin.isBefore(cutoff_unverified)) {
                delete_UnverifiedEmail(user);
            } else if (lastLogin.isBefore(reminderCutoff_unverified)) {
                reminder_UnverifiedEmail(user);
            }
        }
    });

    done();
});


var delete_UnverifiedEmail = function(user) {
    Cue.addTask('deleteAccount', {isAsync:false, unique:true}, {user_id:user._id});
    gAlert_inactiveAccountDeleted(user.username);
};

var delete_noVillagesOrVassals = function(user) {
    Cue.addTask('deleteAccount', {isAsync:false, unique:true}, {user_id:user._id});
    gAlert_inactiveAccountDeleted(user.username);
};

var delete_everyoneElse = function(user) {
    Cue.addTask('deleteAccount', {isAsync:false, unique:true}, {user_id:user._id});
    gAlert_inactiveAccountDeleted(user.username);
};

var reminder_UnverifiedEmail = function(user) {
    if (!user.accountDelNotificationSent) {
        Accounts.sendVerificationEmail(user._id);
        setAccountDelNotificationSent(user._id);
    }
};

var reminder_noVillagesOrVassals = function(user) {
    if (!user.accountDelNotificationSent) {
        mandrillSendTemplate('inactive-reminder-no-villages-or-vassals', user.emails[0].address, user.username);
        setAccountDelNotificationSent(user._id);
    }
};

var reminder_everyoneElse = function(user) {
    if (!user.accountDelNotificationSent) {
        mandrillSendTemplate('inactive-reminder-6-days', user.emails[0].address, user.username);
        setAccountDelNotificationSent(user._id);
    }
};


UserStatus.events.on('connectionLogin', function(fields) {
    updateUserLastActive(fields.userId);
});

UserStatus.events.on('connectionLogout', function(fields) {
    updateUserLastActive(fields.userId);
});

var updateUserLastActive = function(userId) {
    Meteor.users.update(userId, {$set:{lastActive:new Date()}});
};

var setAccountDelNotificationSent = function(userId) {
    Meteor.users.update(userId, {$set:{accountDelNotificationSent:true}});
};
