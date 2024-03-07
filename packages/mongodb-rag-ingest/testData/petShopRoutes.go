package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"sync"

	"github.com/gorilla/mux"
)

// Pet represents the pet model.
type Pet struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Type string `json:"type"`
	Age  int    `json:"age"`
}

var pets []Pet
var mutex sync.Mutex
var currentID int

func main() {
	router := mux.NewRouter()

	pets = append(pets, Pet{ID: 1, Name: "Rex", Type: "Dog", Age: 5})
	currentID = 1 // Initialize currentID with the latest pet ID

	router.HandleFunc("/pets", getPets).Methods("GET")
	router.HandleFunc("/pets/{id}", getPet).Methods("GET")
	router.HandleFunc("/pets", createPet).Methods("POST")
	router.HandleFunc("/pets/{id}", updatePet).Methods("PUT")
	router.HandleFunc("/pets/{id}", deletePet).Methods("DELETE")

	log.Fatal(http.ListenAndServe(":8080", router))
}

// getPets handles GET requests to list all pets.
func getPets(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(pets)
}

// getPet handles GET requests to retrieve a single pet by ID.
func getPet(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	for _, pet := range pets {
		if pet.ID == id {
			json.NewEncoder(w).Encode(pet)
			return
		}
	}
	w.WriteHeader(http.StatusNotFound)
}

// createPet handles POST requests to add a new pet.
func createPet(w http.ResponseWriter, r *http.Request) {
	mutex.Lock()
	defer mutex.Unlock()
	w.Header().Set("Content-Type", "application/json")
	var pet Pet
	_ = json.NewDecoder(r.Body).Decode(&pet)
	currentID++
	pet.ID = currentID
	pets = append(pets, pet)
	json.NewEncoder(w).Encode(pet)
}

// updatePet handles PUT requests to update a pet by ID.
func updatePet(w http.ResponseWriter, r *http.Request) {
	mutex.Lock()
	defer mutex.Unlock()
	w.Header().Set("Content-Type", "application/json")
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	for i, pet := range pets {
		if pet.ID == id {
			pets = append(pets[:i], pets[i+1:]...)
			var updatedPet Pet
			_ = json.NewDecoder(r.Body).Decode(&updatedPet)
			updatedPet.ID = id
			pets = append(pets, updatedPet)
			json.NewEncoder(w).Encode(updatedPet)
			return
		}
	}
	w.WriteHeader(http.StatusNotFound)
}

// deletePet handles DELETE requests to remove a pet by ID.
func deletePet(w http.ResponseWriter, r *http.Request) {
	mutex.Lock()
	defer mutex.Unlock()
	w.Header().Set("Content-Type", "application/json")
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	for i, pet := range pets {
		if pet.ID == id {
			pets = append(pets[:i], pets[i+1:]...)
			break
		}
	}
	w.WriteHeader(http.StatusNoContent)
}
