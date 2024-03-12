use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use std::collections::HashMap;

#[derive(Serialize, Deserialize)]
struct Pet {
    id: u32,
    name: String,
    type_: String,
    age: u32,
}

// Use Mutex to safely share state across threads.
struct AppState {
    pets: Mutex<HashMap<u32, Pet>>,
}

async fn get_pets(data: web::Data<AppState>) -> impl Responder {
    let pets = data.pets.lock().unwrap();
    let pets: Vec<&Pet> = pets.values().collect();
    HttpResponse::Ok().json(pets)
}

async fn get_pet(path: web::Path<(u32,)>, data: web::Data<AppState>) -> impl Responder {
    let pets = data.pets.lock().unwrap();
    if let Some(pet) = pets.get(&path.0) {
        HttpResponse::Ok().json(pet)
    } else {
        HttpResponse::NotFound().body("Pet not found")
    }
}

async fn add_pet(pet: web::Json<Pet>, data: web::Data<AppState>) -> impl Responder {
    let mut pets = data.pets.lock().unwrap();
    pets.insert(pet.id, pet.into_inner());
    HttpResponse::Created().finish()
}

async fn update_pet(path: web::Path<(u32,)>, pet: web::Json<Pet>, data: web::Data<AppState>) -> impl Responder {
    let mut pets = data.pets.lock().unwrap();
    if pets.contains_key(&path.0) {
        pets.insert(path.0, pet.into_inner());
        HttpResponse::Ok().finish()
    } else {
        HttpResponse::NotFound().body("Pet not found")
    }
}

async fn delete_pet(path: web::Path<(u32,)>, data: web::Data<AppState>) -> impl Responder {
    let mut pets = data.pets.lock().unwrap();
    if pets.remove(&path.0).is_some() {
        HttpResponse::Ok().finish()
    } else {
        HttpResponse::NotFound().body("Pet not found")
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let data = web::Data::new(AppState {
        pets: Mutex::new(HashMap::new()),
    });

    HttpServer::new(move || {
        App::new()
            .app_data(data.clone())
            .route("/pets", web::get().to(get_pets))
            .route("/pets/{id}", web::get().to(get_pet))
            .route("/pets", web::post().to(add_pet))
            .route("/pets/{id}", web::put().to(update_pet))
            .route("/pets/{id}", web::delete().to(delete_pet))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
