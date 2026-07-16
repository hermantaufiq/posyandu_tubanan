<?php
$host = '127.0.0.1';
$port = '5432';
$user = 'postgres';
$dbname = 'posyandu_tubanan';

$passwords = ['', 'postgres', 'root', 'password', '123456'];
$connected = false;

foreach ($passwords as $password) {
    try {
        $pdo = new PDO("pgsql:host=$host;port=$port", $user, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        echo "Successfully connected with password: '$password'\n";
        
        $stmt = $pdo->query("SELECT 1 FROM pg_database WHERE datname = '$dbname'");
        if (!$stmt->fetch()) {
            $pdo->exec("CREATE DATABASE $dbname");
            echo "Database $dbname created successfully.\n";
        } else {
            echo "Database $dbname already exists.\n";
        }
        $connected = true;
        break;
    } catch (PDOException $e) {
        // try next
    }
}

if (!$connected) {
    echo "Could not connect to PostgreSQL with any common password.\n";
    exit(1);
}
