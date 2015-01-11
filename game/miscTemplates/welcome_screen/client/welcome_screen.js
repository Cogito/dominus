Template.welcome_screen.helpers({
    show: function() {
        if (!Session.get('show_building_castle_modal')) {
            var res = Meteor.users.findOne(Meteor.userId(), {fields: {show_welcome_screen: 1}})
            if (res) {
                if (res.show_welcome_screen) {
                    return true
                }
            }
        }
    },
})


Template.welcome_screen.events({
    'click #close_welcome_screen_button': function(event, template) {
        Meteor.call('hide_welcome_screen')
    }
})


Template.welcome_screen.created = function() {
    this.autorun(function() {
        var fields = {show_welcome_screen:1, castle_id:1, x:1, y:1}
        var user = Meteor.users.findOne(Meteor.userId(), {fields: fields})
        if (user) {
            if(typeof user.castle_id == 'undefined' || typeof user.x == 'undefined' || typeof user.y == 'undefined') {
                Session.set('show_building_castle_modal', true)
            } else {
                Session.set('show_building_castle_modal', false)
                if (user.show_welcome_screen) {
                    Session.set('selected_id', user.castle_id)
                    Session.set('selected_type', 'castle')
                    center_on_hex(user.x, user.y)
                }
            }
        }
    })
}


Template.welcome_screen.rendered = function() {
    var canvasSize = Session.get('canvas_size')
    if (canvasSize) {
        $('#welcomeScreenPositioner').css('left', canvasSize.width/2 - 250)
        $('#welcomeScreenPositioner').css('top', canvasSize.height/2 - 150)
    }

    this.autorun(function() {
        var canvasSize = Session.get('canvas_size')
        if (canvasSize) {
            $('#welcomeScreenPositioner').css('left', canvasSize.width/2 - 250)
            $('#welcomeScreenPositioner').css('top', canvasSize.height/2 - 150)
        }
    })

    var _fbq = window._fbq || (window._fbq = []);
    if (!_fbq.loaded) {
        var fbds = document.createElement('script');
        fbds.async = true;
        fbds.src = '//connect.facebook.net/en_US/fbds.js';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(fbds, s);
        _fbq.loaded = true;
    }

    window._fbq = window._fbq || [];
    window._fbq.push(['track', '6020229310431', {'value':'0.00','currency':'USD'}]);
}
