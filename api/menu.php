<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->prepare("
        SELECT 
            menu_id,
            food_name,
            food_type,
            price,
            description,
            available,
            image
        FROM menu
        WHERE available = 'yes'
        ORDER BY menu_id
    ");
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'ok' => true,
        'menu' => $rows
    ]);
} catch (Throwable $e) {
    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage()
    ]);
}