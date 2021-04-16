#!/usr/bin/env python3

countries_file = open("countries.txt", "r")

countries = [country.split(",")[1] for country in countries_file.read().splitlines()]

print('[')
for i in range(1, 251):  # everything after 250 is no longer VOL, the first 250 are VOL_CC, where CC is the country code, and the group 250 later is the next occupational group in the same country
    level = 'N'
    forum_type = 'P'  # public
    name = "Public forums"
    VOL_no = str(i)
    NGO_no = str(i+250)
    LAW_no = str(i+500)
    ACA_no = str(i+750)
    IGO_no = str(i+1000)
    GOV_no = str(i+1250)
    JRN_no = str(i+1500)
    COM_no = str(i+1750)
    country_group = [VOL_no, NGO_no, LAW_no, ACA_no, IGO_no, GOV_no, JRN_no, COM_no]
    if ((i - 1) % 250 == 0):  # international forums
        level = 'I'
        name = name + " (worldwide)"
    else:
        level = 'N'
        name = name + " " + countries[((i - 1) % 250) - 1]
    print('{{"model": "forums.forum", "pk": {}, "fields": {{"global_level": "{}", "name": "{}", "forum_type": "{}", "participant_organizations": [], "participant_users_profiles": [], "participant_generic_groups": [{}], "moderators": []}}}},'.format(i, level, name, forum_type, ','.join(country_group)))
    
for i in range(251, 2001):  # everything after 250 is no longer VOL
    name = ""
    
    if 251 <= i and i <= 500:
        name = "NGO forums"
    if 501 <= i and i <= 750:
        name = "Law enforcement forums"
    if 751 <= i and i <= 1000:
        name = "Academic & researcher forums"
    if 1001 <= i and i <= 1250:
        name = "Intergovermental organizations' forums"
    if 1251 <= i and i <= 1500:
        name = "Governmental organizations' forums"
    if 1501 <= i and i <= 1750:
        name = "Journalists' forums"
    if 1751 <= i and i <= 2000:
        name = "Commercial organizations' forums"
    
    level = 'N'
    forum_type = 'G'  # generic
    if ((i - 1) % 250 == 0):  # international forums
        level = 'I'
        name = name + " (worldwide)"
    else:
        level = 'N'
        name = name + " " + countries[((i - 1) % 250) - 1]
    print('{{"model": "forums.forum", "pk": {}, "fields": {{"global_level": "{}", "name": "{}", "forum_type": "{}", "participant_organizations": [], "participant_users_profiles": [], "participant_generic_groups": [{}], "moderators": []}}}},'.format(i, level, name, forum_type, i))
print(']')
