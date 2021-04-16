#!/usr/bin/env python3
f = open("raw/raw.txt", "r")
print('[')
loopCtr = 2251
for x in f.read().splitlines():
    print('{{"model": "auth.group", "pk": {}, "fields": {{"name": "{}"}}}},'.format(loopCtr, x))
    loopCtr = loopCtr + 1
print(']')
