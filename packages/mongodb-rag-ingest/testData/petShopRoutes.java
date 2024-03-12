import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.Optional;

@SpringBootApplication
public class PetStoreApplication {
    public static void main(String[] args) {
        SpringApplication.run(PetStoreApplication.class, args);
    }
}

@RestController
@RequestMapping("/pets")
class PetController {

    private final List<Pet> pets = new ArrayList<>();
    private final AtomicLong counter = new AtomicLong();

    public PetController() {
        // Pre-populate the list with some pets
        pets.add(new Pet(counter.incrementAndGet(), "Rex", "Dog", 5));
        pets.add(new Pet(counter.incrementAndGet(), "Mittens", "Cat", 3));
    }

    @GetMapping
    public List<Pet> getAllPets() {
        return pets;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pet> getPetById(@PathVariable Long id) {
        Optional<Pet> pet = pets.stream().filter(p -> p.getId().equals(id)).findFirst();
        return pet.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public Pet addPet(@RequestBody Pet pet) {
        pet.setId(counter.incrementAndGet());
        pets.add(pet);
        return pet;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pet> updatePet(@PathVariable Long id, @RequestBody Pet pet) {
        Optional<Pet> petOptional = pets.stream().filter(p -> p.getId().equals(id)).findFirst();
        if (petOptional.isPresent()) {
            Pet existingPet = petOptional.get();
            existingPet.setName(pet.getName());
            existingPet.setType(pet.getType());
            existingPet.setAge(pet.getAge());
            return new ResponseEntity<>(existingPet, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePet(@PathVariable Long id) {
        boolean removed = pets.removeIf(p -> p.getId().equals(id));
        if (removed) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}

class Pet {
    private Long id;
    private String name;
    private String type;
    private int age;

    // Constructor, getters, and setters omitted for brevity
}
