<?php

header("Content-Type: application/json");

$file = "data.json";

if (!file_exists($file)) {
    echo json_encode([
        "status" => "empty",
        "data" => []
    ]);
    exit;
}

$data = json_decode(file_get_contents($file), true);

echo json_encode([
    "status" => "ok",
    "total" => count($data),
    "data" => $data
]);