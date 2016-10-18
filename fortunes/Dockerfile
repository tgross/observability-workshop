# a Node.js application container including ContainerPilot
FROM alpine:3.4

# install curl
RUN apk update && apk add \
    nodejs \
    curl \
    && rm -rf /var/cache/apk/*

# install all dependencies
COPY package.json /opt/fortunes/
RUN cd /opt/fortunes && npm install

# get ContainerPilot release
ENV CONTAINERPILOT_VERSION 2.4.3
RUN export CP_SHA1=2c469a0e79a7ac801f1c032c2515dd0278134790 \
    && curl -Lso /tmp/containerpilot.tar.gz \
         "https://github.com/joyent/containerpilot/releases/download/${CONTAINERPILOT_VERSION}/containerpilot-${CONTAINERPILOT_VERSION}.tar.gz" \
    && echo "${CP_SHA1}  /tmp/containerpilot.tar.gz" | sha1sum -c \
    && tar zxf /tmp/containerpilot.tar.gz -C /bin \
    && rm /tmp/containerpilot.tar.gz

# add our application
COPY fortunes.js /opt/fortunes/
COPY lib/ /opt/fortunes/lib/

# add ContainerPilot configuration and scripts
COPY containerpilot.json /etc/containerpilot.json
ENV CONTAINERPILOT=file:///etc/containerpilot.json

EXPOSE 3000
CMD [ "/bin/containerpilot", \
      "node", \
      "/opt/fortunes/fortunes.js" \
]
