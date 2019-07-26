#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

if [[ "$OSTYPE" == "linux-gnu" ]];
then
    export PATH="$DIR/bin/linux:$DIR/bin:$PATH"
elif [[ "$OSTYPE" == "darwin"* ]];
then
    export PATH="$DIR/bin/osx:$DIR/bin:$PATH"
fi


echo $PATH

echo "===== OMG VERSION ====="
npx omg -V

echo "===== HELLO WORLD TEMPLATES ===="
mkdir repos
cd repos
for repo in clojure d go node java python php ruby rust scala ; do
    echo "===== Testing $repo ====="
    git clone -q --depth 1 "https://github.com/microservices/${repo}.git"
    cd "$repo"
    output="$(npx omg run --raw message -a name="Peter" | jq -c .)"
    if [ "$output" != '{"message":"Hello Peter"}' ] ; then echo "$output"; exit 1; fi
    cd ..
done

for repo in python-events node-events ; do
    echo "===== Testing $repo ====="
    git clone -q "https://github.com/microservices/${repo}.git"
    ( cd "$repo";
        ./test/all.js
    )
done

echo "===== PULLING REPOSITORIES ===="

# Other repos
git clone -q https://github.com/omg-services/base64.git
git clone -q https://github.com/omg-services/hashes.git
# git clone -q https://github.com/JeanBarriere/jwt.git


echo "===== TESTING BASIC SERVICES ====="

echo "===== Testing base64 ====="
cd base64
output="$(npx omg run --raw encode -a content="Peter")"
if [ "$output" != 'UGV0ZXI=' ] ; then echo "$output"; exit 1; fi
output="$(npx omg run --raw decode -a content="UGV0ZXI=")"
if [ "$output" != 'Peter' ] ; then echo "$output"; exit 1; fi

echo "===== Testing hashes ====="
cd ../hashes
output="$(npx omg run --raw digest -a method="sha1" -a data="foo" | jq -c .)"
if [ "$output" != '{"method":"sha1","digest":"0BEEC7B5EA3F0FDBC95D0DD47F3C5BC275DA8A33"}' ] ; then echo "$output"; exit 1; fi
output="$(npx omg run --raw hmac -a method="sha1" -a data="hello world" -a secret="my secret" | jq -c .)"
if [ "$output" != '{"method":"sha1","digest":"9F60EE4B05E590A7F3FAC552BFB9D98FA46F78D9"}' ] ; then echo "$output"; exit 1; fi

# echo "===== Testing jwt ====="
# cd ../jwt
# output="$(npx omg run --raw sign -a data="hello world" -a secret="abc" -a expiresIn="2h" | jq -c .)"
# if [ "$output" != 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiaGVsbG8gd29ybGQiLCJpYXQiOjE1NDM5MjMyMTAsImV4cCI6MTU0MzkzMDQxMH0.FCsstg1m01goffz0cFYxZIUe0uPybUAqzGRnZPJgGBw' ] ; then echo "$output"; exit 1; fi
# output="$(npx omg run --raw verify -a token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiaGVsbG8gd29ybGQiLCJpYXQiOjE1NDM5MjMyMTAsImV4cCI6MTU0MzkzMDQxMH0.FCsstg1m01goffz0cFYxZIUe0uPybUAqzGRnZPJgGBw" | jq -c .)"
# if [ "$output" != '{"data":"hello world","iat":1543923210,"exp":1543930410}' ] ; then echo "$output"; exit 1; fi
