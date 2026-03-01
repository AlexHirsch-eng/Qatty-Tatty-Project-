<?php
require __DIR__ . '/config.php';

$data = read_json();

$email       = trim((string)($data['email'] ?? ''));
$secret      = trim((string)($data['secret'] ?? ''));
$newPassword = (string)($data['password'] ?? '');

if ($email === '' || $secret === '' || $newPassword === '') {
  err('Please fill all fields.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  err('Invalid email.');
}

// Проверка сложности пароля
$regex = '/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};\'":\\\\|,.<>\/?]).{8,}$/';
if (!preg_match($regex, $newPassword)) {
  err('Password too weak.');
}

try {
  // Ищем пользователя
  $st = $pdo->prepare('
    SELECT client_id, secret_word
    FROM client
    WHERE email = ?
    LIMIT 1
  ');
  $st->execute([$email]);
  $user = $st->fetch();

  if (!$user) {
    err('User not found.', 404);
  }

  // Проверяем секретное слово
  if (!password_verify($secret, $user['secret_word'])) {
    err('Wrong secret word.');
  }

  // Хэшируем новый пароль
  $newHash = password_hash($newPassword, PASSWORD_BCRYPT);

  $upd = $pdo->prepare('
    UPDATE client
    SET pass_word = ?
    WHERE client_id = ?
  ');
  $upd->execute([$newHash, $user['client_id']]);

  ok(['message' => 'Password changed successfully']);
} catch (Throwable $e) {
  err('Password change failed', 500);
}