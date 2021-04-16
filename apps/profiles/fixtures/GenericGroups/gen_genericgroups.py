#!/usr/bin/env python3
countries_file = open("../countries.txt", "r")
orgtype_file = open("../org_types.txt", "r")
print('[')
loopCtr = 1
for org_type in orgtype_file.read().splitlines():
    org_code = org_type.split(',')[0]
    org_name = org_type.split(',')[1]
    if org_code == "ANO":
        print('{{"model": "profiles.genericgroup", "pk": {}, "fields": {{"group": ["{}"], "display_name": "{} (worldwide)", "countries": "", "level_type": "I", "logo": "", "type": "{}", "visible": false, "parent": null}}}},'.format(loopCtr, org_code, org_name, org_code))
    else:
        print('{{"model": "profiles.genericgroup", "pk": {}, "fields": {{"group": ["{}"], "display_name": "{} (worldwide)", "countries": "", "level_type": "I", "logo": "", "type": "{}", "visible": false, "parent": null, "own_forums": {}}}}},'.format(loopCtr, org_code, org_name, org_code, loopCtr))
    parent_key = loopCtr
    loopCtr = loopCtr + 1
    for country in countries_file.read().splitlines():
        country_code = country.split(',')[0]
        country_name = country.split(',')[1]
        if org_code == "ANO":
            print('{{"model": "profiles.genericgroup", "pk": {}, "fields": {{"group": ["{}_{}"], "display_name": "{} ({})", "countries": "{}", "level_type": "N", "logo": "", "type": "{}", "visible": false, "parent": {}}}}},'.format(loopCtr, org_code, country_code, org_name, country_name, country_code, org_code, parent_key))
        else:
            print('{{"model": "profiles.genericgroup", "pk": {}, "fields": {{"group": ["{}_{}"], "display_name": "{} ({})", "countries": "{}", "level_type": "N", "logo": "", "type": "{}", "visible": false, "parent": {}, "own_forums": {}}}}},'.format(loopCtr, org_code, country_code, org_name, country_name, country_code, org_code, parent_key, loopCtr))
        loopCtr = loopCtr + 1
    countries_file.seek(0)
print(']')
