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
test_services='[
    {"name":"awesome","owner":"oms-services"},
    {"name":"log","owner":"storyscript"},
    {"name":"http","owner":"storyscript"},
    {"name":"file","owner":"storyscript"},
    {"name":"redis","owner":"oms-services"},
    {"name":"psql","owner":"oms-services"},
    {"name":"json","owner":"storyscript"},
    {"name":"twilio","owner":"oms-services"},
    {"name":"gmaps","owner":"oms-services"},
    {"name":"clevertap","owner":"oms-services"},
    {"name":"openapi2oms","owner":"microservices"},
    {"name":"storage","owner":"storyscript"},
    {"name":"amqp1","owner":"oms-services"},
    {"name":"rabbitmq","owner":"oms-services"},
    {"name":"oms-validate","owner":"oms-services"},
    {"name":"stackdriver","owner":"oms-services"},
    {"name":"nexmo","owner":"oms-services"},
    {"name":"sendgrid","owner":"oms-services"},
    {"name":"uuid","owner":"oms-services"},
    {"name":"slack","owner":"oms-services"}
]'

for row in $(echo "${test_services}" | jq -c '.[]'); do
    _jq() {
        echo ${row} | jq -r ${1}
    }

    repo_name=$(_jq '.name')
    owner_name=$(_jq '.owner')
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