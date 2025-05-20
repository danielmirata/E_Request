<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $requestId = $data['request_id'] ?? '';

    try {
        $stmt = $conn->prepare("
            SELECT * FROM resident_document_requests 
            WHERE request_id = ?
        ");
        $stmt->execute([$requestId]);
        $request = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($request) {
            echo json_encode(['success' => true, 'request' => $request]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Document request not found']);
        }
    } catch(PDOException $e) {
        echo json_encode(['error' => 'Failed to track document request: ' . $e->getMessage()]);
    }
}
?> 