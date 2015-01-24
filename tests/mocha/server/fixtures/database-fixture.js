/* globals
resetDatabase: true,
loadDefaultFixtures: true,
*/

var Future = Npm.require('fibers/future');

resetDatabase = function () {
    console.log('Resetting database');

    // safety check
    if (!process.env.IS_MIRROR) {
        console.error('velocityReset is not allowed outside of a mirror. Something has gone wrong.');
        return false;
    }

    var fut = new Future();

    var collectionsRemoved = 0;
    var db = Meteor.users.find()._mongo.db;
    db.collections(function (err, collections) {

        var appCollections = _.reject(collections, function (col) {
            return col.collectionName.indexOf('velocity') === 0 ||
            col.collectionName === 'system.indexes';
        });

        _.each(appCollections, function (appCollection) {
            appCollection.remove(function (e) {
                if (e) {
                    console.error('Failed removing collection', e);
                    fut.return('fail: ' + e);
                }
                collectionsRemoved++;
                //console.log('Removed collection');
                if (appCollections.length === collectionsRemoved) {
                    console.log('Finished resetting database');
                    fut['return']('success');
                }
            });
        });

    });

    return fut.wait();
};

loadDefaultFixtures = function () {
    console.log('Loading default fixtures');

    var user = {
        admin:false,
        username: 'player1',
        emails: [{address:'player1@email.com', verified:true}]
    }

    user = setupNewUser(user)
    Meteor.users.insert(user)

    // add some rings so that mapbaker doesn't get called
    generate_hexes(8, false)

    console.log('Finished loading default fixtures');
};

if (process.env.IS_MIRROR) {
    resetDatabase();
    loadDefaultFixtures();
}
