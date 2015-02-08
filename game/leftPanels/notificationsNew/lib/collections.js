// one for every notification
NotificationContents = new Meteor.Collection('notificationcontents')

// these are per person
// they link user to either notificationContents or a battle
NotificationTitles = new Meteor.Collection('notificationtitles')

// global notifications
// one for every notification that is global or battle that is finished
NotificationGlobalTitles = new Meteor.Collection('notificationglobaltitles')
