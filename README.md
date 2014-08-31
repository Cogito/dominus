Dominus is a multiplayer browser strategy game.  Players grow in power by attacking another player's castle.  Conquering someone's castle makes them your vassal.  Vassals send their lord 25% of their income.  If everyone in the game is your vassal or a vassal of your vassal then you are the Dominus.

Dominus is a slow strategy game that is designed to not require a lot of time to play.  Army movement and resource gathering happen slowly over time.  Login, give your armies their orders then check back in a few hours.

The game is able to support any number of people.  As more people join the map grows creating a larger gameplay space.

Dominus is made using the web platform <a href="http://meteor.com">Meteor.js</a>.


### Steps to run ###

* Install Meteor.js
* run "meteor update" to install packages (might need to be migrated to 0.9 with "mrt migrate-app" after "npm install -g mrt")
* Set admin address in server/accounts.js
* Setup SMTP in server/smtp.js
* Set Stripe keys in settings.json
* Run with "./run"

process_renders requires ImageMagick


### Known Issues ###

* The battle package has some issues still.  I believe the problem is defender.enemies and attackers[0].enemies should not be a reference.  It causes a Maximum call stack size exceeded error.
* Issues are tracked at https://bitbucket.org/daniel_phillips/gridgame/issues?status=new&status=open and should probably be moved to github.
* Admin address, SMTP and stripe keys need to be moved to environment variables so they don't have to be checked into git.