import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.model._
import akka.http.scaladsl.server.Directives._
import akka.stream.ActorMaterializer
import spray.json.DefaultJsonProtocol._
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport._

import scala.io.StdIn

// Define the Pet case class and its JSON format
case class Pet(id: Int, name: String, petType: String, age: Int)

object PetShopServer extends App {
  implicit val system = ActorSystem("petShopSystem")
  implicit val materializer = ActorMaterializer()
  implicit val executionContext = system.dispatcher

  // Spray JSON support
  implicit val petFormat = jsonFormat4(Pet)

  var pets = Vector.empty[Pet]

  val route =
    pathPrefix("pets") {
      concat(
        get {
          path(IntNumber) { id =>
            complete(pets.find(_.id == id))
          } ~
          pathEndOrSingleSlash {
            complete(pets)
          }
        },
        post {
          entity(as[Pet]) { pet =>
            pets = pets :+ pet
            complete(StatusCodes.Created, pet)
          }
        },
        put {
          entity(as[Pet]) { pet =>
            pets = pets.filterNot(_.id == pet.id) :+ pet
            complete(StatusCodes.OK, pet)
          }
        },
        delete {
          path(IntNumber) { id =>
            pets = pets.filterNot(_.id == id)
            complete(StatusCodes.OK)
          }
        }
      )
    }

  val bindingFuture = Http().bindAndHandle(route, "localhost", 8080)
  println(s"Server online at http://localhost:8080/\nPress RETURN to stop...")
  StdIn.readLine() // let it run until user presses return
  bindingFuture
    .flatMap(_.unbind()) // trigger unbinding from the port
    .onComplete(_ => system.terminate()) // and shutdown when done
}
