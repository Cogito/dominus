### Steps to run ###

* Install Meteor.js
* run "meteor update" to install packages (might need to be migrated to 0.9 with "mrt migrate-app" after "npm install -g mrt")
* Set admin address in server/accounts.js
* Setup SMTP in server/smtp.js
* Set Stripe keys in settings.json
* Run with "./run"


### Known Issues ###

* The battle package has some issues still.  I believe the problem is defender.enemies and attackers[0].enemies should not be a reference.
* Issues are tracked at https://bitbucket.org/daniel_phillips/gridgame/issues?status=new&status=open and should probably be moved to github.
* Admin address, SMTP and stripe keys need to be moved to environment variables so they don't have to be checked into git.