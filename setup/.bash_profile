# if running bash
if [ -n "$BASH_VERSION" ]; then
    # include .bashrc if it exists
    if [ -f "$HOME/.bashrc" ]; then
        . "$HOME/.bashrc"
    fi
fi

# set PATH so it includes user's private bin directories
PATH="$HOME/bin:$HOME/.local/bin:$PATH"

# set environment
export PRIVATE_IP=$(ip addr show net1 | grep "inet\b" | awk '{print $2}' | cut -d/ -f1)
export PUBLIC_IP=$(ip addr show net0 | grep "inet\b" | awk '{print $2}' | cut -d/ -f1)
export SELF_HOST=$(hostname)
export TRITON_ACCOUNT=0f06a3e0-a0da-eb00-a7ae-989d4e44e2ad
export LOGSTASH_HOST=logstash.svc.${TRITON_ACCOUNT}.us-east-1.cns.joyent.com
export CONSUL_HOST=consul.svc.${TRITON_ACCOUNT}.us-east-1.cns.joyent.com
