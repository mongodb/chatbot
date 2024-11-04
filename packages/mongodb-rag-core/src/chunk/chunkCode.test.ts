import { chunkCode } from "./chunkCode";
import { promises as fs } from "fs";
import path from "path";
import { Page, pageFormat } from "../contentStore";

const PROJECT_ROOT_DIR = path.resolve(__dirname, "../../");

const createTestCodePage = async (filePath: string): Promise<Page> => {
  const code = await fs.readFile(
    path.join(PROJECT_ROOT_DIR, "testData/", filePath),
    { encoding: "utf-8" }
  );
  const fileExtension = path.extname(filePath).slice(1);
  const format = pageFormat(fileExtension);
  return {
    url: new URL(filePath, "https://example.com").toString(),
    body: code,
    format: format,
    sourceName: "test",
    metadata: {
      programmingLanguage: format,
    },
  } satisfies Page;
};

describe("chunkCode", () => {
  it("Chunks JavaScript", async () => {
    const page = await createTestCodePage("petShopRoutes.js");
    const chunks = await chunkCode(page, {
      maxChunkSize: 200,
      chunkOverlap: 20,
    });
    expect(chunks.length).toBe(6);
    expect(chunks[0].text).toBe(
      'const express = require("express");\nconst app = express();'
    );
    expect(chunks[1].text).toBe(
      'const port = 3000;\n\n// Middleware to parse JSON bodies\napp.use(express.json());\n\n// In-memory "database" for demonstration purposes'
    );
    expect(chunks[2].text).toBe(
      'let pets = [\n  { id: 1, name: "Rex", type: "Dog", age: 5 },\n  { id: 2, name: "Mittens", type: "Cat", age: 3 },\n  // Add more pets as needed\n];\n\n// GET /pets - List all pets\napp.get("/pets", (req, res) => {\n  res.json(pets);\n});\n\n// GET /pets/:id - Get a single pet by ID\napp.get("/pets/:id", (req, res) => {\n  const pet = pets.find((p) => p.id === parseInt(req.params.id));\n  if (pet) {\n    res.json(pet);\n  } else {\n    res.status(404).send("Pet not found");\n  }\n});'
    );
    expect(chunks[3].text).toBe(
      '// POST /pets - Add a new pet\napp.post("/pets", (req, res) => {\n  const newPet = {\n    id: pets.length + 1, // Simple ID generation strategy\n    name: req.body.name,\n    type: req.body.type,\n    age: req.body.age,\n  };\n  pets.push(newPet);\n  res.status(201).send(newPet);\n});'
    );
    expect(chunks[4].text).toBe(
      '// PUT /pets/:id - Update a pet\'s information\napp.put("/pets/:id", (req, res) => {\n  const petIndex = pets.findIndex((p) => p.id === parseInt(req.params.id));\n  if (petIndex > -1) {\n    const updatedPet = { ...pets[petIndex], ...req.body };\n    pets[petIndex] = updatedPet;\n    res.send(updatedPet);\n  } else {\n    res.status(404).send("Pet not found");\n  }\n});'
    );
    expect(chunks[5].text).toBe(
      '// DELETE /pets/:id - Delete a pet\napp.delete("/pets/:id", (req, res) => {\n  const petIndex = pets.findIndex((p) => p.id === parseInt(req.params.id));\n  if (petIndex > -1) {\n    pets = pets.filter((p) => p.id !== parseInt(req.params.id));\n    res.send("Pet deleted");\n  } else {\n    res.status(404).send("Pet not found");\n  }\n});\n\napp.listen(port, () => {\n  console.log(`Pet store app listening at http://localhost:${port}`);\n});'
    );
  });

  it("Chunks TypeScript", async () => {
    const page = await createTestCodePage("petShopRoutes.ts");
    const chunks = await chunkCode(page, {
      maxChunkSize: 200,
      chunkOverlap: 20,
    });
    expect(chunks.length).toBe(7);
    expect(chunks[0].text).toBe(
      'import express, { Request, Response } from "express";\n\nconst app = express();'
    );
    expect(chunks[1].text).toBe(
      'const port = 3000;\n\napp.use(express.json());\n\ninterface Pet {\n  id: number;\n  name: string;\n  type: string;\n  age: number;\n}\n\n// Sample in-memory "database"'
    );
    expect(chunks[2].text).toBe(
      'let pets: Pet[] = [\n  { id: 1, name: "Rex", type: "Dog", age: 5 },\n  { id: 2, name: "Mittens", type: "Cat", age: 3 },\n  // Add more pets as needed\n];\n\n// GET /pets - List all pets\napp.get("/pets", (req: Request, res: Response) => {\n  res.json(pets);\n});'
    );
    expect(chunks[3].text).toBe(
      '// GET /pets/:id - Get a single pet by ID\napp.get("/pets/:id", (req: Request, res: Response) => {\n  const pet = pets.find((p) => p.id === parseInt(req.params.id));\n  if (pet) {\n    res.json(pet);\n  } else {\n    res.status(404).send("Pet not found");\n  }\n});'
    );
    expect(chunks[4].text).toBe(
      '// POST /pets - Add a new pet\napp.post("/pets", (req: Request, res: Response) => {\n  const newPet: Pet = {\n    id: pets.length + 1, // Simple ID generation strategy\n    name: req.body.name,\n    type: req.body.type,\n    age: req.body.age,\n  };\n  pets.push(newPet);\n  res.status(201).send(newPet);\n});'
    );
    expect(chunks[5].text).toBe(
      '// PUT /pets/:id - Update a pet\'s information\napp.put("/pets/:id", (req: Request, res: Response) => {\n  const petIndex = pets.findIndex((p) => p.id === parseInt(req.params.id));\n  if (petIndex > -1) {\n    const updatedPet = { ...pets[petIndex], ...req.body };\n    pets[petIndex] = updatedPet as Pet;\n    res.send(updatedPet);\n  } else {\n    res.status(404).send("Pet not found");\n  }\n});'
    );
    expect(chunks[6].text).toBe(
      '// DELETE /pets/:id - Delete a pet\napp.delete("/pets/:id", (req: Request, res: Response) => {\n  const petIndex = pets.findIndex((p) => p.id === parseInt(req.params.id));\n  if (petIndex > -1) {\n    pets = pets.filter((p) => p.id !== parseInt(req.params.id));\n    res.send("Pet deleted");\n  } else {\n    res.status(404).send("Pet not found");\n  }\n});\n\napp.listen(port, () => {\n  console.log(`Pet store app listening at http://localhost:${port}`);\n});'
    );
  });

  it("Chunks Java", async () => {
    const page = await createTestCodePage("petShopRoutes.java");
    const chunks = await chunkCode(page, {
      maxChunkSize: 200,
      chunkOverlap: 20,
    });
    expect(chunks.length).toBe(8);
    expect(chunks[0].text).toBe(
      'import org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\nimport org.springframework.web.bind.annotation.*;\nimport org.springframework.http.HttpStatus;\nimport org.springframework.http.ResponseEntity;\n\nimport java.util.ArrayList;\nimport java.util.List;\nimport java.util.concurrent.atomic.AtomicLong;\nimport java.util.Optional;\n\n@SpringBootApplication\npublic class PetStoreApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(PetStoreApplication.class, args);\n    }\n}\n\n@RestController\n@RequestMapping("/pets")'
    );
    expect(chunks[1].text).toBe(
      'class PetController {\n\n    private final List<Pet> pets = new ArrayList<>();\n    private final AtomicLong counter = new AtomicLong();\n\n    public PetController() {\n        // Pre-populate the list with some pets\n        pets.add(new Pet(counter.incrementAndGet(), "Rex", "Dog", 5));\n        pets.add(new Pet(counter.incrementAndGet(), "Mittens", "Cat", 3));\n    }\n\n    @GetMapping\n    public List<Pet> getAllPets() {\n        return pets;\n    }'
    );
    expect(chunks[2].text).toBe(
      '@GetMapping("/{id}")\n    public ResponseEntity<Pet> getPetById(@PathVariable Long id) {\n        Optional<Pet> pet = pets.stream().filter(p -> p.getId().equals(id)).findFirst();\n        return pet.map(value -> new ResponseEntity<>(value, HttpStatus.OK))\n                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));\n    }'
    );
    expect(chunks[3].text).toBe(
      "@PostMapping\n    public Pet addPet(@RequestBody Pet pet) {\n        pet.setId(counter.incrementAndGet());\n        pets.add(pet);\n        return pet;\n    }"
    );
    expect(chunks[4].text).toBe(
      '@PutMapping("/{id}")\n    public ResponseEntity<Pet> updatePet(@PathVariable Long id, @RequestBody Pet pet) {\n        Optional<Pet> petOptional = pets.stream().filter(p -> p.getId().equals(id)).findFirst();\n        if (petOptional.isPresent()) {\n            Pet existingPet = petOptional.get();\n            existingPet.setName(pet.getName());\n            existingPet.setType(pet.getType());\n            existingPet.setAge(pet.getAge());'
    );
    expect(chunks[5].text).toBe(
      "return new ResponseEntity<>(existingPet, HttpStatus.OK);\n        } else {\n            return new ResponseEntity<>(HttpStatus.NOT_FOUND);\n        }\n    }"
    );
    expect(chunks[6].text).toBe(
      '@DeleteMapping("/{id}")\n    public ResponseEntity<Void> deletePet(@PathVariable Long id) {\n        boolean removed = pets.removeIf(p -> p.getId().equals(id));\n        if (removed) {\n            return new ResponseEntity<>(HttpStatus.NO_CONTENT);\n        } else {\n            return new ResponseEntity<>(HttpStatus.NOT_FOUND);\n        }\n    }\n}'
    );
    expect(chunks[7].text).toBe(
      "class Pet {\n    private Long id;\n    private String name;\n    private String type;\n    private int age;\n\n    // Constructor, getters, and setters omitted for brevity\n}"
    );
  });

  it("Chunks C", async () => {
    const page = await createTestCodePage("calculator.c");
    const chunks = await chunkCode(page, {
      maxChunkSize: 200,
      chunkOverlap: 20,
    });
    expect(chunks.length).toBe(3);
    expect(chunks[0].text).toBe(
      '#include <stdio.h>\n#include <stdlib.h>\n\nfloat add(float num1, float num2) { return num1 + num2; }\n\nfloat subtract(float num1, float num2) { return num1 - num2; }\n\nfloat multiply(float num1, float num2) { return num1 * num2; }\n\nfloat divide(float num1, float num2) {\n  if (num2 != 0.0) {\n    return num1 / num2;\n  } else {\n    printf("Error: Division by zero!\\n");\n    return 0.0;\n  }\n}'
    );
    expect(chunks[1].text).toBe(
      'int main() {\n  char operator;\n  float num1, num2, result;\n\n  printf("Enter an operator (+, -, *, /): ");\n  scanf(" %c", &operator);\n\n  printf("Enter two operands: ");\n  scanf("%f %f", &num1, &num2);'
    );
    expect(chunks[2].text).toBe(
      "switch (operator) {\n  case '+':\n    result = add(num1, num2);\n    break;\n  case '-':\n    result = subtract(num1, num2);\n    break;\n  case '*':\n    result = multiply(num1, num2);\n    break;\n  case '/':\n    result = divide(num1, num2);\n    break;\n  default:\n    printf(\"Error: Unsupported operation!\\n\");\n    return -1;\n  }\n\n  printf(\"Result: %.2f\\n\", result);\n  return 0;\n}"
    );
  });

  it("Chunks C++", async () => {
    const page = await createTestCodePage("petShopRoutes.cpp");
    const chunks = await chunkCode(page, {
      maxChunkSize: 200,
      chunkOverlap: 20,
    });
    expect(chunks.length).toBe(9);
    expect(chunks[0].text).toBe(
      "#include <cpprest/http_listener.h>\n#include <cpprest/json.h>\n#include <mutex>\n#include <vector>\n\nusing namespace web;\nusing namespace web::http;\nusing namespace web::http::experimental::listener;\n\nstruct Pet {\n  long id;\n  utility::string_t name;\n  utility::string_t type;\n  int age;\n};\n\nstd::vector<Pet> pets;\nstd::mutex pets_mutex;\nlong currentPetId = 0;"
    );
    expect(chunks[1].text).toBe(
      "void handle_get(http_request request) {\n  // Lock access to the pets vector\n  std::lock_guard<std::mutex> lock(pets_mutex);"
    );
    expect(chunks[2].text).toBe(
      '// Create a JSON array to hold the pet data\n  json::value petArray = json::value::array();\n  for (size_t i = 0; i < pets.size(); ++i) {\n    json::value petObj;\n    petObj[U("id")] = json::value::number(pets[i].id);\n    petObj[U("name")] = json::value::string(pets[i].name);\n    petObj[U("type")] = json::value::string(pets[i].type);\n    petObj[U("age")] = json::value::number(pets[i].age);\n    petArray[i] = petObj;\n  }'
    );
    expect(chunks[3].text).toBe(
      "// Respond with the JSON array of pets\n  request.reply(status_codes::OK, petArray);\n}"
    );
    expect(chunks[4].text).toBe(
      'void handle_post(http_request request) {\n  // Lock access to the pets vector\n  std::lock_guard<std::mutex> lock(pets_mutex);\n\n  // Parse the incoming request body as JSON\n  request.extract_json()\n      .then([](json::value requestObj) {\n        Pet newPet;\n        newPet.id = ++currentPetId;\n        newPet.name = requestObj[U("name")].as_string();\n        newPet.type = requestObj[U("type")].as_string();\n        newPet.age = requestObj[U("age")].as_integer();'
    );
    expect(chunks[5].text).toBe(
      'pets.push_back(newPet);\n\n        json::value responseObj;\n        responseObj[U("id")] = json::value::number(newPet.id);\n        responseObj[U("name")] = json::value::string(newPet.name);\n        responseObj[U("type")] = json::value::string(newPet.type);\n        responseObj[U("age")] = json::value::number(newPet.age);'
    );
    expect(chunks[6].text).toBe(
      "return responseObj;\n      })\n      .then([&request](json::value responseObj) {\n        request.reply(status_codes::Created, responseObj);\n      })\n      .wait();\n}"
    );
    expect(chunks[7].text).toBe(
      'int main() {\n  uri_builder uri(U("http://localhost:3000"));\n  auto addr = uri.to_uri().to_string();\n  http_listener listener(addr);\n\n  listener.support(methods::GET, handle_get);\n  listener.support(methods::POST, handle_post);\n\n  try {\n    listener.open()\n        .then([&listener]() {\n          std::wcout << U("Starting to listen at ")\n                     << listener.uri().to_string() << std::endl;\n        })\n        .wait();'
    );
    expect(chunks[8].text).toBe(
      'std::string line;\n    std::getline(std::cin, line);\n  } catch (const std::exception &e) {\n    std::wcerr << U("An error occurred: ") << e.what() << std::endl;\n  }\n\n  return 0;\n}'
    );
  });

  it("Chunks Go", async () => {
    const page = await createTestCodePage("petShopRoutes.go");
    const chunks = await chunkCode(page, {
      maxChunkSize: 200,
      chunkOverlap: 20,
    });
    expect(chunks.length).toBe(10);
    expect(chunks[0].text).toBe(
      'package main\n\nimport (\n\t"encoding/json"\n\t"log"\n\t"net/http"\n\t"strconv"\n\t"sync"\n\n\t"github.com/gorilla/mux"\n)\n\n// Pet represents the pet model.\ntype Pet struct {\n\tID   int    `json:"id"`\n\tName string `json:"name"`\n\tType string `json:"type"`\n\tAge  int    `json:"age"`\n}\n\nvar pets []Pet\nvar mutex sync.Mutex\nvar currentID int'
    );
    expect(chunks[1].text).toBe(
      'func main() {\n\trouter := mux.NewRouter()\n\n\tpets = append(pets, Pet{ID: 1, Name: "Rex", Type: "Dog", Age: 5})\n\tcurrentID = 1 // Initialize currentID with the latest pet ID\n\n\trouter.HandleFunc("/pets", getPets).Methods("GET")\n\trouter.HandleFunc("/pets/{id}", getPet).Methods("GET")\n\trouter.HandleFunc("/pets", createPet).Methods("POST")\n\trouter.HandleFunc("/pets/{id}", updatePet).Methods("PUT")\n\trouter.HandleFunc("/pets/{id}", deletePet).Methods("DELETE")\n\n\tlog.Fatal(http.ListenAndServe(":8080", router))\n}'
    );
    expect(chunks[2].text).toBe(
      "// getPets handles GET requests to list all pets."
    );
    expect(chunks[3].text).toBe(
      'func getPets(w http.ResponseWriter, r *http.Request) {\n\tw.Header().Set("Content-Type", "application/json")\n\tjson.NewEncoder(w).Encode(pets)\n}\n\n// getPet handles GET requests to retrieve a single pet by ID.'
    );
    expect(chunks[4].text).toBe(
      'func getPet(w http.ResponseWriter, r *http.Request) {\n\tw.Header().Set("Content-Type", "application/json")\n\tparams := mux.Vars(r)\n\tid, err := strconv.Atoi(params["id"])\n\tif err != nil {\n\t\tw.WriteHeader(http.StatusBadRequest)\n\t\treturn\n\t}\n\tfor _, pet := range pets {\n\t\tif pet.ID == id {\n\t\t\tjson.NewEncoder(w).Encode(pet)\n\t\t\treturn\n\t\t}\n\t}\n\tw.WriteHeader(http.StatusNotFound)\n}\n\n// createPet handles POST requests to add a new pet.'
    );
    expect(chunks[5].text).toBe(
      'func createPet(w http.ResponseWriter, r *http.Request) {\n\tmutex.Lock()\n\tdefer mutex.Unlock()\n\tw.Header().Set("Content-Type", "application/json")\n\tvar pet Pet\n\t_ = json.NewDecoder(r.Body).Decode(&pet)\n\tcurrentID++\n\tpet.ID = currentID\n\tpets = append(pets, pet)\n\tjson.NewEncoder(w).Encode(pet)\n}\n\n// updatePet handles PUT requests to update a pet by ID.'
    );
    expect(chunks[6].text).toBe(
      'func updatePet(w http.ResponseWriter, r *http.Request) {\n\tmutex.Lock()\n\tdefer mutex.Unlock()\n\tw.Header().Set("Content-Type", "application/json")\n\tparams := mux.Vars(r)\n\tid, err := strconv.Atoi(params["id"])\n\tif err != nil {\n\t\tw.WriteHeader(http.StatusBadRequest)\n\t\treturn\n\t}\n\tfor i, pet := range pets {\n\t\tif pet.ID == id {\n\t\t\tpets = append(pets[:i], pets[i+1:]...)\n\t\t\tvar updatedPet Pet\n\t\t\t_ = json.NewDecoder(r.Body).Decode(&updatedPet)\n\t\t\tupdatedPet.ID = id'
    );
    expect(chunks[7].text).toBe(
      "updatedPet.ID = id\n\t\t\tpets = append(pets, updatedPet)\n\t\t\tjson.NewEncoder(w).Encode(updatedPet)\n\t\t\treturn\n\t\t}\n\t}\n\tw.WriteHeader(http.StatusNotFound)\n}"
    );
    expect(chunks[8].text).toBe(
      "// deletePet handles DELETE requests to remove a pet by ID."
    );
    expect(chunks[9].text).toBe(
      'func deletePet(w http.ResponseWriter, r *http.Request) {\n\tmutex.Lock()\n\tdefer mutex.Unlock()\n\tw.Header().Set("Content-Type", "application/json")\n\tparams := mux.Vars(r)\n\tid, err := strconv.Atoi(params["id"])\n\tif err != nil {\n\t\tw.WriteHeader(http.StatusBadRequest)\n\t\treturn\n\t}\n\tfor i, pet := range pets {\n\t\tif pet.ID == id {\n\t\t\tpets = append(pets[:i], pets[i+1:]...)\n\t\t\tbreak\n\t\t}\n\t}\n\tw.WriteHeader(http.StatusNoContent)\n}'
    );
  });

  it("Chunks PHP", async () => {
    const page = await createTestCodePage("petShopRoutes.php");
    const chunks = await chunkCode(page, {
      maxChunkSize: 200,
      chunkOverlap: 20,
    });
    expect(chunks.length).toBe(10);
    expect(chunks[0].text).toBe(
      "header(\"Content-Type: application/json\");\n\n// Simulated database of pets\n$pets = [\n    ['id' => 1, 'name' => 'Rex', 'type' => 'Dog', 'age' => 5],\n    ['id' => 2, 'name' => 'Mittens', 'type' => 'Cat', 'age' => 3]\n];\n\n// Utility function to find a pet by ID"
    );
    expect(chunks[1].text).toBe(
      "function findPetById($pets, $id) {\n    foreach ($pets as $pet) {\n        if ($pet['id'] == $id) {\n            return $pet;\n        }\n    }\n    return null;\n}\n\n$method = $_SERVER['REQUEST_METHOD'];\n$path = explode('/', trim($_SERVER['PATH_INFO'],'/'));\n$petId = isset($path[1]) ? (int)$path[1] : null;"
    );
    expect(chunks[2].text).toBe(
      "switch ($method) {\n    case 'GET':\n        if ($petId) {\n            $pet = findPetById($pets, $petId);\n            if ($pet) {\n                echo json_encode($pet);\n            } else {\n                http_response_code(404);\n                echo json_encode(['error' => 'Pet not found']);\n            }\n        } else {"
    );
    expect(chunks[3].text).toBe(
      "} else {\n            echo json_encode($pets);\n        }\n        break;\n    case 'POST':\n        $input = json_decode(file_get_contents('php://input'), true);\n        if (!is_array($input) || !isset($input['name']) || !isset($input['type']) || !isset($input['age'])) {\n            http_response_code(400);\n            echo json_encode(['error' => 'Bad request']);\n            break;"
    );
    expect(chunks[4].text).toBe(
      "break;\n        }\n        $newPet = [\n            'id' => end($pets)['id'] + 1,\n            'name' => $input['name'],\n            'type' => $input['type'],\n            'age' => $input['age']\n        ];\n        $pets[] = $newPet;\n        echo json_encode($newPet);\n        break;\n    case 'PUT':"
    );
    expect(chunks[5].text).toBe(
      "break;\n    case 'PUT':\n        if (!$petId || !$pet = findPetById($pets, $petId)) {\n            http_response_code(404);\n            echo json_encode(['error' => 'Pet not found']);\n            break;\n        }\n        $input = json_decode(file_get_contents('php://input'), true);\n        if (!is_array($input)) {\n            http_response_code(400);"
    );
    expect(chunks[6].text).toBe(
      "http_response_code(400);\n            echo json_encode(['error' => 'Bad request']);\n            break;\n        }\n        // Update the pet\n        foreach ($pets as &$pet) {\n            if ($pet['id'] == $petId) {\n                $pet['name'] = $input['name'] ?? $pet['name'];\n                $pet['type'] = $input['type'] ?? $pet['type'];"
    );
    expect(chunks[7].text).toBe(
      "$pet['age'] = $input['age'] ?? $pet['age'];\n                echo json_encode($pet);\n                break;\n            }\n        }\n        break;\n    case 'DELETE':\n        if (!$petId) {\n            http_response_code(400);\n            echo json_encode(['error' => 'Bad request']);\n            break;"
    );
    expect(chunks[8].text).toBe(
      "break;\n        }\n        $found = false;\n        foreach ($pets as $i => $pet) {\n            if ($pet['id'] == $petId) {\n                array_splice($pets, $i, 1);\n                $found = true;\n                break;\n            }\n        }\n        if ($found) {"
    );
    expect(chunks[9].text).toBe(
      "if ($found) {\n            http_response_code(204);\n        } else {\n            http_response_code(404);\n            echo json_encode(['error' => 'Pet not found']);\n        }\n        break;\n    default:\n        http_response_code(405);\n        echo json_encode(['error' => 'Method not allowed']);\n        break;\n}"
    );
  });

  it("Chunks Python", async () => {
    const page = await createTestCodePage("petShopRoutes.py");
    const chunks = await chunkCode(page, {
      maxChunkSize: 200,
      chunkOverlap: 20,
    });
    expect(chunks.length).toBe(5);
    expect(chunks[0].text).toBe(
      "from flask import Flask, jsonify, request, abort\n\napp = Flask(__name__)\n\npets = [\n    {'id': 1, 'name': 'Rex', 'type': 'Dog', 'age': 5},\n    {'id': 2, 'name': 'Mittens', 'type': 'Cat', 'age': 3}\n]\n\n@app.route('/pets', methods=['GET'])\ndef get_pets():\n    return jsonify(pets)\n\n@app.route('/pets/<int:pet_id>', methods=['GET'])"
    );
    expect(chunks[1].text).toBe(
      "def get_pet(pet_id):\n    pet = next((pet for pet in pets if pet['id'] == pet_id), None)\n    if pet is None:\n        abort(404)\n    return jsonify(pet)\n\n@app.route('/pets', methods=['POST'])"
    );
    expect(chunks[2].text).toBe(
      "def create_pet():\n    if not request.json or not 'name' in request.json:\n        abort(400)\n    pet = {\n        'id': pets[-1]['id'] + 1 if pets else 1,\n        'name': request.json['name'],\n        'type': request.json.get('type', \"\"),\n        'age': request.json.get('age', 0)\n    }\n    pets.append(pet)\n    return jsonify(pet), 201\n\n@app.route('/pets/<int:pet_id>', methods=['PUT'])"
    );
    expect(chunks[3].text).toBe(
      "def update_pet(pet_id):\n    pet = next((pet for pet in pets if pet['id'] == pet_id), None)\n    if pet is None:\n        abort(404)\n    if not request.json:\n        abort(400)\n    pet['name'] = request.json.get('name', pet['name'])\n    pet['type'] = request.json.get('type', pet['type'])\n    pet['age'] = request.json.get('age', pet['age'])\n    return jsonify(pet)\n\n@app.route('/pets/<int:pet_id>', methods=['DELETE'])"
    );
    expect(chunks[4].text).toBe(
      "def delete_pet(pet_id):\n    global pets\n    pet = next((pet for pet in pets if pet['id'] == pet_id), None)\n    if pet is None:\n        abort(404)\n    pets = [pet for pet in pets if pet['id'] != pet_id]\n    return jsonify({'result': True})\n\nif __name__ == '__main__':\n    app.run(debug=True)"
    );
  });

  it("Chunks Ruby", async () => {
    const page = await createTestCodePage("petShopRoutes.rb");
    const chunks = await chunkCode(page, {
      maxChunkSize: 200,
      chunkOverlap: 20,
    });
    expect(chunks.length).toBe(4);
    expect(chunks[0].text).toBe(
      "require 'sinatra'\nrequire 'json'\n\n# In-memory store for pets\npets = [\n  { id: 1, name: 'Rex', type: 'Dog', age: 5 },\n  { id: 2, name: 'Mittens', type: 'Cat', age: 3 }\n]\n\n# Helper to find a pet by ID"
    );
    expect(chunks[1].text).toBe(
      "def find_pet(id, pets)\n  pets.find { |pet| pet[:id] == id.to_i }\nend\n\n# List all pets\nget '/pets' do\n  content_type :json\n  pets.to_json\nend\n\n# Get a single pet by ID\nget '/pets/:id' do\n  content_type :json\n  pet = find_pet(params[:id], pets)\n  halt 404, { error: 'Pet not found' }.to_json unless pet\n  pet.to_json\nend"
    );
    expect(chunks[2].text).toBe(
      "# Create a new pet\npost '/pets' do\n  content_type :json\n  new_pet = JSON.parse(request.body.read, symbolize_names: true)\n  new_pet[:id] = pets.last[:id] + 1\n  pets << new_pet\n  new_pet.to_json\nend\n\n# Update a pet by ID\nput '/pets/:id' do\n  content_type :json\n  pet = find_pet(params[:id], pets)\n  halt 404, { error: 'Pet not found' }.to_json unless pet\n\n  update_data = JSON.parse(request.body.read, symbolize_names: true)\n  pet.merge!(update_data)\n  pet.to_json\nend"
    );
    expect(chunks[3].text).toBe(
      "# Delete a pet by ID\ndelete '/pets/:id' do\n  content_type :json\n  pet = find_pet(params[:id], pets)\n  halt 404, { error: 'Pet not found' }.to_json unless pet\n\n  pets.delete(pet)\n  { success: true }.to_json\nend\n\n# Start the server\nrun! if app_file == $0"
    );
  });

  it("Chunks Rust", async () => {
    const page = await createTestCodePage("petShopRoutes.rs");
    const chunks = await chunkCode(page, {
      maxChunkSize: 200,
      chunkOverlap: 20,
    });
    expect(chunks.length).toBe(8);
    expect(chunks[0].text).toBe(
      "use actix_web::{web, App, HttpResponse, HttpServer, Responder};\nuse serde::{Deserialize, Serialize};\nuse std::sync::Mutex;\nuse std::collections::HashMap;\n\n#[derive(Serialize, Deserialize)]\nstruct Pet {\n    id: u32,\n    name: String,\n    type_: String,\n    age: u32,\n}\n\n// Use Mutex to safely share state across threads.\nstruct AppState {\n    pets: Mutex<HashMap<u32, Pet>>,\n}"
    );
    expect(chunks[1].text).toBe(
      "async fn get_pets(data: web::Data<AppState>) -> impl Responder {\n    let pets = data.pets.lock().unwrap();\n    let pets: Vec<&Pet> = pets.values().collect();\n    HttpResponse::Ok().json(pets)\n}"
    );
    expect(chunks[2].text).toBe(
      'async fn get_pet(path: web::Path<(u32,)>, data: web::Data<AppState>) -> impl Responder {\n    let pets = data.pets.lock().unwrap();\n    if let Some(pet) = pets.get(&path.0) {\n        HttpResponse::Ok().json(pet)\n    } else {\n        HttpResponse::NotFound().body("Pet not found")\n    }\n}'
    );
    expect(chunks[3].text).toBe(
      "async fn add_pet(pet: web::Json<Pet>, data: web::Data<AppState>) -> impl Responder {\n    let mut pets = data.pets.lock().unwrap();\n    pets.insert(pet.id, pet.into_inner());\n    HttpResponse::Created().finish()\n}"
    );
    expect(chunks[4].text).toBe(
      'async fn update_pet(path: web::Path<(u32,)>, pet: web::Json<Pet>, data: web::Data<AppState>) -> impl Responder {\n    let mut pets = data.pets.lock().unwrap();\n    if pets.contains_key(&path.0) {\n        pets.insert(path.0, pet.into_inner());\n        HttpResponse::Ok().finish()\n    } else {\n        HttpResponse::NotFound().body("Pet not found")\n    }\n}'
    );
    expect(chunks[5].text).toBe(
      'async fn delete_pet(path: web::Path<(u32,)>, data: web::Data<AppState>) -> impl Responder {\n    let mut pets = data.pets.lock().unwrap();\n    if pets.remove(&path.0).is_some() {\n        HttpResponse::Ok().finish()\n    } else {\n        HttpResponse::NotFound().body("Pet not found")\n    }\n}\n\n#[actix_web::main]\nasync fn main() -> std::io::Result<()> {\n    let data = web::Data::new(AppState {\n        pets: Mutex::new(HashMap::new()),\n    });'
    );
    expect(chunks[6].text).toBe(
      'HttpServer::new(move || {\n        App::new()\n            .app_data(data.clone())\n            .route("/pets", web::get().to(get_pets))\n            .route("/pets/{id}", web::get().to(get_pet))\n            .route("/pets", web::post().to(add_pet))\n            .route("/pets/{id}", web::put().to(update_pet))'
    );
    expect(chunks[7].text).toBe(
      '.route("/pets/{id}", web::delete().to(delete_pet))\n    })\n    .bind("127.0.0.1:8080")?\n    .run()\n    .await\n}'
    );
  });

  it("Chunks Scala", async () => {
    const page = await createTestCodePage("petShopRoutes.scala");
    const chunks = await chunkCode(page, {
      maxChunkSize: 200,
      chunkOverlap: 20,
    });
    expect(chunks.length).toBe(6);
    expect(chunks[0].text).toBe(
      "import akka.actor.ActorSystem\nimport akka.http.scaladsl.Http\nimport akka.http.scaladsl.model._\nimport akka.http.scaladsl.server.Directives._\nimport akka.stream.ActorMaterializer\nimport spray.json.DefaultJsonProtocol._\nimport akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport._\n\nimport scala.io.StdIn\n\n// Define the Pet case class and its JSON format\ncase class Pet(id: Int, name: String, petType: String, age: Int)"
    );
    expect(chunks[1].text).toBe(
      'object PetShopServer extends App {\n  implicit val system = ActorSystem("petShopSystem")\n  implicit val materializer = ActorMaterializer()\n  implicit val executionContext = system.dispatcher\n\n  // Spray JSON support\n  implicit val petFormat = jsonFormat4(Pet)\n\n  var pets = Vector.empty[Pet]'
    );
    expect(chunks[2].text).toBe(
      'val route =\n    pathPrefix("pets") {\n      concat(\n        get {\n          path(IntNumber) { id =>\n            complete(pets.find(_.id == id))\n          } ~\n          pathEndOrSingleSlash {\n            complete(pets)\n          }\n        },\n        post {\n          entity(as[Pet]) { pet =>\n            pets = pets :+ pet'
    );
    expect(chunks[3].text).toBe(
      "pets = pets :+ pet\n            complete(StatusCodes.Created, pet)\n          }\n        },\n        put {\n          entity(as[Pet]) { pet =>\n            pets = pets.filterNot(_.id == pet.id) :+ pet\n            complete(StatusCodes.OK, pet)\n          }\n        },\n        delete {\n          path(IntNumber) { id =>"
    );
    expect(chunks[4].text).toBe(
      "path(IntNumber) { id =>\n            pets = pets.filterNot(_.id == id)\n            complete(StatusCodes.OK)\n          }\n        }\n      )\n    }"
    );
    expect(chunks[5].text).toBe(
      'val bindingFuture = Http().bindAndHandle(route, "localhost", 8080)\n  println(s"Server online at http://localhost:8080/\\nPress RETURN to stop...")\n  StdIn.readLine() // let it run until user presses return\n  bindingFuture\n    .flatMap(_.unbind()) // trigger unbinding from the port\n    .onComplete(_ => system.terminate()) // and shutdown when done\n}'
    );
  });

  it("Chunks Swift", async () => {
    const page = await createTestCodePage("petShopRoutes.swift");
    const chunks = await chunkCode(page, {
      maxChunkSize: 200,
      chunkOverlap: 20,
    });
    expect(chunks.length).toBe(5);
    expect(chunks[0].text).toBe(
      'import Vapor\n\nstruct Pet: Content {\n    var id: Int\n    var name: String\n    var type: String\n    var age: Int\n}\n\n// Initialize with some pets\nvar pets = [\n    Pet(id: 1, name: "Rex", type: "Dog", age: 5),\n    Pet(id: 2, name: "Mittens", type: "Cat", age: 3)\n]'
    );
    expect(chunks[1].text).toBe(
      'func routes(_ app: Application) throws {\n\n    app.get("pets") { req -> [Pet] in\n        return pets\n    }\n\n    app.get("pets", ":petId") { req -> Pet in\n        guard let petId = req.parameters.get("petId", as: Int.self),\n              let pet = pets.first(where: { $0.id == petId }) else {\n            throw Abort(.notFound)\n        }\n        return pet\n    }'
    );
    expect(chunks[2].text).toBe(
      'app.post("pets") { req -> Pet in\n        let pet = try req.content.decode(Pet.self)\n        pets.append(pet)\n        return pet\n    }'
    );
    expect(chunks[3].text).toBe(
      'app.put("pets", ":petId") { req -> Pet in\n        let updatedPet = try req.content.decode(Pet.self)\n        guard let index = pets.firstIndex(where: { $0.id == updatedPet.id }) else {\n            throw Abort(.notFound)\n        }\n        pets[index] = updatedPet\n        return updatedPet\n    }'
    );
    expect(chunks[4].text).toBe(
      'app.delete("pets", ":petId") { req -> HTTPStatus in\n        guard let petId = req.parameters.get("petId", as: Int.self),\n              let index = pets.firstIndex(where: { $0.id == petId }) else {\n            throw Abort(.notFound)\n        }\n        pets.remove(at: index)\n        return .noContent\n    }\n}'
    );
  });
});

///**
//  This is a helper function that's useful for writing these tests. If
//  we change the test code files (or add a new one) we can use this to
//  output the expectations to disk. We can then copy the expectations
//  into the test file.
// */
// async function writeChunkExpectationsToDisk(language: string, chunks: ContentChunk[]) {
//   const cases = chunks
//     .map((chunk, i) => {
//       return `expect(chunks[${i}].text).toBe(${JSON.stringify(chunk.text)});`;
//     })
//     .join("\n");
//   await fs.mkdir("test_chunks", { recursive: true });
//   await fs.writeFile(`./test_chunks/${language}.txt`, cases);
// }
