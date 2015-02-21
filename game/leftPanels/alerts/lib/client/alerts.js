alertSharedEvents = {
    'click .openAlertButton': function(event, template) {
        if (Template.instance().isOpen.get()) {
            Template.instance().isOpen.set(false)
        } else {
            Template.instance().isOpen.set(true)
            Meteor.call('markAlertAsRead', template.data._id)
        }
    },

    'click .userLink': function(event, template) {
        var x = parseInt(event.currentTarget.getAttribute('data-x'))
        var y = parseInt(event.currentTarget.getAttribute('data-y'))
        var castle_id = event.currentTarget.getAttribute('data-castle_id')

        center_on_hex(x,y)
        Session.set('selected_type', 'castle')
        Session.set('selected_id', castle_id)
        Session.set('selected_coords', {x:x, y:y})
    },

    'click .armyLink': function(event, template) {
        event.preventDefault()
        event.stopPropagation()
        var x = parseInt(event.currentTarget.getAttribute('data-x'))
        var y = parseInt(event.currentTarget.getAttribute('data-y'))
        var army_id = event.currentTarget.getAttribute('data-army_id')
        center_on_hex(x,y)
        Session.set('selected_type', 'army')
        Session.set('selected_id', army_id)
        Session.set('selected_coords', {x:x, y:y})
    },

    'click .coordinateLink': function(event, template) {
        event.preventDefault()
        event.stopPropagation()
        var hex = {
            x: parseInt(event.currentTarget.getAttribute('data-x')),
            y: parseInt(event.currentTarget.getAttribute('data-y'))
        }
        check(hex.x, validNumber)
        check(hex.y, validNumber)

        Meteor.call('coords_to_id', hex.x, hex.y, 'hex', function(error, hexId) {
            if (!error && hexId) {
                center_on_hex(hex.x, hex.y);
                Session.set('selected_type', 'hex');
                Session.set('selected_id', hexId);
                Session.set('selected_coords', {x:hex.x, y:hex.y})
            }
        });
    }
}


alertSharedHelpers = {
    isOpen: function() {
        return Template.instance().isOpen.get()
    },

    read: function() {
        var userId = Meteor.userId()
        var record = _.find(this.user_ids, function(users) {
            return users.user_id == userId
        })
        return record.read
    }
}


globalAlertSharedEvents = {
    'click .openAlertButton': function(event, template) {
        if (Template.instance().isOpen.get()) {
            Template.instance().isOpen.set(false)
        } else {
            Template.instance().isOpen.set(true)
        }
    },

    'click .userLink': function(event, template) {
        var x = parseInt(event.currentTarget.getAttribute('data-x'))
        var y = parseInt(event.currentTarget.getAttribute('data-y'))
        var castle_id = event.currentTarget.getAttribute('data-castle_id')

        center_on_hex(x,y)
        Session.set('selected_type', 'castle')
        Session.set('selected_id', castle_id)
        Session.set('selected_coords', {x:x, y:y})
    },
}


globalAlertSharedHelpers = {
    isOpen: function() {
        return Template.instance().isOpen.get()
    }
}


alertSharedRendered = function() {
    this.find('.alertAnimationWrapper')._uihooks = {
        insertElement: function(node, next) {
            $(node).hide().insertBefore(next).slideDown(120)
        },
        removeElement: function(node) {
            $(node).slideUp(80, function() {
                $(this).remove()
            })
        }
    }
}
