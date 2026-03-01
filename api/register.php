<?php
require __DIR__ . '/config.php';

$data = read_json();

$name     = trim((string)($data['name'] ?? ''));
$surname  = trim((string)($data['surname'] ?? ''));
$phone    = trim((string)($data['phone'] ?? ''));
$address  = trim((string)($data['address'] ?? ''));
$dob      = trim((string)($data['dob'] ?? ''));
$email    = trim((string)($data['email'] ?? ''));
$password = (string)($data['password'] ?? '');
$secret   = trim((string)($data['secret'] ?? ''));   // новое поле

if ($name === '' || $surname === '' || $phone === '' || $email === '' || $password === '' || $secret === '') {
  err('Please fill all required fields.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  err('Invalid email.');
}

// тот же regex, что был
$regex = '/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};\'":\\\\|,.<>\/?]).{8,}$/';
if (!preg_match($regex, $password)) {
  err('Password too weak.');
}

$fullName      = trim($name . ' ' . $surname);
$addressOrNull = ($address === '') ? null : $address;
$dobOrNull     = ($dob === '') ? null : $dob;

try {
  // проверяем уникальность email
  $st = $pdo->prepare('SELECT client_id FROM client WHERE email = ? LIMIT 1');
  $st->execute([$email]);
  if ($st->fetch()) {
    err('User with this email already exists.');
  }

  $passwordHash = password_hash($password, PASSWORD_BCRYPT);
  $secretHash   = password_hash($secret, PASSWORD_BCRYPT);   // ключевое слово тоже хэшируем

  $st = $pdo->prepare('
    INSERT INTO client (name, email, pass_word, secret_word, address, date_birth, phone)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  ');
  $st->execute([$fullName, $email, $passwordHash, $secretHash, $addressOrNull, $dobOrNull, $phone]);

  ok(['message' => 'Registration successful']);
} catch (Throwable $e) {
  err('Registration failed', 500);
}