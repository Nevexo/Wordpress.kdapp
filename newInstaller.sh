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
touch $OUT/"30-Changing directory to Wordpress"
cd wordpress

touch $OUT/"40-Creates mysql database."
mysql -u root -e "CREATE DATABASE wordpress_db;"

#create wp config
touch $OUT/"50-Creating wp config"
cp wp-config-sample.php wp-config.php

touch $OUT/"60-Setting up database profiles"
sed -i -e "s/database_name_here/$dbname/g" wp-config.php
sed -i -e "s/username_here/"root"/g" wp-config.php
sed -i -e "s/password_here/""/g" wp-config.php

touch $OUT/"100-WordPress installation completed."
rm ../wordpress.tar.gz
