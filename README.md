![Alt text](/public/presskit/presskit_banner.jpg?raw=true "Optional Title")

### Dominus ###
http://dominusgame.net

Dominus is a multiplayer browser strategy game.  Grow in power by conquering castles.   Make everyone in the game your vassal to become the Dominus.

Dominus is a slow strategy game.  Army movement and resource gathering happen slowly over time.  Login, give your armies their orders then check back in a few hours.

The game is able to support any number of people.  As more people join the map grows creating a larger gameplay space.

Dominus is made using the web platform <a href="http://meteor.com">Meteor</a>.


### Steps to run ###

* Install <a href="http://meteor.com">Meteor</a>
* Run "meteor update" to install packages.
* Duplicate the file "run_temp" and name it "run".
* Duplicate the file "settings_temp.json" and name it "settings.json".
* "chmod +x run"
* "chmod +x settings.json"
* Fill in the run file and settings.json.  These file is in the .gitignore and never checked in.
    * If you create a player with DOMINUS_ADMIN_EMAIL as their email they will be an admin and have access to localhost:3000/admin
    * DOMINUS_WORKER must be true for jobs to run.
    * Images for the map background are generated whenever the map changes and stored on Amazon S3.  Add your S3 bucket info to settings.json.
    * Stripe is used for payments, set your stripe account keys in settings.json.
* Start game with "./run"
* Open http://localhost:3000 in your browser.
