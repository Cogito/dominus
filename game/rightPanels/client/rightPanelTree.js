var lords = new ReactiveVar([])

Template.rightPanelTree.created = function() {
    this.autorun(function() {
        if (Template.currentData()) {
            var user = RightPanelUser.findOne(Template.currentData().user_id)
            if (user) {
                var lordsArray = getLords(user, []).reverse()
                lordsArray.push(user)
                lords.set(lordsArray)
            }
        }
    })
}

Template.rightPanelTree.helpers({
    king: function() {
        return lords.get()[0]
    },

    hasLords: function() {
        var user = RightPanelUser.findOne(this.user_id)
        if (user) {
            return user.lord
        }
    },

    thisUser: function() {
        var user = RightPanelUser.findOne(this.user_id)
        if (user) {
            return user
        }
    },
})

var getLords = function(user, lordsArray) {
    var lord = RightPanelTreeUsers.findOne(user.lord)
    if (lord) {
        lordsArray.push(lord)
        if (lord.lord) {
            lordsArray = getLords(lord, lordsArray)
        }
    }
    return lordsArray
}


Template.rightPanelTreeUser.helpers({
    getNextLord: function() {
        var self = this
        var nextLord = _.find(lords.get(), function(lord) {
            return lord.lord == self._id
        })
        return nextLord
    }
})

Template.rightPanelTreeUser.events({
    'click .username': function(event, template) {
        center_on_hex(this.x, this.y)
        Session.set('selected_type', 'castle')
        Session.set('selected_id', this.castle_id)
    }
})
