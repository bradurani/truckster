console.log("----- STARTING TRUCKSTER ----");

var envParser = require('./app/env-parser');
var RSVP = require('rsvp');
var Slack = require('node-slack');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var gitPull = require('./app/git-pull');
var s3Sync = require('./app/s3-sync');

function init(env){
    var settings = parseEnv(env);
    var port = settings['TRUCKSTER_WEBHOOK_PORT'];
    initRSVP();
    var slack = initChat(settings);
    var sendChat = getSendChat(slack, settings['TRUCKSTER_SLACK_CHANNEL']);
    sendChat('Starting Truckster on port ' + port + '...')
        .then(function() { return initExpress(settings, slack, sendChat) })
        .then(function(){
            return sendChat('**** Truckster is Listening. You think you hate it now, but wait \'til you drive it *****');
        })
        .catch(function(err){
            sendChat('Truckster is exiting: ' + err)
                .finally(function(){
                    process.exit(-1);
                });
        });
}

function parseEnv(env){
    var requiredEnv = ['AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'TRUCKSTER_REPO',
        'TRUCKSTER_GIT_EMAIL',
        'TRUCKSTER_GIT_USERNAME',
        'TRUCKSTER_SLACK_TOKEN',
        'TRUCKSTER_SLACK_OUTGOING_TOKEN', //token sent from slack as secret
        'TRUCKSTER_SLACK_DOMAIN',
        'TRUCKSTER_SLACK_CHANNEL',
        'TRUCKSTER_SLACK_OUTGOING_TOKEN'
    ];
    return settings = envParser.parse(process.env, requiredEnv, { 'TRUCKSTER_WEBHOOK_PORT': 5000});
}

function initRSVP(){
    RSVP.on('error', function(reason) {
        console.error('RSVP error', reason);
    });
}

function initChat(settings){
    return new Slack(settings['TRUCKSTER_SLACK_DOMAIN'], settings['TRUCKSTER_SLACK_TOKEN']);
}

function getSendChat(slack, channel) {
    return function(msg){
        console.log(msg);
        var promise = new RSVP.Promise(function(resolve, reject){
            slack.send({
                text: msg,
                channel: channel
            }, function(error, body){
                if(error) {
                    console.error(error);
                    reject(error);
                }
                resolve(body);
            });
        });
        return promise;
    }
}

function initExpress(settings, slack, sendChat){
    var port = settings['TRUCKSTER_WEBHOOK_PORT'];
    console.log('Starting Express');
    var app = express();
    app.use(bodyParser.urlencoded({ extended: false }));
    app.post('/', processRequest.bind(undefined, settings, slack, sendChat));
    app.use(function(err, req, res, next){
        sendChat('Request Failed: ' + err)
            .finally(function(){
                res.status(500).send('request failed');
            });
    });

    return new RSVP.Promise(function(resolve, reject){
        app.listen(port, function(){
            console.log('Express started on port: ' + port);
            resolve();
        });
    });
}

function processRequest(settings, slack, sendChat, req, res) {
    var reply = slack.respond(req.body, function(hook) {
        console.log('received request', hook);
        try {
            var syncParams = parseText(hook.text);
            var cloneDir = getGitDir();
            sendChat('Syncing branch ' + syncParams.branch + ' to bucket ' + syncParams.bucket + ' for ' + hook.user_name)
                .then(function(result) {
                    return gitPull.pull(cloneDir, syncParams.branch, settings.TRUCKSTER_REPO,
                                                                     settings.TRUCKSTER_GIT_EMAIL,
                                                                     settings.TRUCKSTER_GIT_USERNAME);
                })
                .then(function(result){
                    return sendChat(result);
                })
                .then(function(){
                    return s3Sync.sync(cloneDir, syncParams.bucket);
                })
                .then(function(result){
                    return sendChat('Sync Succeeded:\n', result);
                }, function(error){
                    return sendChat('Sync Failed:\n' + error);
                })
                .finally(function(){
                    console.log('listening...');
                });
            return 'Starting...';
        } catch (e) { //synchronous catch for parseText errors and bugs
            sendChat('Sync failed:\n' + e);
            return 'Failed';
        }
    });
    res.json(reply);
}

function parseText(text){
    if(!text){
        throw 'No text property posted';
    }
    var words = text.split(' ');
    if(words.length != 2){
        throw 'text property must have 2 params: branch bucket';
    }
    return {
        branch: words[0],
        bucket: words[1]
    };
}

function getGitDir(){
    //make sure matches the clone dir in the docker file
    return path.join(process.cwd(), 'tmp/assets');
}

init(process.env);
