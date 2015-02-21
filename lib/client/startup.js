Accounts.ui.config({
  passwordSignupFields: 'USERNAME_AND_EMAIL'
});

TimeSync.loggingEnabled = false

Meteor.startup(function() {
    Tracker.autorun(function(c) {
        if (Meteor.userId()) {
            try {
                UserStatus.startMonitor({
                    threshold: 1000 * 60 * 5,
                    interval: 1000 * 20,
                    idleOnBlur: false
                });
            } catch (error) {}
        }
    });
})


Session.set("Mongol", {
    'collections': ['Castles', 'Armies', 'Villages'],
    'display': true,
    'opacity_normal': ".7",
    'opacity_expand': ".9",
    'disable_warning': 'false'
});
