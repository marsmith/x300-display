<?php 

//include config
include 'config.php';
include 'opendb.php';

//create the table if it doesn't exist
$queryCreateTable = "CREATE TABLE IF NOT EXISTS `csvdata` (
	`logtime` datetime NOT NULL,
	`temp` decimal(4,1) NULL,
	`sensor1` decimal(4,1) NULL,
	`sensor2` decimal(4,1) NULL,
	`sensor3` decimal(4,1) NULL,
	`sensor4` decimal(4,1) NULL,
	`sensor5` decimal(4,1) NULL,
	`sensor6` decimal(4,1) NULL,
	`sensor7` decimal(4,1) NULL,
	`sensor8` decimal(4,1) NULL,
	PRIMARY KEY  (`logtime`)
	) DEFAULT CHARSET=utf8 DEFAULT COLLATE utf8_unicode_ci";

if(!$dbConnection->query($queryCreateTable)){
	echo "Table creation failed: (" . $dbConnection->errno . ") " . $dbConnection->error;
}

//get current temp
$xml = simplexml_load_file("http://api.wunderground.com/auto/wui/geo/WXCurrentObXML/index.xml?query=".$location);
$temp = $xml->temp_f; 
echo "Current time is ".date('Y-m-d H:i:s').".  The current temp is: ".$temp."</br><hr>";

//read in log file
$row = 1;
if (($handle = fopen($logurl, "r")) !== FALSE) {
  while (($csv_array = fgetcsv($handle, 1000, ",")) !== FALSE) {
   
	//convert time value to real value
	$logtime= date('Y-m-d H:i:s', strtotime($csv_array[0]));
		
	//append data to table
	$query = "INSERT INTO csvdata(logtime,temp,sensor1,sensor2,sensor3,sensor4,sensor5,sensor6,sensor7,sensor8)
	VALUES('".$logtime."','".$temp."','".$csv_array[1]."','".$csv_array[2]."','".$csv_array[3]."','".$csv_array[4]."','".$csv_array[5]."','".$csv_array[6]."','".$csv_array[7]."','".$csv_array[8]."')
	ON DUPLICATE KEY UPDATE logtime = '".$logtime."'";  //if duplicate, do nothing

	//error message
	if(!$dbConnection->query($query)){
		echo "Table insert failed: (" . $dbConnection->errno . ") " . $dbConnection->error . " for entry: ".$logtime."<br />";
		break;
	}
	else {
		echo $logtime.' entry processed.</br>';
	}

	 $row++;
  }
  echo "<hr>";
  fclose($handle);
}

//delete log.txt if required
if ($eraselog) {
	$log = fopen($logurl."?erase=1", 'r');
	fclose($log);
	echo "Cleared log";
}
else {
	echo "Left log along";
}

mysqli_close($dbConnection);

?>