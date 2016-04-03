<?php
//include config
include 'config.php';
include 'opendb.php';

//get query value from ajax
$queryInterval = $_GET['queryInterval'];
$queryDate = $_GET['queryDate'];

if ($queryInterval) {
	$query = "> DATE_SUB(NOW(), INTERVAL ".$queryInterval.")";
}
else if ($queryDate) {
	$query = "LIKE '".$queryDate."%'";
}

//select database records
$sql = "SELECT * FROM csvdata
		WHERE logtime $query";
$result = mysqli_query($dbConnection, $sql);

//make sure we got some results
if (mysqli_num_rows($result) > 0) {
    // output data of each row
    while($row = mysqli_fetch_assoc($result)) {
        echo $row["logtime"] . "," . $row["temp"] . "," . $row["sensor1"] . "," . $row["sensor2"] . "," . $row["sensor3"] . "," . $row["sensor4"] . "," . $row["sensor5"] . "," . $row["sensor6"] . "," . $row["sensor7"] . "," . $row["sensor8"] . "\n"; 
    }
} else {
    echo "0 results";
}

mysqli_close($dbConnection);
?> 