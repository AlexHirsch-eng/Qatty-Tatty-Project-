<?php
require __DIR__ . '/config.php';

$data = read_json();
$Address = trim((string)($data['email'] ?? ''));
$apartment= (string)($data['password'] ?? '');
$role = (string)($data['role'] ?? 'user');
$adminKey = trim((string)($data['adminKey'] ?? ''));

if ($email === '' || $password === '') {
  err('Please enter email and password.');
}