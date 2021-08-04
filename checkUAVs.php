<?php
    $connection = new mysqli("localhost","ezard_waypoints","jH6G&Up7",'ezard_waypoints');
    $sql = "SELECT * FROM `UAVs`";
    $result = $connection->query($sql);
    $uavs = array();

    while ($row = $result->fetch_assoc()){
        $uavs[] = $row;
    }
    $connection->close();
    echo json_encode($uavs);
?>