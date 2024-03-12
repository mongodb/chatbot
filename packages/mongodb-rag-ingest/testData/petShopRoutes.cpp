#include <cpprest/http_listener.h>
#include <cpprest/json.h>
#include <mutex>
#include <vector>

using namespace web;
using namespace web::http;
using namespace web::http::experimental::listener;

struct Pet {
  long id;
  utility::string_t name;
  utility::string_t type;
  int age;
};

std::vector<Pet> pets;
std::mutex pets_mutex;
long currentPetId = 0;

void handle_get(http_request request) {
  // Lock access to the pets vector
  std::lock_guard<std::mutex> lock(pets_mutex);

  // Create a JSON array to hold the pet data
  json::value petArray = json::value::array();
  for (size_t i = 0; i < pets.size(); ++i) {
    json::value petObj;
    petObj[U("id")] = json::value::number(pets[i].id);
    petObj[U("name")] = json::value::string(pets[i].name);
    petObj[U("type")] = json::value::string(pets[i].type);
    petObj[U("age")] = json::value::number(pets[i].age);
    petArray[i] = petObj;
  }

  // Respond with the JSON array of pets
  request.reply(status_codes::OK, petArray);
}

void handle_post(http_request request) {
  // Lock access to the pets vector
  std::lock_guard<std::mutex> lock(pets_mutex);

  // Parse the incoming request body as JSON
  request.extract_json()
      .then([](json::value requestObj) {
        Pet newPet;
        newPet.id = ++currentPetId;
        newPet.name = requestObj[U("name")].as_string();
        newPet.type = requestObj[U("type")].as_string();
        newPet.age = requestObj[U("age")].as_integer();

        pets.push_back(newPet);

        json::value responseObj;
        responseObj[U("id")] = json::value::number(newPet.id);
        responseObj[U("name")] = json::value::string(newPet.name);
        responseObj[U("type")] = json::value::string(newPet.type);
        responseObj[U("age")] = json::value::number(newPet.age);

        return responseObj;
      })
      .then([&request](json::value responseObj) {
        request.reply(status_codes::Created, responseObj);
      })
      .wait();
}

int main() {
  uri_builder uri(U("http://localhost:3000"));
  auto addr = uri.to_uri().to_string();
  http_listener listener(addr);

  listener.support(methods::GET, handle_get);
  listener.support(methods::POST, handle_post);

  try {
    listener.open()
        .then([&listener]() {
          std::wcout << U("Starting to listen at ")
                     << listener.uri().to_string() << std::endl;
        })
        .wait();

    std::string line;
    std::getline(std::cin, line);
  } catch (const std::exception &e) {
    std::wcerr << U("An error occurred: ") << e.what() << std::endl;
  }

  return 0;
}
