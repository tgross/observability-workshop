"""
autopilotpattern/mysql ContainerPilot handlers;
heavily hacked from the original to act as a standalone only,
for purposes of our workshop
"""
from __future__ import print_function
import os
import socket
import sys

# pylint: disable=invalid-name,no-self-use,dangerous-default-value
from manager.containerpilot import ContainerPilot
from manager.libconsul import Consul
from manager.libmysql import MySQL, MySQLError
from manager.utils import log, get_ip, debug, PRIMARY

class Node(object):
    """
    Node represents the state of our running container and carries
    around the MySQL config, and clients for Consul and Manta.
    """
    def __init__(self, mysql=None, cp=None, consul=None):
        self.mysql = mysql
        self.consul = consul
        self.cp = cp
        self.hostname = socket.gethostname()
        self.name = 'mysql-{}'.format(self.hostname)
        self.ip = get_ip('net1')

# ---------------------------------------------------------
# Top-level functions called by ContainerPilot

@debug
def pre_start(node):
    """
    the top-level ContainerPilot `preStart` handler.
    MySQL must be running in order to execute most of our setup behavior
    so we're just going to make sure the directory structures are in
    place and then let the first health check handler take it from there
    """
    # make sure that if we've pulled in an external data volume that
    # the mysql user can read it
    my = node.mysql
    my.take_ownership()
    my.render()
    if not os.path.isdir(os.path.join(my.datadir, 'mysql')):
        if not my.initialize_db():
            log.info('Skipping database setup.')

@debug
def health(node):
    """
    The top-level ContainerPilot `health` handler. Runs a simple health check.
    Also acts as a check for whether the ContainerPilot configuration needs
    to be reloaded (if it's been changed externally).
    """

    # Because we need MySQL up to finish initialization, we need to check
    # for each pass thru the health check that we've done so. The happy
    # path is to check a lock file against the node state (which has been
    # set above) and immediately return when we discover the lock exists.
    # Otherwise, we bootstrap the instance for its *current* state.
    assert_initialized_for_state(node)

    node.consul.renew_session()
    node.mysql.query('select 1')


# ---------------------------------------------------------
# run_as_* functions determine the top-level behavior of a node

@debug(log_output=True)
def assert_initialized_for_state(node):
    """
    If the node has not yet been set up, find the correct state and
    initialize for that state. After the first health check we'll have
    written a lock file and will never hit this path again.
    """
    LOCK_PATH = '/var/run/init.lock'
    try:
        os.mkdir(LOCK_PATH, 0700)
    except OSError:
        # the lock file exists so we've already initialized
        return True

    # the check for primary will set the state if its known. If another
    # instance is the primary then we'll be marked as REPLICA, so if
    # we can't determine after the check which we are then we're likely
    # the first instance (this will get safely verified later).
    try:
        if not run_as_primary(node):
            log.error('Tried to mark node %s primary but primary exists, '
                      'exiting for retry on next check.', node.name)
            os.rmdir(LOCK_PATH)
            sys.exit(1)
    except MySQLError as ex:
        # We've made it only partly thru setup. Setup isn't idempotent
        # but should be safe to retry if we can make more progress. At
        # worst we end up with a bunch of failure logs.
        log.error('Failed to set up %s as primary (%s). Exiting but will '
                  'retry setup. Check logs following this line to see if '
                  'setup needs reconfiguration or manual intervention to '
                  'continue.', node.name, ex)
        os.rmdir(LOCK_PATH)
        sys.exit(1)
    return False


@debug
def run_as_primary(node):
    """
    The overall workflow here is ported and reworked from the
    Oracle-provided Docker image:
    https://github.com/mysql/mysql-docker/blob/mysql-server/5.7/docker-entrypoint.sh
    """
    node.cp.state = PRIMARY

    conn = node.mysql.wait_for_connection()
    my = node.mysql
    if conn:
        # if we can make a connection w/o a password then this is the
        # first pass. *Note: the conn is not the same as `node.conn`!*
        my.set_timezone_info()
        my.setup_root_user(conn)
        my.create_db(conn)
        my.create_default_user(conn)
        my.create_repl_user(conn)
        my.expire_root_password(conn)
    else:
        # in case this is a newly-promoted primary
        my.execute('STOP SLAVE')

    return True

# ---------------------------------------------------------

def main():
    """
    Parse argument as command and execute that command with
    parameters containing the state of MySQL, ContainerPilot, etc.
    Default behavior is to run `pre_start` DB initialization.
    """
    if len(sys.argv) == 1:
        consul = Consul(envs={'CONSUL': os.environ.get('CONSUL', 'consul')})
        cmd = pre_start
    else:
        consul = Consul()
        try:
            cmd = globals()[sys.argv[1]]
        except KeyError:
            log.error('Invalid command: %s', sys.argv[1])
            sys.exit(1)

    my = MySQL()
    cp = ContainerPilot()
    cp.load()
    node = Node(mysql=my, consul=consul, cp=cp)

    cmd(node)

if __name__ == '__main__':
    main()
