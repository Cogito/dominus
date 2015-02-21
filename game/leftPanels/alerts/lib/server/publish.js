Meteor.publish('globalAlerts', function() {
    if(this.userId) {
        return GlobalAlerts.find({},{sort:{created_at:-1}, limit:150})
    } else {
        this.ready()
    }
})

Meteor.publish('globalAlert', function(id) {
    if(this.userId) {
        return GlobalAlerts.find(id)
    } else {
        this.ready()
    }
})

Meteor.publish('myAlerts', function() {
    if(this.userId) {
        return Alerts.find({user_ids: {$elemMatch: {user_id:this.userId}}})
    } else {
        this.ready()
    }
})

// client only collection
Meteor.publish('alertUser', function(user_id) {
    var self = this
    var cur = Meteor.users.find(user_id, {fields: {username:1, x:1, y:1, castle_id:1}})
    Mongo.Collection._publishCursor(cur, self, 'alertusers')
    return self.ready();
})


Meteor.publish('alertArmy', function(army_id) {
    var cur = Armies.find({_id:army_id, user_id:this.userId}, {fields: {name:1, username:1, x:1, y:1, castle_id:1}})
    Mongo.Collection._publishCursor(cur, this, 'alertarmies')
    return this.ready();
})


Meteor.publish('alertChatroom', function(room_id) {
    var self = this
    var cur = Rooms.find(room_id, {fields: {name:1}})
    Mongo.Collection._publishCursor(cur, self, 'alertchatrooms')
    return self.ready();
})


Meteor.publish('battleAlertTitles', function() {
    var self = this
    var fields = {
        created_at:1,
        isOver:1,
        x:1,
        y:1
        }

    fields['currentUnits.username'] = 1
    fields['currentUnits.type'] = 1
    fields['currentUnits.name'] = 1

    var cur = Battles.find({},{sort:{created_at:-1}, limit:150, fields:fields})
    Mongo.Collection._publishCursor(cur, self, 'alertbattletitles')
    return self.ready();
})


Meteor.publish('unreadAlerts', function() {
    var self = this
    var cur = Alerts.find({user_ids: {$elemMatch: {user_id:this.userId, read:false}}}, {fields:{_id:1}})
    Mongo.Collection._publishCursor(cur, self, 'unreadalerts')
    return self.ready();
})
