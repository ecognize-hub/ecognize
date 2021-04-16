# What is Ecognize?

Ecognize is a platform for citizens and volunteers to report on environmental, conservation and wildlife issues and crimes. Organizations (non-profits, law enforcement, governmental ministries and offices, intergovernmental/international organizations, academia, and journalists) can register with Ecognize in order to receive these reports. Reports can be submitted either via the web platform or through a mobile app.

Ecognize was inspired by platforms like [WildALERT in the Philippines](https://news.mongabay.com/2020/09/philippine-wildlife-reporting-app-promises-to-upgrade-fight-against-trafficking/) and the [eJustice app in Sri Lanka](https://news.mongabay.com/2020/09/philippine-wildlife-reporting-app-promises-to-upgrade-fight-against-trafficking/). Both of these are environmental reporting apps. Ecognize takes this idea, generalizes it (by allowing users to select from a variety of issue categories), and applies it globally. That means that users can send in reports wherever they are on the planet. These reports are automatically distributed to organizations in the country where the report was submitted, provided the organizations registered with Ecognize before. Just a few examples of more than 30 categories users can choose from:

* Deforestation, land clearing, arson
* Poaching
* Sales of various illegal animal goods (including sub-categories for medicine and trinkets)
* Illegal sales of live species
* Food items on restaurant menus
* Pollution & trash
* many more

Additionally, Ecognize offers various communication channels for organizations to work together within their country and internationally through a fine-grained forums system which provides forums by (a) geographical location and (b) professional sphere (law enforcement and customs have separate forums from non-profits, but shared forums exist as well). Dropbox- or Teams-like file sharing with a strong focus on security exists too.

The idea behind this development was to save national efforts and to have one global platform where users can report on environmental and conservation issues, just like in the national solutions for Sri Lanka (eJustice) and the Philippines (WildALERT). Additionally, collaboration on reports should be easy both within and across borders. Users can hand in reports both via the website and through a mobile app. This way, Ecognize facilitates a "citizen reporter" approach to environmental and conservation issue reporting. Organizations can access reports only through the website (not the app) and only after registration, which is vetted to prevent unauthorized access to reports.

# Project progress

Currently, the implemented feature set is at 90% of the target feature set for version 1.0. Version 1.0 will be finalized and go live after a user acceptance testing (UAT) phase for which Ecognize is currently looking for professionals and organizations to provide feedback.

The companion mobile app (for reporting from mobile phones) is currently 50% complete.

# Tech stack & dependencies

Ecognize is a Django-based (Django 3.2 or newer) web app written in Python 3.8 and developed on Ubuntu 20.04. It requires postgresql 12 with the postgis extension to work. Frontend JavaScript code was written in vanilla JavaScript (that means no React, Vue or Angular, and only minimal jQuery). Reusable UI components are implemented with Handlebars. Maps are currently provided using MapBox. Design elements and layout are provided by Bootstrap 4.

# How to install and deploy

There is an installation script: `install.sh`. It takes either one or three arguments and requires admin rights:

1. Test deployment (launches the Django debug server): `sudo ./install test`
2. Production deployment (uses nginx): `sudo ./install prod <hostname> <http|https>`

Ecognize has been developed and tested on Ubuntu 20.04. The installer assumes your operating system to be Ubuntu 20.04 or something closely related.

## Test deployment

To perform a test deployment either on a server or on your local machine, perform the following steps:

1. Unpack Ecognize or clone its git repository to the directory where you want to install Ecognize. I recommend `/var/www/ecognize`.
2. Execute the installer script: `sudo ./install.sh test`
3. Add a MapBox API key to `global_static_resources/js/constants.js`. This is required for maps to work.
4. Either switch the `EMAIL_BACKEND` in `project/settings.py` to `django.core.mail.backends.console.EmailBackend` or add your e-mail configuration in the fields `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER` and `EMAIL_HOST_PASSWORD`. This is required for registration links to work. When setting the `EMAIL_BACKEND` to `django.core.mail.backends.console.EmailBackend`, all e-mails will be displayed on the console. If you choose to do a proper e-mail configuration, e-mails will be sent out through your mail server.
5. Run the debug server: `pipenv run python3 manage.py runserver 0.0.0.0:8000` to start the debug server on port 8000.

Congratulations, your Django debug server is now serving Ecognize!

## Production deployment

To perform a production deployment on an Internet-reachable server, perform the following steps:

1. Unpack Ecognize or clone its git repository to the directory where you want to install Ecognize. I recommend `/var/www/ecognize`.
2. Set a DNS A record for the system where Ecognize should be deployed. Make sure that the DNS record has propagated into the global DNS before you continue. A working DNS A record is required for HTTPS autoconfiguration to work.
3. Execute the installer script: `sudo ./install.sh prod <hostname> <http|https>`. For example, to do an HTTPS deployment on the host `test.ecognize.org`, the command would be `sudo ./install.sh prod test.ecognize.org https`. To do an HTTP deployment on test2.ecognize.org, the command would be `sudo ./install.sh prod test2.ecognize.org http`.
4. Add a MapBox API key to `global_static_resources/js/constants.js`. This is required for maps to work. To make sure that your MapBox API key will actually be used, you need to execute the `collectstatic` command (which will copy the file with the key from the global static source directory to the directory served by nginx): `sudo pipenv run python3 manage.py collectstatic -c --noinput`
5. Add your e-mail configuration in the fields `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER` and `EMAIL_HOST_PASSWORD` in the file `project/settings.py`. This is required for registration links and other e-mails to work.
6. Restart the gunicorn daemon on your system: `sudo systemctl daemon-reload`

Congratulations, your Ecognize installation is complete!

## Security Note: Values to change for deployment

The following values should be changed for a production deployment:

* Django `SECRET_KEY` in `settings.py` should be replaced with a fresh value
* Superuser credentials. Use the Django admin console to change them after installation (located at the `/admin` address of your installation accessible by browser), or change them in `install.sh` before installation.
* Database credentials
    * During Postgres database setup in `install.sh`
    * In Django settings file: `DATABASES > default > USER` and `DATABASES > default > PASSWORD`
* E-mail account credentials in `settings.py`: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER` and `EMAIL_HOST_PASSWORD`
* MapBox API key in `global_static_resources/js/constants.js` - in production deployment, the MapBox API key has to be changed before `collectstatic` is executed because `collectstatic` copies all source static files to the directory served by `nginx`

# Ecognize reporting mobile app

There is a mobile reporting app based on Flutter for both Android and iOS in the works. This mobile app allows users to send in reports using their phones, including photos and GPS coordinates.

# How can I help?

Ecognize currently needs input from professionals and organizations in the environmental, wildlife and conservation areas. Feedback from organizations willing to test Ecognize out would also be much appreciated. Please get in touch if you would like to test Ecognize or provide feedback!

# Screenshots and presentation

This repository includes screenshots (like the [report search view](pres/reportssearch.png)) and a [presentation](pres/introducing-ecognize.pdf) in the [pres](pres) directory.

# License

All code developed in this project (which includes all code in the `/apps` and `/templates` subdirectories of this repository as well as a few single JavaScript and CSS files in `/global_static_resources`) is subject to the Apache License version 2.0 included in this repository in [LICENSE](LICENSE). Code written by other parties, included as source code in this repository or as dependencies, is subject to its respective license. Stock photos in [global_static_resources/img/photos](global_static_resources/img/photos) were sourced from [Unsplash](https://unsplash.com/) ([license](https://unsplash.com/license)).
