<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $complaintId = $data['complaint_id'] ?? '';

    try {
        $stmt = $conn->prepare("
            SELECT * FROM complaints 
            WHERE id = ?
        ");
        $stmt->execute([$complaintId]);
        $complaint = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($complaint) {
            echo json_encode(['success' => true, 'complaint' => $complaint]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Complaint not found']);
        }
    } catch(PDOException $e) {
        echo json_encode(['error' => 'Failed to track complaint: ' . $e->getMessage()]);
    }
}
?> 