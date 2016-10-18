FROM autopilotpattern/mysql:5.6r3.1.0

COPY containerpilot.json /etc/containerpilot.json
RUN sed -i 's/eth0/net1/' /usr/local/bin/manager/utils.py
COPY manage.py /usr/local/bin/manage.py
