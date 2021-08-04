<?php
    $connection = new mysqli("localhost","ezard_waypoints","jH6G&Up7", "ezard_waypoints");
    $sql = "TRUNCATE TABLE waypoints";

    if(intval($_GET["a"]) === 4356){
        $connection->query($sql);
    }
    $connection->close();
?>