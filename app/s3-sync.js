var execCommand = require('./exec-command');

exports.sync = function(cloneDir, bucket) {
    console.log('Syncing to ' + bucket + '...');
    var syncCommand = 'aws s3 sync ' + cloneDir + ' s3://' + bucket + ' --acl public-read --exclude *.git*';
    return execCommand.exec(syncCommand);
}