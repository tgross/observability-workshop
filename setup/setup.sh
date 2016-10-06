#!/bin/bash

image="ubuntu-certified-16.04"
package="k4-highcpu-kvm-1.75G"

create() {
    count=$((${1:-1} + 0))
    for (( c=1; c<=${count}; c++ )); do
        triton instance create --name="student-${c}" "${image}" "${package}" \
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

cmd=$1
shift

$cmd $@
