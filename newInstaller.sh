#/bin/bash
dbname="wordpress_db"

OUT="/tmp/_WordPressinstaller.out/$1"
mkdir -p $OUT

#download wordpress
touch $OUT/"0-Downloading Wordpress"
cd Web
curl -O http://wordpress.org/latest.tar.gz

#unzip wordpress
touch $OUT/"20-Unzipping Wordpress"
tar -zxvf latest.tar.gz

#change dir to wordpress
touch $OUT/"35-Changing directory to Wordpress"
cd wordpress

echo Starting MySQL service
touch $OUT/"99.9-Starting MySQL. Please enter sudo password below:"
echo
echo
echo
echo
echo
echo
echo
echo
echo
echo
echo
echo
echo
echo
echo
echo
echo
echo
echo
echo
echo
echo
echo
echo
echo
echo
echo
echo
echo
echo sudo service mysql restart
echo

sudo service mysql restart

touch $OUT/"99.9-Creating mysql database. Please enter mysql password below:"
echo
echo
echo
echo
echo
echo
echo
echo "Next, please enter your MySQL root password." 
echo
echo "If you have NOT changed your password, please press enter now and press enter once more when prompted for your password again."
echo
echo "If you have changed your password, please enter your password now."
echo
printf "Enter password: "
read password
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
