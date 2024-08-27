from flask import Flask, jsonify, request, abort

app = Flask(__name__)

pets = [
    {'id': 1, 'name': 'Rex', 'type': 'Dog', 'age': 5},
    {'id': 2, 'name': 'Mittens', 'type': 'Cat', 'age': 3}
]

@app.route('/pets', methods=['GET'])
def get_pets():
    return jsonify(pets)

@app.route('/pets/<int:pet_id>', methods=['GET'])
def get_pet(pet_id):
    pet = next((pet for pet in pets if pet['id'] == pet_id), None)
    if pet is None:
        abort(404)
    return jsonify(pet)

@app.route('/pets', methods=['POST'])
def create_pet():
    if not request.json or not 'name' in request.json:
        abort(400)
    pet = {
        'id': pets[-1]['id'] + 1 if pets else 1,
        'name': request.json['name'],
        'type': request.json.get('type', ""),
        'age': request.json.get('age', 0)
    }
    pets.append(pet)
    return jsonify(pet), 201

@app.route('/pets/<int:pet_id>', methods=['PUT'])
def update_pet(pet_id):
    pet = next((pet for pet in pets if pet['id'] == pet_id), None)
    if pet is None:
        abort(404)
    if not request.json:
        abort(400)
    pet['name'] = request.json.get('name', pet['name'])
    pet['type'] = request.json.get('type', pet['type'])
    pet['age'] = request.json.get('age', pet['age'])
    return jsonify(pet)

@app.route('/pets/<int:pet_id>', methods=['DELETE'])
def delete_pet(pet_id):
    global pets
    pet = next((pet for pet in pets if pet['id'] == pet_id), None)
    if pet is None:
        abort(404)
    pets = [pet for pet in pets if pet['id'] != pet_id]
    return jsonify({'result': True})

if __name__ == '__main__':
    app.run(debug=True)
