truckster
=========

Truckster syncs files between a GitHub repo and Amazon S3. It is a node.js server application that acts as a Slack webhook. It is intended to run in a Docker container using the included Dockerfile. To use, the following environment variables need to be set on the container host:
 - AWS_ACCESS_KEY_ID
 - AWS_SECRET_ACCESS_KEY
 - TRUCKSTER_GIT_EMAIL
 - TRUCKSTER_GIT_USERNAME
 - TRUCKSTER_REPO
 - TRUCKSTER_SLACK_DOMAIN
 - TRUCKSTER_SLACK_OUTGOING_TOKEN
 - TRUCKSTER_SLACK_TOKEN
 - TRUCKSTER_SLACK_CHANNEL

You can also fill out these variables in the `fig.yml` file for use in local
development.

Also, add a file `id_dsa`  - containing a key that authenticates as a
personal access token for the GitHub repo the app is copying - to the project
directory under `config/ssh` (it will be gitignored) before building the
container. The key will be copied into the container and used to authenticate
against GitHub when the container is run.

<img src='https://github.com/bradurani/truckster/blob/master/truckster.jpg'/>

