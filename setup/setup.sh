#!/bin/bash

image="ubuntu-certified-16.04"
package="k4-highcpu-kvm-1.75G"

create() {
    local count=$((${1:-1} + 0))
    local private=$(triton network ls -l | awk -F' +' '/My-Fabric-Network/{print $1}')
    local public=$(triton network ls -l | awk -F' +' '/Joyent-SDC-Public/{print $1}')
    for (( c=1; c<=${count}; c++ )); do
        triton instance create \
               --name="student-${c}" "${image}" "${package}" \
               --network="${public},${private}" \
               -t "sdc_docker=true" \
               --script=./userscript.sh
    done
}

inventory() {
    echo '[students]' > inventory
    triton ls -lH | awk -F' +' '/student/{print $8}' >> inventory
}

provision() {
    ansible-playbook -v -i ./inventory vm.yml
}

supporting() {
    export COMPOSE_PROJECT_NAME=workshop
    export TRITON_ACCOUNT=$(triton account get | awk -F": " '/id:/{print $2}')
    pushd $(pwd)
    cd supporting
    docker-compose up -d
    docker-compose scale consul=3
    popd
}

cmd=$1
shift

$cmd $@
