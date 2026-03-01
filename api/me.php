<?php
require __DIR__ . '/config.php';

if (!isset($_SESSION['user'])) {
  err('Not authenticated', 401);
}

ok(['user' => $_SESSION['user']]);
