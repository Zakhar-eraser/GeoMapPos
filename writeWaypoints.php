<?php
    $id = $_GET['id'];
    $latitude = $_GET['latitude'];
    $longitude = $_GET['longitude'];
    $angle = $_GET['angle'];

    $connection = new mysqli("localhost","ezard_waypoints","jH6G&Up7",'ezard_waypoints');
    $sql = "INSERT INTO `waypoints` (`id`, `latitude`, `longitude`, `angle`) VALUES ('$id', '$latitude', '$longitude', '$angle')";

    $connection->query($sql);
    $connection->close();
?>