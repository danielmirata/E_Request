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

// Get all complaints with search and filter
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $search = $_GET['search'] ?? '';
        $status = $_GET['status'] ?? '';
        $dateFrom = $_GET['date_from'] ?? '';
        $dateTo = $_GET['date_to'] ?? '';

        $query = "SELECT * FROM complaints WHERE 1=1";
        $params = [];

        if ($search) {
            $query .= " AND (first_name LIKE ? OR last_name LIKE ? OR complaint_type LIKE ? OR complaint_description LIKE ?)";
            $searchParam = "%$search%";
            $params = array_merge($params, [$searchParam, $searchParam, $searchParam, $searchParam]);
        }

        if ($status) {
            $query .= " AND status = ?";
            $params[] = $status;
        }

        if ($dateFrom) {
            $query .= " AND incident_date >= ?";
            $params[] = $dateFrom;
        }

        if ($dateTo) {
            $query .= " AND incident_date <= ?";
            $params[] = $dateTo;
        }

        $query .= " ORDER BY created_at DESC";

        $stmt = $conn->prepare($query);
        $stmt->execute($params);
        $complaints = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'complaints' => $complaints]);
    } catch(PDOException $e) {
        echo json_encode(['error' => 'Failed to fetch complaints: ' . $e->getMessage()]);
    }
}

// Create new complaint with file upload
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Handle file upload
        $evidencePhoto = null;
        if (isset($_FILES['evidence_photo'])) {
            $file = $_FILES['evidence_photo'];
            $fileName = time() . '_' . basename($file['name']);
            $targetDir = 'uploads/';
            
            // Create directory if it doesn't exist
            if (!file_exists($targetDir)) {
                mkdir($targetDir, 0777, true);
            }
            
            $targetPath = $targetDir . $fileName;
            
            if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                $evidencePhoto = $targetPath;
            }
        }

        $data = json_decode($_POST['data'], true);
        
        $stmt = $conn->prepare("
            INSERT INTO complaints (
                complaint_id, first_name, last_name, contact_number,
                email, complete_address, complaint_type, incident_date,
                incident_time, incident_location, complaint_description,
                evidence_photo, declaration, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $data['complaint_id'] ?? null,
            $data['first_name'],
            $data['last_name'],
            $data['contact_number'],
            $data['email'] ?? null,
            $data['complete_address'],
            $data['complaint_type'],
            $data['incident_date'],
            $data['incident_time'],
            $data['incident_location'],
            $data['complaint_description'],
            $evidencePhoto,
            $data['declaration'],
            'Pending'
        ]);

        echo json_encode([
            'success' => true, 
            'message' => 'Complaint submitted successfully',
            'complaint_id' => $conn->lastInsertId()
        ]);
    } catch(PDOException $e) {
        echo json_encode(['error' => 'Failed to submit complaint: ' . $e->getMessage()]);
    }
}

// Update complaint status
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    try {
        $stmt = $conn->prepare("
            UPDATE complaints 
            SET status = ?, remarks = ? 
            WHERE id = ?
        ");
        
        $stmt->execute([
            $data['status'],
            $data['remarks'] ?? null,
            $data['id']
        ]);

        echo json_encode(['success' => true, 'message' => 'Complaint status updated successfully']);
    } catch(PDOException $e) {
        echo json_encode(['error' => 'Failed to update complaint: ' . $e->getMessage()]);
    }
}
?> 