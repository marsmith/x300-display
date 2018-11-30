# x300

### FOR DEVELOPMENT: Use Window Subsystem for linux for database:
Install ubuntu 16.04 and install [here](https://aka.ms/wsl-ubuntu-1604/)

Start ubuntu from start menu, create user and password

Update ubuntu:  
`sudo apt-get update` then `sudo apt-get upgrade`

Get required software from package manager:  
`sudo apt-get install -y mariadb-server`

Start mariaDB server:
`sudo service mysql start`

create new database user and set password.  This needs to be done using 'root':   
`sudo mysql -u root`  

you are now at the mysql prompt.  Now create the user and grant all privileges (replace 'hawdis' and 'abc123'):  
```GRANT ALL PRIVILEGES ON *.* TO 'hawdis'@'localhost' IDENTIFIED BY 'abc123';``` 

quit mysql:  
`\q`  

log back in as your new user:  
```mysql -u hawdis -p```  

create new database:  
```CREATE DATABASE x300;```  

quit mysql:  
`\q`  