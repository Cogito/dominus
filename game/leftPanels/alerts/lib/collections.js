Alerts = new Meteor.Collection('alerts')
GlobalAlerts = new Meteor.Collection('globalalerts')

if (Meteor.isClient) {
    // client only collection to hold users that are referenced in alerts
    AlertUsers = new Mongo.Collection('alertusers')
    AlertBattleTitles = new Mongo.Collection('alertbattletitles')
    UnreadAlerts = new Mongo.Collection('unreadalerts')
}
