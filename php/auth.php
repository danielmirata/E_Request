<?php
require_once 'config.php';

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Login endpoint
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'login') {
    $email = $_POST['email'];
    $password = $_POST['password'];

    try {
        $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) {
            // Generate session token
            $token = bin2hex(random_bytes(32));
            
            // Store token in database
            $stmt = $conn->prepare("UPDATE users SET token = ?, token_expires = DATE_ADD(NOW(), INTERVAL 24 HOUR) WHERE id = ?");
            $stmt->execute([$token, $user['id']]);

            echo json_encode([
                'success' => true,
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'name' => $user['name']
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
        }
    } catch(PDOException $e) {
        echo json_encode(['error' => 'Login failed: ' . $e->getMessage()]);
    }
}

// Verify token middleware
function verifyToken($conn) {
    $headers = getallheaders();
    $token = $headers['Authorization'] ?? '';

    if (empty($token)) {
        return false;
    }

    try {
        $stmt = $conn->prepare("SELECT * FROM users WHERE token = ? AND token_expires > NOW()");
        $stmt->execute([$token]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch(PDOException $e) {
        return false;
    }
}
?> 