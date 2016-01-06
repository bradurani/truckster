FROM dockerfile/nodejs

RUN apt-get update -yq
RUN apt-get install -yq git
RUN apt-get install -yq python-pip
RUN pip install awscli

RUN mkdir -p /root/.ssh
ADD config/ssh/id_dsa /root/.ssh/id_dsa
RUN chmod 700 /root/.ssh/id_dsa
RUN echo "Host github.com\n\tStrictHostKeyChecking no\n" >> /root/.ssh/config

EXPOSE 5000

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN mkdir -p /usr/src/tmp/assets
RUN git clone git@github.com:$TRUCKSTER_REPO.git tmp/assets

ADD package.json /usr/src/app/package.json
RUN npm install

ADD . /usr/src/app

CMD [ "npm", "start" ]
