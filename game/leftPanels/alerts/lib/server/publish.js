Meteor.publish('globalAlerts', function(numShow) {
    numShow = Math.min(numShow, 150)
    if(this.userId) {
        return GlobalAlerts.find({},{sort:{created_at:-1}, limit:numShow})
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

Meteor.publish('myAlerts', function(numShow) {
    numShow = Math.min(numShow, 150)
    if(this.userId) {
        return Alerts.find({user_ids: {$elemMatch: {user_id:this.userId}}}, {sort:{created_at:-1}, limit:numShow})
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
    var cur = Armies.find({_id:army_id}, {fields: {name:1, username:1, x:1, y:1, castle_id:1}})
    Mongo.Collection._publishCursor(cur, this, 'alertarmies')
    return this.ready();
})


Meteor.publish('alertVillage', function(village_id) {
    var cur = Villages.find({_id:village_id}, {fields: {name:1, username:1, x:1, y:1, castle_id:1}})
    Mongo.Collection._publishCursor(cur, this, 'alertvillages')
    return this.ready();
})


Meteor.publish('alertCastle', function(castle_id) {
    var cur = Castles.find({_id:castle_id}, {fields: {name:1, username:1, x:1, y:1, castle_id:1}})
    Mongo.Collection._publishCursor(cur, this, 'alertcastles')
    return this.ready();
})


Meteor.publish('alertChatroom', function(room_id) {
    var self = this
    var cur = Rooms.find(room_id, {fields: {name:1}})
    Mongo.Collection._publishCursor(cur, self, 'alertchatrooms')
    return self.ready();
})


Meteor.publish('battleAlertTitles', function(numShow) {
    var self = this
    var fields = {
        created_at:1,
        updated_at:1,
        isOver:1,
        x:1,
        y:1,
        castleWasTaken:1
        }

    fields['currentUnits.username'] = 1
    fields['currentUnits.type'] = 1
    fields['currentUnits.name'] = 1
    fields['currentUnits.dead'] = 1
    fields['currentUnits._id'] = 1

    var cur = Battles.find({},{sort:{updated_at:-1}, limit:numShow, fields:fields})
    Mongo.Collection._publishCursor(cur, self, 'alertbattletitles')
    return self.ready();
})


Meteor.publish('unreadAlerts', function() {
    var self = this
    var cur = Alerts.find({user_ids: {$elemMatch: {user_id:this.userId, read:false}}}, {fields:{_id:1}})
    Mongo.Collection._publishCursor(cur, self, 'unreadalerts')
    return self.ready();
})



Meteor.publish('alertGameEndDate', function() {
    return Settings.find({name:'gameEndDate'})
})


Meteor.publish('isGameOver', function() {
    return Settings.find({name:'isGameOver'})
})


Meteor.publish('lastDominusUserId', function() {
    return Settings.find({name:'lastDominusUserId'})
})


Meteor.publish('alertPreviousDominus', function(dominus_id) {
    var sub = this
    var cur = Meteor.users.find(dominus_id, {fields: {
        username:1,
        castle_id:1,
        x:1,
        y:1,
        is_dominus:1
    }})
    Mongo.Collection._publishCursor(cur, sub, 'alertPreviousDominus')
    return sub.ready();
})
