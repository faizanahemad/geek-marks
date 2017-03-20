#!/usr/bin/env bash

export node_pid=$(ps -e | grep node | grep harmony | grep server | grep -v grep  | awk -F ' ' '{print $1}')
kill $node_pid
nohup node server.js --harmony &!

