Alerts = new Meteor.Collection('alerts')
GlobalAlerts = new Meteor.Collection('globalalerts')

if (Meteor.isClient) {
    // client only collections to hold data for alerts
    AlertUsers = new Mongo.Collection('alertusers')
    AlertChatrooms = new Mongo.Collection('alertchatrooms')

    AlertBattleTitles = new Mongo.Collection('alertbattletitles')
    UnreadAlerts = new Mongo.Collection('unreadalerts')
}
