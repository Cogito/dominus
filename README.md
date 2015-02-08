![Alt text](/public/presskit/presskit_banner.jpg?raw=true "Optional Title")

### Dominus ###
https://dominusgame.net

Dominus is a multiplayer browser strategy game.  Grow in power by conquering castles.   Make everyone in the game your vassal to become the Dominus.

Dominus is a slow strategy game.  Army movement and resource gathering happen slowly over time.  Login, give your armies their orders then check back in a few hours.

The game is able to support any number of people.  As more people join the map grows creating a larger gameplay space.

Dominus is made using the web platform <a href="http://meteor.com">Meteor</a>.


### Steps to run ###

* Install <a href="http://meteor.com">Meteor</a>
* Go to the dominus directory in the terminal.
* Run `meteor update` to install packages.
* Map baking requires PhantomJS http://phantomjs.org/
* Duplicate the file "run_temp" and name it "run".
* Duplicate the file "settings_temp.json" and name it "settings.json".
* Make the run file executable. `chmod +x run`
* Make the settings file executable. `chmod +x settings.json`
* Fill in the run file and settings.json file.  These files are in .gitignore and are never checked in.
    * If you create a player with DOMINUS_ADMIN_EMAIL as their email they will be an admin and have access to localhost:3000/admin
    * `DOMINUS_WORKER` in the run file must be true for jobs to run.
    * Images for the map background are generated whenever the map changes and stored on Amazon S3. Add your S3 bucket info to settings.json.
        * [How to create S3 bucket](http://docs.aws.amazon.com/AmazonS3/latest/gsg/CreatingABucket.html)
        * `s3region` value can be found by looking at your s3 url. If your end point is dominus.s3-website-us-east-2.amazonaws.com, then your `s3region` value is `us-east-2`.
        * [How to get AWS key and secret](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSGettingStartedGuide/AWSCredentials.html)
    * Stripe is used for payments, set your stripe account keys in settings.json.
* Start game with `./run` in the terminal.
* Open http://localhost:3000 in your browser.
