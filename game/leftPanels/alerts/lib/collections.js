Alerts = new Meteor.Collection('alerts')
GlobalAlerts = new Meteor.Collection('globalalerts')

if (Meteor.isClient) {
    // client only collections to hold data for alerts
    AlertUsers = new Mongo.Collection('alertusers')
    AlertChatrooms = new Mongo.Collection('alertchatrooms')
    AlertArmies = new Mongo.Collection('alertarmies')
    AlertCastles = new Mongo.Collection('alertcastles')
    AlertVillages = new Mongo.Collection('alertvillages')

    AlertBattleTitles = new Mongo.Collection('alertbattletitles')
    UnreadAlerts = new Mongo.Collection('unreadalerts')
}
