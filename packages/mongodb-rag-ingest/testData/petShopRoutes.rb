require 'sinatra'
require 'json'

# In-memory store for pets
pets = [
  { id: 1, name: 'Rex', type: 'Dog', age: 5 },
  { id: 2, name: 'Mittens', type: 'Cat', age: 3 }
]

# Helper to find a pet by ID
def find_pet(id, pets)
  pets.find { |pet| pet[:id] == id.to_i }
end

# List all pets
get '/pets' do
  content_type :json
  pets.to_json
end

# Get a single pet by ID
get '/pets/:id' do
  content_type :json
  pet = find_pet(params[:id], pets)
  halt 404, { error: 'Pet not found' }.to_json unless pet
  pet.to_json
end

# Create a new pet
post '/pets' do
  content_type :json
  new_pet = JSON.parse(request.body.read, symbolize_names: true)
  new_pet[:id] = pets.last[:id] + 1
  pets << new_pet
  new_pet.to_json
end

# Update a pet by ID
put '/pets/:id' do
  content_type :json
  pet = find_pet(params[:id], pets)
  halt 404, { error: 'Pet not found' }.to_json unless pet

  update_data = JSON.parse(request.body.read, symbolize_names: true)
  pet.merge!(update_data)
  pet.to_json
end

# Delete a pet by ID
delete '/pets/:id' do
  content_type :json
  pet = find_pet(params[:id], pets)
  halt 404, { error: 'Pet not found' }.to_json unless pet

  pets.delete(pet)
  { success: true }.to_json
end

# Start the server
run! if app_file == $0
