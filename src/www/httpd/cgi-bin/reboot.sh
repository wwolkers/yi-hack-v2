#!/bin/sh

printf "Content-type: application/json\r\n\r\n"

# Yeah, it's pretty ugly.. but hey, it works.

sync
sync
sync
sleep 1
reboot -f

printf "{\n"
printf "}"

