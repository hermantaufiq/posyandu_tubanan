<?php
try {
    $pdo = new PDO('mysql:host=75.2.106.174;port=4000;dbname=test', '3kZoh3kZGmM4fkD.root', '1R2GWOCr5gnT3ylc', [
        PDO::MYSQL_ATTR_SSL_CA => true,
        PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false
    ]);
    echo "Connected successfully!";
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
