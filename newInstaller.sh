#!/bin/bash
dbname="wordpress_db"

OUT="/tmp/_WordPressinstaller.out/$1"
mkdir -p $OUT

#download wordpress
touch $OUT/"0-Downloading Wordpress"
cd ~/Web
curl -O http://wordpress.org/latest.tar.gz

#unzip wordpress
touch $OUT/"20-Unzipping Wordpress"
tar -zxf latest.tar.gz

touch $OUT/"50-Installing PureFTPd. Please enter sudo password below:"

for i in {1..20}
do
   echo
done

echo sudo apt-get -y install pure-ftpd
echo
echo Note: Your sudo password is your koding password.
echo
sudo apt-get -y install pure-ftpd

#change dir to wordpress
touch $OUT/"35-Changing directory to Wordpress"
cd wordpress

echo Starting MySQL service

touch $OUT/"99.9-Starting MySQL. Please enter sudo password below:"
echo
echo sudo service mysql start
echo
sudo service mysql start

touch $OUT/"99.9-Creating MySQL database. Please enter MySQL password below:"

for i in {1..20}
do
   echo
done

echo "Press ENTER (twice) if you have not changed your MySQL password."
echo
echo "Enter MySQL password (you will not see it outputted): "
read -s password
mysql -u root -p$password -e "CREATE DATABASE wordpress_db;"

#create wp config
touch $OUT/"70-Creating wp config"
cp wp-config-sample.php wp-config.php

touch $OUT/"80-Setting up database profiles"
sed -i -e "s/database_name_here/$dbname/g" wp-config.php
sed -i -e "s/username_here/"root"/g" wp-config.php
sed -i -e "s/password_here/$password/g" wp-config.php

touch $OUT/"100-WordPress installation completed."
cd ..
rm latest.tar.gz
