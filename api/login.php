<?php
require __DIR__ . '/config.php';

$data = read_json();

$email    = trim((string)($data['email'] ?? ''));
$password = (string)($data['password'] ?? '');
$role     = (string)($data['role'] ?? 'user');   // 'user' | 'admin' приходит с фронта
$adminKey = trim((string)($data['adminKey'] ?? ''));

if ($email === '' || $password === '') {
  err('Please enter email and password.');
}

// Разрешаем только два варианта
$isAdminLogin = ($role === 'admin');

// -------------------- проверка admin keyword --------------------
if ($isAdminLogin) {
  // тот же ключ, что и на фронте
  $ADMIN_KEY = 'ADMIN123';

  if ($adminKey !== $ADMIN_KEY) {
    err('Invalid admin keyword.');
  }
}

try {
  if ($isAdminLogin) {
    // ==================== ЛОГИН АДМИНА ====================
    // таблица admin: admin_id, name, email, password
    $st = $pdo->prepare('
      SELECT admin_id, name, email, password
      FROM admin
      WHERE email = ?
      LIMIT 1
    ');
    $st->execute([$email]);
    $admin = $st->fetch();

    // Пароль в таблице admin у тебя хранится в обычном виде (например "ADMIN123"),
    // поэтому сравниваем напрямую.
    if (!$admin || $password !== $admin['password']) {
      err('Wrong email or password.', 401);
    }

    $_SESSION['user'] = [
      'id'    => (int)$admin['admin_id'],
      'name'  => $admin['name'],
      'email' => $admin['email'],
      'phone' => null,          // в таблице admin телефона нет
      'role'  => 'admin',
    ];

  } else {
    // ==================== ЛОГИН Обычного КЛИЕНТА ====================
    // таблица client: client_id, name, email, phone, pass_word (hash)
    $st = $pdo->prepare('
      SELECT client_id, name, email, phone, pass_word
      FROM client
      WHERE email = ?
      LIMIT 1
    ');
    $st->execute([$email]);
    $user = $st->fetch();

    if (!$user || !password_verify($password, $user['pass_word'])) {
      err('Wrong email or password.', 401);
    }

    $_SESSION['user'] = [
      'id'    => (int)$user['client_id'],
      'name'  => $user['name'],
      'email' => $user['email'],
      'phone' => $user['phone'],
      'role'  => 'user',
    ];
  }

  ok(['user' => $_SESSION['user']]);

} catch (Throwable $e) {
  // Можно раскомментировать, если надо дебажить:
  // err('Login failed: ' . $e->getMessage(), 500);
  err('Login failed', 500);
}