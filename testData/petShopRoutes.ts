import express, { Request, Response } from "express";

const app = express();
const port = 3000;

app.use(express.json());

interface Pet {
  id: number;
  name: string;
  type: string;
  age: number;
}

// Sample in-memory "database"
let pets: Pet[] = [
  { id: 1, name: "Rex", type: "Dog", age: 5 },
  { id: 2, name: "Mittens", type: "Cat", age: 3 },
  // Add more pets as needed
];

// GET /pets - List all pets
app.get("/pets", (req: Request, res: Response) => {
  res.json(pets);
});

// GET /pets/:id - Get a single pet by ID
app.get("/pets/:id", (req: Request, res: Response) => {
  const pet = pets.find((p) => p.id === parseInt(req.params.id));
  if (pet) {
    res.json(pet);
  } else {
    res.status(404).send("Pet not found");
  }
});

// POST /pets - Add a new pet
app.post("/pets", (req: Request, res: Response) => {
  const newPet: Pet = {
    id: pets.length + 1, // Simple ID generation strategy
    name: req.body.name,
    type: req.body.type,
    age: req.body.age,
  };
  pets.push(newPet);
  res.status(201).send(newPet);
});

// PUT /pets/:id - Update a pet's information
app.put("/pets/:id", (req: Request, res: Response) => {
  const petIndex = pets.findIndex((p) => p.id === parseInt(req.params.id));
  if (petIndex > -1) {
    const updatedPet = { ...pets[petIndex], ...req.body };
    pets[petIndex] = updatedPet as Pet;
    res.send(updatedPet);
  } else {
    res.status(404).send("Pet not found");
  }
});

// DELETE /pets/:id - Delete a pet
app.delete("/pets/:id", (req: Request, res: Response) => {
  const petIndex = pets.findIndex((p) => p.id === parseInt(req.params.id));
  if (petIndex > -1) {
    pets = pets.filter((p) => p.id !== parseInt(req.params.id));
    res.send("Pet deleted");
  } else {
    res.status(404).send("Pet not found");
  }
});

app.listen(port, () => {
  console.log(`Pet store app listening at http://localhost:${port}`);
});
