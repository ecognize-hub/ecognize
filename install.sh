#!/bin/bash

# This script assumes that Ecognize is currently in its final installation
# location. Please make sure it actually is. The preferred location for this
# directory is /var/www/ecognize.

export PIPENV_VENV_IN_PROJECT="enabled"

if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi

if [[ !($# -eq 1 || $# -eq 3) ]]; then
    echo "Illegal number of parameters. Please provide a mode ('test' or 'prod') and, in the case of 'prod', also the hostname of the server you are installing Ecognize on and whether you want http or https. Examples:"
    echo "'./install.sh test' installs in test mode on port 8000"
    echo "'./install.sh prod test.ecognize.org http' installs in production mode with HTTP serving on port 80, assuming hostname test.ecognize.org"
    echo "'./install.sh prod test.ecognize.org https' installs in production mode with HTTPS serving on port 443, assuming hostname test.ecognize.org"
    exit
fi

if [[ !($1 == 'prod' || $1 == 'test') ]]; then
    echo "Illegal installation mode. Must be 'prod' or 'test'."
    exit
fi

if [[ $1 == 'prod' ]]; then
    if [[ !($# -eq 3) ]]; then
        echo "Illegal number of arguments for 'prod' installation mode. Please provide the hostname of the server you are installing Ecognize to and 'http'/'https'."
        exit
    fi
fi


echo "[i] Proceeding to install Ecognize..."

MY_PATH="`dirname \"$0\"`"              # relative
MY_PATH="`( cd \"$MY_PATH\" && pwd )`"  # absolutized and normalized
echo "[i] Executing from $MY_PATH. Using $MY_PATH as target for all operations."


GUNICORN_SOCKET='[Unit]\nDescription=gunicorn socket\n\n[Socket]\nListenStream=/run/gunicorn.sock\n\n[Install]\nWantedBy=sockets.target'
GUNICORN_SERVICE_1='[Unit]\nDescription=gunicorn daemon\nRequires=gunicorn.socket\nAfter=network.target\n\n[Service]\nUser=www-data\nGroup=www-data\nWorkingDirectory='
GUNICORN_SERVICE_2='\nExecStart='
GUNICORN_SERVICE_3='/.venv/bin/gunicorn \\\n          --access-logfile - \\\n          --workers 3 \\\n          --bind unix:/run/gunicorn.sock \\\n          project.wsgi:application\n\n[Install]\nWantedBy=multi-user.target'
GUNICORN_SERVICE="$GUNICORN_SERVICE_1$MY_PATH$GUNICORN_SERVICE_2$MY_PATH$GUNICORN_SERVICE_3"

NGINX_CONF_SSL='server {\n    listen 443;\n    server_name test.ecognize.org;\n\n    client_max_body_size 5M;\n\n    #ssl_certificate /etc/letsencrypt/live/test.ecognize.org/fullchain.pem;\n    #ssl_certificate_key /etc/letsencrypt/live/test.ecognize.org/privkey.pem;\n    ssl_session_tickets off;\n    ssl_protocols TLSv1.2 TLSv1.3;\n    ssl_prefer_server_ciphers on;\n    ssl_dhparam /etc/nginx/dhparam.pem;\n    ssl_ciphers EECDH+AESGCM:EDH+AESGCM;\n    ssl_ecdh_curve secp384r1;\n    # ssl_session_timeout 10m; # commented out because LetsEncrypt wants to insert its own directive\n    #ssl_session_cache shared:SSL:10m; # commented out because LetsEncrypt wants to insert its own directive\n    proxy_set_header X-Forwarded-Proto https;  # required so missing referer still works with CSRF protection\n\n    location = /favicon.ico { access_log off; log_not_found off; }\n    location /static/ {\n        root /var/www/ecognize;\n    }\n\n    location /media/ {\n        root /var/www/ecognize;\n    }\n\n    location / {\n        include proxy_params;\n        proxy_pass http://unix:/run/gunicorn.sock;\n#        proxy_set_header X-Forwarded-Proto https;  # required so missing referer still works with CSRF protection\n    }\n}\n'

NGINX_CONF_NOSSL='server {\n    listen 80;\n    server_name test.ecognize.org;\n\n    client_max_body_size 5M;\n\n    location = /favicon.ico { access_log off; log_not_found off; }\n    location /static/ {\n        root /var/www/ecognize;\n    }\n\n    location /media/ {\n        root /var/www/ecognize;\n    }\n\n    location / {\n        include proxy_params;\n        proxy_pass http://unix:/run/gunicorn.sock;\n}\n}\n'

ALLOWED_HOSTS="ALLOWED_HOSTS = ['test.ecognize.org', 'localhost', '127.0.0.1']"

echo "[i] Installing OS package dependencies from apt repositories..."
apt-get update
apt-get dist-upgrade -y
apt-get install -y git autoconf build-essential python3-pip python3-dev certbot libpq-dev postgresql postgresql-contrib libgdal26 gdal-bin libgdal-dev nginx curl libjpeg8-dev zlib1g zlib1g-dev libtiff-dev libtiff5 libfreetype6 libfreetype-dev libfreetype6-dev libwebp6 libwebp-dev tcl tcl-dev libimagequant0 libimagequant-dev libraqm0 libraqm-dev libxcb1 libxcb1-dev libmagic1 libmagic-mgc postgis python3-certbot-nginx postgresql-12-postgis-3
pip3 install pipenv
echo "[+] Installing OS packages from apt repositories: done!"

echo "[i] Configuring the database... Please note that this is done using DEFAULT CREDENTIALS. It is recommended to change credentials for security reasons."
echo "[i] Creating the database user..."
sudo -u postgres psql -c "CREATE USER reportappuser WITH PASSWORD 'reportapppw';"
echo "[+] Creating the database user: done!"
echo "[i] Setting user encoding..."
sudo -u postgres psql -c "ALTER ROLE reportappuser SET client_encoding TO 'utf8';"
echo "[+] Setting user encoding: done!"
echo "[i] Setting transaction isolation..."
sudo -u postgres psql -c "ALTER ROLE reportappuser SET default_transaction_isolation TO 'read committed';"
echo "[+] Setting transaction isolation: done!"
echo "[i] Setting timezone..."
sudo -u postgres psql -c "ALTER ROLE reportappuser SET timezone TO 'UTC';"
echo "[+] Setting timezone: done!"
echo "[i] Creating database..."
sudo -u postgres psql -c "CREATE DATABASE reportappdb;"
echo "[+] Creating database: done!"
echo "[i] Granting privileges on database..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE reportappdb TO reportappuser;"
echo "[+] Granting privileges on database: done!"
echo "[i] Enabling postgis extention on database..."
sudo -u postgres psql -d reportappdb -c "CREATE EXTENSION postgis;"
echo "[+] Enabling postgis extention on database: done!"
echo "[+] Database installation complete!"

echo "[i] Installing pip requirements..."
pipenv run pipenv install
echo "[+] Installing pip requirements: done!"

echo "[i] Creating Ecognize database tables..."
cd "$MY_PATH"
pipenv run python3 manage.py makemigrations
pipenv run python3 manage.py migrate
echo "[+] Creating Ecognize database tables: done!"

echo "[i] Creating super user..."
echo DJANGO_SUPERUSER_PASSWORD="YourS3cr3tP4ssw0rd" > .env
pipenv run python3 manage.py createsuperuser --noinput --username admin --email your_email@gmail.com
rm .env
echo "[+] Creating super user: done!"
echo '[!] You can later log in using the username "admin" and the password "YourS3cr3tP4ssw0rd". Please change your password in the Django admin console as soon as possible.'

## Seed data...
cd "$MY_PATH"
echo "[i] Seeding database with authorization group data..."
pipenv run python3 manage.py loaddata apps/profiles/fixtures/GenericGroups/GenericGroup_AuthGroups.json apps/profiles/fixtures/OrganizationGroups/Organization_AuthGroups.json
pipenv run python3 manage.py loaddata apps/forums/fixtures/GenericGroupForums.json apps/profiles/fixtures/GenericGroups/GenericGroups.json
pipenv run python3 manage.py loaddata apps/forums/fixtures/OrganizationGroupForums.json apps/profiles/fixtures/OrganizationGroups/OrganizationGroups.json
pipenv run python3 manage.py loaddata apps/profiles/fixtures/UserProfiles.json
pipenv run python3 manage.py loaddata apps/profiles/fixtures/AdminAuthProfile.json
pipenv run python3 manage.py loaddata apps/quotas/fixtures/Quotas.json
echo "[+] Seeding database with authorization group data: done!"

echo "[i] Giving ownership of the Ecognize directory to www-data..."
chown -R www-data:www-data "$MY_PATH"
echo "[+] Giving ownership of the Ecognize directory to www-data: done!"

if [[ $1 == 'test' ]]; then

    echo "[i] Turning on debug mode..."
    sed -i "s/DEBUG = .*/DEBUG = True/g" "$MY_PATH/project/settings.py"
    echo "[+] Turning on debug mode: done!"
    echo "[i] Allowing access from all hosts..."
    sed -i "s/ALLOWED_HOSTS = .*/ALLOWED_HOSTS = ['*']/g" "$MY_PATH/project/settings.py"
    echo "[+] Allowing access from all hosts: done!"

    echo "Congratulations, your test deployment is complete! There are now only two things left to do:"
    echo "1. Adding a MapBox API key in global_static_resources/js/constants.js (and running 'manage.py collectstatic' afterwards), otherwise maps will not work."
    echo "2. Adding e-mail account information at the end of settings.py so Ecognize can send out registration e-mails."
    echo "You can now start Ecognize using Django's debug server as follows:"
    echo "1. Switch to Ecognize installation directory: 'cd $MY_PATH'"
    echo "2. Become www-data user: 'sudo su www-data -s /bin/bash'"
    echo "3. Run Django debug server: 'pipenv run python3 manage.py runserver 0.0.0.0:8000'"
    echo "After completing these steps, Ecognize will run on port 8000 of the system where you deployed it. Shut down the Django debug server with Ctrl+C. If you cannot access the port, you might need to adjust your firewall rules."
    echo 'You can log in using the username "admin" and the password "YourS3cr3tP4ssw0rd". Please change your password in the Django admin console as soon as possible.'
    exit
fi

if [[ $1 == 'prod' ]]; then
    HOSTNAME=$2
    SSL_MODE=$3
    echo "[i] Adding provided hostname for production deployment to project/settings.py..."
    ADJUSTED_ALLOWED_HOSTS=`echo "$ALLOWED_HOSTS" | sed "s/test.ecognize.org/$HOSTNAME/g"`
    sed -i "s/ALLOWED_HOSTS = .*/$ADJUSTED_ALLOWED_HOSTS/g" "$MY_PATH/project/settings.py"
    echo "[+] Adding provided hostname for production deployment to project/settings.py: done!"
    
    echo "[i] Turning off debug mode..."
    sed -i "s/DEBUG = .*/DEBUG = False/g" "$MY_PATH/project/settings.py"
    echo "[+] Turning off debug mode: done!"
    
    echo "[i] Collecting static files..."
    pipenv run python3 manage.py collectstatic -c --noinput
    chown -R www-data:www-data $MY_PATH
    echo "[+] Collecting static files: done!"
    
    echo "[i] Creating gunicorn socket file..."
    echo -e $GUNICORN_SOCKET > /etc/systemd/system/gunicorn.socket
    echo "[+] Creating gunicorn socket file: done!"
    
    echo "[i] Creating gunicorn service file..."
    echo -e $GUNICORN_SERVICE > /etc/systemd/system/gunicorn.service
    echo "[+] Creating gunicorn service file: done!"
    
    echo "[i] Starting & enabling gunicorn socket"
    systemctl start gunicorn.socket
    systemctl enable gunicorn.socket
    echo "[+] Starting & enabling gunicorn socket: done!"
    
    echo "[i] Starting & enabling gunicorn service..."
    systemctl start gunicorn.service
    systemctl enable gunicorn.service
    echo "[+] Starting & enabling gunicorn service: done!"
    
    echo "[i] Creating nginx site configuration..."
    if [[ $SSL_MODE == 'http' ]]; then
        echo -e "$NGINX_CONF_NOSSL" > /etc/nginx/sites-available/ecognize_http.conf
    fi
    if [[ $SSL_MODE == 'https' ]]; then
        echo -e "$NGINX_CONF_SSL" > /etc/nginx/sites-available/ecognize_https.conf
    fi
    echo "[+] Creating nginx site configuration: done!"
    
    echo "[i] Inserting site name into nginx site configuration..."
    if [[ $SSL_MODE == 'http' ]]; then
        sed -i "s/test.ecognize.org/$HOSTNAME/g" /etc/nginx/sites-available/ecognize_http.conf
    fi
    if [[ $SSL_MODE == 'https' ]]; then
        sed -i "s/test.ecognize.org/$HOSTNAME/g" /etc/nginx/sites-available/ecognize_https.conf
    fi
    echo "[+] Inserting site name into nginx site configuration: done!"
    
    echo "[i] Inserting Ecognize directory path into nginx site configuration..."
    MY_PATH_ESCAPED=$(echo $MY_PATH|sed 's/\//\\\//g')
    if [[ $SSL_MODE == 'http' ]]; then
        sed -i "s/\/var\/www\/ecognize/$MY_PATH_ESCAPED/g" /etc/nginx/sites-available/ecognize_http.conf
    fi
    if [[ $SSL_MODE == 'https' ]]; then
        sed -i "s/\/var\/www\/ecognize/$MY_PATH_ESCAPED/g" /etc/nginx/sites-available/ecognize_https.conf
    fi
    echo "[+] Inserting Ecognize directory path into nginx site configuration: done!"
    
    echo "[i] Disabling default nginx site..."
    rm /etc/nginx/sites-enabled/default
    echo "[+] Disabling default nginx site: done!"
    
    echo "[i] Enabling Ecognize nginx site through symlink..."
    rm /etc/nginx/sites-enabled/ecognize.conf
    if [[ $SSL_MODE == 'http' ]]; then
        ln -s /etc/nginx/sites-available/ecognize_http.conf /etc/nginx/sites-enabled/ecognize.conf
    fi
    if [[ $SSL_MODE == 'https' ]]; then
        ln -s /etc/nginx/sites-available/ecognize_https.conf /etc/nginx/sites-enabled/ecognize.conf
    fi
    echo "[+] Enabling Ecognize nginx site through symlink: done!"
    
    if [[ $SSL_MODE == 'https' ]]; then
        echo "[i] Getting SSL certificate through LetsEncrypt/certbot..."
        certbot --nginx --non-interactive --agree-tos --register-unsafely-without-email --domains $HOSTNAME
        echo "[+] Getting SSL certificate through LetsEncrypt/certbot: done!"
        
        echo "[i] Inserting SSL certificate and key location into Ecognize nginx site configuration..."
        sed -i "s/#ssl_certificate .*/ssl_certificate \/etc\/letsencrypt\/live\/$HOSTNAME\/fullchain.pem;/g" /etc/nginx/sites-available/ecognize_https.conf
        sed -i "s/#ssl_certificate_key .*/ssl_certificate_key \/etc\/letsencrypt\/live\/$HOSTNAME\/privkey.pem;/g" /etc/nginx/sites-available/ecognize_https.conf
        sed -i "s/listen 443;/listen 443 ssl;/g" /etc/nginx/sites-available/ecognize_https.conf
        echo "[+] Inserting SSL certificate and key location into Ecognize nginx site configuration: done!"
        echo "[i] Generating DH parameters. This might take a while, please be patient..."
        openssl dhparam -out /etc/nginx/dhparam.pem 4096
        echo "[+] Generating DH parameters: done!"
    fi
    
    echo "[i] Starting and enabling nginx..."
    systemctl start nginx
    systemctl enable nginx
    echo "[+] Starting and enabling nginx: done!"
    
    echo "[i] Setting firewall rules..."
    if [[ $SSL_MODE == 'https' ]]; then
        iptables -A INPUT -p tcp --dport 443 -j ACCEPT
    fi
    if [[ $SSL_MODE == 'http' ]]; then
        iptables -A INPUT -p tcp --dport 80 -j ACCEPT
    fi
    echo "[+] Setting firewall rules: done!"
    
    echo "[i] Restarting nginx and reloading daemons..."
    systemctl daemon-reload
    systemctl restart nginx
    echo "[+] Restarting nginx and reloading daemons: done!"
    
    echo "Congratulations, your production deployment is (almost) complete! You can now access Ecognize on: $SSL_MODE://$HOSTNAME/"
    echo "There are only two things left for you to do:"
    echo "1. Adding a MapBox API key in global_static_resources/js/constants.js (and running 'manage.py collectstatic' afterwards), otherwise maps will not work."
    echo "2. Adding e-mail account information at the end of settings.py so Ecognize can send out registration e-mails."
    echo 'You can log in using the username "admin" and the password "YourS3cr3tP4ssw0rd". Please change your password in the Django admin console as soon as possible.'
    exit
fi
