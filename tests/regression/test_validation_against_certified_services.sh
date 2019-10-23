#!/usr/bin/env bash

set -e  # Exit abruptly on any error.

#set -x
source functions.sh

OMS_PATH=`get_oms_path`
VALIDATION_OUTPUT_FILE_NAME=".validation_output__.log"

WORK_DIR=`mktemp -d`
echo "Working in ${WORK_DIR}"
pushd ${WORK_DIR}

echo "===== Testing certified services from the Storyscript Hub ====="
failed_services=""
for i in `curl -s 'https://api.storyscript.io/graphql' -H 'Content-Type: application/json' --data '{"query":"query Services { allServices(condition: { isCertified: true }) { nodes { name uuid}}}"}' | jq -c ".data.allServices.nodes[]"`; do
    service_uuid=`echo ${i} | jq -r ".uuid"`
    service_name=`echo ${i} | jq -r ".name"`
    service_details=`curl -s "https://api.storyscript.io/graphql" -H "Content-Type: application/json" \
        --data "{\"query\":\"query Services { getServiceRepository(serviceUuid: \\\\\"${service_uuid}\\\\\") { ownerName repoName service } } \"}"`
    owner_name=`echo ${service_details} | jq -rc ".data.getServiceRepository.ownerName"`
    repo_name=`echo ${service_details} | jq -rc ".data.getServiceRepository.repoName"`
    service_provider=`echo ${service_details} | jq -rc ".data.getServiceRepository.service"`
    if [[ ! "$service_provider" == "GITHUB" ]]; then
        continue
    fi

    clone_url="https://github.com/${owner_name}/${repo_name}.git"
    git clone ${clone_url}
    cd ${repo_name}
    if ! ${OMS_PATH} validate &> ${VALIDATION_OUTPUT_FILE_NAME}; then
        echo "Failed!"
        failed_services="$failed_services ${repo_name}"
    fi
    cd ..
done

echo "==== Failures ===="

for i in ${failed_services}; do
    echo ${i}
    echo "Validation output:"
    cat ${i}/${VALIDATION_OUTPUT_FILE_NAME}
    echo
done

if [[ ${failed_services} != "" ]]; then
    exit 1
else
    echo "No failures to report"
fi

echo "===== Completed! ====="
popd  # Exit from our working directory