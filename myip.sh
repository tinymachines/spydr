#!/bin/bash

#IP=$(lynx "https://ipchicken.com" --dump \
IP=$(curl --silent "https://ipchicken.com" \
        | grep -Eo "[0-9]{1,3}[.][0-9]{1,3}[.][0-9]{1,3}[.][0-9]{1,3}" \
        | xargs)

echo "${IP}"

nslookup -type=any "${IP}"
