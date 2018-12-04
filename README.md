# x300-display

This project uses an [x300 temperature logger unit](https://www.controlbyweb.com/x300/manuals.html) to record temperatures from eight ds18b20 waterproof temperature sensors.  A node.js script queries the x300 unit's internal log file every 5 minutes and saves the data to a mariadb database.  Seperately, we have a web server running using server.js that hosts both web services to query the database, and a static website to display the data.

### Start Database in WSL ubuntu (after it is setup, info below)
Start mariaDB server:
`sudo service mysql start`

### Set up cron
cron is a special file that will execute tasks at a predefined interval.  
`crontab -e` 

The entry below will run the 'getLog.js' node script every 5 minutes to pull new temperature data.  Enter this on an empty line, where 'hawdis' is your username/home directory:  
```
*/5 * * * * /usr/bin/node /home/hawdis/x300-display/getLog.js
```

### Persistently start and keep the node/express server script running (optional):
install pm2:  
`sudo npm install pm2 -g`

create symlink for pm2 to enable user run:  
`sudo ln -s /opt/nodejs/bin/pm2 /usr/bin/pm2`

start pm2 (replace 'hawdis' with your username/home directory):  
`pm2 start /home/hawdis/x300-display/server.js`  
`pm2 startup`  
`sudo env PATH=$PATH:/opt/nodejs/bin /opt/nodejs/lib/node_modules/pm2/bin/pm2 startup systemd -u hawdis --hp /home/hawdis`  


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