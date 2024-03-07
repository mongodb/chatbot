import Vapor

struct Pet: Content {
    var id: Int
    var name: String
    var type: String
    var age: Int
}

// Initialize with some pets
var pets = [
    Pet(id: 1, name: "Rex", type: "Dog", age: 5),
    Pet(id: 2, name: "Mittens", type: "Cat", age: 3)
]

func routes(_ app: Application) throws {

    app.get("pets") { req -> [Pet] in
        return pets
    }

    app.get("pets", ":petId") { req -> Pet in
        guard let petId = req.parameters.get("petId", as: Int.self),
              let pet = pets.first(where: { $0.id == petId }) else {
            throw Abort(.notFound)
        }
        return pet
    }

    app.post("pets") { req -> Pet in
        let pet = try req.content.decode(Pet.self)
        pets.append(pet)
        return pet
    }

    app.put("pets", ":petId") { req -> Pet in
        let updatedPet = try req.content.decode(Pet.self)
        guard let index = pets.firstIndex(where: { $0.id == updatedPet.id }) else {
            throw Abort(.notFound)
        }
        pets[index] = updatedPet
        return updatedPet
    }

    app.delete("pets", ":petId") { req -> HTTPStatus in
        guard let petId = req.parameters.get("petId", as: Int.self),
              let index = pets.firstIndex(where: { $0.id == petId }) else {
            throw Abort(.notFound)
        }
        pets.remove(at: index)
        return .noContent
    }
}
