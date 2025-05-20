<?php
require_once 'config.php';
require_once 'auth.php';

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verify authentication for all endpoints except GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    $user = verifyToken($conn);
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }
}

// Get all document requests with search and filter
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $search = $_GET['search'] ?? '';
        $status = $_GET['status'] ?? '';
        $dateFrom = $_GET['date_from'] ?? '';
        $dateTo = $_GET['date_to'] ?? '';

        $query = "SELECT * FROM resident_document_requests WHERE 1=1";
        $params = [];

        if ($search) {
            $query .= " AND (first_name LIKE ? OR last_name LIKE ? OR document_type LIKE ? OR purpose LIKE ?)";
            $searchParam = "%$search%";
            $params = array_merge($params, [$searchParam, $searchParam, $searchParam, $searchParam]);
        }

        if ($status) {
            $query .= " AND status = ?";
            $params[] = $status;
        }

        if ($dateFrom) {
            $query .= " AND date_needed >= ?";
            $params[] = $dateFrom;
        }

        if ($dateTo) {
            $query .= " AND date_needed <= ?";
            $params[] = $dateTo;
        }

        $query .= " ORDER BY created_at DESC";

        $stmt = $conn->prepare($query);
        $stmt->execute($params);
        $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'requests' => $requests]);
    } catch(PDOException $e) {
        echo json_encode(['error' => 'Failed to fetch document requests: ' . $e->getMessage()]);
    }
}

// Create new document request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Handle file upload for ID photo
        $idPhoto = null;
        if (isset($_FILES['id_photo'])) {
            $file = $_FILES['id_photo'];
            $fileName = time() . '_' . basename($file['name']);
            $targetDir = 'uploads/';
            
            // Create directory if it doesn't exist
            if (!file_exists($targetDir)) {
                mkdir($targetDir, 0777, true);
            }
            
            $targetPath = $targetDir . $fileName;
            
            if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                $idPhoto = $targetPath;
            }
        }

        $data = json_decode($_POST['data'], true);
        
        $stmt = $conn->prepare("
            INSERT INTO resident_document_requests (
                user_id, document_type, first_name, last_name,
                contact_number, email, address, date_needed,
                purpose, notes, id_type, id_photo, declaration,
                status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $data['user_id'] ?? null,
            $data['document_type'],
            $data['first_name'],
            $data['last_name'],
            $data['contact_number'],
            $data['email'] ?? null,
            $data['address'],
            $data['date_needed'],
            $data['purpose'],
            $data['notes'] ?? null,
            $data['id_type'],
            $idPhoto,
            $data['declaration'] ?? true,
            'pending'
        ]);

        echo json_encode([
            'success' => true, 
            'message' => 'Document request submitted successfully',
            'request_id' => $conn->lastInsertId()
        ]);
    } catch(PDOException $e) {
        echo json_encode(['error' => 'Failed to submit document request: ' . $e->getMessage()]);
    }
}

// Update document request status
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    try {
        $stmt = $conn->prepare("
            UPDATE resident_document_requests 
            SET status = ?, remarks = ? 
            WHERE id = ?
        ");
        
        $stmt->execute([
            $data['status'],
            $data['remarks'] ?? null,
            $data['id']
        ]);

        echo json_encode(['success' => true, 'message' => 'Document request status updated successfully']);
    } catch(PDOException $e) {
        echo json_encode(['error' => 'Failed to update document request: ' . $e->getMessage()]);
    }
}
?> 