#!/usr/bin/env bash

export node_pid=`ps -e | grep node | grep harmony | grep server | grep -v grep  | awk -F ' ' '{print $1}'`

if [ -n "$node_pid" -a "$node_pid" != " " ]; then
        kill $node_pid
fi
