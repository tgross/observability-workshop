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
export SELF_HOST=$(hostname)
export CONSUL_HOST=consul.svc.0f06a3e0-a0da-eb00-a7ae-989d4e44e2ad.us-east-1.cns.joyent.com:8500
