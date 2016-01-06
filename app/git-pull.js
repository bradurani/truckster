var execCommand = require('./exec-command');

exports.pull = function pull(cloneDir, branch, repo, gitEmail, gitUsername){
    console.log('pulling ' + repo + '/' + branch + ' into ' + cloneDir);
    return setGitUser(gitEmail, gitUsername)
        .then(function(){ return gitPull(cloneDir, branch); });
};

function setGitUser(email, username){
    var setGitUserCommand = 'git config --global user.email "' + email + '" && git config --global user.name "' + username + '"';
    return execCommand.exec(setGitUserCommand);
}

function gitPull(cloneDir, branch){
    var pullCommand = 'cd ' + cloneDir + ' && git fetch && git checkout ' + branch + ' && git pull';
    return execCommand.exec(pullCommand);
}