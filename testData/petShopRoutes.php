header("Content-Type: application/json");

// Simulated database of pets
$pets = [
    ['id' => 1, 'name' => 'Rex', 'type' => 'Dog', 'age' => 5],
    ['id' => 2, 'name' => 'Mittens', 'type' => 'Cat', 'age' => 3]
];

// Utility function to find a pet by ID
function findPetById($pets, $id) {
    foreach ($pets as $pet) {
        if ($pet['id'] == $id) {
            return $pet;
        }
    }
    return null;
}

$method = $_SERVER['REQUEST_METHOD'];
$path = explode('/', trim($_SERVER['PATH_INFO'],'/'));
$petId = isset($path[1]) ? (int)$path[1] : null;

switch ($method) {
    case 'GET':
        if ($petId) {
            $pet = findPetById($pets, $petId);
            if ($pet) {
                echo json_encode($pet);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Pet not found']);
            }
        } else {
            echo json_encode($pets);
        }
        break;
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!is_array($input) || !isset($input['name']) || !isset($input['type']) || !isset($input['age'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Bad request']);
            break;
        }
        $newPet = [
            'id' => end($pets)['id'] + 1,
            'name' => $input['name'],
            'type' => $input['type'],
            'age' => $input['age']
        ];
        $pets[] = $newPet;
        echo json_encode($newPet);
        break;
    case 'PUT':
        if (!$petId || !$pet = findPetById($pets, $petId)) {
            http_response_code(404);
            echo json_encode(['error' => 'Pet not found']);
            break;
        }
        $input = json_decode(file_get_contents('php://input'), true);
        if (!is_array($input)) {
            http_response_code(400);
            echo json_encode(['error' => 'Bad request']);
            break;
        }
        // Update the pet
        foreach ($pets as &$pet) {
            if ($pet['id'] == $petId) {
                $pet['name'] = $input['name'] ?? $pet['name'];
                $pet['type'] = $input['type'] ?? $pet['type'];
                $pet['age'] = $input['age'] ?? $pet['age'];
                echo json_encode($pet);
                break;
            }
        }
        break;
    case 'DELETE':
        if (!$petId) {
            http_response_code(400);
            echo json_encode(['error' => 'Bad request']);
            break;
        }
        $found = false;
        foreach ($pets as $i => $pet) {
            if ($pet['id'] == $petId) {
                array_splice($pets, $i, 1);
                $found = true;
                break;
            }
        }
        if ($found) {
            http_response_code(204);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Pet not found']);
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
