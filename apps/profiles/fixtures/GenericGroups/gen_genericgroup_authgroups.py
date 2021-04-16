#!/usr/bin/env python3
countries_file = open("../countries.txt", "r")
orgtype_file = open("../org_types.txt", "r")
print('[')
loopCtr = 1
for org_type in orgtype_file.read().splitlines():
    org_code = org_type.split(',')[0]
    print('{{"model": "auth.group", "pk": {}, "fields": {{"name": "{}"}}}},'.format(loopCtr, org_code))
    loopCtr = loopCtr + 1
    for country in countries_file.read().splitlines():
        country_code = country.split(',')[0]
        print('{{"model": "auth.group", "pk": {}, "fields": {{"name": "{}_{}"}}}},'.format(loopCtr, org_code, country_code))
        loopCtr = loopCtr + 1
    countries_file.seek(0)
print(']')
