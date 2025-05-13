<guide>
<guide_topic>MongoDB Atlas - Creating and Managing Clusters</guide_topic>

<section>
<title>Get Started with Atlas</title>
<url>https://mongodb.com/docs/atlas/getting-started/</url>
<description>How to create an Atlas cluster, connect to it, and load sample data using the Atlas CLI or user interface.</description>


# Get Started with Atlas

## Atlas CLI
```sh
atlas setup [options]   # creates account/org/project, free M0 cluster, DB user, IP access list, loads sample data, prints connection string
```
See CLI docs for flags.

## Atlas UI
1. Register account.  
2. Deploy Free (M0) cluster.  
3. Add MongoDB DB users.  
4. Configure IP access list (allowed IP/CIDR).  
5. Connect via mongosh, drivers, or Compass.  
6. Insert documents.  
7. Load sample or generate synthetic data.

## Go Further
Enable Atlas Search for full-text queries.

</section>
<section>
<title>Create an Atlas Account</title>
<url>https://mongodb.com/docs/atlas/tutorial/create-atlas-account/</url>
<description>How to get started with MongoDB Atlas by setting up a new account, organization, and project.</description>


# Atlas Account Creation & Login

## Options & Limits
- Choose **one** auth source: Email, GitHub, or Google.  
- Federated SSO → must use company email.  
- Cloud Manager users may reuse Cloud Manager creds.

### GitHub / Google
• Provider controls profile, password, 2-FA; Atlas MFA disabled.  
• You can unlink in Atlas.  
GitHub requires a public email or registration fails.

## Firewall Prereq
Allow CDN host: `https://assets.mongodb-cdn.com/`

## GitHub Public Email Quick-Fix
1 Profile → Settings → Public Profile.  
2 Pick email in **Public email** (unlink “Keep my email addresses private” if needed).  
3 Update profile.

## Register

### CLI
```sh
atlas auth register [options]   # or: atlas setup
```

### UI
Email: enter Email, First, Last, Password (≥8 chars, not email/user, new vs last 24/common), accept Terms, captcha → Sign up.  
GitHub / Google: click provider, sign in, accept Terms → Submit.

## Login

### CLI
```sh
atlas auth login [options]
```

### UI
Email: enter email → Next → password.  
GitHub / Google: click provider → sign in.

## Org & Project
Atlas auto-creates one org & project; you may add more. Use org for global controls, project for env-specific users/roles. Deploy clusters inside a project.

## Next
Open project → deploy free cluster.

</section>
<section>
<title>Deploy a Free Cluster</title>
<url>https://mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/</url>
<description>How to deploy a free tier cluster in MongoDB Atlas using the Atlas CLI, Admin API, or Atlas user interface.</description>


# Deploy a Free Cluster (M0)

• 1 Free M0 cluster per Atlas project; limited features.  
• Provision via CLI, Admin API, or UI.

## Atlas CLI
```sh
atlas setup [options]   # creates M0, loads sample data, adds caller IP, creates DB user
```

## Atlas Administration API
POST `/groups/{GROUP-ID}/clusters`
```json
{
  "name": "<clusterName>",
  "providerSettings": { "providerName": "AWS|GCP|AZURE", "regionName": "<region>" },
  "clusterType": "REPLICASET",
  "providerBackupEnabled": false,
  "instanceSize": "M0"
}
```

## Atlas UI
1. Log in → select Org/Project → Overview → Create.  
2. Choose Cluster Tier: **M0** (Free).  
3. Select Provider (AWS/GCP/Azure) & supported Region.  
4. Name ≤ 64 chars, ASCII/num/- (immutable).  
5. Create → wait ≤ 10 min.  
6. Security Quickstart:  
   • Create DB user (username/password).  
   • Add IP Access List → Add My Current IP Address.  

Next: Manage database users.

</section>
<section>
<title>Manage the Database Users for Your Cluster</title>
<url>https://mongodb.com/docs/atlas/tutorial/create-mongodb-user-for-cluster/</url>
<description>Create a database user to access your Atlas cluster, requiring authentication for security purposes.</description>


# Manage Database Users

- Atlas clusters require MongoDB database users (distinct from Atlas console users) for client auth.
- Creation/edit requires `Organization Owner` or `Project Owner`.
- One user created during first-cluster wizard; add/edit via “Configure Database Users”.
- Next: set IP Access List.

</section>
<section>
<title>Manage the IP Access List</title>
<url>https://mongodb.com/docs/atlas/security/add-ip-address-to-list/</url>
<description>Add trusted IP addresses to the Atlas IP access list to securely connect to your cluster.</description>


# Manage IP Access List

- Atlas clusters allow traffic only from whitelisted IPs.  
- Role needed: `Project Owner`.  
- First IP added during cluster creation.  
- Add/edit via “Configure IP Access List Entries” (UI or API).  
- After adding, connect to cluster.

</section>
<section>
<title>Connect to Your Cluster</title>
<url>https://mongodb.com/docs/atlas/tutorial/connect-to-your-cluster/</url>
<description>How to connect to your Atlas cluster using mongosh, Compass, or a driver.</description>


# Connect to Your Atlas Cluster

Prerequisites  
• Atlas project with running cluster  
• Your IP in the Access List  
• DB user credentials  

## Get Connection String  
Atlas Console → Clusters → Connect → choose Security (Standard / Peering / Private Endpoint) → Drivers/Shell/Compass → copy URI  
Replace `<db_username>`, `<db_password>`; URI-escape special chars.

## mongo Shell (`mongosh`)
Install:  
Windows / Linux: download archive or `.deb`/`.rpm`; add binary to `PATH`.  
macOS: `brew install mongosh`  
Verify: `mongosh --version`  
Connect:  
```sh
mongosh "mongodb+srv://<user>:<pw>@<cluster>.mongodb.net/?retryWrites=true&w=majority"
```

## MongoDB Compass
Download installer for OS → open Compass → New Connection → paste URI (or fill fields for SSL/X.509/SSH/multi-cloud) → Connect.

## Language Drivers

Installation | Minimal “ping” sample (update URI)
------------ | ----------------------------------
C# (.NET)  
`dotnet add package MongoDB.Driver` | ```csharp
var client=new MongoClient("<URI>");
client.GetDatabase("admin").RunCommand<BsonDocument>(new BsonDocument("ping",1));
```  
Go  
```sh
go get go.mongodb.org/mongo-driver/v2/mongo
``` | ```go
client,_:=mongo.Connect(options.Client().ApplyURI("<URI>"))
client.Ping(context.TODO(), readpref.Primary())
```  
Java (Sync) – add driver via Maven/Gradle | ```java
try(MongoClient c=MongoClients.create("<URI>")){
 c.getDatabase("admin").runCommand(new BsonDocument("ping",new BsonInt64(1)));
}
```  
Node.js  
`npm install mongodb` | ```js
const {MongoClient}=require("mongodb");
const client=new MongoClient("<URI>");
await client.connect();
```  
Python  
`python -m pip install "pymongo[snappy,gssapi,srv,tls]"` | ```python
from pymongo import MongoClient
client=MongoClient("<URI>")
```

Troubleshooting: ensure IP allow-listed, correct password, `AVAILABLE` peering/private-link status, add `readPreference` (primaryPreferred/secondary/secondaryPreferred) for multi-cloud.

Next: insert & query data.

</section>
<section>
<title>Insert and View a Document</title>
<url>https://mongodb.com/docs/atlas/tutorial/insert-data-into-your-cluster/</url>

# Insert and View a Document

Prereqs: database user, valid `<connection-string>`. All examples use db `gettingStarted`, collection `people`.

---

## Atlas UI  
1 Clusters → Browse Collections → **+Create Database** (`gettingStarted`, `people`).  
2 Insert two docs (Alan Turing, Grace Hopper; see JSON below).  
3 Filter `{ "name.last":"Turing" }` → Apply.

```json
{ "name":{ "first":"Alan","last":"Turing"},
  "birth":{"$date":"1912-06-23"},
  "death":{"$date":"1954-06-07"},
  "contribs":["Turing machine","Turing test","Turingery"],
  "views":1250000 }
```

---

## mongosh
```shell
use gettingStarted
db.people.insertMany([
 {name:{first:'Alan',last:'Turing'},birth:new Date('1912-06-23'),
  death:new Date('1954-06-07'),contribs:['Turing machine','Turing test','Turingery'],views:1250000},
 {name:{first:'Grace',last:'Hopper'},birth:new Date('1906-12-09'),
  death:new Date('1992-01-01'),contribs:['Mark I','UNIVAC','COBOL'],views:3860000}
])
db.people.find({"name.last":"Turing"})
```

---

## Compass  
Create DB/collection, insert two docs, Filter `{ "name.last":"Turing" }`.

---

## Driver Samples  
Replace `<connection-string>`; insert 2 docs then query `name.last=="Turing"`.

### C#
```csharp
var col = new MongoClient("<connection-string>")
            .GetDatabase("gettingStarted")
            .GetCollection<Person>("people");
await col.InsertManyAsync(new[]{new Person{...Alan...},new Person{...Grace...}});
var doc = await col.Find(p=>p.Name.Last=="Turing").FirstAsync();
Console.WriteLine(doc);
```

### Go
```go
client,_ := mongo.Connect(ctx,options.Client().ApplyURI("<connection-string>"))
col := client.Database("gettingStarted").Collection("people")
col.InsertMany(ctx, []interface{}{Alan, Grace})
var res Person
col.FindOne(ctx,bson.D{{"name.last","Turing"}}).Decode(&res)
fmt.Println(res)
```

### Java
```java
try(MongoClient mc=MongoClients.create("<connection-string>")) {
  MongoCollection<Document> c=mc.getDatabase("gettingStarted").getCollection("people");
  c.insertMany(Arrays.asList(Alan,Grace));
  System.out.println(c.find(eq("name.last","Turing")).first());
}
```

### Node.js
```javascript
const col = new MongoClient("<connection-string>").db("gettingStarted").collection("people");
await col.insertMany([Alan,Grace]);
console.log(await col.findOne({"name.last":"Turing"}));
```

### Python
```python
col = MongoClient("<connection-string>")['gettingStarted']['people']
col.insert_many([Alan_doc, Grace_doc])
print(col.find_one({"name.last":"Turing"}))
```

Doc variables follow the JSON shown in Atlas UI example (change names/dates as needed).

---

Next: scale cluster, load sample or synthetic data as required.

</section>
<section>
<title>Load Data into Atlas</title>
<url>https://mongodb.com/docs/atlas/sample-data/</url>
<description>How to load sample datasets into your Atlas cluster.</description>


# Load Data into Atlas

## Access & Prereqs
- Role: `Project Owner` (Org Owner must add self to project).
- Cluster required (any type).

## CLI

```sh
# load samples
atlas clusters sampleData load <clusterName> [options]

# job status
atlas clusters sampleData describe <jobId> [options]
atlas clusters sampleData watch    <jobId> [options]
```
(See Atlas CLI docs; install & auth first.)

## Atlas UI

### Clusters View
1. Clusters → … (cluster) → **Load Sample Dataset**.  
2. Select datasets (or **Select All**) → **Load sample data**.  
3. Browse Collections → data visible.  
Optional query (restaurants in Queens):
```json
{ "borough": "Queens" }
```

### Collections View  
(Data Explorer enabled & collection empty)
1. Browse Collections → **Load a Sample Dataset**.  
2. Choose datasets → **Load sample data**.

## Available Sample Datasets
- Sample AirBnB Listings – lodging listings  
- Sample Analytics – mock financial services data  
- Sample Geospatial – shipwrecks  
- Sample Guides – planets  
- Sample Mflix – movies (includes vector embeddings)  
- Sample Restaurants – restaurant inspections  
- Sample Supply Store – office-supply orders  
- Sample Training – MongoDB training data  
- Sample Weather – weather reports  

## Namespaces Created (db.collection)
sample_airbnb.listingsAndReviews  
sample_analytics.{accounts,customers,transactions}  
sample_geospatial.shipwrecks  
sample_guides.planets  
sample_mflix.{comments,embedded_movies,movies,theaters,users}  
sample_supplies.sales  
sample_training.{companies,grades,inspections,posts,routes,trips,zips}  
sample_weatherdata.data  

(Load fails if any above already exist.)

## Tutorials & Courses
- “Get Started with Atlas” tutorial uses these datasets.  
- MongoDB Charts examples: Supply Store, Mflix (UI: **Visualize Your Data**).  

Further: Generate Synthetic Data, Import/Migrate Data for custom datasets.

</section>
<section>
<title>Sample AirBnB Listings Dataset</title>
<url>https://mongodb.com/docs/atlas/sample-data/sample-airbnb/</url>
<description>Explore the `sample_airbnb` database containing vacation home listings and reviews, with details on collection indexes and sample documents.</description>


# Sample AirBnB Listings Dataset

`sample_airbnb` → collection `listingsAndReviews` (randomized subset of Inside AirBnB).

## Indexes

| name | key | notes |
|---|---|---|
| `_id_` | `{ _id: 1 }` | PK |
| `property_type_1_room_type_1_beds_1` | `{ property_type:1, room_type:1, beds:1 }` | compound |
| `name_1` | `{ name:1 }` | listing name |
| `address.location_2dsphere` | `{ "address.location":"2dsphere" }` | sparse geospatial |

## Document Skeleton

```json
{
  "_id": "10006546",
  "listing_url": "...",
  "name": "Ribeira Charming Duplex",
  "summary": "...",
  "property_type": "House",
  "room_type": "Entire home/apt",
  "bed_type": "Real Bed",
  "minimum_nights": "2",
  "maximum_nights": "30",
  "cancellation_policy": "moderate",
  "accommodates": 8,
  "bedrooms": 3,
  "beds": 5,
  "number_of_reviews": 51,
  "bathrooms": 1.0,
  "amenities": ["TV","Wifi",...],
  "price": 80.00,
  "security_deposit": 200.00,
  "cleaning_fee": 35.00,
  "extra_people": 15.00,
  "guests_included": 6,
  "images": { "picture_url": "..." },
  "host": {
    "host_id": "51399391",
    "host_name": "Ana&Gonçalo",
    "host_location": "Porto, Portugal",
    "host_response_time": "within an hour",
    "host_response_rate": 100,
    "host_is_superhost": false,
    "host_listings_count": 3
  },
  "address": {
    "street": "Porto, Porto, Portugal",
    "market": "Porto",
    "country": "Portugal",
    "country_code": "PT",
    "location": {
      "type": "Point",
      "coordinates": [-8.61308, 41.1413],
      "is_location_exact": false
    }
  },
  "availability": {
    "availability_30": 28,
    "availability_60": 47,
    "availability_90": 74,
    "availability_365": 239
  },
  "review_scores": {
    "review_scores_accuracy": 9,
    "review_scores_cleanliness": 9,
    "review_scores_checkin": 10,
    "review_scores_communication": 10,
    "review_scores_location": 10,
    "review_scores_value": 9,
    "review_scores_rating": 89
  },
  "reviews": [
    {
      "_id": "362865132",
      "date": 1545886800000,
      "reviewer_id": "208880077",
      "reviewer_name": "Thomas",
      "comments": "Very helpful hosts..."
    },
    { "_id": "364728730", "date": 1546232400000, "reviewer_name": "Mr", "comments": "Ana & Goncalo were great..." },
    { "_id": "403055315", "date": 1547960400000, "reviewer_name": "Milo", "comments": "The house was extremely well located..." }
  ]
}
```

</section>
<section>
<title>Sample Analytics Dataset</title>
<url>https://mongodb.com/docs/atlas/sample-data/sample-analytics/</url>
<description>Explore the `sample_analytics` database with collections for customers, accounts, and transactions used in MongoDB data analysis training.</description>


# sample_analytics Dataset

Three collections for financial-services demos.

## Collections

| name | purpose | key indexes |
|------|---------|-------------|
| accounts | account limits & purchased products | `{_id:1}` |
| customers | personal data, linked `accounts` + `tier_and_details` | `{_id:1}` |
| transactions | batched transactions per `account_id` | `{_id:1}` |

## Sample Docs

```jsonc
// accounts
{ "account_id":470650, "limit":10000,
  "products":["CurrencyService","Commodity","InvestmentStock"] }

// customers
{ "username":"lejoshua", "name":"Michael Johnson",
  "address":"15989 Edward Inlet\nLake Maryton, NC 39545",
  "birthdate":{"$date":54439275000},
  "email":"courtneypaul@example.com",
  "accounts":[470650,443178],
  "tier_and_details":{
    "b5f19cb532fa436a9be2cf1d7d1cac8a":{
      "tier":"Silver",
      "benefits":["dedicated account representative"],
      "active":true } } }

// transactions
{ "account_id":794875, "transaction_count":6,
  "bucket_start_date":{"$date":693792000000},
  "bucket_end_date":{"$date":1473120000000},
  "transactions":[
    {"date":{"$date":1325030400000},"amount":1197,"transaction_code":"buy","symbol":"nvda","price":"12.7330024299","total":"15241.4039"},
    {"date":{"$date":1465776000000},"amount":8797,"transaction_code":"buy","symbol":"nvda","price":"46.5387317240","total":"409401.2229"},
    {"date":{"$date":1472601600000},"amount":6146,"transaction_code":"sell","symbol":"ebay","price":"32.1160088485","total":"197384.9903"},
    {"date":{"$date":1101081600000},"amount":253,"transaction_code":"buy","symbol":"amzn","price":"37.7744122616","total":"9556.9263"},
    {"date":{"$date":1022112000000},"amount":4521,"transaction_code":"buy","symbol":"nvda","price":"10.7630697581","total":"48659.8383"},
    {"date":{"$date":936144000000},"amount":955,"transaction_code":"buy","symbol":"csco","price":"27.9921365352","total":"26732.4903"} ] }
```

</section>
<section>
<title>Sample Geospatial Dataset</title>
<url>https://mongodb.com/docs/atlas/sample-data/sample-geospatial/</url>
<description>Explore the `sample_geospatial` database with GeoJSON data, featuring the `shipwrecks` collection and geospatial indexes.</description>


# sample_geospatial Dataset

Collection `shipwrecks`: shipwreck docs with GeoJSON `coordinates`.

Indexes  
- `_id_` `{_id:1}`  
- `coordinates_2dsphere` `{"coordinates":"2dsphere"}` (sparse)

Example doc:  
```json
{ "_id": ObjectId(...),
  "feature_type":"Wrecks - Submerged, dangerous",
  "latdec":9.3560572, "londec":-79.9074173,
  "quasou":"depth unknown",
  "watlev":"always under water/submerged",
  "coordinates":[-79.9074173,9.3560572] }
```

</section>
<section>
<title>Sample Guides Dataset</title>
<url>https://mongodb.com/docs/atlas/sample-data/sample-guides/</url>
<description>Explore the `sample_guides` database in Atlas, featuring the `planets` collection with data on Solar System planets.</description>


# sample_guides DB

- One collection: `planets`.
- Fields: `name`, `orderFromSun`, `hasRings`, `mainAtmosphere` (array), `surfaceTemperatureC` {min,max,mean}.
- Indexes: `_id_` `{_id:1}` (PK).
- Sample:
```json
{
 _id:ObjectId("…"),
 name:"Uranus",
 orderFromSun:7,
 hasRings:true,
 mainAtmosphere:["H2","He","CH4"],
 surfaceTemperatureC:{min:null,max:null,mean:-197.2}
}
```

</section>
<section>
<title>Sample Mflix Dataset</title>
<url>https://mongodb.com/docs/atlas/sample-data/sample-mflix/</url>
<description>Explore the `sample_mflix` database, which includes collections on movies, theaters, users, and comments, with details on indexes and sample documents.</description>


# sample_mflix Dataset

Movie-themed sample DB. Collections, key fields, and index specs:

## Collections
- comments – movie comments.
- embedded_movies – subset of Western/Action/Fantasy movies incl. OpenAI `plot_embedding` array for Atlas Vector Search.
- movies – all movies, reviews, etc.
- sessions – user JWT metadata.
- theaters – theater locations.
- users – user accounts.

## Indexes & Key Fields
### comments
- `_id_` `{_id:1}`.

Fields: `name,email,movie_id,text,date`.

### embedded_movies
- `_id_` `{_id:1}`.

Fields: movie metadata + `plot_embedding` [1536-D float[]].

### movies
- `_id_` `{_id:1}`
- `cast_text_fullplot_text_genres_text_title_text` `{_fts:"text",_ftsx:1}`  (text index over `cast, fullplot, genres, title`, sparse).

Key fields: `title,year,runtime,released,plot,fullplot,cast,directors,genres,imdb,rating,votes,tomatoes,num_mflix_comments`.

### sessions
- `_id_` `{_id:1}`
- `user_id_1` `{user_id:1}` unique.

Fields: `user_id,jwt`.

### theaters
- `_id_` `{_id:1}`
- `geo index` `{"location.geo":"2dsphere"}` sparse.

Fields: `theaterId, location.address{street1,city,state,zipcode}, location.geo{type:"Point",coordinates[lon,lat]}`.

### users
- `_id_` `{_id:1}`
- `email_1` `{email:1}` unique.

Fields: `name,email,password`.

</section>
<section>
<title>Sample Restaurants Dataset</title>
<url>https://mongodb.com/docs/atlas/sample-data/sample-restaurants/</url>
<description>Explore the `sample_restaurants` database with collections for restaurant details and New York City neighborhoods, featuring GeoJSON data for spatial queries.</description>


# Sample Restaurants Dataset

Two collections exposing GeoJSON:

## Collections
- restaurants – restaurant details  
- neighborhoods – NYC neighborhood polygons  

### restaurants
Fields: address{building, coord[lng,lat], street, zipcode}, borough, cuisine, grades[{date, grade, score}], name, restaurant_id.  
Index: `_id_ : {_id:1}`.  

`json`
```json
{
 "address":{"building":"8825","coord":[-73.8803827,40.7643124]},
 "borough":"Queens","cuisine":"American",
 "grades":[{"date":{"$date":"2014-11-15T00:00:00Z"},"grade":"Z","score":38}],
 "name":"Brunos On The Boulevard","restaurant_id":"40356151"
}
```

### neighborhoods
Fields: name, geometry{coordinates:[[lng,lat]...]}. Typical for `$geoWithin`.  
Index: `_id_ : {_id:1}`.  

`json`
```json
{
 "geometry":{"coordinates":[[[-73.94,40.70],[-73.94,40.69],...]]},
 "name":"Bedford"
}
```

</section>
<section>
<title>Sample Supply Store Dataset</title>
<url>https://mongodb.com/docs/atlas/sample-data/sample-supplies/</url>
<description>Explore the `sample_supplies` database, which includes sales data from a mock office supply company with customer and store information.</description>


# Sample Supply Store Dataset

Database: `sample_supplies`  
Collection: `sales`

Contents: one document per sale. Main fields  
- `saleDate` (ISO date)  
- `items` [ { `name`, `tags`[], `price` (Decimal128), `quantity` } ]  
- `storeLocation` (city)  
- `customer` { `gender`, `age`, `email`, `satisfaction` }  
- `couponUsed` (bool)  
- `purchaseMethod` ("Online", "In store", "Phone")

Index  
```json
{ "_id": 1 }   // primary key
```

Example  
```json
{
  "saleDate": ISODate("2015-03-23T01:26:49Z"),
  "items":[{"name":"notepad","price":35.29,"quantity":2},…],
  "storeLocation":"Denver",
  "customer":{ "gender":"M","age":42,"email":"cauho@witwuta.sv","satisfaction":4 },
  "couponUsed":true,
  "purchaseMethod":"Online"
}
```

</section>
<section>
<title>Sample Training Dataset</title>
<url>https://mongodb.com/docs/atlas/sample-data/sample-training/</url>
<description>Explore the `sample_training` database containing collections with realistic data for MongoDB training, including companies, grades, inspections, and more.</description>


# sample_training Dataset

Atlas provides `sample_training` for labs. Collections & key info:

| collection | source / purpose | notable fields |
|------------|-----------------|----------------|
| companies | Crunchbase firms | name, category_code, founded\_{day,month,year}, homepage_url, funding_rounds[], offices[], relationships[] |
| grades | synthetic student scores | class_id, student_id, scores[{type, score}] |
| inspections | NYC OpenData business inspections | business_name, sector, address{city,street,zip}, result, date, certificate_number |
| posts | random US-Senate-seeded blog posts | author, title, body, tags[], comments[{author,body,email}], date |
| routes | Open Flights routes | airline{subdocument: id,name,iata,alias}, src_airport, dst_airport, airplane, codeshare, stops |
| trips | CitiBike trips | bikeid, start/stop time, start/end station {id,name,location(Point)}, usertype, gender, birth year |
| zips | US ZIP info | zip, city, state, loc{x,y}, pop |

All collections only contain MongoDB default `_id_` index.

Minimal document shapes:

```jsonc
// companies
{ _id: ObjectId(), name: "", category_code: "", founded_year: 2004, offices:[{city:"", country_code:""}], relationships:[{person:{first_name:""}, title:""}] }

// grades
{ _id:ObjectId(), class_id:173, student_id:4, scores:[{type:"exam",score:19.8}] }

// inspections
{ _id:ObjectId(), business_name:"", sector:"", address:{city:"",street:"",zip:0}, result:"Fail", date:"Mar 3 2015" }

// posts
{ _id:ObjectId(), author:"", title:"", body:"", tags:["math"], comments:[{author:"",body:"",email:""}], date:ISODate() }

// routes
{ _id:ObjectId(), airline:{id:1654,name:"Cargoitalia",iata:"CRG",alias:"2G"}, src_airport:"BTK", dst_airport:"OVB", airplane:"A81", stops:0 }

// trips
{ _id:ObjectId(), bikeid:14785, start_time:ISODate(), stop_time:ISODate(), start_station:{id:518,name:"…", location:{type:"Point",coordinates:[-73,40]}}, end_station:{id:433,name:"…", location:{type:"Point",coordinates:[-73,40]}}, tripduration:812, usertype:"Subscriber", gender:1, birth_year:1977 }

// zips
{ _id:ObjectId(), zip:"35049", city:"CLEVELAND", state:"AL", loc:{x:86.559355, y:33.992106}, pop:2369 }
```

Use this dataset to practice aggregations (e.g., `$graphLookup` on `routes` & `trips`), geospatial queries (`trips`, `zips`), and indexing labs.

</section>
<section>
<title>Sample Weather Dataset</title>
<url>https://mongodb.com/docs/atlas/sample-data/sample-weather/</url>
<description>Explore the `sample_weatherdata` database containing detailed weather reports with GeoJSON locations and various readings like air temperature and wind.</description>


# Sample Weather Dataset

DB: `sample_weatherdata`  
Collection: `data` (weather reports; GeoJSON location).  

Index: `{ _id: 1 }` (primary).  

Typical document:  
```jsonc
{
 _id: ObjectId,
 st: String,
 ts: Date,
 position: { type: "Point", coordinates: [lon, lat] },
 elevation: Int,
 callLetters: String,
 qualityControlProcess: String,
 dataSource: String,
 type: String,
 airTemperature: { value: Double, quality: String },
 dewPoint:     { value: Double, quality: String },
 pressure:     { value: Double, quality: String },
 wind: {
   direction: { angle: Int, quality: String },
   type: String,
   speed: { rate: Double, quality: String }
 },
 visibility: {
   distance:    { value: Int, quality: String },
   variability: { value: String, quality: String }
 },
 skyCondition: {
   ceilingHeight: { value: Int, quality: String, determination: String },
   cavok: String
 },
 sections: [String],
 precipitationEstimatedObservation: {
   discrepancy: String,
   estimatedWaterDepth: Int
 },
 atmosphericPressureChange: {
   tendency:        { code: String, quality: String },
   quantity3Hours:  { value: Double, quality: String },
   quantity24Hours: { value: Double, quality: String }
 },
 seaSurfaceTemperature: { value: Double, quality: String }
}
```

</section>
<section>
<title>Cluster Types</title>
<url>https://mongodb.com/docs/atlas/create-database-deployment/</url>
<description>Explore different cluster types in Atlas, including Dedicated, Flex, and Global clusters, to suit various deployment needs.</description>


# Cluster Types

## Dedicated
Production-grade. Choose tier, sharding, multi-region/cloud, on-demand or auto-scaling. All Atlas features & APIs supported. Billed by tier + config.

## Flex (replaces M2/M5 & Serverless)
Low-cost dev/test. Auto-scales. Limited regions & features (see below).  
Deprecation timeline  
• Feb 2025: creation of M2/M5 & Serverless blocked.  
• Apr 2 2025: existing M2/M5 auto-migrate to Flex.  
• May 5 2025: Serverless auto-migrates to Free, Flex, or Dedicated (see UI).

## Global Cluster
M30+ sharded (or replica set scaled to M30) with Global Writes. Adds geo-aware reads/writes, multi-regional HA. Cannot disable once enabled.

## Local Deployment
Single-node replica set on workstation via Atlas CLI for feature testing.

## Feature Matrix (Dedicated = full support unless noted)

Configurations unsupported or limited on Flex  
• Rapid releases  
• Multi-region / multi-cloud  
• Sharding / Global clusters  
• Advanced enterprise security (LDAP, auditing)  
• Network peering, Private Endpoints  
• Only select AWS/GCP/Azure regions

Capabilities absent on Flex  
• Configurable backups, PIT restore  
• Detailed metrics & alerts  
• Atlas UI advisors (Find, Indexes, Schema)  
• Atlas Triggers, Search, Online Archive  
• Federated queries, BI Connector, Charts  
• API access limited (no cluster create via API/CLI/K8s/Terraform/CFN until Feb 2025)

All other listed features are available on Dedicated.

## Next Step
Create the desired cluster using Atlas UI, CLI, or Admin API.

</section>
<section>
<title>Create a Cluster</title>
<url>https://mongodb.com/docs/atlas/tutorial/create-new-cluster/</url>
<description>Create a new Atlas cluster by following steps for configuration, cloud provider selection, and deployment options.</description>


# Create a Cluster

## Tier Changes  
• Feb 2025+: only Flex, Free (M0), or Dedicated (M10+) clusters can be created.  
• `M2/M5` and Serverless creation disabled (UI, CLI, API, K8s Operator, Terraform, CloudFormation).  
• Apr 2 2025: all existing `M2/M5` ⇒ Flex.  
• May 5 2025: Serverless auto-migrated to Free, Flex, or Dedicated per usage (see All Clusters page).

## Required Role  
Organization Owner or Project Owner.

## Project-Level Limits & Rules  
• ≤25 clusters / project.  
• Multi-region node cap: for any project, sum of electable+read-only+analytics nodes **outside one region** ≤40 (Flex & Free excluded). CSRS electable nodes count.  
• Can’t add multi-region cluster if project already ≥40 such nodes. Contact support to raise limit.  
• Production: use ≥M30. Sustained load on M10/M20 may degrade.  
• Custom RBAC with newer DB actions blocks creation of older-version clusters—delete role first.  
• TLS 1.2 minimum; 1.0/1.1 rejected after Jul 31 2025.  
• First cluster in a provider/region creates a VPC/VNet container.  
• Backup Compliance Policy, if enabled, forces Cloud Backup on new clusters.

## Atlas CLI  

Install & auth, then:  
```sh
# create
atlas clusters create <name> [--projectId <id>] [opts]

# wait until ready
atlas clusters watch <name> [--projectId <id>]

# list regions you can deploy to
atlas clusters availableRegions list [opts]
```
Key options (partial):  
`--clusterType flex|replicaset|sharded`, `--tier M10…`, `--provider AWS|GCP|AZURE`, `--region <id>`, `--mdbVersion <ver>`, `--diskSizeGB <n>`, `--autoScale [disk|compute|none]`.

## Atlas UI (summary)

1. Clusters → Build a Database / Build a Cluster.  
2. Choose Template or “Advanced Configuration”.  
3. Select Cluster Type:  
   • Flex (low-cost dev),  
   • Free (M0, one per project),  
   • Dedicated (M10+; optional Global Cluster).  
4. Pick Cloud Provider & Region (or Multi-Region/Workload Isolation → set electable, read-only, analytics, search nodes).  
5. Tier & Auto-Scaling:  
   • Auto-scale Storage (on by default): ↑ at 90 % disk.  
   • Auto-scale Cluster Tier: set min/max tiers.  
6. Additional Settings (optional): MongoDB version, Cloud Backup, Termination Protection, Sharding (#shards), BI Connector, Customer Managed Keys, etc.  
7. Cluster Name rules: ≤64 chars; internal 23-char limit (no trailing ‘-’, unique per project, char 23 ≠ ‘-’). Immutable after creation.  
8. (Optional) Resource Tags—no sensitive data.  
9. Confirm & Deploy.  

Billing, payment, VAT, etc. use org-level settings (not repeated here).

## Deprecated Creation Interfaces  
All SDKs/automation tools follow same tier restrictions as UI/CLI.

</section>
<section>
<title>Create a Global Cluster</title>
<url>https://mongodb.com/docs/atlas/tutorial/create-global-cluster/</url>
<description>Learn how to enable Global Writes on an Atlas cluster, including configuring sharding and selecting cloud providers and regions.</description>


# Create a Global Cluster

## Access & Limits
- Required role: `Organization Owner` or `Project Owner`.
- Allowed only on **Dedicated (`M30+`) sharded** clusters; cannot downgrade/convert later.
- Max 9 zones (~70 shards/cluster); no sample data; review VPC Peering if first paid cluster in region(s).

## High-Level Steps
1. Atlas → Clusters → **Create** (or *Build a Database* → *advanced configuration*).
2. Choose **Dedicated** tier ≥ M30.
3. Expand **Global Cluster Configuration** → toggle **Enable Global Writes**.
4. Select **Sharding Configuration**  
   • Atlas-Managed (auto `location` shard key + zones) – default, recommended.  
   • Self-Managed – you manually zone & shard via `mongosh`/driver. (Irreversible choice.)
5. Pick **Cloud Provider/Regions**.
6. Configure **Zones** (UI tabs):
   ### Templates
   - Predefined single-region zones with latency/HA validations.  
   - Edit location-zone mapping via *Configure Location Mappings*.
   ### Single Region Zone
   - Add up to 9 zones (+ Add a Zone).  
   - For each zone: pick **Preferred Region**, choose **Shards** (default 1).  
   - Adjust location mappings if Atlas-Managed.
   ### Multi-Region Zone
   - For a zone: add electable, read-only, analytics nodes.  
   - Electable nodes: total must be 3/5/7; first row = highest-priority primary.  
   - Read-only/analytics nodes optional; add regions as needed for locality/isolation.
7. Select **Cluster Tier**, optional **Settings** (MongoDB version, backup, BI Connector, BYO-KMS, etc.).
8. **Name Cluster** (≤ 64 chars; 23-char uniqueness rule, no trailing `-` before 23rd char). Immutable.
9. **Confirm & Deploy**; max 25 clusters/project.

## Post-Deployment
- Verify/refresh connection string if zones removed (esp. non-DNS seedlist format).
- Shard collections:  
  • Atlas-Managed: shard via UI.  
  • Self-Managed: define shard keys & zones manually (`sh.enableSharding`, `sh.shardCollection`, etc.).

</section>
<section>
<title>Connect to a Cluster</title>
<url>https://mongodb.com/docs/atlas/connect-to-database-deployment/</url>
<description>How to connect to your MongoDB Atlas cluster using the Atlas CLI or user interface.</description>


# Connect to a Cluster

## Hostname Stability
Replica/shard role ↔ hostname can change after topology ops (scale, region add). Never depend on `foo123-shard-00-03-...` etc. for role identification.

## Optimized SRV (load-balanced) for Private Endpoints
Criteria to auto-generate `...-lb.` SRV record:  
• Sharded cluster on AWS, MongoDB ≥ 5.0  
• Private endpoint enabled  
• Single-region OR multi-region with *regionalized* private endpoints (one SRV per region)  
• Driver ≥ minimum, Compass, or mongosh client  
If ever used legacy SRV, Atlas shows both. Switch to optimized for fewer per-`mongos` conns. Disable via Support. Migrating to multi-region w/out regionalized endpoints → use legacy SRV.

## Prereqs
• Source IP/CIDR in Project IP Access List (or VPC/VNet peering or Private Endpoint).  
• MongoDB database user.  
• Outbound TCP 27015-27017 open from app to Atlas.  
• For LDAP over TLS, allow Atlas → LDAP host.

## Get Connection String
### Atlas CLI
```sh
atlas clusters connectionStrings describe <cluster>
```
Returns SRV, e.g. `mongodb+srv://mycluster.abcd1.mongodb.net`.  
Usage with mongosh:
```sh
mongosh "mongodb+srv://mycluster.abcd1.mongodb.net/<db>" --apiVersion 1 --username <user>
```
### Atlas UI (Clusters → Connect)
1. Choose connection type:  
   • Standard (public IP list)  
   • Private IP for Peering  
   • Private Endpoint (Optimized/Legacy SRV, select endpoint)  
2. Add client IP/CIDR if prompted.  
3. Create/choose DB user if none.  
4. Select connection method (Drivers, Compass, mongosh, VS Code, CLI tools).

## Atlas CLI Direct Connect
```sh
atlas deployments connect <deployment> [options]
```

## Troubleshooting
See “Troubleshoot Connection Issues” for drivers, Compass, mongosh, BI Connector, UI, primary failover, AWS Lambda, connection limits, VS Code.

</section>
<section>
<title>Transition from Atlas BI Connector to Atlas SQL</title>
<url>https://mongodb.com/docs/atlas/tutorial/transition-bic-to-atlas-sql/</url>
<description>Migrate from Atlas BI Connector to Atlas SQL for enhanced data analysis capabilities and cost efficiency.</description>


# Transition from Atlas BI Connector to Atlas SQL

Atlas BI Connector is deprecated; migrate to Atlas SQL.

## Atlas SQL Overview
- Read-only SQL-92 access (Tableau, Power BI, etc.) via Atlas Data Federation.
- Supports non-Atlas sources, user-defined schema, per-query billing, custom Tableau/Power BI connectors.
- Subject to all Data Federation limits.

Pricing: only Data Federation query + AWS transfer charges; Atlas SQL Interface free.

## Prerequisites
- An Atlas Federated Database Instance (FDI) with data.
- MongoDB DB user.

## Readiness Report Tool
Helps detect schema/query issues.

Download platform binary → `chmod +x <exe>` (macOS/Linux).

Optional inputs:  
1. BI Connector logs (`Download Logs → mongosql.gz → decompress`).  
2. Cluster URI (`Connect → Shell → copy mongodb+srv://...`).

Run:
```sh
<exe> -u <user> [--input <logDir>] [--uri <URI>] \
      [-o <outDir>] [--resolver cloudflare|google|quad9] \
      [--include <nsGlob>] [--exclude <nsGlob>] [--quiet]
```
`--help` shows full options.

Output: HTML index + per-namespace findings (unknown types, SQL-incompatible syntax, query volumes).

## Migration Steps
1. Enable Atlas SQL on the FDI.  
2. Connect via Atlas SQL Interface.  
3. Execute BI queries; note failures.  
4. Adjust schemas (Schema Management) or rewrite queries (SQL-92; see Language Reference).  
5. Validate in sandbox before production cutover.

## Troubleshooting Resources
Community Forum, MongoDB Support/PS, Customer Success.

</section>
<section>
<title>Create a System DSN</title>
<url>https://mongodb.com/docs/atlas/tutorial/create-system-dsn/</url>
<description>Create a system DSN for the BI Connector to connect SQL clients and BI tools to MongoDB using ODBC.</description>


# Create a System DSN for BI Connector

Flex clusters & Serverless instances: not supported.

## Prereqs
* Install MongoDB ODBC Driver (BI Connector) for your OS  
* Windows only: Visual C++ Redistributable 2015

---

## Windows

1. Run “ODBC Data Sources” (match 32/64-bit to driver).  
2. System DSN ➞ Add ➞ choose **MongoDB ODBC ANSI** or **Unicode** driver  
   * ANSI = faster, limited charset; Unicode = full charset, slower.  
3. Click **Details**, fill:  
   * Data Source Name – arbitrary  
   * TCP/IP Server – Atlas host from connect dialog  
   * Port – Atlas port, default `27015`  
   * Database – target DB  
   * User – `<username>?source=<auth-db>`  
     * SCRAM: auth-db `admin` (omit `?source=`)  
     * LDAP: auth-db `$external` (e.g. `myUser?source=$external`)  
   * Password – for User  
4. Click **Test**; if success ➞ OK.

---

## macOS

1. Open **ODBC Manager** (bundled with driver).  
2. System DSN ➞ Add ➞ choose **MongoDB ANSI** or **Unicode** driver.  
3. Enter DSN name/optional description. Do not close window.  
4. Add keyword/value pairs:  

| Keyword | Value |
|---------|-------|
| SERVER  | Atlas host |
| PORT    | Atlas port (`27015` default) |
| DATABASE| DB to use (mandatory for Excel) |
| UID     | `<username>?source=<auth-db>` (SCRAM `admin`, LDAP `$external`) |
| PWD     | password |

5. Click **OK** to save DSN.

For full ODBC parameters see Connector/ODBC docs.

</section>
<section>
<title>Connect from Excel</title>
<url>https://mongodb.com/docs/atlas/tutorial/connect-bic-excel/</url>
<description>Connect Excel to Atlas using the BI Connector for M10+ clusters, with steps for both Windows and macOS systems.</description>


# Connect from Excel

Flex & Serverless clusters: BI Connector unsupported. BI Connector EOL Sept 2026 → migrate to Atlas SQL.

Cluster-side: Connect → Standard Connection → Connect Your Business Intelligence Tool to copy BI Connector URI/creds.

## Prerequisites  
Windows:  
• M10+ cluster with BI Connector enabled  
• System DSN pointing to the cluster  

macOS:  
• Same as Windows  
• Excel 64-bit. Verify:  
```sh
file -N /Applications/Microsoft\ Excel.app/Contents/MacOS/Microsoft\ Excel
```  
• iODBC runtime (use 64-bit for tests). Create/modify DSN via ODBC Manager, not iODBC.  

## Excel Workflow  

### Windows  
1. Data → From Other Sources → From Data Connection Wizard.  
2. Pick ODBC DSN → Next.  
3. Choose Atlas DSN → Next.  
4. Select database & collection → Next.  
5. Save connection file → Finish.  
6. Pick import layout (table, pivot, etc.) → OK.  

### macOS  
1. Data → New Database Query → From Database (or Get External Data).  
2. System DSN tab → select Atlas DSN → OK.  
3. Supply `username?source=<authDB>` & password.  
4. Expand server, pick collection. (Click Run to preview.) → Return Data.  
5. Import to Existing Sheet (cell), New Sheet (A1), or PivotTable → OK.  

## Reference  
• Atlas Flex Limitations  
• Serverless Instance Limitations  
• Transition from BI Connector to Atlas SQL  
• MongoDB Connector for BI Manual

</section>
<section>
<title>Connect from Tableau Desktop</title>
<url>https://mongodb.com/docs/atlas/tutorial/connect-bic-tableau/</url>
<description>Connect Tableau Desktop to Atlas using the BI Connector for SQL-based access to MongoDB databases, available for M10+ clusters.</description>


# Connect Tableau Desktop to Atlas BI Connector

Not supported: Flex, Serverless. BI Connector EOL 09/2026 → migrate to Atlas SQL.  
Clusters: M10+ (perf risk on M10/20; use ≥M30 if heavy).

Enable BI Connector in Atlas, then: Connect → Standard Connection → Connect Your Business Intelligence Tool to obtain `hostname` & `port`.

Prereqs  
• BI-enabled Atlas cluster • System DSN using MongoDB ODBC driver • Tableau ≥10.3 (Win) / ≥10.4 (macOS)

Procedure (Win/macOS)  
1. Start Tableau → To a server → More… → Other Databases (ODBC).  
2. Select DSN → Connect.  
3. Enter in Connection Attributes:  
   • Server: Atlas `hostname`  
   • Port: Atlas `port`  
   • Username:
```shell
<username>?source=<authDatabase>
```  
   • Password: user’s password  
4. Sign In.

Docs: Connection Tutorials, MongoDB Connector for BI Manual.

</section>
<section>
<title>Connect from Qlik Sense</title>
<url>https://mongodb.com/docs/atlas/tutorial/connect-bic-qlik/</url>
<description>Connect Qlik Sense to Atlas using the BI Connector by creating a data connection with a system DSN.</description>


# Connect from Qlik Sense

Unsupported on Flex/Serverless clusters. BI Connector EOL Sept 2026 → migrate to Atlas SQL.

Supported: M10+ cluster with BI Connector enabled.

Atlas UI: Connect → Standard Connection → Connect Your Business Intelligence Tool → use provided string.

Prereqs: BI-enabled cluster, system DSN, Qlik Sense Desktop.

Qlik Sense:  
1. Start app → Create New App → Open.  
2. Add data → ODBC → System DSN=<your DSN>; leave user/pwd blank → Create.

See Connection Tutorials/B I Manual for details.

</section>
<section>
<title>Connect from MySQL Workbench</title>
<url>https://mongodb.com/docs/atlas/tutorial/connect-bic-workbench/</url>
<description>Connect MySQL Workbench to Atlas using the BI Connector, following steps to configure connection parameters and test the connection.</description>


# Connect from MySQL Workbench

Flex clusters & Serverless not supported. BI Connector deprecates Sept 2026 → migrate to Atlas SQL.

## Prereqs
* M10+ cluster with BI Connector enabled  
* MySQL Workbench 6.3–8.0.31 (compatible with MySQL 5.7)

## Atlas UI
1. Cluster ➜ Connect ➜ Standard Connection ➜ Connect Your Business Intelligence Tool.  
2. Note Hostname, Port, and suggested user.

## Workbench 6.3+
1. Start Workbench → “+” New Connection.  
2. Parameters  
   * Hostname: value from Atlas dialog  
   * Port: value from Atlas dialog  
   * Username:  
     ```text
     <username>?source=<authDB>
     ```  
   * Password: store in keychain  
   * Default Schema: optional DB name  
3. SSL → Use SSL: “If available”.  
4. Advanced → Enable Cleartext Authentication Plugin (must be checked).  
5. Test Connection → OK. If fails, verify credentials & IP access list.  
6. Welcome page → double-click connection to open SQL Editor.

For more details see MongoDB Connector for BI Manual & connection tutorials.

</section>
<section>
<title>Connect from Power BI Desktop (Windows)</title>
<url>https://mongodb.com/docs/atlas/tutorial/connect-bic-powerbi/</url>
<description>Connect Power BI Desktop to Atlas using the BI Connector for data visualization, noting the transition to Atlas SQL by June 2025.</description>


# Connect from Power BI Desktop (Windows)

- Not supported on Flex or Serverless instances.  
- BI Connector deprecated Sept 2026 → migrate to Atlas SQL.  

Prerequisites  
- M10+ Atlas cluster with BI Connector enabled  
- System DSN pointing to BI Connector  

Steps  
1. Atlas UI: Connect → Standard Connection → Connect Your Business Intelligence Tool → note ODBC details.  
2. Power BI Desktop → Home › Get Data › More › ODBC › Connect.  
3. Pick DSN → OK.  
4. In Navigator, choose database & collections → Load.  

Data now usable in Power BI visualizations.  

Docs: Atlas Flex Limitations, Serverless Instance Limitations, Connection Tutorials, MongoDB Connector for BI Manual.

</section>
<section>
<title>Connect Azure (Microsoft Azure) Services to Atlas with Azure (Microsoft Azure) Service Connector</title>
<url>https://mongodb.com/docs/atlas/tutorial/azure-service-connector/</url>
<description>Connect Azure compute services to your Atlas clusters by configuring your application with the necessary connection details.</description>


# Connect Azure Services to Atlas with Azure Service Connector (Preview)

## Limits  
- No connection string validation; runtime errors possible.  
- Connection string visible during setup.  
- Not in all Azure regions.  
- Env vars may lag; var name shown may be wrong; value only editable.  
- Only SCRAM auth.  
- AKS may not surface `MONGODBATLAS_CLUSTER_CONNECTIONSTRING`.

## Prereqs  
- Azure subscription + supported compute service (App Service, Function, AKS, etc.).  
- Atlas cluster + connection string.

## Steps  
1. In Azure portal, open your compute resource → Settings → **Service Connector** → **+ Create**.  
2. Service type: **MongoDB Atlas Cluster (preview)**.  
3. Enter Connection name.  
4. Auth: leave “Connection string”; paste Atlas URI.  
   • Optional: Advanced → edit env-var name.  
5. Skip Networking (configure in Atlas).  
6. Review + Create → Create.  
   Azure adds env var (default `MONGODBATLAS_CLUSTER_CONNECTIONSTRING`). Verify on Service Connector page.

## App Usage  
App reads the injected env var and connects with any MongoDB driver.

</section>
<section>
<title>Test Resilience</title>
<url>https://mongodb.com/docs/atlas/tutorial/test-resilience/</url>
<description>Simulate failovers and regional outages for clusters in Atlas using the UI or API to test resilience.</description>


# Test Resilience

- **Test Failover**: Initiate primary election via Atlas UI or API (`Test Primary Failover`).
- **Simulate Regional Outage**: Emulate region loss for multi-region clusters via UI or API (`Simulate Regional Outage`).
- Access: requires role ≥ `Project Cluster Manager`.

</section>
<section>
<title>Test Primary Failover</title>
<url>https://mongodb.com/docs/atlas/tutorial/test-resilience/test-primary-failover/</url>
<description>Test the resilience of your Atlas cluster by simulating a primary failover and observing how your application handles the event.</description>


# Test Primary Failover

Unavailable for `M0` Free & Flex clusters.

## Access
Roles: `Organization Owner`, `Project Owner`, `Project Cluster Manager`, or `Project Stream Processing Owner`.

## Prerequisites
• No pending cluster changes  
• All members healthy & have primaries  
• Replication lag < 10 s  
• ≥ 5 % disk free on every node  
• Primary oplogs store ≥ 3 h of data  

## Process
1. Atlas stops current primary.  
2. Secondaries elect new primary.  
3. Old primary restarts as secondary and syncs.  
Notes:  
• Un-replicated writes are rolled back; see Rollbacks During Replica Set Failover.  
• Only `mongos` on primary hosts restart.  
• Shard primaries restart in parallel.

## Trigger Failover
### Atlas CLI
```sh
atlas clusters failover <clusterName> [options]
```

### Administration API
POST `/api/atlas/v1.0/groups/{PROJECT-ID}/clusters/{CLUSTER-NAME}/testFailover`

### Atlas UI
Clusters → … → Test Resilience → Primary Failover → Restart Primary.

## Verify
Clusters → <cluster> → Overview: former PRIMARY now SECONDARY; another node is PRIMARY.

## Troubleshoot
Ensure:  
• SRV connection string used  
• Latest driver  
• Retryable writes (`retryWrites=true`) or custom retry logic implemented

</section>
<section>
<title>Simulate Regional Outage</title>
<url>https://mongodb.com/docs/atlas/tutorial/test-resilience/simulate-regional-outage/</url>
<description>Simulate a regional outage in Atlas to test application resilience using the UI or API, ensuring proper handling of connectivity loss in multi-region clusters.</description>


# Simulate Regional Outage

Not supported on: `M0`, `M2/M5` (deprecated), Flex, Serverless (deprecated).

Access: Org/Project Owner.

Process  
• Atlas drops network to chosen regions; alerts for “no primary” suppressed.  
• App >15 min to detect loss → lower TCP retransmission timeout (`tcp_retries2`).  
• 5 min recommended gap between multiple simulations.

UI Workflow  
1. Clusters → … → Test Resilience → Regional Outage.  
2. Select regions:  
   – Minority (<½ electable nodes).  
   – Majority (>½, leaving ≥1). Majority removes primary → no writes & reads without proper `readPreference`.  
3. Simulate Regional Outage.  
4. End: click End Simulation (minority) or add electable nodes / End Simulation (majority).

API  
POST /groups/{projectId}/clusters/{name}/outageSimulation (“Test Outage”).

Verification  
Monitor app; reads/writes should behave as expected.

Troubleshooting  
Sharded cluster loses highest-priority regions:  
• Set read preference to allow secondary reads.  
• Reconfigure to restore electable nodes.

</section>
<section>
<title>Configure Security Features for Clusters</title>
<url>https://mongodb.com/docs/atlas/setup-cluster-security/</url>
<description>Configure security features for Atlas clusters, including encryption, network access, and user authentication, to enhance security and meet specific needs.</description>


# Configure Security Features for Clusters

Atlas defaults: secure settings, FIPS 140-2 L2, TLS/SSL (90-day certs, auto-rotate 42 d), M10+ clusters in dedicated VPC/VNet, encryption at rest.

## Required

### Network
- App must reach Atlas on TCP 27015-27017.  
  Options: add public IPs to project IP Access List, VPC/VNet peering, or Private Endpoints.  
- LDAP: allow Atlas → LDAP host (public or private IP w/ DNS).

### IP Access List
Add client or cloud-service IPs (GCP/Azure) via “Configure IP Access List Entries”.

### Authentication / Authorization
Create DB users; user must belong to project. See “Configure Database Users”.

## Optional

### Connectivity
- VPC/VNet Peering (`M10+`, set before cluster build)  
- Private Endpoints: AWS PrivateLink, Azure Private Link, GCP Private Service Connect  
- Unified AWS Access: set AWS IAM role for Data Federation, KMS, etc.

### AuthN/AuthZ Options
- Custom DB roles
- AWS IAM auth
- LDAP authz/authn
- X.509 (Atlas-managed or self-managed)
- Restrict MongoDB Support infra access (org-level; 24 h bypass per cluster)

### Encryption
- Customer-managed keys: AWS KMS, Azure Key Vault, GCP KMS
- Client-side Field Level Encryption (automatic). Compass/UI/mongosh can’t decrypt.

### Audit / Monitoring
- Database Auditing
- Access Tracking (auth logs in UI)
- MFA for Atlas UI

### Atlas Control Plane Access
Needed for Alert Webhooks, customer KMS, etc.

`GET /api/atlas/v1.0/controlPlaneIPAddresses` returns:

```json
{
  "inbound": { "aws": {"<region>":["<CIDR>"]}, "azure":{...}, "gcp":{...} },
  "outbound":{ ... }
}
```

Network rules:  
- Your **inbound** must allow `controlPlane.outbound` CIDRs.  
- Your **outbound** must allow `controlPlane.inbound` CIDRs.

### Data Federation
Allow outbound HTTPS to Atlas inbound IPs, TCP 27017.

### OCSP Revocation
Allow CA OCSP responder hosts; otherwise disable OCSP in driver.

➤

</section>
<section>
<title>Configure Cluster Access with the Quickstart Wizard</title>
<url>https://mongodb.com/docs/atlas/security/quick-start/</url>
<description>Configure cluster access in Atlas using the Quickstart Wizard by setting up database users and IP access list entries.</description>


# Configure Cluster Access – Quickstart

1. Open **Security › Quickstart**.  
   • Not visible? **Project Settings › Atlas Security Quickstart On**.

2. Authentication  
   **Username/Password**  
   • Set Username (immutable) & Password → Create User.  
   • Escape special pw chars in URI.  
   **X.509 Certificate**  
   • Select Certificate. Enter Common Name.  
   • Optional: toggle “Download certificate when user is added”; pick expiry 3/6/12/24 mo.  
   • Add User (role = Project Data Access Read/Write).

3. Network Access  
   **Local Environment**  
   • Choose “My Local Environment”. Enter IP/CIDR & Description or Add My Current IP → Add Entry.  
   **Cloud Environment** (`M10+`)  
   • Same IP entry options.  
   • Optional: click “Configure in New Tab” for VPC Peering or Private Endpoints.

4. Finish  
   • Click **Finish and Close**.  
   • Dialog: (un)check “Hide Quickstart guide in the navigation”.  
   • Later toggle via **Project Settings › Atlas Security Quickstart Off/On**.

Result: DB user + IP access list configured; Quickstart disabled after first use.

</section>
<section>
<title>Configure IP Access List Entries</title>
<url>https://mongodb.com/docs/atlas/security/ip-access-list/</url>
<description>How to view, add, modify, and delete IP access list entries using the Atlas CLI or Atlas user interface.</description>


# Atlas IP Access Lists

Atlas accepts client traffic only from project-level IP access list entries (max 200; legacy sharded clusters created < 2017-08-25: 100).  
Entry types:  
• Single IP (`1.2.3.4`)  
• CIDR (`1.2.3.0/24`)  
• AWS Security Group ID (same region as VPC-peered cluster; not allowed when peering spans multiple regions).  

Temporary entries: optional 6 h, 1 d, 1 w (max 7 d). Not supported for Security Groups. Atlas auto-removes after expiry.  
Activity Feed logs create/delete/modify (comment edits excluded; IP change shows delete+create).

Required role: `Project Owner` (Org Owner must add self to project).

## Entry Status
Inactive | No containers provisioned  
Pending  | Configuring  
Active   | Configured on all containers  
Active in regions | Configured only on listed regions (SG only)  
Failed   | Configuration error

## CLI (Atlas CLI ≥ 1.5)

```sh
# List / describe
atlas accessLists list        [--projectId <id>]
atlas accessLists describe <entry> [--projectId <id>]

# Create
atlas accessLists create <entry> \
  [--comment "<text>"] \
  [--projectId <id>] \
  [--duration {6h|1d|1w}]        # omit for permanent

# Delete
atlas accessLists delete <entry> [--projectId <id>]
```

## Administration API
Endpoints:  
GET `/groups/{projectId}/accessList`  
POST `/groups/{projectId}/accessList` (create)  
PATCH `/groups/{projectId}/accessList/{entry}` (modify)  
DELETE `/groups/{projectId}/accessList/{entry}`  
Body fields: `ipAddress` | `cidrBlock` | `awsSecurityGroup` , `comment`, `deleteAfterDate` (ISO date).

## Atlas UI (brief)
Security → Network Access → IP Access List.  
Add / Edit / Delete rows. Fields: Address/CIDR/SG, Comment, Temporary duration.

### Add Entry Guidelines
Entry                     | Effect
--------------------------|---------------------------------
IP                        | Grants that host.
CIDR                      | Grants range. WARNING `0.0.0.0/0` opens to world—use strong creds.
AWS Security Group (ID)   | Grants members of SG (AWS only).

## Notes
• Google Cloud/Azure services: add their egress IPs.  
• Deleting an entry closes existing connections after driver/TCP timeouts.

</section>
<section>
<title>Set Up a Private Endpoint for a Dedicated Cluster</title>
<url>https://mongodb.com/docs/atlas/security-cluster-private-endpoint/</url>
<description>Set up a private endpoint for a dedicated Atlas cluster using AWS, Azure, or GCP to enable secure client connections.</description>


# Set Up Private Endpoints for Dedicated Clusters

Not supported on M0/Flex. Requires Org/Project Owner. Create one endpoint per cloud/region (unless regionalized).

## AWS – PrivateLink (Atlas CLI)

```sh
# 1. Create Atlas endpoint service
atlas privateEndpoints aws create --region <REGION> [... ]     # → <svcId>

# 2. Get AWS service name
atlas privateEndpoints aws describe <svcId>                    # ENDPOINT SERVICE=<SERVICE-NAME>

# 3. Create AWS interface endpoint
aws ec2 create-vpc-endpoint \
  --vpc-id <VPC-ID> --region <REGION> \
  --service-name <SERVICE-NAME> \
  --vpc-endpoint-type Interface \
  --subnet-ids <SUBNET-IDS>                                    # → VpcEndpointId=<vpceId>

# 4. Register interface with Atlas
atlas privateEndpoints aws interfaces create <svcId> \
  --privateEndpointId <vpceId>

# 5. Security groups
#   – Each client SG: outbound → endpoint private IPs (all ports)
#   – Endpoint SG: inbound from clients (all ports)

# 6. Verify
atlas privateEndpoints aws interfaces describe <vpceId> \
  --endpointServiceId <svcId>                                  # STATUS=AVAILABLE
```

## Azure – Private Link (Atlas CLI)

```sh
# 1. Create Atlas service
atlas privateEndpoints azure create --region <REGION>          # → <svcId>

# 2. Get endpoint service name
atlas privateEndpoints azure describe <svcId>                  # ENDPOINT SERVICE=<plsName>

# 3. Create Azure private endpoint
az network private-endpoint create \
  --resource-group <RG> --name <PE-NAME> \
  --vnet-name <VNET> --subnet <SUBNET> \
  --private-connection-resource-id \
    /subscriptions/<SUB_ID>/resourceGroups/<RG_ID>/providers/Microsoft.Network/privateLinkServices/<plsName> \
  --connection-name <plsName> --manual-request true            # → ResourceID=<peId>

# Obtain private IP <peIp> (portal or `az network nic show`).

# 4. Register interface with Atlas
atlas privateEndpoints azure interfaces create <svcId> \
  --privateEndpointId <peId> \
  --privateEndpointIpAddress <peIp>

# 5. Verify
atlas privateEndpoints azure interfaces describe <peId> \
  --endpointServiceId <svcId>                                  # STATUS=AVAILABLE
```

## Google Cloud – Private Service Connect (Atlas CLI)

```sh
# 1. Create Atlas endpoint group
atlas privateEndpoints gcp create --region <REGION>            # → <peId>
atlas privateEndpoints gcp describe <peId>                     # wait for STATUS=AVAILABLE

# 2. In GCP reserve 50 IPs & forwarding rules
cat >setup_psc.sh <<'EOF'
gcloud config set project <GCP-PROJECT-ID>
for i in {0..49}; do
  gcloud compute addresses create <PREFIX>-ip-$i --region=<REGION> --subnet=<SUBNET>
done
for i in {0..49}; do
  gcloud compute forwarding-rules create <PREFIX>-$i --region=<REGION> \
    --network=<VPC-NAME> --address=<PREFIX>-ip-$i \
    --target-service-attachment=projects/<ATLAS-GCP-PROJECT-ID>/regions/<REGION>/serviceAttachments/sa-<REGION>-<GROUP-ID>-$i
done
EOF
sh setup_psc.sh

# 3. Build endpoint list
gcloud compute forwarding-rules list --regions=<REGION> \
  --format="csv(name,IPAddress)" --filter="name:(<PREFIX>*)" > atlasEndpoints.txt
# transform to  name@ip,name@ip,...

# 4. Register with Atlas
atlas privateEndpoints gcp interfaces create <PREFIX> \
  --endpointServiceId <peId> \
  --gcpProjectId <GCP-PROJECT-ID> \
  --endpoint "$(cat atlasEndpoints.txt)"

# 5. Verify
atlas privateEndpoints gcp interfaces describe <PREFIX> \
  --endpointServiceId <peId>                                   # STATUS=AVAILABLE
```

### Common Verification

`STATUS` must be `AVAILABLE`. Otherwise wait or troubleshoot via Atlas docs.

### Security Reminder

Clients must route traffic through endpoint IPs; adjust cloud firewall/SG rules accordingly.

</section>
<section>
<title>Set Up Access to Cloud Providers</title>
<url>https://mongodb.com/docs/atlas/security/cloud-provider-access/</url>
<description>Configure cloud provider access for Atlas, including AWS and Azure service principal setup.</description>


# Set Up Access to Cloud Providers

Configure Atlas using:  
- Unified AWS Access  
- Azure Service Principal Access

</section>
<section>
<title>Set Up Unified AWS Access</title>
<url>https://mongodb.com/docs/atlas/security/set-up-unified-aws-access/</url>
<description>Set up unified AWS access for Atlas by configuring IAM roles for features like Data Federation and Encryption at Rest.</description>


# Unified AWS IAM Access

Prereqs: Atlas account, AWS CLI, Org/Project Owner role.

## Create & Authorize IAM Role
### Atlas CLI
```sh
# returns AtlasAWSAccountArn + AtlasAssumedRoleExternalId
atlas cloudProviders accessRoles aws create [options]

# authorize
atlas cloudProviders accessRoles aws authorize <roleId> [options]
```

### Atlas Admin API
```
POST /groups/{projectId}/cloudProviderAccess  (cloudProvider:"AWS")
→ atlasAWSAccountArn, atlasAssumedRoleExternalId
PUT  /cloudProviderAccess/{roleId}  (authorize)
```

### AWS Trust Policy
```json
{
 "Version":"2012-10-17",
 "Statement":[{
  "Effect":"Allow",
  "Principal":{"AWS":"<atlasAWSAccountArn>"},
  "Action":"sts:AssumeRole",
  "Condition":{"StringEquals":{"sts:ExternalId":"<atlasAssumedRoleExternalId>"}}
 }]
}
```
Attach to new/existing role (AWS Console or CLI), then Update Trust Policy.

## Atlas UI
Project → Options → Integrations → AWS IAM Role Access → Configure  
• Create New Role with AWS CLI: save provided JSON as role-trust-policy.json, run CLI, paste Role ARN → Validate & Finish.  
• Add Trust to Existing Role: edit role’s trust with JSON above, paste ARN → Validate & Finish.  
Resume pending roles (status “in progress”) via Resume/Delete.

## Deauthorize Role
CLI:  
```sh
atlas cloudProviders accessRoles aws deauthorize <roleId> [options]
```  
API: `DELETE /cloudProviderAccess/{roleId}`  
UI: Integrations → AWS IAM Role Access → Edit → Delete.

## Manage Roles
List, view details, authorize, deauthorize via:
• CLI commands above  
• API endpoints  
• UI Integrations screen (shows ARN, creation time, linked services).

</section>
<section>
<title>Set Up and Manage Azure Service Principal Access</title>
<url>https://mongodb.com/docs/atlas/security/set-up-azure-access/</url>
<description>Set up Azure Service Principal access for Atlas projects using the UI or API to securely manage Azure Blob Storage resources.</description>


# Azure Service Principal Access for Atlas

## Prerequisites
- Atlas account, `Project Owner` role  
- Azure PowerShell or Azure CLI

## Create / Authorize Service Principal
UI  
1. Atlas → Project → Options → Integrations → Configure Azure.  
2. Authorize Azure Service Principal → copy displayed *AppId*.  
3. In terminal create/update SP:

```powershell
# PowerShell
Connect-AzAccount          # or az login
$tenantId=(Get-AzContext).Tenant.Id
New-AzADServicePrincipal -AppId <AppId> -Role "Storage Blob Data Contributor" -Scope <scope>
```

```bash
# Azure CLI
az login
tenantId=$(az account show --query tenantId -o tsv)
az ad sp create --id <AppId> --role "Storage Blob Data Contributor" --scopes <scope>
```

4. Enter returned `ObjectId`/`id` in UI → Validate & Finish.

API  

```
POST /groups/{PROJECT-ID}/cloudProviderAccess
{ "cloudProvider":"AZURE" }

POST /groups/{PROJECT-ID}/cloudProviderAccess/{ROLE-ID}
{
  "tenantId":"<tenantId>",
  "subscriptionId":"<subscriptionId>",
  "principalId":"<SP ObjectId>"
}
```

## List Authorized SPs
UI: Integrations → Azure Service Principal Access (fields: Service Principal ID, Created Date, Actions).  
API: `GET /groups/{PROJECT-ID}/cloudProviderAccess?cloudProvider=AZURE`

## View Details
UI: ⋯ → View Service Principal Details (Atlas AppID, Tenant ID, Service Principal ID).  
API: `GET /groups/{PROJECT-ID}/cloudProviderAccess/{ROLE-ID}`

## Delete Service Principal
(Not allowed if in use.)  
UI: ⋯ → Delete → confirm ID.  
API: `DELETE /groups/{PROJECT-ID}/cloudProviderAccess/AZURE/{ROLE-ID}`

</section>
<section>
<title>Set Up and Manage Google Cloud Service Account Access</title>
<url>https://mongodb.com/docs/atlas/security/set-up-gcp-access/</url>

# Google Cloud Service Account Access

## Prereqs
- Atlas account with M10+ Google Cloud cluster.  
- Google Cloud project: you are **Project Owner** (Org Owners must add themselves).

## Create / Authorize an SA
### UI  
Project → Options → Integrations → Google Cloud → Create Google Cloud Service Account → Create → Done.

### API  
1. Create SA record  
```http
POST /api/atlas/v1.0/groups/{PROJECT-ID}/cloudProviderAccess
```
Request body: `{ "providerName":"GCP" }` → returns `{ "serviceAccountId": "<SA-ID>" }`.

2. Authorize SA  
```http
POST /api/atlas/v1.0/groups/{PROJECT-ID}/cloudProviderAccess/{SA-ID}/authorize
```

## List Authorized SAs
### UI  
Integrations → Google Cloud list.

### API  
```http
GET /api/atlas/v1.0/groups/{PROJECT-ID}/cloudProviderAccess
```

## View SA Details
### UI  
Integrations → Google Cloud → ⋯ → View Service Account Details (shows Atlas GCP SA ID + SA ID).

### API  
```http
GET /api/atlas/v1.0/groups/{PROJECT-ID}/cloudProviderAccess/{SA-ID}
```

## Remove SA (must be unused)
### UI  
Integrations → Google Cloud → ⋯ → Delete → confirm SA ID.

### API  
```http
DELETE /api/atlas/v1.0/groups/{PROJECT-ID}/cloudProviderAccess/{SA-ID}
```

</section>
<section>
<title>Configure Cluster Authentication and Authorization</title>
<url>https://mongodb.com/docs/atlas/security/config-db-auth/</url>
<description>Explore how to configure cluster authentication and authorization in Atlas, including options like AWS IAM, LDAP, OIDC, and X.509.</description>


# Cluster Auth & AuthZ

Atlas requires DB users. Options:

- Built-in or custom roles  
- Alt auth: AWS IAM role ARN, LDAP, OIDC/OAuth2, X.509 (Atlas- or self-managed)  

See respective setup guides.

</section>
<section>
<title>Set Up Authentication with AWS IAM</title>
<url>https://mongodb.com/docs/atlas/security/aws-iam-authentication/</url>
<description>Set up AWS IAM authentication for database users to connect to Atlas clusters using IAM roles, reducing authentication mechanisms and secret management.</description>


# Set Up AWS IAM Authentication

• LDAP auth & AWS IAM are mutually exclusive per project.  
• Assign an AWS IAM Role to Lambda, EC2, ECS/Fargate, or EKS; Atlas uses the temp creds it exposes:

Lambda: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`  
ECS task: `http://169.254.170.2$AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`  
EC2: `http://169.254.169.254/latest/meta-data/iam/security-credentials/`  
EKS pod: set `AWS_WEB_IDENTITY_TOKEN_FILE`, `AWS_ROLE_ARN`

• After role exists, add an Atlas database user of type AWS IAM (UI, CLI, or API).

## Connect with `mongosh` ≥ 0.9.0 or a driver

```sh
mongosh "mongodb+srv://<host>/test?authSource=%24external&authMechanism=MONGODB-AWS" \
  --username <AWS_ACCESS_KEY_ID> \
  --password <AWS_SECRET_ACCESS_KEY>
```

authSource must be `$external`; authMechanism must be `MONGODB-AWS`. Secret key is never sent to Atlas or stored by drivers.

</section>
<section>
<title>Manage Customer Keys with AWS Over a Public Network</title>
<url>https://mongodb.com/docs/atlas/security/aws-kms-over-public-network/</url>

# Manage Customer Keys with AWS (Public Network)

## Prereqs
- Cluster tier ≥ M10.  
- AWS KMS CMK + IAM role with `kms:Encrypt|Decrypt|DescribeKey`.  
  • Cross-acct CMK: add key policy + IAM inline policy; enter full CMK ARN.  
- Allow Atlas & node IPs/DNS in IAM role `Condition` if IP-restricted.

## Project-Level Setup (Role-Based)

### UI
1. Security → Advanced → toggle “Encryption at Rest using your Key” On.  
2. Authorize new IAM role: follow AWS CLI/console wizard.  
3. Attach KMS access policy:  
```json
{
 "Version":"2012-10-17",
 "Statement":[{
   "Effect":"Allow",
   "Action":["kms:Decrypt","kms:Encrypt","kms:DescribeKey"],
   "Resource":"arn:aws:kms:REGION:ACCT:key/<cmk-id>"
 }]
}
```  
4. In Atlas: select IAM role, CMK ID/ARN, region → Save.

### API
1. Create role mapping  
`POST /groups/{groupId}/cloudProviderAccess` → note `atlasAWSAccountArn`, `atlasAssumedRoleExternalId`.  
2. Update AWS role trust policy:  
```json
{
 "Version":"2012-10-17",
 "Statement":[{
   "Effect":"Allow",
   "Principal":{"AWS":"<atlasAWSAccountArn>"},
   "Action":"sts:AssumeRole",
   "Condition":{"StringEquals":{"sts:ExternalId":"<atlasAssumedRoleExternalId>"}}
 }]
}
```  
3. Authorize role (`PATCH /cloudProviderAccess/{roleId}/authorize`).  
4. Enable KMS on project:  
```bash
PATCH /groups/{groupId}/encryptionAtRest
{
 "awsKms":{
  "enabled":true,
  "roleId":"<roleId>",
  "customerMasterKeyID":"<cmk-id>",
  "region":"<region>"
 }
}
```

### Migrating from IAM User → Role
Edit project → Encryption at Rest → Configure; authorize IAM role. Irreversible.

## Cluster-Level Enablement
Role: Project Owner.  
• New cluster: set “Manage your own encryption keys” = Yes.  
• Existing: Clusters → Edit Configuration → Additional Settings → toggle same option; ensure Private Networking matches project setup → Review & Apply.

</section>
<section>
<title>Manage Customer Keys with AWS Over Private Endpoints</title>
<url>https://mongodb.com/docs/atlas/security/aws-kms-over-private-endpoint/</url>

# AWS KMS Customer-Managed Keys over PrivateLink (Atlas)

## Overview
Encrypt Atlas data at rest with your AWS KMS CMK and force all KMS traffic through AWS PrivateLink.

## Requirements
- Atlas single-cloud project in `ACTIVE` state.
- M10+ clusters.
- AWS IAM **role** (not user) trusted by Atlas with `kms:Encrypt/Decrypt/DescribeKey`.
- Provide full CMK ARN (`arn:aws:kms:<region>:<acct>:key/<uuid>`).
- Optional: add Atlas/public node IPs to IAM policy conditions.
- Works only after project-level CMK + private endpoints are enabled.

## Key IAM Elements
Role trust policy (replace placeholders):
```json
{
 "Version":"2012-10-17",
 "Statement":[{
   "Effect":"Allow",
   "Principal":{"AWS":"<atlasAWSAccountArn>"},
   "Action":"sts:AssumeRole",
   "Condition":{"StringEquals":{"sts:ExternalId":"<atlasAssumedRoleExternalId>"}}
 }]
}
```
Role access policy:
```json
{
 "Version":"2012-10-17",
 "Statement":[{
   "Effect":"Allow",
   "Action":["kms:Encrypt","kms:Decrypt","kms:DescribeKey"],
   "Resource":"<CMK-ARN>"
 }]
}
```

## API Workflows

### 1  Authorize Atlas IAM Role
```bash
# create cloud provider access
POST /api/atlas/v1.0/groups/{groupId}/cloudProviderAccess
→ returns atlasAWSAccountArn, atlasAssumedRoleExternalId

# after editing AWS trust policy, authorize role
POST /api/atlas/v1.0/groups/{groupId}/cloudProviderAccess/aws/role
{ "iamAssumedRoleArn":"arn:aws:iam::<acct>:role/<roleName>" }
→ returns roleId
```

### 2  Enable CMK for Project
```bash
PATCH /api/atlas/v1.0/groups/{groupId}/encryptionAtRest
{
 "awsKms":{
   "enabled":true,
   "roleId":"<roleId>",
   "customerMasterKeyID":"<CMK-ARN>",
   "region":"<aws-region>"
 }
}
```

### 3  Enforce Private Networking
```bash
PATCH /api/atlas/v1.0/groups/{groupId}/encryptionAtRest
{ "awsKms":{ "requirePrivateNetworking":true } }
```

### 4  Create Private Endpoint per Region
```bash
POST /api/atlas/v2/groups/{groupId}/encryptionAtRest/AWS/privateEndpoints
{ "regionName":"<AWS_REGION>" }
```
Check status (`ACTIVE | INITIATING | FAILED`):
```bash
GET /api/atlas/v2/groups/{groupId}/encryptionAtRest/AWS/privateEndpoints
```
Restrictions after enablement:
- New clusters & added nodes only in regions with `ACTIVE` endpoints.

### 5  Cluster-Level Enablement
When creating or editing a cluster: Additional Settings → “Manage your own encryption keys” = **Yes**. Requires Project Owner.

### 6  Disable / Remove
1. DELETE each endpoint  
   `DELETE /api/atlas/v2/groups/{groupId}/encryptionAtRest/AWS/privateEndpoints/{endpointId}`
2. PATCH `requirePrivateNetworking:false`.
3. Disable CMK per cluster, then project.

### 7  Additional Ops
- Add more endpoints: repeat step 4.
- View endpoints/status: UI Advanced → Private Endpoints or GET API above.
- Deleting endpoint in AWS console triggers Atlas recreation (`PENDING_RECREATION` → approve).

## UI Navigation (summary)
Atlas → Project → Security → Advanced  
• Encryption at Rest: toggle On, “Authorize new IAM Role”  
• Network Settings: Require Private Networking → Set up / Manage

## Notes
- Cannot revert to credential-based access once role-based CMK enabled.
- Only one CMK/role per project; applies to all clusters.

</section>
<section>
<title>Manage Customer Keys with Azure Key Vault Over a Public Network</title>
<url>https://mongodb.com/docs/atlas/security/azure-kms-over-public-network/</url>

# Customer-Managed Keys via Azure Key Vault (AKV)

Not supported on M0, M2/M5 (deprecated), Serverless (deprecated), Flex.  
Cluster tier ≥ M10.

## Prerequisites
- Azure app: client ID, tenant ID, *non-expired* secret, azureEnvironment.
- AKV: subscription ID, resourceGroupName, keyVaultName, keyIdentifier URL  
  (`https://{kv}.vault.azure.net/{object-type}/{object-name}/{version}`).
- Allow Atlas control-plane + cluster node IPs (update on node change) or use Azure Private Link.  
  Retrieve control-plane IPs: “Fetch Atlas Control Plane IP Addresses” API.

## Enable CMK for a Project

### Atlas UI
Advanced → Encryption at Rest using your Key Management → On  
Select Azure Key Vault, enter Account, Vault, and Key fields, optionally add private endpoints, Save.

### Atlas Admin API
```bash
PATCH /api/atlas/v2/groups/{GROUP-ID}/encryptionAtRest
{
  "azureKeyVault": {
    "enabled": true,
    "azureEnvironment": "AZURE",
    "clientID": "...",
    "tenantID": "...",
    "secret": "...",
    "subscriptionID": "...",
    "resourceGroupName": "...",
    "keyVaultName": "...",
    "keyIdentifier": "https://kv.vault.azure.net/keys/key/...",
    "requirePrivateNetworking": false
  }
}
```
Immutable after Private Endpoints: keyVaultName, resourceGroupName, subscriptionID.

Verify:
```bash
GET /api/atlas/v2/groups/{GROUP-ID}/encryptionAtRest
# enabled:true, valid:true
```

## Enable CMK for a Cluster
Clusters → Edit Configuration → Additional Settings → Manage your own encryption keys = Yes.  
Require Private Networking shows Active if PE configured at project level.

## Disable CMK
Turn off per-cluster first, then project. Do **not** delete AKV keys until disabled everywhere; data becomes unreadable.

## Revoke Key Access
Revoke in AKV. Atlas auto-pauses clusters if control-plane IP allowed; otherwise manually pause. Keep IP list updated.

## Rotate Key Identifier
Create new key in same Key Vault. Advanced → Edit → Encryption Key → update Key Identifier URL → Update Credentials.  
Don’t delete/disable old key until rotation complete and snapshots validated.

## Related
Manage Your Own Encryption Keys (cluster deploy), Enable Encryption at Rest (existing cluster), Encryption docs, Cloud Backup encryption.

</section>
<section>
<title>Manage Customer Keys with Azure Key Vault Over Private Endpoints</title>
<url>https://mongodb.com/docs/atlas/security/azure-kms-over-private-endpoint/</url>

# Atlas CMK with Azure Key Vault over Private Endpoints

Unsupported: M0, M2/M5 (deprecated), Flex, Serverless (deprecated).

## Limits
• Only single-cloud Azure projects in ACTIVE state.  
• Project *must* be M10+. Enabling on multi-cloud disables those clusters.

## Azure Prereqs
• AD App: clientID, tenantID, **secret**.  
• Key Vault: subscriptionID, resourceGroupName, keyVaultName, keyIdentifier (full URL).  
• `Microsoft.Network` provider registered.  
• If conditional access, allow Atlas Control Plane IPs.

## Enable CMK for Project

PATCH `/groups/{groupId}/encryptionAtRest`
```json
{
  "azureKeyVault": {
    "enabled": true,
    "azureEnvironment": "AZURE",
    "clientID": "<appId>",
    "tenantID": "<tenant>",
    "secret": "<secret>",
    "subscriptionID": "<sub>",
    "resourceGroupName": "<rg>",
    "keyVaultName": "<kv>",
    "keyIdentifier": "https://<kv>.vault.azure.net/keys/<key>/<ver>"
  }
}
```
Immutable after PE setup: `subscriptionID`, `resourceGroupName`, `keyVaultName`.

GET same endpoint to verify (`enabled:true`, `valid:true`).

## Require Private Networking & Create Private Endpoints

1. PATCH `requirePrivateNetworking:true` in previous body.  
2. For each Azure region:

POST `/groups/{groupId}/encryptionAtRest/AZURE/privateEndpoints`
```json
{ "regionName": "US_CENTRAL" }
```
3. Approve endpoint in Azure (UI/CLI/Terraform).

Status values: INITIATING, PENDING_ACCEPTANCE, ACTIVE, PENDING_RECREATION, FAILED, DELETING.

GET `/groups/{groupId}/encryptionAtRest/AZURE/privateEndpoints` to monitor.

Effects after approval:  
• All new clusters deploy only in approved regions.  
• Existing CMK clusters migrate to PE; public KV access optional to disable.

## Cluster-Level Enable

UI or Edit Cluster → Additional Settings → “Manage your own encryption keys”. Requires Project Owner. If project PEs active, cluster automatically uses them.

## Disable CMK

1. Delete *all* private endpoints:  
   DELETE `/groups/{groupId}/encryptionAtRest/AZURE/privateEndpoints/{endpointId}`  
2. Disable CMK on every cluster.  
3. PATCH project `enabled:false`.  
Do **not** delete KV keys until above complete.

## Manage Private Endpoints

• Add: repeat POST per region.  
• Remove: DELETE as above.  
Atlas recreates removed ACTIVE endpoints; approve new PE.

## Disable Private Networking Only

PATCH `requirePrivateNetworking:false` (PEs must be deleted first).

## Rotate Key Identifier

UI: Advanced → Azure Key Vault → Encryption Key → update `keyIdentifier` with new KV key URL.  
Keep old key until rotation + backups validated.

## Freeze Data

Revoke Atlas access to key in KV; Atlas pauses clusters.

## Status Codes Summary

```
INITIATING         creating endpoint
PENDING_ACCEPTANCE awaiting Azure approval
ACTIVE             approved and in use
PENDING_RECREATION rejected/removed; recreating
FAILED             creation failed
DELETING           deleting endpoint
```

---

</section>
<section>
<title>Configure Federated Authentication</title>
<url>https://mongodb.com/docs/atlas/security/federated-authentication/</url>
<description>Configure Federated Authentication in Atlas to link credentials across MongoDB systems using the Federated Identity Management model with your Identity Provider.</description>


# Configure Federated Authentication (Atlas)

• Requires Organization Owner.  
• Enabling federation disables all other Atlas auth.

## Federation Management Console  
Organizations → Organization Settings → Visit Federation Management App.

## Quick Start (4 steps)  
1. Add & verify domains.  
2. Exchange IdP/Atlas metadata.  
3. Map domains→IdP.  
4. Activate IdP.

## Manual Tasks  
1. Manage Identity Providers: link IdP.  
2. Manage Domains: map email domains→IdP.  
3. Manage Organizations:  
   • map orgs→IdP.  
   • map Atlas roles→IdP groups.

## Tutorials  
Guides for Entra ID, Google Workspace, Okta, PingOne.

## Restrictions  
• Users blocked by UI IP access list cannot open Federation console.  
• 2FA is handled by IdP; Atlas skips its own 2FA for federated users.

</section>
<section>
<title>Manage Identity Providers</title>
<url>https://mongodb.com/docs/atlas/security/manage-federated-auth/</url>
<description>Configure federated authentication in Atlas by linking your Identity Provider to manage user credentials across MongoDB services.</description>


# Manage Identity Providers

Federated Authentication lets Atlas delegate all login credentials to a SAML IdP. When enabled, every other Atlas auth method is disabled.

Access required: Organization Owner.

## 1  Create SAML app in your IdP  
• Set placeholders for **SP Entity ID / Audience URI / ACS URL**.  
• Signature Algorithm: `SHA-1` or `SHA-256`.  
• **NameID = user email**; format `unspecified` or `emailAddress`.  
• Add case-sensitive attributes:  
  `firstName`  → First Name  
  `lastName`   → Last Name  
  `memberOf`   → User Groups  
Save.

## 2  Register IdP in Atlas  
Atlas UI → Organization Settings → **Visit Federation Management App** → Configure/Add Identity Provider.  
Enter:  
```
Configuration Name          (required)  
Configuration Description    (optional)  
IdP Issuer URI               placeholder  
IdP Single Sign-On URL       placeholder  
IdP Signature Certificate    PEM upload/paste  
Request Binding              HTTP POST | HTTP REDIRECT  
Response Signature Algorithm SHA-256 | SHA-1
```  
Click Next.

## 3  Exchange metadata  
• Download `metadata.xml` from Atlas; upload to IdP.  
• Copy Atlas ACS URL & Audience URI if needed.  
• In Atlas, replace placeholder **Issuer URI / SSO URL** with real IdP values.

## 4  (Optional) set RelayState in IdP  
• Atlas: login URL shown in Federation App  
• Support: https://auth.mongodb.com/app/salesforce/exk1rw00vux0h1iFz297/sso/saml  
• University: https://auth.mongodb.com/home/mongodb_thoughtindustriesstaging_1/0oadne22vtcdV5riC297/alndnea8d6SkOGXbS297  
• Community Forums: https://auth.mongodb.com/home/mongodbexternal_communityforums_3/0oa3bqf5mlIQvkbmF297/aln3bqgadajdHoymn297  
• Feedback: https://auth.mongodb.com/home/mongodbexternal_uservoice_1/0oa27cs0zouYPwgj0297/aln27cvudlhBT7grX297  
• JIRA: https://auth.mongodb.com/app/mongodbexternal_mongodbjira_1/exk1s832qkFO3Rqox297/sso/saml  

## 5  Finish  
Click Finish. IdP status is Inactive until you map at least one domain; users from mapped domains must authenticate through the IdP.

</section>
<section>
<title>Manage Domain Mapping for Federated Authentication</title>
<url>https://mongodb.com/docs/atlas/security/manage-domain-mapping/</url>
<description>Map domains to your Identity Provider in Atlas for streamlined user authentication and manage domain verification methods.</description>


# Federated Auth – Domain Mapping

## Overview  
Map email domains to IdPs so users are auto-redirected during login. A domain can map to multiple IdPs; Atlas redirects to the first match. Users can bypass by logging in through the desired IdP’s Login URL.

## Access & Prereqs  
• Organization Owner role on orgs delegated to federation instance  
• At least one IdP already linked

## Add & Verify Domain

1. Org Settings → Open Federation Management App → Domains → **Add Domain**  
   Fields:  
   • Display Name – label  
   • Domain Name – `example.com`

2. Pick 1 verification method (cannot change; delete/re-add to switch):

   **HTML file**  
   a. Select HTML File Upload → Next  
   b. Download `mongodb-site-verification.html`  
   c. Host at `https://<host>.<domain>/mongodb-site-verification.html`  
   d. Finish

   **DNS TXT**  
   a. Select DNS Record → Next  
   b. Copy TXT:  
   ```ini
   mongodb-site-verification=<32-char string>
   ```  
   c. Add record at domain registrar  
   d. Finish

3. On Domains list click **Verify**. Banner shows success/failure.

## Associate Domain with IdP  
Identity Providers → Edit (IdP) → Associated Domains → select domain → Confirm.

## Test  
1. Save IdP “Bypass SAML Mode” URL (emergency login).  
2. In private window open Atlas login, enter email `user@verified-domain`, click Next → should redirect to IdP and back on success.  
   Or use IdP’s Login URL directly.

## Delete Domain  
1. If mapped, IdP → Edit → deselect domain → Confirm.  
2. Domains → Actions → Delete → Confirm.

</section>
<section>
<title>Manage Organization Mapping for Federated Authentication</title>
<url>https://mongodb.com/docs/atlas/security/manage-org-mapping/</url>
<description>Manage organization mapping for federated authentication by configuring Identity Providers to grant user access across multiple Atlas organizations.</description>


# Manage Organization Mapping for Federated Auth

- Access: `Organization Owner`.  
- Prereqs: IdP linked + domains mapped.

## Map Org to IdP
1. Atlas UI › select org › Organization Settings › Open Federation Management App.  
2. View Organizations → Connect (for unmapped org).  
3. Click org name → Apply Identity Provider.  
4. IdPs list → Add Organizations → choose orgs → Confirm.  
5. Verify org shows desired IdP.

Atlas auto-creates “Organization's IdP certificate is about to expire” alert; removed on un-mapping.

## Change Mapped IdP
1. Organizations → select org’s IdP → Modify.  
   • Deselect org → Next → Finish.  
2. Modify new IdP → select org → Next → Finish.

## Optional
- Default Org Role: set in Federation console; used if user lacks group-role mapping.  
- Restrict Org Access by Domain: define approved domains.

## Disconnect Org
Federation console → View Organizations → Actions › Disconnect → Confirm.  
Atlas stops granting membership/default role via IdP.

</section>
<section>
<title>Manage Mapping Atlas Roles to IdP Groups</title>
<url>https://mongodb.com/docs/atlas/security/manage-role-mapping/</url>
<description>Streamline authorization by mapping IdP groups to Atlas roles, simplifying access to organizations, projects, and clusters.</description>


# Atlas – Map IdP Groups to Roles

Federated users inherit Atlas org/project roles from their IdP groups (`memberOf` SAML attr). Direct role edits for those users are blocked.

## Role-Assignment Logic
1. On login Atlas reads `memberOf` → applies matching org mappings.  
2. If no mapping or mapping yields no role → default role applied.  
3. If user loses mapped IdP group, mapped roles are removed on next login.  
4. Each org must always retain ≥1 `Organization Owner`; removal preventing this fails.

## Permissions
`Organization Owner` in each org to be managed.

## Prerequisites
• IdP SAML app exposing `memberOf` (or Entra “Group Id”)  
• IdP linked to Atlas + orgs delegated to federation  
• ≥1 IdP group with users

## UI Path (Add / Edit / Delete)
1. Org selector → **Organization Settings** → **Manage Federation Settings → Open Federation Management App**.  
2. **Manage Organizations**:  
   • “Connect” enables federation for an org.  
   • “⋯ View” opens org in console.  
3. **Create Role Mappings**:  
   • “Create a Role Mapping” (or “✎ Edit” / “🗑 Delete”).  

### Create / Edit Mapping Wizard
1. Map Group and Assign Org Roles  
   • Enter IdP group name (or Entra Object ID).  
   • Select Atlas org roles.  
   • Finish or Next.  
2. Assign Project Roles (optional)  
   • Select roles per project.  
   • Finish or Next.  
3. Review & Confirm → Finish.

### Delete Mapping
In “Organization Role Mappings” click “🗑 Delete” beside group → Confirm.



</section>
<section>
<title>Configure Federated Authentication from Microsoft Entra ID</title>
<url>https://mongodb.com/docs/atlas/security/federated-auth-azure-ad/</url>
<description>Configure federated authentication in Atlas using Microsoft Entra ID as the Identity Provider for secure single sign-on access.</description>


# Federated Auth with Microsoft Entra ID (Azure AD) for MongoDB Atlas

## Access & Prereqs
- Atlas: `Organization Owner`.
- Azure: Subscription, Entra ID tenant, `Cloud App Administrator` + `User Administrator`, verified custom routable domain.

## 1  Azure – Prepare Domain & Users
1. Add custom domain ➞ publish provided `TXT` DNS record ➞ Verify.
2. Create/assign Entra ID users in that domain.

## 2  Azure – Create SAML Enterprise App
Choose either:

### a) Gallery “MongoDB Cloud” app  
### b) Non-gallery custom app (“MongoDB-Atlas”)

Common required steps  
1. Assign users/groups to the app.  
2. Single Sign-On → SAML → Edit Section 1:  
   ```
   Identifier: https://www.okta.com/saml2/service-provider/MongoDBCloud
   Reply URL : https://auth.mongodb.com/sso/saml2/
   ```  
   Save & refresh to regenerate cert (SHA-256).  
3. Download Certificate (Base64).  
4. Copy “Login URL” and “Microsoft Entra ID Identifier”.  
5. (Optional) Group claim for Atlas role-mapping:  
   • Add Group Claim → Security groups → Source attribute = Group Id → Advanced → Name = memberOf (namespace empty, don’t emit role claims).  
6. Non-gallery only:  
   • Delete default additional claims.  
   • Unique User Identifier: Format = Unspecified, Source Attribute = `user.userprincipalname` (or attribute with full email).  
   • Add user claims (namespace blank):  
     ```
     firstName = user.givenname
     lastName  = user.surname
     ```

## 3  Atlas – Register IdP
Atlas UI → Org Settings → Open Federation Management App → Configure Identity Providers → Add.

Required SAML fields:  
```
Configuration Name        = “Microsoft Entra ID”
IdP Issuer URI            = <Identifier copied from Azure>
IdP Single Sign-On URL    = <Login URL copied from Azure>
IdP Signature Certificate = <Base64 cert>
Request Binding           = HTTP POST
Response Signature Alg    = SHA-256
```
Next → Download metadata → Finish → Upload metadata back in Azure SSO page (Upload metadata file).  
(Optional) Set RelayState URLs to bypass redirects (see table in original doc).

## 4  Map & Verify Domain
FMC → Domains → Add Domain → enter Display Name & Domain.  
Choose verification method once:  
- HTML upload (`https://<host>/mongodb-site-verification.html`), or  
- DNS TXT:

```ini
mongodb-site-verification=<32-character string>
```
After external change, click Verify.  

## 5  Associate Domain ↔ IdP
FMC → Identity Providers → Edit “Associated Domains” → select verified domain → Confirm.

## 6  Test & Safety
- Save “Bypass SAML Mode” URL.  
- Private browser → Atlas login → enter user@yourDomain → should redirect to Entra ID, then back to Atlas on success.  
- Or navigate directly to the IdP Login URL.

## 7  (Opt) Map Organizations
FMC → Organizations → Connect desired orgs → Apply Identity Provider → select orgs → Confirm.

Advanced options (require org mapping): default user role, restrict by domain, restrict membership, Bypass SAML Mode.

## 8  User Sign-in
Assigned Entra ID users access Atlas via IdP Login URL or Atlas login (domain-based redirect). If multiple IdPs on same domain, first match is used unless user starts from specific Login URL.

</section>
<section>
<title>Configure Federated Authentication from Google Workspace</title>
<url>https://mongodb.com/docs/atlas/security/federated-auth-google-ws/</url>
<description>Configure federated authentication in Atlas using Google Workspace as your Identity Provider to enable login with company credentials.</description>


# Configure Federated Authentication from Google Workspace

Prereqs  
• Atlas Org Owner  
• Google Workspace + admin user

## 1  Google Workspace – create SAML app  
Admin console ➜ Apps ➜ Web and mobile apps ➜ Add custom SAML app.  
Save:  
• SSO URL  
• Entity ID  
• X.509 cert (.cer)

## 2  Atlas – add IdP  
Org Settings ➜ Open Federation Management Console (FMC) ➜ Identity Providers ➜ Setup Identity Provider  
Fields  
- Configuration Name: any  
- Issuer URI: *Entity ID*  
- Single Sign-On URL: *SSO URL*  
- Certificate: upload/paste *.cer*  
- Request Binding: **HTTP POST**  
- Response Signature Algorithm: **SHA-256**  
Next ➜ copy Assertion Consumer Service URL (ACS) + Audience URI ➜ Finish ➜ note Login URL.

## 3  Google Workspace – finish app  
Fields  
- ACS URL: *ACS*  
- Entity ID: *Audience URI*  
- Start URL: *Login URL*  
- Signed Response: ON  
- Name ID Format: UNSPECIFIED  
- Name ID: Primary Email  
Attribute mappings  
• First name → `firstName`  
• Last name  → `lastName`  
Optional role mapping  
• Group membership → `memberOf` (add Google groups)  
Enable service for desired users/OUs/groups.

## 4  Domain mapping (FMC)  
Domains ➜ Add Domain → enter Display & Domain names → Next  
Verify (choose once):  
a) HTML file at `https://<domain>/mongodb-site-verification.html`  
b) DNS TXT record:  
```ini
mongodb-site-verification=<32-character-string>
```  
Finish ➜ Verify.  
Identity Providers ➜ Edit Associated Domains ➜ select domain ➜ Confirm.

## 5  Test  
Record Bypass SAML Mode URL (IdP tile).  
Private window ➜ Atlas login ➜ enter user@<domain> ➜ redirected to Google Workspace ➜ back to Atlas on success.  
Or navigate directly to *Login URL*.

## 6  (Opt.) Map organizations  
FMC ➜ View Organizations ➜ Connect → Apply Identity Provider.  
Advanced options (after org mapping): default user role, domain restriction, federation membership restriction, bypass SAML mode.

Login flow  
Users assigned to the Google Workspace app authenticate via Atlas console or *Login URL*. If multiple IdPs mapped to a domain, first match is auto-redirect; use other IdP’s Login URL to override.

</section>
<section>
<title>Configure Federated Authentication from Okta</title>
<url>https://mongodb.com/docs/atlas/security/federated-auth-okta/</url>
<description>Configure federated authentication with Okta for Atlas, allowing users to log in using company credentials and manage domain mappings and identity provider settings.</description>


# Atlas Federation: Okta SAML Setup (Concise)

## Access & Prereqs
- Org Owner role.
- Okta account.
- Public domain.

## 1. Create Okta SAML App
1. Admin → Applications → Create App Integration → SAML 2.0.  
2. Name app; skip logo.  
3. SAML settings (temp values, will change later):
   - Single sign-on URL: `http://localhost`
   - Audience URI: `urn:idp:default`
4. Finish.  
5. Download newest active certificate → convert to PEM:  
   ```sh
   openssl x509 -in cert.crt -out cert.pem -outform PEM
   ```

## 2. Add IdP in Atlas FMC
Federation Management Console (Org Settings → Open Federation Management App)  
Identity Providers → Setup Identity Provider:
```
Configuration Name: <label>
Issuer URI           : placeholder
Single Sign-On URL   : placeholder
Certificate          : cert.pem
Request Binding      : HTTP POST
Response Algo        : SHA-256
```
Next → Finish (captures ACS URL & Audience URI for next step).

## 3. Complete Okta SAML Settings
Okta App → General → Edit SAML:  
```
Single sign-on URL : <ACS URL from FMC>  (✓Recipient & Destination)
Audience URI       : <Audience URI from FMC>
Default RelayState : (optional, e.g. Atlas Login URL)
Name ID format     : Unspecified
Application user   : Email (update on create & update)
```
Advanced (Show Advanced Settings):
```
Response/Assertion : Signed
Sig Algorithm      : RSA-SHA256
Digest             : SHA256
Encryption         : Unencrypted
```
Attributes:
```
firstName → user.firstName
lastName  → user.lastName
(optional) memberOf (regex .*)
```
Save → Finish.

## 4. Replace Placeholders in FMC
IdPs → Edit Okta config:
```
Issuer URI            : value from Okta “Setup Instructions”
Single Sign-On URL    : same
Signature Certificate : X.509 from Okta
```
Next → Finish.

## 5. Assign Okta Users
Okta App → Assignments → add all Atlas users.

## 6. Map & Verify Domain
FMC → Domains → Add Domain:
- Display Name, Domain Name.

Verification (choose once):
a) HTML upload: host `https://<domain>/mongodb-site-verification.html`.  
b) DNS TXT: `mongodb-site-verification=<key>`.

Verify domain → success banner.

## 7. Link Domain to IdP
FMC → Identity Providers → Edit “Associated Domains” → select domain → Confirm.

## 8. Test
Private browser → Atlas login → enter user@<domain>. Redirects to Okta; after auth returns to Atlas.  
Keep Bypass SAML URL handy for lockout recovery.

## 9. (Optional) Map Organizations
FMC → Organizations:
- Connect orgs not yet federated.
- Select org → Apply Identity Provider → pick IdP → Confirm.

## 10. (Optional) Advanced Controls
- Bypass SAML Mode
- Default org role
- Domain-restricted org access
- Restrict user membership to federation

## 11. User Login
Users use the IdP Login URL or Atlas login (redirects by domain). Multiple IdPs on same domain: first match wins; alt IdP requires its specific Login URL.

</section>
<section>
<title>Configure Federated Authentication from PingOne</title>
<url>https://mongodb.com/docs/atlas/security/federated-auth-ping-one/</url>
<description>Configure federated authentication with PingOne as your Identity Provider to enable login to Atlas using company credentials.</description>


# Atlas Federation – PingOne SAML Setup

Prerequisites  
- Atlas `Organization Owner` role  
- PingOne admin account & subscription  

## 1. Create PingOne SAML App  
1. Admin Console → Setup → Certificates → download **Origination Certificate**.  
2. Applications → Add Application → **New SAML Application**.  
3. Name: “MongoDB Atlas”; Continue.  
4. Select **I have the SAML configuration**, then enter values from Atlas FMC:  

| Field | Value |
|---|---|
| Signing Certificate | PingOne origination cert |
| Protocol Version | SAML v2.0 |
| Assertion Consumer Service | Atlas **ACS URL** |
| Entity ID | Atlas **Audience URI** |
| Signing | Sign Assertion |
| Signing Algorithm | RSA_SHA256 |
| Encrypt Assertion / Force Re-auth | Unchecked |

5. Attributes → Add:  

| Application Attribute | Source | As Literal |
|---|---|---|
| `SAML_SUBJECT` | Email | ✗ |
| `firstName` | First Name | ✗ |
| `lastName` | Last Name | ✗ |

Advanced → NameID Format:  
`urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified` or `…emailAddress`  

6. Assign user groups, Continue, note **Issuer** and **idpid**, Finish.

## 2. Register IdP in Atlas  
1. Org Settings → **Open Federation Management App (FMC)** → Identity Providers → **Setup Identity Provider**.  
2. Enter:  

| Field | Value |
|---|---|
| Configuration Name | label |
| Issuer URI | temporary placeholder |
| Single Sign-On URL | temporary placeholder |
| Identity Provider Signature Certificate | PingOne cert |
| Request Binding | HTTP POST |
| Response Signature Algorithm | SHA-256 |

3. After PingOne app finish, **Modify** IdP in Atlas:  
   - Issuer URI = PingOne Issuer  
   - SSO URL = `https://sso.connect.pingidentity.com/sso/idp/SSO.saml2?idpid=<idpid>`  
4. Next → Finish.

## 3. Map & Verify Domain  
FMC → Domains → **Add Domain**. Provide Display Name & Domain.  
Choose ONE verification method (irreversible):  

HTML: upload `mongodb-site-verification.html` to `https://<domain>/`.  
DNS: add TXT record  
```
mongodb-site-verification=<32-char string>
```  
Click **Verify**.

## 4. Link Domain to IdP  
Identity Providers → Edit **Associated Domains** → select verified domain → Confirm.

## 5. Test  
Save **Bypass SAML Mode URL** from IdP page.  
In private browser: Atlas login → enter user@<domain> → should redirect to PingOne and back to Atlas.  
Or navigate directly to SSO URL.

## 6. (Optional) Map Organizations  
FMC → View Organizations → Connect.  
Select org → Apply Identity Provider → Confirm.

## 7. Advanced Options  
(FMC)  
- Bypass SAML Mode  
- Default User Role per org  
- Restrict Access by Domain  
- Restrict User Membership to Federation

## User Login  
All users assigned to the PingOne app sign in via:  
`https://sso.connect.pingidentity.com/sso/idp/SSO.saml2?idpid=<idpid>`  
If multiple IdPs map to a domain, Atlas console redirects to first match; alternate IdP requires direct SSO URL.

</section>
<section>
<title>Advanced Options for Federated Authentication</title>
<url>https://mongodb.com/docs/atlas/security/federation-advanced-options/</url>
<description>Configure advanced options for Federated Authentication in Atlas to control user roles, domain access, and authentication settings.</description>


# Advanced Options for Federated Authentication

- Access: only `Organization Owner`.  
- Open console: Atlas → Organization Settings → Open Federation Management App.

## Default User Role (per org)
1. Console → Organizations → <org>.  
2. Set dropdown “Default User Role”. (Applies only if user lacks existing role.)  
3. Remove via ×.

## Restrict Access by Domain
Effects  
• Only emails with approved domains can be invited.  
• Existing users outside list remain.  
• IdP-mapped domains auto-approved.

Steps  
1. Organizations → <org>.  
2. Advanced Settings → toggle “Restrict Access by Domain”.  
3. Add domains via:  
   • “Add Domains from Existing Members”, check desired.  
   • “Add Domains”, type domain, Add, repeat.  
4. Submit.

## Bypass SAML Mode
- Generates IdP-specific URL that skips SAML; enabled by default.  
- Disable once config verified.

Manage  
Identity Providers → <IdP> → toggle “Bypass SAML Mode” (confirm if disabling).

Sign-in when enabled: use bypass URL + Atlas credentials whose username includes mapped domain and existed pre-federation.

## Restrict User Membership to Federation
Blocks federated users from creating/joining orgs outside federation.

Behavior  
• No external org access/invites.  
• `Organization Owner`s may create new orgs (auto-federated).  
• Non-owners cannot create orgs.  
• Existing external memberships preserved.

Enable  
Advanced Settings → toggle “Restrict Membership”.  
If conflicts exist, banner → “View User Conflicts” to list affected users.

</section>
<section>
<title>Manage Organization Access</title>
<url>https://mongodb.com/docs/atlas/tutorial/manage-organizations/</url>
<description>Manage organization access in Atlas by enabling multi-factor authentication and configuring IP access lists for API and UI.</description>


# Manage Organization Access

• Only `Organization Owners` can modify these settings via Organization Settings (Org menu → ⚙️).  

## Require Multi-Factor Authentication  
1. In Org Settings toggle **Require Multi-Factor Authentication** ON.  
All org users must then enable MFA on their Atlas accounts.

## Require IP Access List – Atlas Administration API  
1. In Org Settings toggle **Require IP Access List for the Atlas Administration API** ON.  
All Admin-API requests must originate from an IP/CIDR present in each API key’s access list. (See API Access Lists endpoint.)

## IP Access List – Atlas UI  
Contact Atlas Support to enable this feature for the org.

### Enable / Configure  
Org Settings → Define IP Access List for the Atlas UI → Configure  
1. Add IPv4/IPv6 address (e.g. `1.2.3.4`, `2001:db8::1`) or CIDR (`1.2.0.0/16`).  
   • List must contain your current IP/CIDR; otherwise **Enable** remains disabled to prevent lockout.  
   • Atlas validates entries; disallows duplicates, malformed/out-of-range, deletion of all or your own IP.  
   • To change an entry, delete then re-add.  
2. Optional description → Add Entry / Add my Current IP Address.  
3. Click **Enable** → confirm.  
After activation only listed IPs can load the org’s Atlas UI; others see:  
```none
You don't have permission to view <url-with-organizationID> in the
Atlas UI. To gain access, ask the organization owner to add your
IP address to the IP access list.
```  
API keys that inherit this list use it for IP restrictions.

### Edit  
Org Settings → Define IP Access List for the Atlas UI → Edit  
• Add/delete entries per rules above.  
• Save disabled if your IP/CIDR missing; add it to re-enable.  
• Click **Save**.

### Disable  
Org Settings → Define IP Access List for the Atlas UI → Disable → confirm.  
• Removes UI IP restrictions for the org; retains the list.  
• API keys that inherited this list stop using it.

</section>
<section>
<title>Manage Organization Settings</title>
<url>https://mongodb.com/docs/atlas/tutorial/manage-organization-settings/</url>
<description>Manage organization settings in Atlas, including adding security contacts, disabling generative AI features, and configuring integrations like Slack and Vercel.</description>


# Manage Organization Settings

Organization Owner role required.

## Navigation
Atlas UI → top bar **Organizations** ➜ select org ➜ **⚙️ Organization Settings**.  
For Integrations page: sidebar **Integrations**.

## Security Contact
Only 1 address. No Atlas access granted. Deletion clears setting.

Add / Update: Organization Settings → Security Contact → enter email → Save  
Delete: clear email → Save

## Disable Generative AI (org-wide)
Organization Settings → toggle **Enable Atlas features that use generative AI** OFF. Project Owners lose ability to enable AI features.

## Live Migration
During Cloud/Ops Manager → Atlas migration, connect to target Atlas organization via above navigation.

## Integrations

### Slack
Integrations → **Add to Slack** → login → Authorize → Save  
Only one workspace per org.  
Remove: Integrations → **Remove Integration** (alerts continue until Slack alert settings are deleted).

### Vercel
See “Integrate with Vercel” to link Atlas clusters to Vercel-deployed apps.

</section>
<section>
<title>Manage Project Access</title>
<url>https://mongodb.com/docs/atlas/tutorial/manage-projects/</url>
<description>Manage projects in Atlas by creating, viewing, moving, or deleting them within an organization.</description>


# Atlas Projects Quick-Ref

Projects isolate envs, users, network, creds, and alert rules inside an Org.

Roles  
• Create – Organization Owner | Organization Project Creator (becomes Project Owner)  
• View – Org Owner | Project Owner | invited user  
• Move – Org Owner of source & dest Orgs  
• Delete – Project Owner or Org Owner

## Create

CLI  
```sh
atlas projects create <projectName> [options]
```

API → `POST /groups` (Create One Project)

UI → Projects → + New Project → Name (≤64 chars, A-Z 0-9 _ -) → Add members & roles → Create.

## View

CLI  
```sh
atlas projects list [opts]
atlas projects describe <ID> [opts]
```

API → `GET /groups/{groupId}` | `GET /groups/byName/{name}`

UI → Projects page (Org menu → Projects / View All Projects).

## Move

UI → Projects → ⋯ → Move Project → choose destination Org → Confirm & Move.  
Notes  
• Clusters stay online; conn strings unchanged.  
• Teams not moved.  
• All project API Keys deleted; recreate after move.  
• Billing hour credited to Org owning project at that hour.

## Delete

Cannot delete if Backup Compliance Policy has snapshots.

Prereqs  
– No active clusters, serverless instances, Charts, Apps, private endpoints, federated DBs.  
– No outstanding invoices.

CLI  
```sh
atlas projects delete <ID> [options]
```

API → `DELETE /groups/{groupId}`

UI  
Projects → ⋯ → Delete Project (or Project Settings → Delete) → MFA code → Delete.

</section>
<section>
<title>Manage Project Settings</title>
<url>https://mongodb.com/docs/atlas/tutorial/manage-project-settings/</url>
<description>Manage project settings in Atlas, including updating settings via the CLI and configuring options like custom DNS, time zone, and performance features.</description>


# Manage Project Settings

Project-wide options. Requires `Project Owner`. Project ID used by API/CLI.

## Atlas CLI

```sh
# View
atlas projects settings describe [flags]

# Update
atlas projects settings update [flags]

# AWS Custom DNS for dedicated clusters
atlas customDns aws enable   [flags]   # expose private-IP conn string
atlas customDns aws disable  [flags]
atlas customDns aws describe [flags]
```

## Atlas UI Settings (Project Settings → Settings)

| Setting | Key Points / Constraints |
|---------|-------------------------|
| Project Name | Editable by `Project/Org Owner`. |
| Time Zone | Affects maintenance & alerts only. |
| Tags | Key-value labels. |
| Connect via Peering Only (GCP/Azure) | Deprecated. Only when no active dedicated GCP/Azure clusters. Use both standard & private IP strings instead. |
| Custom DNS on AWS with VPC Peering | Shows second AWS conn string (private IP). Visible only if AWS peering enabled. |
| Multiple Regionalized Private Endpoints | Enables >1 Private Endpoint per region. Allowed only when project has no non-sharded replica sets. Once multiple endpoints exist, cannot disable. Only sharded clusters allowed after enabling. Connection strings change—update apps. |
| Collect DB Specific Statistics | Toggle database-level metrics. |
| Preferred Cluster Maintenance Start Time | Set hour for weekly maintenance. |
| Project Overview | Toggle Overview landing page. |
| Real Time Performance Panel | Show live DB metrics. |
| Data Explorer | GUI querying; disabling also blocks RTTP slow op termination & index creation from Performance Advisor. |
| Performance Advisor & Profiler | Analyze logs, suggest improvements. |
| Schema Advisor | Data-model suggestions. Disabled on Serverless. |
| Managed Slow Operations | Auto sets slow query threshold; disable for manual value. |
| Enable Extended Storage Sizes | M40+ single-region, General/Low-CPU on AWS/Azure/GCP (specific Azure regions). Slower syncs & restores; consider sharding instead. |
| Delete Charts | Permanently removes Charts instance & data. |
| Delete Project | Only if no Online Archives. Click DELETE. |

User settings → top-right username › Account.

</section>
<section>
<title>View Activity Feed</title>
<url>https://mongodb.com/docs/atlas/tutorial/activity-feed/</url>
<description>Access and filter activity feeds in Atlas to view organization and project events, using the Atlas UI, CLI, or Administration API.</description>


# View Activity Feed

Access  
• Org feed: requires `Organization Member+`  
• Project feed: requires `Project Read Only+`

CLI  
```sh
# org events
atlas events organizations list [--orgId <id>] [--output json] [...]

# project events
atlas events projects list [--projectId <id>] [...]
```

API (Administration)  
GET `/orgs/{orgId}/events`  
GET `/groups/{projectId}/events`

UI  
Org: Organization Settings ► Activity Feed  
Project: Project Activity Feed icon or Project Settings ► Activity Feed

Filtering (UI & API)  
• Start / End date → Apply Dates  
• Select event Categories and/or individual events  
• Project feed can also filter by cluster (active or deleted)

Event Categories (both feeds)  
Access, Alerts, Billing, Organization, Projects, Others  
Project-only adds: Agent, Atlas, Atlas Network & Security, Audit, Backup, Charts, Clusters, Data Federation, Maintenance, Resource Tags, Search, Serverless

Isolate User Activity (Data Explorer)  
Data Explorer operations stop recording usernames after 30 Jun 2025. Use DB audit with role filter:  
```json
{
  "roles": { "$elemMatch": {
    "$or": [
      { "role":"atlasDataAccessReadWrite", "db":"admin" },
      { "role":"atlasDataAccessReadOnly",  "db":"admin" },
      { "role":"atlasDataAccessAdmin",     "db":"admin" }
    ]
} } }
```

</section>
<section>
<title>Manage Your MongoDB Atlas Account</title>
<url>https://mongodb.com/docs/atlas/security/manage-your-mongodb-atlas-account/</url>
<description>Manage your Atlas account settings, unlink from Google or GitHub, configure multi-factor authentication, and change your email or name.</description>


# Manage MongoDB Atlas Account

## Access Account Settings  
Top-menu ➜ click your name ➜ Manage your MongoDB Account. Left nav: Profile Info, Security (MFA), etc.

## Change Login Email  
1. If using Google SSO, unlink first (see Unlink SSO).  
2. Profile Info ➜ Change Email Address.  
3. Enter password (+ MFA if enabled).  
4. New email must not belong to another/deleted account.  
5. Save ➜ verify via link in new mailbox ➜ log in with new email.

## Change Display Name  
Profile Info ➜ edit First/Last Name ➜ Save.

## Unlink SSO (GitHub or Google)  
Profile Info shows linked provider.  
1. Click Unlink from GitHub/Google ➜ Confirm.  
2. Atlas sends password-reset email (valid 2 h).  
3. Reset password (≥8 chars, no email/username, not last 24, not common).  
4. Log in with email + new password.

## Delete Account (irreversible, up to 2 weeks)  
Prereqs: no invoices, clusters, projects, orgs; federated users contact IdP.  
1. Profile Info ➜ Delete Account.  
2. Acknowledge ➜ Confirm Account Deletion.  
3. Identity check:  
   • MFA users: provide code.  
   • Google SSO: email code; SSO unlinked automatically.  
   • Others: re-enter password + email code.  

## Remove All Atlas Resources

### Delete/Terminate Clusters & Serverless  
Clusters page ➜ … menu next to target:  
1. If Termination Protection ON: Edit Config ➜ Additional Settings ➜ toggle OFF ➜ Review ➜ Apply.  
2. … menu ➜ Terminate.  
3. (Optional) toggle “Keep existing snapshots” (only if Cloud Backup enabled).  
4. Type cluster name ➜ Terminate.  
Serverless: same flow.

### Delete Project (Owner or Org Owner)  
After all clusters gone & no invoices:  
Projects view: … ➜ Delete Project  
  or  
Project Settings ➜ Delete.  
Enter MFA code if prompted.

### Leave or Delete Organization  
Leave: Organizations menu ➜ View All ➜ Leave (must promote another Owner first).  
Delete (Org Owner only, no active projects): Organization Settings ➜ Delete ➜ Delete Organization.

Once all clusters, projects, orgs are removed and account deleted, billing stops and email cannot be reused until deletion completes.

</section>
<section>
<title>Interact with Your Data</title>
<url>https://mongodb.com/docs/atlas/atlas-ui/</url>
<description>Manage databases, collections, documents, indexes, and create aggregation pipelines using the Atlas UI.</description>


# Interact with Your Data (Atlas UI)

- Data Explorer lets you: manage databases/collections/documents/indexes, run aggregations, shard Global Clusters, build charts.  
- Serverless: all UI features except Search tab.

Read policy: UI queries primary; if down, any non-hidden, non-delayed secondary.

Data Explorer toggle (Project Settings → Data Explorer):  
• Requires Project Owner / Org Owner.  
• Enabled by default. Off disables:  
  – Terminate slow ops in Real-Time Performance Panel  
  – Create Performance Advisor indexes (must use `mongosh`).

</section>
<section>
<title>Create, View, and Drop Databases</title>
<url>https://mongodb.com/docs/atlas/atlas-ui/databases/</url>
<description>Manage databases in your clusters using the Atlas UI, including creating, viewing, and dropping databases with specific roles required for each action.</description>


# Databases (Atlas UI)

**Roles**  
- Create: Project Owner | Org Owner | Project Data Access Admin | Project Data Access Read/Write  
- View: ≥ Project Data Access Read Only  
- Drop: Project Owner | Project Data Access Admin  

## Create
1. Navigation: Clusters → **Browse Collections**.  
2. **Create Database** → enter `Database Name`, `Collection Name`.  
   Optional:  
   • Capped collection → set max size (bytes).  
   • Time-series → set `timeField`, `granularity`; optional `metaField`, expire-after (seconds).  
3. Click **Create**.

## View
Clusters → **Browse Collections** to open Data Explorer.  
To chart data: **Visualize Your Data** → MongoDB Charts.

## Drop
In Data Explorer, select/hover DB → trash icon → confirm by typing DB name → **Drop**.

</section>
<section>
<title>Create, View, Drop, and Shard Collections</title>
<url>https://mongodb.com/docs/atlas/atlas-ui/collections/</url>
<description>Manage collections in Atlas UI, including creating, viewing, dropping, and sharding collections with required roles.</description>


# Manage Collections in Atlas

## Required Roles
- Create: Project/Org Owner, Project Data Access Admin | RW  
- View: Project Data Access Read Only+  
- Drop: Project Owner, Project Data Access Admin  
- Shard: Project/Org Owner  

## Create Collection (Atlas UI)
1. Clusters → **Browse Collections**.  
2. Hover DB → **+**.  
3. Enter name (avoid sensitive chars; see naming rules).  
4. Optional:  
   • Capped: set max bytes.  
   • Time-series: set time field, granularity, optional meta & expireAfter.  
5. **Create**.

(config & system DBs: no new collections)

## View Collections
Clusters → **Browse Collections** → click DB.  
Document count is from `collStats`; use `db.collection.countDocuments()` for exact count.

### Visualize Data
While viewing a DB/collection click **Visualize Your Data** to open MongoDB Charts.

## Drop Collection
Hover collection → trash icon → type name → **Drop** (deletes docs & indexes).

## Shard Collection
Prereqs: Sharded Atlas cluster, local `mongosh`.

```sh
# Enable DB sharding
sh.enableSharding("<db>")

# (If collection non-empty) index shard key
db.<coll>.createIndex({<shardKey>:1})

# Shard collection
sh.shardCollection("<db>.<coll>", {"<shardKey>":1})
```
Example:
```sh
sh.enableSharding("sample_analytics")
db.sample_analytics.runCommand({
  createIndexes:"customers",
  indexes:[{key:{username:1}, name:"usernameIndex"}],
  commitQuorum:"majority"
})
sh.shardCollection("sample_analytics.customers",{"username":1})
```
Search indexes: expect brief downtime or failed queries until initial sync completes when sharding or adding shards.

</section>
<section>
<title>Create, View, Update, and Delete Documents</title>
<url>https://mongodb.com/docs/atlas/atlas-ui/documents/</url>
<description>Learn how to view documents in MongoDB Atlas, sort query results in MongoDB Atlas, filter query results in MongoDB Atlas, skip documents in MongoDB Atlas, project fields in MongoDB Atlas, apply collation in MongoDB Atlas, update documents in MongoDB Atlas, and delete documents in MongoDB Atlas.</description>


# Atlas UI – Document CRUD & Query

## Access
Roles allowed: `Project/Organization Owner`, `Project Data Access Admin`, `Project Data Access Read/Write`.

## Insert

### One
1. Collections › Find tab › **Insert Document**.  
2. Edit JSON (_id auto-generated, immutable).  
3. **Insert**.

### Many
1. Find tab › **Insert Document** › JSON View.  
2. Enter array:
```json
[{ "name":"Alice","age":26,"email":"alice@abc.com"}, ...]
```  
3. **Insert**.

### Clone
1. Find tab (optionally filter).  
2. Hover doc › clone icon.  
3. Edit fields, then **Insert**.

## View / Query

1. Clusters › **Browse Collections** › select DB & collection › **Find** view.  
   • Up to 0.8 MB per page (≤20 docs).  
2. Query bar fields: Filter, Project, Sort, Collation.

Filter examples
```javascript
{ field: value }
{ field: { $gt: 5 } }
{ created_at: ISODate("2019-01-01T00:00:00Z") }
// Extended JSON
{ created_at: { $gte: { $date: "2019-01-01T00:00-00:00" } } }
```

Project
```javascript
{ year: 1, name: 1 }   // include
{ year: 0, name: 0 }   // exclude
```

Sort
```javascript
{ year: -1, name: 1 }
```

Collation (not Flex/Serverless):
```javascript
{ locale: "zh@collation=pinyin" }
```

Apply button activates when JSON is valid. `$skip` unsupported; use aggregation.

## Edit

1. Find tab (optional filter).  
2. Hover doc › pencil icon.  
3. Modify JSON (add ➕, delete ❌, revert ↩, _id undeletable).  
4. **Update** or **Cancel**.

## Delete

1. Find tab (optional filter).  
2. Hover doc › trash icon → **Delete** to confirm.



</section>
<section>
<title>Create, View, Drop, and Hide Indexes</title>
<url>https://mongodb.com/docs/atlas/atlas-ui/indexes/</url>
<description>Manage indexes in Atlas using the CLI or UI, including creating, viewing, dropping, and hiding indexes for efficient query execution.</description>


# Create, View, Drop, and Hide Indexes

## Roles
- Project/Organization Owner, or Project Data Access Admin

## Limits & Rolling Builds
- ≤3 concurrent builds per cluster.  
- Rolling build: node marked HOST_DOWN; request builds sequentially; aborted builds → run `listIndexes` on all nodes.  
- Atlas cancels & reverts rolling builds that fail on any node.

Unsupported rolling build:
- Unique indexes
- M0, Flex, M2/M5 Shared, Serverless

Common rolling-build failures: key too large, duplicate name, >1 array field, max text index limit reached.

## View Indexes (UI)
Clusters → Browse Collections → select DB & collection → Indexes tab.

## Create Index

### Atlas CLI
```sh
atlas clusters indexes create <indexName> [flags]
```

### Atlas UI
Indexes tab → Create Index  
Key spec:
```javascript
{ <field1>: <type|1|-1>, ... }          // e.g.
{ category: 1, score: -1 }
```
Optional options:
```javascript
{ unique: true,
  name: "idx",
  partialFilterExpression: { status: "A" },
  sparse: true,
  expireAfterSeconds: 3600 }
```
Collation:
```json
{ "locale": "fr", ... }
```
Enable “Build in rolling fashion” if supported.

## Drop Index (UI)
Indexes tab → Action » Drop → type index name → Drop.  
`_id` index cannot be dropped.

## Hide / Unhide Index (UI)
Indexes tab → Action » Hide → Confirm. Repeat to unhide.

## Tips
- Prefer hiding to test impact before dropping.

</section>
<section>
<title>Run Aggregation Pipelines</title>
<url>https://mongodb.com/docs/atlas/atlas-ui/agg-pipeline/</url>
<description>Build and export aggregation pipelines using the Atlas UI, with options to configure settings and preview results.</description>


# Atlas Aggregation Pipeline Builder (UI)

Roles  
- Read pipeline: `Project Data Access Read Only`  
- Write stages (`$out`, `$merge`): `Project Data Access Read/Write`

Open Builder  
1. Choose DB ➔ collection ➔ Aggregation view (empty pipeline).

Build Pipeline  
- Add stage: pick from dropdown, toggle enable.  
- Live preview auto-appends `$limit` 10 (change in Settings).  
- Add stage with “Add Stage” or ➕ after a stage; delete with 🗑.  
- Collation: click Collation, supply doc  
  ```js
  { locale: <str>, caseLevel: <bool>, caseFirst: <str>,
    strength: <int>, numericOrdering: <bool>, alternate: <str>,
    maxVariable: <str>, backwards: <bool> }
  ```
Import from Text  
➕▸New Pipeline from Text → paste pipeline (same syntax as `db.collection.aggregate()` ) → Create New → Confirm.

Reset Pipeline  
Click ➕ (New).

Export to Driver  
Export to Language ➔ pick Java, Node, C#, Python 3.  
Optional “Include Import Statements”. Copy, Close.

Settings (⚙️ icon)  
- Comment Mode: adds helper comments (new stages only). Default On.  
- Number of Preview Documents: 1-20 (default 10).  
Limitation: preview input capped at 100 k docs for `$group/$bucket/$bucketAuto`.

Pipeline builder preview unaffected by production run limits.



</section>
<section>
<title>Atlas Triggers</title>
<url>https://mongodb.com/docs/atlas/atlas-ui/triggers/</url>
<description>Use Atlas Triggers to execute application and database logic in response to events or schedules.</description>


# Atlas Triggers

Atlas Triggers call an Atlas Function when:
- a collection change occurs (Database Trigger)  
- a cron-like time is met (Scheduled Trigger)

## Key Points
- Event object is passed to the linked Function.  
- Execution ≥ 1×; last run time tracked.

## Limits
1. Function limits = Trigger limits.  
2. Concurrency  
   • Ordered: 1 event at a time.  
   • Unordered: up to 10 000 concurrent (can raise on M10+ via Maximum Throughput Triggers).  
   Tips: optimize function logic, project ≤ 2 KB/event, match-filter to drop unneeded events.  
3. Each Database Trigger consumes a cluster change stream; total Triggers ≤ tier’s stream quota (see Service Limitations).

## Duplicate Events
Possible after server failure or unordered suspension/retry. Inspect Trigger logs for “suspended” or failures.

</section>
<section>
<title>Database Triggers</title>
<url>https://mongodb.com/docs/atlas/atlas-ui/triggers/database-triggers/</url>
<description>Use Database Triggers to execute server-side logic when database changes occur.</description>


# Database Triggers

Execute server-side logic on MongoDB Atlas change streams. Scope: Collection, Database, or Deployment (cluster). Not supported on serverless/federated.

## Core Flow
1. Atlas opens 1 change stream per watched collection; all its triggers share it.  
2. Change event ➜ Trigger ➜ Action: Atlas Function or AWS EventBridge.  
3. Optional `$match` (filter) and `$project` (reduce fields).

## Limits & Notes
• Change-stream limits vary by cluster size.  
• No triggers on `admin`,`local`,`config`,`__realm_sync*` when scope=Deployment.  
• Prevent recursion (e.g., trigger writes to same watched namespace).  
• Document preimages need MongoDB 4.4+ (non-sharded) or 5.3+ (sharded); increase storage/CPU.

---

## Create

### Atlas UI
Sidebar ➜ Services » Triggers » Add Trigger » Database Trigger » configure » Save.

### App Services CLI
```bash
appservices login --api-key "<KEY>" --private-api-key "<PRIV>"
appservices pull --remote <AppID> [--local <dir>]
# add JSON in triggers/<name>.json
appservices push
```

---

## Configuration

### Source Options
| Scope | Required fields | Watch ops |
|-------|-----------------|-----------|
| Collection | cluster, db, collection | insert, update, replace, delete |
| Database   | cluster, db            | create/modify/rename/drop/shard/reshard/refineShardKey + Doc ops |
| Deployment | cluster               | dropDatabase |

Common flags:  
• fullDocument (always on for insert/replace, never for delete).  
• documentPreimage (not for insert; disabled on Database/Deployment).  

### Trigger Settings
• autoResume – resume after oplog loss (skips missed events).  
• eventOrdering – on=sequential; off=parallel (needed for Max Throughput).  
• skipEventsOnReEnable – ignore events occurred while disabled.  
• maxThroughput – >10k concurrent (M10+ only, requires eventOrdering=false).

### Action
type: FUNCTION (`function_name`) or EVENTBRIDGE (`event_bus`, etc.).

### Advanced
`project` : inclusive or exclusive object (cannot exclude `operationType`).  
`match`   : `$match` expression to filter events.

---

## Change Event Object (truncated)
```json
{
  "_id": <OID>,
  "operationType": "...",
  "fullDocument": {...},
  "fullDocumentBeforeChange": {...},
  "ns": { "db": "...", "coll": "..." },
  "documentKey": { "_id": <OID> },
  "updateDescription": {...},
  "clusterTime": <TS>
}
```

operationType list: insert|update|replace|delete|createCollection|modifyCollection|renameCollection|dropCollection|shardCollection|reshardCollection|refineCollectionShardKey|createIndexes|dropIndexes|dropDatabase.

---

## Example (CLI)
Trigger:
```json
{
  "type":"DATABASE",
  "name":"shippingLocationUpdater",
  "function_name":"textShippingUpdate",
  "config":{
    "service_name":"mongodb-atlas",
    "database":"store",
    "collection":"orders",
    "operation_types":["UPDATE"],
    "unordered":false,
    "full_document":true
  }
}
```
Function excerpt:
```javascript
exports = async ({updateDescription, fullDocument})=>{
  if (Object.keys(updateDescription.updatedFields).some(f=>/shippingLocation/.test(f))){
     const {customerId,shippingLocation}=fullDocument;
     const loc=shippingLocation.at(-1).location;
     const twilio=require('twilio')(context.values.get("TwilioAccountSID"),
                                   context.values.get("TwilioAuthToken"));
     const customer=await context.services.get("mongodb-atlas")
                      .db("store").collection("customers").findOne({_id:customerId});
     await twilio.messages.create({
        To: customer.phoneNumber,
        From: context.values.get("ourPhoneNumber"),
        Body:`Your order moved to ${loc}.`
     });
  }
}
```

---

## Suspension & Resume

Suspended when change stream invalidated or `ChangeStreamHistoryLost`. Atlas emails owner.

Auto-resume: enable `autoResume`.  
Manual: UI ➜ Triggers » Restart (with/without resume token) OR CLI `appservices push`.

Keep oplog size > peak GB/hr to retain token.

---

## UI Time Stamps
• Last Modified – config change.  
• Latest Heartbeat – last run or heartbeat.  
• Last Cluster Time Processed – last event time.

---

## Performance Tips
1. Disable eventOrdering for burst workloads.  
2. Disable collection-level preimages if not needed.  
3. Use `$match` to cut invocations; test via mongosh:
   ```js
   db.getSiblingDB(db).coll.watch([{$match: {YOUR_EXPR}}])
   ```
4. Use `$project` to shrink event payloads (ex: keep `operationType` & needed fields).

```json
{ "_id":0, "operationType":1, "updateDescription.updatedFields.status":1 }
```

</section>
<section>
<title>Scheduled Triggers</title>
<url>https://mongodb.com/docs/atlas/atlas-ui/triggers/scheduled-triggers/</url>
<description>Use scheduled Triggers to to react to authentication events.</description>


# Scheduled Triggers

Run Atlas Functions or publish to AWS EventBridge on a fixed schedule.

## Create

### Atlas UI
Triggers → Add Trigger → Type: Scheduled → configure (see below) → Save.

### App Services CLI
```bash
appservices login --api-key="<API>" --private-api-key="<PRIVATE>"
appservices pull --remote=<AppID> [--local <dir>]
# ./triggers/<file>.json
{
  "type":"SCHEDULED",
  "name":"<Name>",
  "function_name":"<Func>",
  "config":{"schedule":"<CRON>"},
  "disabled":false
}
# Basic schedules not supported; CRON required.
appservices push
```

## Config Fields
- `type`: "SCHEDULED"
- `name`: trigger name
- `function_name`: Function to run (no args) or AWS EventBridge.
- `config.schedule`: Basic (every N min/hr/day) or CRON string (UTC). **Required**
- `skip_catchup_event` (bool): ignore events missed while disabled.
- `disabled` (bool)

## CRON Syntax

```
* * * * *
│ │ │ │ └─ weekday 0-6 (SUN-SAT)
│ │ │ └── month   1-12 or JAN-DEC
│ │ └──── day     1-31
│ └────── hour    0-23
└──────── minute  0-59
```

Field values:  
* (all) | `n` (value) | `a,b,c` (list) | `a-b` (range) | `*/s` (step, minute/hour only)

Examples  
• Every minute: `* * * * *`  
• 11 AM daily: `0 11 * * *`  
• 7 AM Jan, Mar, Jul: `0 7 * 1,3,7 *`  
• 0,25,50 min each hour: `*/25 * * * *`

## Example

Trigger file:
```json
{
  "type":"SCHEDULED",
  "name":"reportDailyOrders",
  "function_name":"generateDailyReport",
  "config":{"schedule":"0 7 * * *"},
  "disabled":false
}
```

Function (excerpt):
```javascript
exports = async () => {
  const db = context.services.get("mongodb-atlas").db("store");
  const report = await db.collection("orders").aggregate([
    {$match:{orderDate:{$gte:makeYesterday(),$lt:makeToday()}}},
    {$addFields:{shipped:{$cond:{if:"$shipDate",then:1,else:0}}}},
    {$unwind:"$orderContents"},
    {$group:{
      _id:null,
      orderIds:{$addToSet:"$_id"},
      numSKUsOrdered:{$sum:1},
      numItemsOrdered:{$sum:"$orderContents.qty"},
      totalSales:{$sum:"$orderContents.price"},
      avgOrderSales:{$avg:"$orderContents.price"},
      numItemsShipped:{$sum:"$shipped"}
    }},
    {$addFields:{numOrders:{$size:"$orderIds"}}}
  ]).next();
  await db.collection("reports").insertOne(report);
};
```

## Performance
Filter early (e.g., `$match`) to cut documents and memory use.

</section>
<section>
<title>Authentication Triggers</title>
<url>https://mongodb.com/docs/atlas/atlas-ui/triggers/authentication-triggers/</url>
<description>Use authentication Triggers to react to authentication events.</description>


# Authentication Triggers

Deprecation: Atlas Device SDKs end-of-life Sep 2025; auth Triggers will then stop firing.

Config  
- `Trigger Type`: `AUTHENTICATION`  
- `Trigger Name`  
- `Linked Function`: called with one arg `authEvent`  
- `Operation Type`: `LOGIN`, `CREATE`, `DELETE`  
- `Providers`: provider IDs to watch  

authEvent
```jsonc
{
  "operationType": "LOGIN|CREATE|DELETE",
  "providers": [
    "anon-user","local-userpass","api-key",
    "custom-token","custom-function",
    "oauth2-facebook","oauth2-google","oauth2-apple"
  ],         // DELETE includes all linked providers
  "user": {...},         // Realm user object
  "time": "2024-01-01T00:00:00Z"
}
```

Example: create customer doc on new email/password user.
```javascript
exports = async ({user})=>{
  const c=context.services.get("mongodb-atlas")
           .db("store").collection("customers");
  return user.identities.length>1
    ? c.updateOne({id:user.id},{$set:{identities:user.identities}})
    : c.insertOne({_id:user.id,...user});
};
```

</section>
<section>
<title>Disable a Trigger</title>
<url>https://mongodb.com/docs/atlas/atlas-ui/triggers/disable/</url>
<description>Learn how to disable Triggers and why you might want to do so.</description>


# Disable a Trigger

Triggers may self-suspend (e.g., network / cluster changes). A suspended Trigger is **disabled**, emits no events, and Atlas emails the project owner.

## Manually Disable

### Atlas UI
1. Select Organization → Project.  
2. Sidebar ➜ Services ➜ **Triggers**.  
3. Toggle **Enabled** off, click **Save**.

### App Services CLI
```sh
# login
appservices login --api-key="<API KEY>" --private-api-key="<PRIVATE KEY>"

# pull config
appservices pull --remote=<App ID> [--local <dir>]

# edit /triggers/<trigger>.json
{
  ...,
  "disabled": true
}

# deploy
appservices push
```

## Snapshot Restore Effects
• Restoring a snapshot re-enables any disabled/suspended Triggers.  
• Newly inserted docs (while disabled) are processed; previously handled events are ignored.  
• During restore, enabled Triggers show a temporary connection error; clears when restore ends.

</section>
<section>
<title>Send Trigger Events to AWS EventBridge</title>
<url>https://mongodb.com/docs/atlas/atlas-ui/triggers/aws-eventbridge/</url>
<description>Learn how to set up AWS EventBridge to handle Atlas Trigger events.</description>


# Send Trigger Events to AWS EventBridge

– Any Atlas Trigger can forward events to AWS EventBridge (≤ 256 KB/entry).  
– DB Triggers support `error_handler` Functions to prevent unwanted suspension.

## 1 Setup in AWS

1. AWS Console → EventBridge → Partner event sources.  
2. Choose MongoDB → Set up → copy **AWS Account ID**.

## 2 Create/Update Trigger

### Atlas UI
• New/Existing DB or Scheduled Trigger  
  – Event type: **EventBridge**  
  – AWS Account ID, Region  
  – (DB only) select **Error Function**  
  – Optional: Enable Extended JSON

### App Services CLI
```shell
appservices login --api-key="<PUBLIC>" --private-api-key="<PRIVATE>"
appservices pull --remote=<AppID> [--local <dir>]
```
`/triggers/<name>.json`:
```json
{
  "name": "...",
  "type": "...",
  "event_processors": {
    "AWS_EVENTBRIDGE": {
      "config": {
        "account_id": "<AWS Account ID>",
        "region": "<AWS Region>",
        "extended_json_enabled": true
      }
    }
  },
  "error_handler": {          // DB Trigger only
    "config": {
      "enabled": true,
      "function_name": "myErrorHandler"
    }
  }
}
```
Deploy:  
```shell
appservices push
```

### Admin API (minimal)
1. POST /auth/providers/mongodb-cloud/login → `access_token`.  
2. (opt) POST /drafts  
3. POST /functions (create handler)  
4. POST /triggers (include `event_processors.AWS_EVENTBRIDGE` + `error_handler`)  
5. (opt) POST /drafts/{id}/deployment

## 3 Associate Source with Event Bus

AWS Console → Partner event sources → select **Pending** source → **Associate with event bus**.  
Status changes to **Active**; create EventBridge rules as needed.

## 4 Custom Error Handling (DB Triggers)

Function signature:
```js
exports = async (error, changeEvent) => {
  if (error.code === 'DOCUMENT_TOO_LARGE') {
    console.log('Skip large doc');                // omit throw to continue
    return;
  }
  console.log(`Err: ${error.message}`);
  throw new Error(error.message);                 // suspend Trigger
};
```

### Error object
• `code`: `DOCUMENT_TOO_LARGE` (PutEvents > 256 KB) or `OTHER`  
• `message`: raw AWS error string

### Logs
UI: Triggers → Logs → “Show errors only”  
CLI: `appservices logs list --type=trigger_error_handler`  
API: GET /logs?type=TRIGGER_ERROR_HANDLER

## 5 Performance Tips

Event entry must be < 256 KB. Use Database Trigger Project Expression to include only required fields.

</section>
<section>
<title>Atlas Functions</title>
<url>https://mongodb.com/docs/atlas/atlas-ui/triggers/functions/</url>
<description>Define Atlas Functions to execute server-side JavaScript code.</description>


# Atlas Functions

Server-side ES6+ JavaScript that runs on Atlas-managed infrastructure (serverless). Each `.js` file must `exports = function(...) { ... }`. Functions can import Node built-ins, npm packages, use async/await, call other functions, access `context` (user, http, services, etc.).

```javascript
// examples
exports = name => `Hello, ${name ?? "stranger"}!`;

exports = async function getWeather() {
  const city = context.user.custom_data.city;
  const { URL } = require("url");
  const url = new URL("https://example.com/weather");
  url.search = `?location=${city}`;
  const res = await context.http.get({ url: url.toString(), headers:{Accept:["application/json"]}});
  return JSON.stringify(JSON.parse(res.body.text()));
};
```

Returned values are EJSON; wrap with `JSON.stringify()` if plain JSON required.

## Limits
• ≤300 s runtime • ≤350 MB RAM • ≤1000 async ops • ≤25 `net` sockets • req args ≤18 MB.

## Create / Edit

### Atlas UI
Triggers → Linked App Service → Functions → Create a Function.

Settings:  
• Name (unique; path `functions/<name>.js`, nested via `folder/func`).  
• Authentication:
  – `System` (full access).  
  – `Script` (run as user id returned by custom function).  
  *`Application` & `User ID` deprecated.*  
• disable_arg_logs (Log Function Arguments).  
• can_evaluate expression (dynamic authorization; e.g. block IPs).  
• private (hide from client SDKs).  
Save → code in Editor tab → Save.

### App Services CLI
```sh
appservices login --api-key="<ID>" --private-api-key="<SECRET>"
appservices pull --remote=<AppID> [--local=<dir>]

# new function file
mkdir -p functions/utils
touch functions/utils/add.js
```

`functions/utils/add.js`:
```javascript
exports = (a,b)=>a+b;
```

Add to `functions/config.json`:
```json
{
  "name": "utils/add",
  "private": false,
  "can_evaluate": {},
  "disable_arg_logs": false,
  "run_as_system": true,
  "run_as_user_id": "",
  "run_as_user_id_script_source": ""
}
```
Auth variants:  
• System: `"run_as_system": true`.  
• Script: `"run_as_user_id_script_source": "<code>"`.  
• User (deprecated): `"run_as_user_id": "<UserID>"`.

Deploy:
```sh
appservices push
```

## Call a Function

### From another Function
```javascript
exports = (a,b)=>context.functions.execute("utils/add",a,b);
```

### From CLI
```sh
appservices function run --name=utils/add --args=1 --args=2 [--user=<UserID>]
```
Returns EJSON result plus logs/errors.

## Serialization Reference
```javascript
exports = ()=>({pi:3.14,date:new Date()});
/* returns
{"pi":{"$numberDouble":"3.14"},"date":{"$date":{"$numberLong":"..."} }}
*/
```

Use `JSON.stringify()` to emit plain JSON.

</section>
<section>
<title>Context</title>
<url>https://mongodb.com/docs/atlas/atlas-ui/triggers/functions/context/</url>
<description>Learn about the global context object available in Atlas Functions.</description>


# Atlas App Services `context` Object

`context` is a global read-only object available in Atlas Functions.

```js
context = {
  app,            // metadata
  environment,    // env tag & values
  functions,      // call other Functions
  http,           // HTTPS client
  request,        // incoming req metadata
  services,       // linked data sources
  user,           // caller info
  values          // static values / secrets
}
```

## App Metadata (`context.app`)
```jsonc
{
  id,               // "60c8e59866b0c33d14ee634a"
  clientAppId,      // "myapp-abcde"
  name,             // "myapp"
  projectId,        // Atlas project id
  deployment: {     // { model:"LOCAL", providerRegion:"aws-us-east-1" }
    model,
    providerRegion
  },
  lastDeployed,     // ISODate
  hostingUri        // if static hosting enabled
}
```

## Call Another Function (`context.functions.execute`)
```js
await context.functions.execute(fnName, ...args);
```
```js
exports = (a,b)=>context.functions.execute("sum",a,-b);
```

## Environment (`context.environment`)
```js
context.environment.tag  // "", "development", "testing", "qa", "production"
context.environment.values // { <name>:<value> }
```

## Services (`context.services.get`)
```js
const mdb = context.services.get("mongodb-atlas"); // or other service name
const docs = await mdb.db("myApp").collection("myColl").find({name:"Rupert"});
```

## Request Metadata (`context.request`)
No body payloads; example shape:
```jsonc
{
  remoteIPAddress,
  requestHeaders,   // {Header:[val]}
  webhookUrl?, httpMethod?, rawQueryString,
  httpReferrer?, httpUserAgent?,
  service?, action?
}
```
Security: query params whose key=`secret` are stripped from `rawQueryString`.

## User (`context.user`)
```jsonc
{
  id,                 // stringified ObjectId
  type,               // "normal" | "server" | "system"
  data,               // merged provider data
  custom_data,        // document (≤16 MB) from custom user data collection
  identities:[        // per-provider metadata
    { id, provider_type, data }
  ]
}
```
```js
if (context.runningAsSystem()) { /* system user */ }
```

## Static Values (`context.values.get`)
```js
const theme = context.values.get("theme"); // undefined if missing
```

## HTTP Client (`context.http`)
Each method returns a Response whose `body` is `BSON.Binary`.
```js
await context.http.get   ({url});
await context.http.post  ({url,body,encodeBodyAsJSON:true});
await context.http.put   ({url,body,encodeBodyAsJSON:true});
await context.http.patch ({url,body,encodeBodyAsJSON:true});
await context.http.delete({url});
await context.http.head  ({url});
```
Parse body:
```js
EJSON.parse(res.body.text());
```

</section>
<section>
<title>Global Modules</title>
<url>https://mongodb.com/docs/atlas/atlas-ui/triggers/functions/globals/</url>
<description>Learn how to use the MongoDB Query API in an Atlas function to aggregate documents in your Atlas cluster.</description>


# Global Modules

All serverless functions expose these globals:

- utils.jwt – JWT encode/decode  
- utils.crypto – Encrypt/Decrypt/Sign/Verify/HMAC/Hash  
- JSON – std JSON parse/stringify  
- EJSON – Extended JSON parse/stringify  
- BSON – BSON types & helpers  

---

## utils.jwt

```ts
utils.jwt.encode(
  signingMethod: string,      // HS256|HS384|HS512|RS256|RS384|RS512|
                              // ES256|ES384|ES512|PS256|PS384|PS512
  payload: object,
  secret: string,             // random str or PKCS#8 private key
  customHeader?: object
): string
```

```ts
utils.jwt.decode(
  jwtString: string,
  key: string,                // same secret/public-key
  returnHeader?: boolean,
  acceptedSigningMethods?: string[]
): object | {header:object,payload:object}
```

---

## utils.crypto

### encrypt / decrypt (AES only)

```ts
utils.crypto.encrypt("aes", msg: string, key: string): BSON.Binary
utils.crypto.decrypt("aes", bin: BSON.Binary, key: string): BSON.Binary
```
Key must be 16/24/32-byte random string.

### sign / verify (RSA)

```ts
utils.crypto.sign(
  "rsa", msg: string, privateKey: string, scheme?: "pss"|"pkcs1v15"
): BSON.Binary

utils.crypto.verify(
  "rsa", msg: string, publicKey: string,
  signature: BSON.Binary, scheme?: "pss"|"pkcs1v15"
): boolean
```
Keys must be PKCS#1 PEM (`-----BEGIN RSA ... KEY-----`).

### hmac

```ts
utils.crypto.hmac(
  input: string,
  secret: string,
  hashFn: "sha1"|"sha256"|"sha512",
  outFmt: "hex"|"base64"
): string
```

### hash

```ts
utils.crypto.hash(
  hashFn: "sha1"|"sha256"|"md5",
  input: string|BSON.Binary
): BSON.Binary
```

---

## JSON (std)

```ts
JSON.parse(jsonStr: string): object
JSON.stringify(obj: object): string
```

---

## EJSON (preserves BSON types)

```ts
EJSON.parse(ejsonStr: string): object
EJSON.stringify(obj: object): string
```

---

## BSON Helpers

Types: ObjectId, BSONRegExp, Binary, MaxKey, MinKey, Int32, Long, Double, Decimal128

### ObjectId
```ts
new BSON.ObjectId(id?: string)
```

### BSONRegExp
```ts
new BSON.BSONRegExp(pattern: string, flags?: string)
```

### Binary
```ts
BSON.Binary.fromHex(hex: string, subType?: number): BSON.Binary
BSON.Binary.fromBase64(b64: string, subType?: number): BSON.Binary
BSON.Binary.prototype.toHex(): string
BSON.Binary.prototype.toBase64(): string
BSON.Binary.prototype.text(): string
```

### Int32 / Long / Double / Decimal128
```ts
BSON.Int32(n?: number)
BSON.Long(low32?: number, high32?: number)
BSON.Double(n?: number)
BSON.Decimal128.fromString(str: string)
```

### MaxKey / MinKey usage
```js
collection.findOne({field: {$lt: BSON.MaxKey}})
collection.findOne({field: {$gt: BSON.MinKey}})
```

</section>
<section>
<title>External Dependencies</title>
<url>https://mongodb.com/docs/atlas/atlas-ui/triggers/functions/dependencies/</url>
<description>Learn what modules are available in Atlas Functions.</description>


# Atlas Functions – External Dependencies

External deps = any npm/built-in Node.js lib you add to Atlas Functions/Triggers. Atlas transpiles them automatically.

Only one source of truth: last added method overrides earlier.

## Add Packages (UI)

Project → Triggers → select Trigger → Function → **Add Dependency**  
Fields:  
• Package Name (required)  
• Version (optional, default=latest)

Success/failure shown in progress tracker; listed in Dependencies tab.

## Upload `node_modules` Archive (≤15 MB)

1. Locally:  
```shell
npm install <pkg>   # or npm i from package.json
tar -czf node_modules.tar.gz node_modules/
```  
2. UI: Triggers → Dependencies tab → **Upload Folder** → choose archive → Add.  
Drafts: click Review & Deploy. Change effective in 5–60 s.

Uploading removes prior deps.

Supported formats: .tar, .tar.gz, .tgz, .zip.

## Import in Function (must be inside function scope)

```javascript
exports = () => {
  const R = require("ramda");          // full module
  return R.map(x => x*2, [1,2,3]);
};

exports = () => {
  const cloneDeep = require("lodash/cloneDeep"); // subfolder
  // ...
};
```

</section>
<section>
<title>JavaScript Support</title>
<url>https://mongodb.com/docs/atlas/atlas-ui/triggers/functions/javascript-support/</url>
<description>Learn what JavaScript APIs Atlas Functions support.</description>


# JavaScript Support

ES5 + nearly all ES2015+ syntax  
Unsupported only: RegExp `-y` / `-u` flags.

Supported syntax features: arrow functions, classes, `super`, generators, default/rest params, spread, object literal ext, `for…of` / `for await…of`, octal / binary literals, template literals, destructuring, `new.target`, `**`.

Built-in objects: ✅ Map, Promise, Set, Symbol, TypedArray, WeakMap. ❌ BigInt, Proxy, Reflect, WeakSet.  
Methods/props: ✅ Object.*, String.*, String.prototype, Array.prototype, Function.name. ❌ RegExp.prototype props, Array.*, Number.*, Math.*.

Node built-ins (Node 10.18.1 API):

Fully supported: `assert, buffer, events, net, os, path, punycode, querystring, stream, string_decoder, timers, tls, tty, url, zlib`.

```javascript
// punycode shim
const punycode = require("punycode");
```

Partially supported  
• dgram: ✅ addMembership, address, bind, close, createSocket, dropMembership, send, setBroadcast, setMulticastLoopback, setMulticastTTL; ❌ ref, setTTL, unref  
• dns: Promises API & resolver.cancel() ❌  
• fs: ✅ accessSync, constants, lstatSync, readFileSync, statSync  
• http/https: all client APIs ✅; Server class ❌. http2 client only. Use axios v1.3.6 for requests.  
• process: ✅ hrTime, nextTick, version, versions  
• util: TextEncoder / TextDecoder ❌  
• crypto: createDiffieHellman(), createDiffieHellmanGroup(), createECDH() ❌

Unsupported modules: `child_process, cluster, domain, readline, v8, vm`.

</section>
<section>
<title>Read Data from MongoDB Atlas - Functions</title>
<url>https://mongodb.com/docs/atlas/atlas-ui/triggers/functions/read/</url>
<description>Use Atlas Functions to query and read data from MongoDB Atlas.</description>


# Read Data from MongoDB Atlas – Functions

## Setup
```js
const mongodb = context.services.get("mongodb-atlas");
const itemsCollection = mongodb.db("store").collection("items");
```

## CRUD Read

```js
// findOne
itemsCollection.findOne({quantity:{$gte:25}},{title:1,quantity:1});

// find many
itemsCollection.find({"reviews.0":{$exists:true}},{_id:0})
  .sort({name:1}).toArray();

// count
itemsCollection.count({"reviews.0":{$exists:true}});
```

## Query Patterns
```js
// by _id
{_id:BSON.ObjectId("5ad84b81b8b998278f773c1b")}

// by date
{createdAt:new Date("2019-01-23")}
{createdAt:{$gte:new Date("2019-01-01"),$lt:new Date("2020-01-01")}}

// root & multiple fields
{name:"Basketball"}
{name:"Basketball",quantity:{$gt:0}}

// embedded field
{"reviews.0.username":"JoeMango"}

// array exact vs contains all
{reviews:[{username:"JoeMango",comment:"This rocks!"}]}
{reviews:{$all:[{username:"JoeMango",comment:"This rocks!"}]}}

// array element any vs single
{reviews:{username:"JoeMango",comment:"This is a great product!"}}
{reviews:{$elemMatch:{username:"JoeMango",comment:"This is a great product!"}}}
```

## Operators

Comparison: `$eq` `$ne` `$gt` `$gte` `$lt` `$lte` `$in` `$nin`  
Logical: `$and` `$or` `$nor` `$not`

```js
// compare
{quantity:{$gt:0,$lte:10}}

// logical
{$or:[{quantity:{$gt:0}},{reviews:{$size:{$lte:5}}}]}

// regex
{name:{$regex:BSON.BSONRegExp(".+ball","i")}}
```

</section>
<section>
<title>Write Data in MongoDB Atlas - Functions</title>
<url>https://mongodb.com/docs/atlas/atlas-ui/triggers/functions/write/</url>
<description>Use Atlas Functions to write data to MongoDB Atlas.</description>


# Write Data in MongoDB Atlas – Functions

```javascript
// Function boilerplate
exports = function() {
  const db  = context.services.get("mongodb-atlas").db("store");
  const items = db.collection("items");
  const purchases = db.collection("purchases");
};
```

## Sample Collection (`store.items`)
```json
{ "_id": "...", "name": "lego", "quantity": 10, "reviews":[{ "username":"a","comment":"c"}] }
```

---

## Insert

### insertOne
```javascript
await items.insertOne({
  name:"Plastic Bricks",
  quantity:10,
  category:"toys",
  reviews:[{username:"legolover",comment:"These are awesome!"}]
});
```

### insertMany
```javascript
await items.insertMany([
  {name:"basketball",category:"sports",quantity:20,reviews:[]},
  {name:"football",  category:"sports",quantity:30,reviews:[]}
]);
```

---

## Update
Note: Atlas Functions add/remove `_id__baas_transaction`; `$unset` it if editing with other tools.

### updateOne
```javascript
await items.updateOne(
  {name:"lego"},
  {$set:{name:"blocks",price:20.99,category:"toys"}},
  {upsert:false}
);
```

### updateMany
```javascript
await items.updateMany({}, {$mul:{quantity:10}});
```

### Upsert
```javascript
await items.updateOne(
  {name:"board game"},
  {$inc:{quantity:5}},
  {upsert:true}
);
```

### Field Operators (syntax)
```
$set  : {"field":value}
$rename: {"old":"new"}
$inc  : {"field":±N}
$mul  : {"field":N}
```

### Array Operators (syntax)
```
$push : {"arr":value}
$pop  : {"arr":1|-1}
$addToSet:{"arr":value}
$pull : {"arr":condition}
$[]   : update all elems   e.g. {$inc: {"grades.$[]":10}}
$[<id>]: filtered elems    arrayFilters:[{<id>:condition}]
```

---

## Delete

### deleteOne
```javascript
await items.deleteOne({name:"lego"});
```

### deleteMany
```javascript
await items.deleteMany({reviews:{$size:0}});
```

---

## Bulk Writes
```javascript
await purchases.bulkWrite(
  [{insertOne:{document:{name:"velvet elvis",quantity:20,reviews:[]}}},
   {insertOne:{document:{name:"mock turtleneck",quantity:30,reviews:[]}}}],
  {ordered:true}
);
```

---

## Transactions (multi-document)

```javascript
exports = async () => {
  const client = context.services.get("mongodb-atlas");
  const db = client.db("exampleDatabase");
  const accounts = db.collection("accounts");
  const trades = db.collection("browniePointsTrades");

  // create sample users
  await accounts.insertMany([
    {name:"henry",browniePoints:42},
    {name:"michelle",browniePoints:144}
  ]);

  // atomic trade
  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      await accounts.updateOne({name:"michelle"},{$inc:{browniePoints:-5}},{session});
      await accounts.updateOne({name:"henry"},   {$inc:{browniePoints:5}}, {session});
      await trades.insertOne({add:"henry",sub:"michelle",points:5},{session});
    }, {readPreference:"primary",readConcern:{level:"local"},writeConcern:{w:"majority"}});
  } finally { await session.endSession(); }
  return "Traded brownie points.";
};
```

</section>
<section>
<title>Aggregate Data in MongoDB Atlas - Functions</title>
<url>https://mongodb.com/docs/atlas/atlas-ui/triggers/functions/aggregate/</url>
<description>Learn how to use the MongoDB Query API in an Atlas Function to aggregate documents in your Atlas cluster.</description>


# Aggregate Data in Atlas Functions

## Get Collection
```js
const db = context.services.get("mongodb-atlas").db("store");
const purchases = db.collection("purchases");
```

## Aggregate Example
```js
const pipeline = [
  {$group:{
    _id:"$customerId",
    numPurchases:{$sum:1},
    numItemsPurchased:{$sum:{$size:"$items"}}
  }},
  {$addFields:{
    averageNumItemsPurchased:{
      $divide:["$numItemsPurchased","$numPurchases"]
    }
  }}
];
return purchases.aggregate(pipeline).toArray();
```

## Atlas Search
```js
exports = async () => {
  const movies = context.services.get("mongodb-atlas")
    .db("sample_mflix").collection("movies");
  return movies.aggregate([
    {$search:{text:{query:"baseball",path:"plot"}}},
    {$limit:5},
    {$project:{_id:0,title:1,plot:1}}
  ]).toArray();
};
```
• Runs as system user; fields without read access are omitted.  
• `$$SEARCH_META` defined only for system functions or when first collection role has `apply_when` & `read` = true.

## Stage Cheatsheet

`$match`
```js
{$match:{graduation_year:{$gte:2019,$lte:2024}}}
```

`$group`
```js
{$group:{_id:"$customerId",numPurchases:{$sum:1}}}
```

`$project`
```js
{$project:{_id:0,customerId:1,
           numItems:{$sum:{$size:"$items"}}}}
```

`$addFields`
```js
{$addFields:{numItems:{$sum:{$size:"$items"}}}}
```

`$unwind`
```js
{$unwind:{path:"$items",
          includeArrayIndex:"itemIndex",
          preserveNullAndEmptyArrays:false}}
```

## Limits
• Methods: `db.aggregate()` and `db.collection.aggregate()`.  
• All stages/operators allowed for system user except `$indexStats`.

</section>
<section>
<title>Define and Manage Secrets</title>
<url>https://mongodb.com/docs/atlas/atlas-ui/triggers/functions/secrets/</url>

# Secrets

Private, write-only Values stored in Atlas App Services for sensitive data (API keys, etc.).  

General rules  
- Max 500 chars per secret value.  
- Name ≤ 64 ASCII letters, numbers, `_` or `-`; must start with letter/number; unique in project.  
- After save, value is unreadable; access only through a linked non-secret Value in Functions (`context.values.<name>`).  

## CLI Reference (App Services)

```shell
# Login
appservices login --api-key="<PUBLIC>" --private-api-key="<PRIVATE>"

# Pull app config
appservices pull --remote=<AppID> [--local=<dir>]

# Create
appservices secrets create   --app=<AppID> --name="<Name>" --value="<Value>"

# List
appservices secrets list     --app=<AppID>

# Update (name and/or value)
appservices secrets update   --app=<AppID> --secret="<ID|Name>" \
                             --name="<NewName>" --value="<NewValue>"

# Delete (comma-sep allowed)
appservices secrets delete   --app=<AppID> --secret=<ID|Name>[,<ID|Name>...]

# Deploy changes
appservices push
```

## Atlas UI Quick Path

Triggers → Linked App Service → Build › Values  
• Create Value → type = Secret → enter name & value → Save/Deploy  
• Edit/Delete via row ⋮ menu.

## Using a Secret in Functions

1. In Values, create a regular Value that *links* to the Secret.  
2. Access in code:

```javascript
const apiKey = context.values.get("LinkedValueName");
```

</section>
<section>
<title>MongoDB API Reference</title>
<url>https://mongodb.com/docs/atlas/atlas-ui/triggers/functions/api/</url>
<description>Learn how to use Functions to query a MongoDB Atlas data source.</description>


# MongoDB Atlas JavaScript Quick Ref

Common:
- `query`: MongoDB filter (`{}` matches all).
- `projection`: include(1)/exclude(0) fields; can’t mix except `_id`.
- `options.session`: `ClientSession` for xacts.
- Cursor: `next()`, `toArray()`, `skip(n)`, `limit(n)`, `sort(spec)` (1 asc, -1 desc). Call before retrieval.

## Service & DB Handles
```js
const svc = context.services.get("mongodb-atlas");
const admin = svc.admin();                // AdminDatabase
admin.getDBNames(): string[]

const db = svc.db("name");                // Database
db.getCollectionNames(): string[]
const coll = db.collection("name");       // Collection
```

## Read
```ts
find(q?, proj?, opt?): Cursor
findOne(q?, proj?, opt?): Promise<O|null>
count(q?, opt?): Promise<number>
distinct(field, q, opt?): Promise<any[]>
aggregate(pipe[], opt?): Cursor         // All stages except $indexStats
```

## Write (single-op)
```ts
insertOne(doc): Promise<{insertedId:string}>
updateOne(q, upd, opt?): Promise<{matchedCount:number, modifiedCount:number, upsertedId?:string}>
deleteOne(q, opt?): Promise<{deletedCount:number}>
```

## Write (multi-doc / atomic)
```ts
insertMany(docs[], {ordered=true}?): Promise<{insertedIds:string[]}>
updateMany(q, upd, opt?): Promise<{matchedCount, modifiedCount, upsertedId?}>
deleteMany(q, opt?): Promise<{deletedCount:number}>
```

## Find-and-Modify
```ts
findOneAndUpdate(q, upd, {
  upsert?, sort?, projection?, returnNewDocument?, session?
}): Promise<O|null>

findOneAndReplace(q, replacement, sameOpts): Promise<O|null>

findOneAndDelete(q, {sort?, projection?, session?}?): Promise<O|null>
```

## Bulk
```ts
bulkWrite(ops[], {
  ordered=true, bypassDocumentValidation=false, session?
}): Promise<null>

// op examples
{ insertOne:{document:{a:1}} }
{ updateOne:{filter:{a:2}, update:{$set:{a:2}}, upsert:true} }
{ deleteMany:{filter:{c:1}} }
```

Return notes:  
- `insertMany/insertOne`: IDs of new docs.  
- `update*`: matched/modified counts, `upsertedId` if upsert.  
- `delete*`: `deletedCount`.  
- Find-and-* default returns pre-change doc; set `returnNewDocument:true` for post-change.

</section>
<section>
<title>Define and Access Values</title>
<url>https://mongodb.com/docs/atlas/atlas-ui/triggers/functions/values/</url>
<description>Define and access Values to use in Atlas Functions.</description>


# Values

Static app config accessible in Atlas Functions. Types:  
• plain JSON (string/array/object)  
• secret reference.

## Create

### Atlas UI
1. Org → Project → Services ▸ Triggers → Linked App Service → Build ▸ Values → Create a Value.  
2. Name ≤ 64 chars, `[A-Za-z0-9_-]`, first char alnum.  
3. Select type:  
   • Custom Content → enter JSON.  
   • Link to Secret → choose existing or create new secret.  
4. Save.

### App Services CLI
```sh
appservices login --api-key "<API>" --private-api-key "<PRIVATE>"
appservices pull --remote <AppID> [--local <dir>]
```
Create `values/<ValueName>.json`:
```json
{
  "name": "<ValueName>",
  "from_secret": false,      // true to expose secret
  "value": { /* JSON or secret name */ }
}
```
Deploy:  
```sh
appservices push
```

## Use in Function
```javascript
const val = context.values.get("<ValueName>");
```

</section>
<section>
<title>Trigger Logs</title>
<url>https://mongodb.com/docs/atlas/atlas-ui/triggers/logs/</url>
<description>Monitor your App activity through logs of application events, metrics, and notifications.</description>


# Trigger Logs

- Atlas records Trigger, Function, and Change Stream events; visible in project activity feed; retention: 10 days (download/API or forward elsewhere before expiry).  
- Status: `OK` (success) or `Error` (e.g., missing rule, uncaught error/promise, `context.services.get()` unknown).  
- Query: max 100 entries/page; filter by type, status, timestamp, user, requestId.  
- `console.log()`: each line ≤512 bytes; only first 25 lines saved per entry.  
- Alerts: Trigger failures publish to activity feed; App Metrics available separately.

```javascript
Logs: [ <log line>, … ]      // up to 25 lines, 512 B each
See Function. See Trigger.    // links
Compute Used: <bytes•ms>
```

Fields:  
- Compute Used – computational load.  
- Logs – stored `console.log()` output.  
- Links – origin Trigger & Function.  
Error entries add: `Error` – brief description.

</section>
<section>
<title>Triggers Limitations</title>
<url>https://mongodb.com/docs/atlas/atlas-ui/triggers/limitations/</url>
<description>Follow these guidelines to avoid issues related to Triggers limitations.</description>


# Triggers Limitations

- Aggregation (system functions): all stages except `$currentOp`, `$indexStats`. User functions: security-restricted subset.  
- Bulk loads may delay sync to devices.  
- Database Triggers **unsupported** on: time-series collections, Serverless, Federated DB instances (no change streams).  

## Change-Stream Limits per Cluster
`M0`: 5, Flex/M2/M5: 10, M10–20: 100, M30–90: 1000, M100+: 1000. One stream per Triggered collection.

## Commands & Version
Wire-protocol clients: only allowed subset of DB commands. Atlas Functions: none. CRUD/Agg mostly per MongoDB 3.6; see API.

## Queries
- All query options (system functions).  
- Max 50 000 docs returned—paginate if needed.

## Traffic
10 000 concurrent requests; excess → HTTP 429. Request higher via support.

## Connection Pooling
Pool size scales with cluster tier, global deployment (per region servers), and is isolated per service.

</section>
<section>
<title>Atlas Cluster</title>
<url>https://mongodb.com/docs/atlas/data-federation/config/config-atlas-cluster/</url>
<description>Configure Atlas Data Federation to map Atlas cluster data for querying using federated database instances.</description>


# Atlas Cluster (Data Federation Store)

Atlas clusters can be mounted as Data Federation stores via the storage configuration shown below. Avoid PII in configs—values are stored internally.

```jsonc
{
  "stores": [                 // one entry per data store
    {
      "name": "<STORE>",      // referenced by dataSources.storeName
      "provider": "atlas",    // required for Atlas
      "clusterName": "<CLUSTER>",
      "projectId": "<PROJECT_ID>",
      "readPreference": {     // optional
        "mode": "primary|primaryPreferred|secondary|secondaryPreferred|nearest|local",
        "tagSets": [[{ "name": "<tag>", "value": "<val>" }], ...], // no sharded-cluster support
        "maxStalenessSeconds": <int>
      },
      "readConcern": {        // optional
        "level": "local|available|majority|linearizable|snapshot"
      }
    }
  ],

  "databases": [              // virtual DBs exposed by Federation
    {
      "name": "<DB>|*",       // '*' allows dynamic DB creation (single Atlas cluster only)
      "collections": [
        {
          "name": "<COLL>|*", // '*' for dynamic collections
          "dataSources": [
            {
              "storeName": "<STORE>",           // must match stores.name
              "database": "<SRC_DB>",           // omit when using databaseRegex or * DB
              "databaseRegex": "<regex>",       // glob multiple DBs; require collection
              "collection": "<SRC_COLL>",       // omit for wildcard/regex combine
              "collectionRegex": "<regex>",     // filter wildcard coll or combine many
              "provenanceFieldName": "<FIELD>"  // adds provider/cluster/db/coll metadata
            }
          ]
        }
      ],
      "views": [               // optional aggregation or $sql views
        { "name": "<VIEW>", "source": "<COLL>", "pipeline": "<pipeline JSON>" }
      ]
    }
  ]
}
```

Example (maps `metrics.hardware` on cluster `myDataCenter` to `dataCenter.inventory`):

```jsonc
{
  "stores": [{
    "name": "atlasClusterStore",
    "provider": "atlas",
    "clusterName": "myDataCenter",
    "projectId": "5e2211c17a3e5a48f5497de3"
  }],
  "databases": [{
    "name": "dataCenter",
    "collections": [{
      "name": "inventory",
      "dataSources": [{
        "storeName": "atlasClusterStore",
        "database": "metrics",
        "collection": "hardware"
      }]
    }]
  }]
}
```

Key behaviors & constraints
• Query flow: Driver → Data Federation → Atlas cluster; commands unsupported by Data Federation fail even if supported by Atlas.  
• readPreference.tagSets not supported for sharded clusters.  
• Wildcard (`*`) DB or collection allowed only once per parent element.  
• For `databaseRegex` you must supply `collection`, not `collectionRegex`. Combines same-named collections across DBs.  
• For `collectionRegex` with wildcard collection omit `collection`. With named collection it merges matching source collections into one.  
• `provenanceFieldName` returns sub-document: `{provider, clusterName, databaseName, collectionName}`. Not configurable via UI.

</section>
<section>
<title>Back Up, Restore, and Archive Data</title>
<url>https://mongodb.com/docs/atlas/backup-restore-cluster/</url>
<description>Manage backups and restore data for Atlas clusters, including compliance policies and cloud provider snapshots.</description>


# Back Up, Restore & Archive

Access  
• Requires Project Backup Manager or Project Owner. Org Owner must add self to project.

General  
• Backups unsupported on M0; use `mongodump`/`mongorestore`.  
• Cluster is read-only during restore.  
• Restore only to same/next major release; if backup has pinned FCV, target major must match FCV.  

Cloud Backups (M10+)  
• Uses cloud-provider snapshots on AWS, Azure, GCP.  

Flex / M2-M5 Clusters (deprecated)  
• Backup always on; daily snapshots; restore to Flex or ≥M10.  
• M2/M5 auto-migrated to Flex April 2 2025.  

Serverless (deprecated)  
• Backup mandatory. Options:  
  – Serverless Continuous: incr. every 6 h; PIT restore ≤72 h; daily retained 35 d.  
  – Basic: incr. every 6 h; keep 2 newest; free.  
• Restore to Serverless or dedicated clusters.

</section>
<section>
<title>Dedicated Cluster Backups</title>
<url>https://mongodb.com/docs/atlas/backup/cloud-backup/dedicated-cluster-backup/</url>
<description>Explore how to manage dedicated cluster backups in Atlas, including single-region, multi-region, and global cluster backup strategies.</description>


# Atlas Dedicated Cluster Backups

## Single-Region Backups
Ordering to choose node to snapshot:
1. Secondary  
2. Lowest priority  
3. Can be incremental from previous (same disk)  
4. Lexicographically smallest hostname  
(ties fall through to next rule)  
If chosen node unhealthy, Atlas tries next.  
Snapshots stored in same cloud region; retained per policy.  
If snapshot volume becomes invalid, Atlas creates a new one in primary’s region, takes full snapshot, then resumes incrementals.  
Volume-election triggers: tier change, disk/IOPS change, region change, MongoDB/cloud maintenance.

## Multi-Region Backups
Ordering:
1. Highest-priority region (desc)  
2. Secondary  
3. Lowest priority  
4. Incremental possible  
5. Lexicographically smallest hostname  
Fallback & retention identical to single-region.  
Volume-election triggers: tier, disk/IOPS, highest-priority region change, maintenance.

## Global Cluster Backups
Cloud Backups restore shard-to-shard (`shard0→shard0`, etc.).  
If source & target configs differ, balancer migrates data back provided:  
• Both clusters have same global-enabled collection and shard key.  
UI: Clusters → Browse Collections → Enable Global Writes.

## Continuous Cloud Backups
Replays oplog for point-in-time restores within policy window; higher cost.  
Storage: AWS S3, Azure Blob, GCP Storage; encrypted by provider.  
Atlas deletes all existing oplog data when:
• Continuous backup disabled  
• Oplog overflowed before capture  
Region change: data kept in old+new until window covered; billed for both unless disabled & re-enabled (deletes history).  
Cannot restore to the interval between restore start and first post-restore snapshot.

## Consistency & Snapshot Info
Snapshots are causally consistent except for size stats (`collStats`, `count()`).  
Sharded snapshots coordinated across shards.

### View M10+ Snapshots

#### Atlas CLI
```sh
atlas backups snapshots list <clusterName> [options]
atlas backups snapshots describe <snapshotId> [options]
```

#### Atlas UI
Clusters → Backup tab → Snapshots (Backup tab appears only if backups enabled).  
Projects → Security → Backup shows all clusters; terminated-cluster backups remain until expiry.

#### Administration API
Endpoints:  
• returnOneSnapshot / returnAllSnapshots for replica set  
• returnOneSnapshot / returnAllSnapshots for sharded cluster

</section>
<section>
<title>Flex Cluster Backups</title>
<url>https://mongodb.com/docs/atlas/backup/cloud-backup/flex-cluster-backup/</url>

# Flex Cluster Backups

- Creation: Atlas auto-takes 1 daily snapshot, starting 24 h after cluster creation, always from a secondary.  
- Retention: last 8 daily snapshots.  
- Actions: download or restore to Atlas *replica-set* clusters only.  

Access: role `Project Owner` on the project (Org Owner must add self).

Limitations  
- No custom backup policy (only the fixed daily job).  
- No on-demand snapshots.  
- Cannot restore to sharded clusters.  
- Atlas CLI unsupported.

Snapshot storage

| Cluster region | Storage region |
| --- | --- |
| Australia | Australia |
| Germany | Germany |
| Hong Kong | Australia |
| India, Singapore, Taiwan | Asia |
| USA | USA |
| Other | Ireland |

View/Manage  
UI: Clusters → <cluster> → Backup → Snapshots (or Security → Backup).  
API:  
- `GET /groups/{groupId}/clusters/{clusterName}/backup/snapshots` – list all.  
- `GET /groups/{groupId}/clusters/{clusterName}/backup/snapshots/{snapshotId}` – single snapshot.

</section>
<section>
<title>Shared Clusters Backup (Deprecated)</title>
<url>https://mongodb.com/docs/atlas/backup/cloud-backup/shared-cluster-backup/</url>
<description>Manage deprecated `M2` and `M5` cluster backups in Atlas, including automatic migration to Flex clusters starting April 2025.</description>


# Shared Clusters Backup (M2/M5, Deprecated)

• Creation of new `M2`,`M5`, Serverless blocked Feb 2025.  
  – Auto-migration: `M2/M5`→Flex on Apr 2 2025; Serverless→Free/Flex/Dedicated on May 5 2025 (see All Clusters page).  

Snapshots  
• Atlas takes one daily snapshot (starts 24 h post-creation) from a secondary; keeps last 8.  
• Download or restore only to Atlas replica sets.  
• No custom schedules or on-demand snapshots.  
• Can’t restore to sharded, Serverless→`M2/M5`, or from MongoDB <4.4 into 5.0; target must run one of 2 newest major versions of source.  

Access  
• Requires Project Owner role (Org Owner must add self).

Storage region (cluster→snapshot):  
AU→AU, DE→DE, HK→AU, IN/SG/TW→Asia, US→US, other→IE.

Viewing  
Atlas UI: Clusters › <cluster> › Backup › Snapshots, or Security › Backup for project list.  
Atlas CLI: not supported.  
Admin API: “Return One/All Snapshots for One M2 or M5 Cluster” endpoints.

</section>
<section>
<title>Access an Encrypted Snapshot</title>
<url>https://mongodb.com/docs/atlas/tutorial/access-encrypted-snapshot/</url>
<description>Obtain access to data in your encrypted backup by accessing a kmip server proxy standalone.</description>


# Access Encrypted Snapshots (Customer KMS)

Atlas snapshots with Encryption-at-Rest need a local KMIP proxy so `mongod` can fetch the key.

## Credential File

Default: `/<dbPath>/cloudProviderCredentials/<keyID>.<cloudProvider>.metadata`  
• Rotates automatically with key.  
• If role-based KMS access, file is empty; either update it:

```json
{
  "accessKeyId":"TMP_ID",
  "secretAccessKey":"TMP_SECRET",
  "roleId":"",
  "region":"us-east-1"
}
```

or start proxy with `-awsAccessKey -awsSecretAccessKey -awsSessionToken -awsRegion`.

## Workflow

1. In Atlas → Cluster → Backup → Snapshots, click **Download**.  
   One-time link (valid 1 h) is emailed / shown under Restores & Downloads.

2. From the modal (or Security → Advanced → Encryption at Rest), download the **KMIP Proxy Standalone** binary for your OS.

3. Start proxy (choose cloud):

```sh
# AWS
kmipProxyStandalone -cloudProvider aws -dbpath <dbPath> \
  -kmipPort <kmipPort> -mongodPort <mongodPort> \
  [-awsAccessKey <id> -awsSecretAccessKey <key> \
   -awsSessionToken <tok> -awsRegion <region>]

# Azure / GCP
kmipProxyStandalone -cloudProvider <azure|gcp> \
  -dbpath <dbPath> -kmipPort <kmipPort> -mongodPort <mongodPort>
```

Notes  
`dbPath` = directory with snapshot files.  
Proxy writes `kmipCA.pem` & `kmipClient.pem` to this path.

4. Start `mongod` wired to proxy:

```sh
mongod --dbpath <dbPath> --port <mongodPort> --enableEncryption \
  --kmipPort <kmipPort> --kmipServerName 127.0.0.1 \
  --kmipServerCAFile <dbPath>/kmipCA.pem \
  --kmipClientCertificateFile <dbPath>/kmipClient.pem \
  --kmipActivateKeys false
```

5. Connect via `mongosh`, Compass, `mongodump`, `mongorestore`, etc., to read or restore data.

Security best practice: use IAM role-based access for the project key.

</section>
<section>
<title>Tags on Clusters</title>
<url>https://mongodb.com/docs/atlas/database-deployment-tags/</url>
<description>Organize and manage your clusters by adding tags for better identification and categorization based on purpose, environment, or team.</description>


# Cluster Tags

Tag clusters to label purpose, env, team, etc. Tags differ from immutable Atlas replica-set tags and are deleted when unused.  

Sensitive data (PII/PHI) prohibited; tags are visible to Billing, DataDog, Prometheus.

## Where to Add / Edit / Delete

1. Clusters view  
   • Cluster card → Add Tag / Manage tags → Save.  

2. Monitoring → Overview tab → Add Tag / Manage tags → Save.  

3. New cluster  
   • Template flow: Build a Database → Tag section (Key, Value).  
   • Advanced flow: Create New Cluster dialog → Cluster Details → Add Tag.

4. Existing cluster  
   Clusters → Edit Config → Cluster Details → Add Tag.

## Manage Tags Dialog

• Add tag → enter Key + Value.  
• Edit → change Key/Value.  
• Delete → trash icon (removes tag from all associated resources).

## Notes

• Tags provide organization; Atlas auto-removes tags with no clusters.  
• Do not store sensitive info.

</section>
<section>
<title>Manage Clusters</title>
<url>https://mongodb.com/docs/atlas/manage-database-deployments/</url>
<description>Explore resources to manage Atlas clusters, including viewing, filtering, and reviewing cluster details.</description>


# Manage Clusters

## View All Clusters (UI)

1. Click **All Clusters**.  
2. Filter list:  
   • Search box: org / project / cluster names.  
   • Dropdowns:  
     - **Availability:** All, Nodes Available, Some Nodes Available, No Primary, Has Warnings & Alerts  
     - **Type:** All, Standalones, Replica Sets, Sharded Clusters  
     - **Version:** All, Inconsistent, 6.0, 7.0 (Atlas shows FCV if < binary version during upgrade)  
     - **Configuration:** All, Auth OFF, Backup OFF, SSL OFF  
3. Toggle **Show Inactive Clusters** (no contact ≥ 6 mo).  
4. Returned fields: Name, Version, Data Size, Backup, Nodes, SSL, Auth, Alerts.

## View Deployments (CLI)

```sh
atlas deployments list [options]
```

## View Cluster Details (UI)

1. Org → Project → Clusters.  
2. Cluster card shows:  
   - Cluster Name, MongoDB Version, Tier (M10…/Flex), Region, Type (Replica Set/Sharded + node count).  
   - Metrics: ops/sec (R/W), open connections, logical data size, disk IOPS (M10+).  
3. M0 without connections for 7 days: monitoring paused; reconnect via API, driver, mongosh, or UI to resume.

## Next Steps

• Manage Clusters (settings, scaling, etc.)  
• Manage Global Clusters (zones, shard global collections)  
• Manage Serverless Instances (deprecated; creation blocked).

</section>
<section>
<title>Manage Clusters</title>
<url>https://mongodb.com/docs/atlas/manage-clusters/</url>
<description>Configure and manage Atlas clusters, including selecting cluster tiers, customizing storage, and configuring auto-scaling and additional settings.</description>


# Manage Clusters

Access: `Project Read Only`+ required.

## List / Inspect Clusters

```sh
atlas clusters list [opts]              # all
atlas clusters describe <name> [opts]   # config
atlas clusters advancedSettings describe <name> [opts]
```
(Install & auth: see Atlas CLI docs.)

UI: View All Cloud Clusters → Cluster Details.

## Cluster Tier Selection

Tier → RAM/CPU/Storage/IOPS per node; differs by cloud/region.

• Free/Shared (M0/M2/M5, deprecated) & Flex: low-throughput, subset of features. One M0 per project. Added over M0: backups, more storage, API.  
• Dedicated Low-Traffic: M10/M20; replica set only; burstable CPU.  
• Dedicated Prod: M30+; replica set or sharded. Variants available (❯).  

### Sharded Clusters
API can set tier & IOPS per shard (AWS PIOPS / Azure Extended). Min/max autoscale tiers equal across shards; tiers ≤2 apart. Disk size equal on all nodes. NVMe incompatible.

### NVMe (Locally attached SSD)

AWS tiers: M40/50/60/80/200/400  
Azure tiers: M60/80/200/300/400/600  
Azure regions (NVMe):  
Americas `brazilsouth canadacentral centralus eastus eastus2 southcentralus westus3`  
Europe `francecentral northeurope swedencentral uksouth westeurope`  
APAC `australiaeast centralindia japaneast`

Key rules:  
• Only on AWS/Azure (not GCP).  
• Hidden high-IOPS secondary for backup; Cloud Backups mandatory (≥12 h interval).  
• Pause not allowed. Any scale/auto-scale triggers full file-copy initial sync; auto-scales when 90 % storage used.  
• Requires 2 AZs in `eastus2 centralus southcentralus`, 3 AZs elsewhere.

## Cluster Class Comparison

Free (M0): 512 MB; MongoDB 8; no backups, VPC, sharding, perf tools.  
Shared (M2/M5): 2/5 GB; same limits as Free; daily backups.  
Flex: 5 GB; same as Shared.  
Dedicated (M10+): 10-4000 GB; MongoDB 5/6/7/latest; full metrics, VPC peering, global regions, cross-region, backups, sharding (M30+), BI, Performance Advisor.

## Next-Step Operations

Action → Summary  
• Customize Storage (`M10+`).  
• Auto-Scaling: set min/max tier &/or storage.  
• Additional Settings: MongoDB version, backup, encryption.  
• Resource Tags.  
• Modify Cluster.  
• Major Version Upgrade.  
• Maintenance Window schedule.  
• Pause/Resume/Terminate (not NVMe).  
• High Availability / Workload Isolation (multi-cloud, regions).  
• Read Preference Tags (`readPreferenceTags=<k:v>`).

</section>
<section>
<title>Configure Auto-Scaling</title>
<url>https://mongodb.com/docs/atlas/cluster-autoscaling/</url>
<description>Configure Atlas cluster auto-scaling to optimize resource utilization and cost by adjusting cluster tier and storage based on real-time usage.</description>


# Atlas Cluster Auto-Scaling

## Scope
Dedicated clusters, General & Low-CPU classes only (not Local NVMe). Auto-scales tier **within user-set Min/Max bounds**; storage only scales up.

## Metrics
- Normalized System CPU Util.
- System Memory Util.  
  Formula: `(memoryTotal-(memoryFree+memoryBuffers+memoryCached))/memoryTotal*100`.

## Tier Upscale

```
if nextTier ≤ MaxTier and any node meets threshold → scale up
```

### M10/M20
CPU (avg):
- AWS: Normalized CPU > 90% (20 min) **and** CPU steal > 30% (3 min)
- Azure: Normalized CPU > 90% (20 min) **and** softIRQ > 10% (3 min)
- Any cloud: Absolute CPU > 90% (20 min)  
- Relative CPU > 75% (1 hr)

Memory (avg):
- > 90% (10 min) OR > 75% (1 hr)

### M30+
CPU or Memory (avg):
- > 90% (10 min) OR > 75% (1 hr)

Analytics nodes any tier: CPU or Memory > 75% (1 hr).

Cool-down:  
M10/M20: no up-scale if done in last 20 min/1 hr (per threshold).  
M30+: 10 min/1 hr.

## Tier Downscale

```
if nextLowerTier ≥ MinTier and ALL nodes satisfy → scale down
```

Global:
- No down-scale, provisioning, or unpause in past 24 h.

Operational nodes (both must hold for ≥10 min **AND** ≥4 h):
- Normalized CPU < 45%
- WiredTiger cache < 90% of max
- Projected total memory (<60%) on lower tier (replace current WT cache with 0.8 × lower-tier WT cache).

Analytics nodes: CPU & Memory < 50% (24 h).  
M10/M20 use lower provider-specific thresholds due to burst caps.

Min tier ≥ M10. Atlas auto-raises MinTier if storage exceeds capacity of current MinTier.

## Sharded Clusters
Same rules per shard. Only shards meeting criteria change. Config servers never auto-scale.  
API v2024-08-05 allows per-shard tier (`replicationSpec` per shard, `numShards` removed). Using it disables legacy symmetric scaling API until tiers match again.

## Storage Auto-Scale

Enabled by default; triggers when any node disk ≥ 90%.  
- Only increases size (manual decrease allowed).  
- Target: 70% usage post-scale (AWS/Azure/GCP).  
- Disabled if base vs analytics nodes use different instance classes or regions.  
- High-write bursts can outrun scaling; pre-scale manually.  

If required storage > tier limit, Atlas simultaneously raises tier (may override MaxTier, disables down-scaling until reset).  
If tier down fails due to storage/IOPS limits:  
• At MaxTier → disables down-scale.  
• Below MaxTier → raises MinTier to current tier.

## Oplog
Behavior depends on storage auto-scale (see Oplog Size Behavior). Auto-scale enabled by default.

## Configuration

UI (General/Low-CPU):
- Auto-scale checked by default for new clusters.  
  - MaxTier = Current+1, MinTier = Current.
- Options: change Min/Max, uncheck “Cluster Tier Scaling” (no up), uncheck “Allow cluster to be scaled down”, uncheck “Storage Scaling”.

API:
- Tier auto-scale disabled by default unless specified.

## Monitoring

Activity Feed filter “Atlas auto-scaling” to view/download events.

## Alerts

Auto-scaling events are Atlas alerts (Aug 2024 change). Modify under Category = “Atlas Auto Scaling”; set recipients/notifiers (email, SMS, Slack, etc.).

</section>
<section>
<title>Configure Additional Settings</title>
<url>https://mongodb.com/docs/atlas/cluster-additional-settings/</url>
<description>Configure additional settings for Atlas clusters, including MongoDB version selection, backup options, termination protection, and sharded cluster deployment.</description>


# Configure Additional Cluster Settings

## MongoDB Version
- Supported: 6.0, 7.0, 8.0, Latest Release.  
- Free/shared (M0-M5) = major-release cadence only.  
- Dedicated (M10+) may choose specific major or “Latest Release” (rapid cadence).  
  • Rapid cadence: cluster must already run current major; Atlas auto-rolls to each rapid + next major; cannot downgrade; reversion to major cadence allowed only **before** first rapid patch.  
- No major downgrades. Custom DB roles using new actions block creation of older-version clusters.

## Backup
Tier | Setting | Notes
---- | ------- | -----
Flex, M2/M5 (deprecated) | Always On | Cannot disable.
M10+ | Turn on Backup = Cloud Backup (snapshots) or Continuous (PITR). | Backup Compliance Policy can force Continuous and forbid disable.

## Termination Protection
Toggle prevents delete until disabled (default Off).

## Sharded Cluster (M30+)
Toggle Shard your cluster → Yes.  
Topology  
- Shard = 3-node RS; mongod per node.  
- Config servers = 3-node RS (M30) per cluster/region.  
- `mongos` count = shards × nodes.  
Atlas-managed Config Servers (default On for 8.0)  
- ≤3 shards → embedded; ≥4 shards → dedicated.  
- Auto-switch when shard count changes unless using time-series, QE, or Atlas Search.  
- Snapshot restores must stay within same config-server type.

Shards  
- 1 – 70.  
- Converting RS → shard: scale to single-shard, restart & reconnect app, then add shards.  
- Removing shards: highest `_id` removed; `movePrimary` moves unsharded DBs—avoid writes during operation.

Cannot convert sharded → replica set.

## BI Connector (EOL Sept 2026, M10+)
Toggle Enable BI Connector = Yes.  
Read preferences  
Tag | readPreference | readPreferenceTags
----|---------------|-------------------
Primary | primary | –
Secondary | secondary | `{nodeType:ELECTABLE}` or `{nodeType:READ_ONLY}`
Analytics | secondary | `{nodeType:ANALYTICS}`  
Sampling opts: `schemaSampleSize`, `sampleRefreshInterval` (seconds). CPU-intensive; consider ≥M30.

## Customer-Managed Encryption Keys (M10+ RS only)
Providers: AWS KMS, Azure Key Vault, GCP KMS.  
Prereq: configure project-level KMS first.  
Switch provider = disable then re-enable. Lost key ⇒ cluster unrecoverable. Keys encrypt data + backups; extra cost.

## Advanced `mongod` Settings (M10+)

Setting | Param / Config | Key Notes
------- | -------------- | ---------
Minimum Oplog Window | `storage.oplogMinRetentionHours` | Requires storage auto-scaling.
Fixed Oplog Size | `replication.oplogSizeMB` | Opt-out auto-scaling; ≥990 MB; cannot use `replSetResizeOplog`.
Enforce Index Key Limit | `param.failIndexKeyTooLong` | Removed ≥4.4; false allows writes w/out index.
Server-Side JS | `security.javascriptEnabled` | Disabled by default in 8.0.
QueryStats Log | cluster ≥7.1 | Adds redacted `$queryStats` to logs.
Min TLS Version | `net.tls.disabledProtocols` | TLS 1.0/1.1 removed 31 Jul 2025.
Custom Cipher Suites | — | Filter suites per TLS version.
No Table Scan | `notablescan`
Default Write Concern | cluster default (≥5.0 = majority)
Transaction Lifetime | `transactionLifetimeLimitSeconds` (1–∞, default 60 s)
Fast Disk Pre-Warming | toggle (On = default) | Hides new node during warm-up.
Default Read Timeout | `defaultMaxTimeMS` (8.0+)
Replica Set Scaling Mode | Parallel by Workload (default) / Parallel by Node / Sequential
Log Redaction | toggle; requires rolling restart.

## Atlas-Managed Config Servers Summary
- Embedded = app+config data colocated, cheaper.  
- Dedicated = separate RS, more costly.  
- Atlas chooses type by shard count; respects exclusions; replica-set IDs no longer guarantee data role (8.0+).

## CLI / UI
CLI:  
```sh
atlas clusters advancedSettings update <clusterName> [options]
```  
UI: “More Configuration Options” → Additional Settings.

</section>
<section>
<title>Modify a Cluster</title>
<url>https://mongodb.com/docs/atlas/scale-cluster/</url>
<description>Modify your Atlas cluster settings, including cluster type, tier, cloud provider, and enable features like sharding and backups.</description>


# Modify a Cluster

## Configuration Options (summary)

- Cluster Type – Flex/Serverless ➜ Dedicated only (one-way).  
- Global Writes – Enable/modify; **cannot disable** once on.  
- Cloud Provider/Region – Change provider/region;  
  • AWS or post-Nov 2 2020 clusters: conn string unchanged, no downtime.  
  • Pre-Nov 2 2020 GCP/Azure: conn string changes.  
  • Moving to region w/o primary/secondary ⇒ full initial sync.  
  • Azure: some regions lack high-IOPS storage; UI warns.  
- Multi-Cloud/Region – Same Azure IOPS caveat.  
- Cluster Tier – Tier up/down; NVMe clusters always trigger file-copy initial sync.  
- Storage – NVMe size fixed per tier.  
- Autoscaling – Storage auto-scaling on by default; oplog managed by window or size.  
- MongoDB Version – Only major upgrades; downgrade only if FCV pinned. Cannot jump >1 major above pinned FCV.  
- Sharded Cluster – M30+ only; irreversible; disallowed if triggers w/ pre-image enabled.  
- Shard Count – 1–70 shards; downsizing removes highest `_id` shard; movePrimary risk for unsharded DBs.  
- Backup – Mandatory on M2/M5; cannot disable.  
- BI Connector – M10+; heavy CPU/RAM, consider M30+.  
- Customer KMS – Toggle at will; any change forces initial sync.

Apply Changes to enact.

## Operational Considerations

Initial sync required when:  
• Free/Shared (`M0/M2/M5`) ➜ higher tier.  
• Switching general ↔ NVMe volumes.  
• NVMe tier change (incl. autoscale) or region move.  
• Azure cluster-class change.

Migration order: secondaries → primary. Election ≈5 s; retryable writes advised. Performance hit if primary near capacity or reading from secondaries.

Atlas may auto-create indexes if workload blocks scaling.

Billing: Cluster Overview shows new cost (excl. data transfer). Upgrading free tier starts billing.

Backups: see Cloud Backups docs.

## Access

Role `Project Cluster Manager` or higher required.

## Atlas CLI Commands

```sh
# modify generic settings
atlas clusters update <clusterName> [options]

# upgrade tier/disk/version for M0/Flex/M2/M5
atlas clusters upgrade <clusterName> [options]

# advanced settings
atlas clusters advancedSettings update <clusterName> [options]

# list supported regions
atlas clusters availableRegions list [options]
```

## Key Modification Workflows

### Cluster Type
`M0`/Flex/Shared ⇒ Dedicated (`M10+`) only; no reverse; UI: Edit Config → Dedicated tab.

### Global Cluster
Enable/adjust only; cannot disable once set.

### Cloud Provider & Region
Change selectable during scaling or edit; not allowed if Search Nodes deployed. Search Node add/remove: 2–32 nodes; deletion causes search downtime; addition causes dual reads.

### Cluster Tier
Cannot downscale Dedicated ⇒ Free/Flex/Shared. Downtime when moving among M0/Flex/Shared tiers or to Dedicated. NVMe clusters reboot; free/share/Flex ➜ Dedicated deletes existing cluster—download snapshots first. Backup compliance may block unsupported tiers.

### Search Tier
Choose tier; unavailable size auto-upsized; cluster reboots.

### MongoDB Version
Upgrade via Additional Settings; rolling; no downgrade unless FCV pinned.

### Backup
Flex auto-enabled. For M10+, toggle Cloud Backup.

### Termination Protection
Toggle; must disable before delete.

### Sharded Cluster Conversion
Prereqs: M30+, proper role, no triggers w/ pre-image.  
Steps: Edit Config → Shard your cluster = On (initially 1 shard) → Apply → Restart apps & reconnect (update conn string if not using DNS seed) → Increase shard count → shard collections. Conversion reboots nodes; private-endpoint users see downtime.

### Shard Count Change
Set 1–70. Decrease removes highest-id shards; movePrimary moves unsharded DBs (risk of data loss on active writes). Avoid single-shard prod clusters; always restart apps after shard topology change.

### BI Connector
Toggle (M10+); scale to ≥M30 if performance degrades.

### Customer KMS
Toggle Manage your own encryption keys; any change = initial sync.

## Draft, Review, Apply

• Save Draft to return later.  
• Review Changes shows side-by-side diff, pricing, warnings (no rollback, initial sync, downtime).  
• Apply Changes executes (payment info needed if upgrading from free).

## Replica Set → Sharded Cluster (condensed)

1. Edit Config → Shard your cluster = On (1 shard) → Apply.  
2. Wait for deployment.  
3. Restart clients & reconnect (`mongos` DNS seed or new connection string).  
4. Edit Config → set shards 1–70 → Apply.  
5. Run `sh.shardCollection()` to distribute data.  
6. Modify other settings as needed.

Queries using `$unionWith` + `$search` on MongoDB 7.0 may fail if collection not on multiple shards; add shards & distribute to mitigate.

## Tags

Add/manage non-sensitive tags; visible to MongoDB services and integrations.

## Security Note

Do not store PII/PHI in tags.



</section>
<section>
<title>Upgrade Major MongoDB Version for a Cluster</title>
<url>https://mongodb.com/docs/atlas/tutorial/major-version-change/</url>
<description>Upgrade your Atlas cluster's MongoDB version by creating a staging cluster to test application compatibility before updating the production environment.</description>


# Upgrade Major MongoDB Version

## Key Considerations
- Cluster must be healthy; wait for on-demand snapshot to finish.
- Upgrade **one major version at a time**; no skips.
- Review release notes or use Stable API to avoid breaking changes.
- Downgrade only possible if FCV was pinned before upgrade.
- Live migration usually requires identical FCV on source/destination.
- MongoDB 6.0+: `$$SEARCH_META` cannot follow a `$searchMeta` stage.

## Access
Role ≥ Project Owner.

## Recommended Workflow
1. **Create staging cluster** mirroring prod size/config (no backups needed).
2. **Sync data**  
   • If prod has backups: restore latest snapshot to staging.  
   • Else: run Live Import.
3. **Point staging app** to staging cluster; confirm normal operation.
4. (Opt) **Update drivers** to latest version.
5. **Upgrade staging MongoDB version**  
   • Clusters → … → Edit Config → select new major version → Confirm & Deploy.  
   • Note upgrade duration; test failover & workload.
6. **Upgrade production cluster** via same steps; verify apps.
7. If issues arise, open High Priority support ticket.

---

# Feature Compatibility Version (FCV)

FCV blocks new on-disk formats so you can **downgrade within 4 weeks**.

Limitations  
- Available only on Dedicated clusters, not rapid release.  
- Pin lasts ≤ 4 weeks; must be set before MongoDB EOL.  
- Cannot upgrade > 1 major version above pinned FCV.

## Pin FCV
Atlas UI: Clusters → … → Pin Feature Compatibility Version → set expiration (MM/DD/YYYY UTC).  
API: see `POST /groups/{projectId}/clusters/{name}/fcv/pin`.

## Unpin FCV
Clusters → … → Edit Pinned Feature Compatibility Version → Unpin.  
API: `DELETE /groups/{projectId}/clusters/{name}/fcv/pin`.

---

# Downgrade One Major Version

Allowed only if:
- FCV was pinned pre-upgrade.
- Target version equals pinned FCV.
- Version not EOL and rapid release disabled.

UI: Clusters → … → Edit Configuration → Additional Settings → Select version matching pinned FCV → Confirm.  
API: `PATCH /groups/{projectId}/clusters/{name}` with `"clusterMajorVersion": "<target>"`.

---

# Support
Use Atlas UI → Support → Create Ticket for migration or upgrade issues.

</section>
<section>
<title>Configure Maintenance Window</title>
<url>https://mongodb.com/docs/atlas/tutorial/cluster-maintenance-window/</url>
<description>Configure the hour for Atlas to start weekly maintenance on your cluster, with options for protected hours and urgent maintenance considerations.</description>


# Configure Maintenance Window

Optional; set preferred weekly start hour per project. Atlas still performs rolling maintenance for HA.

## Key Facts
- Roles: `Project Owner` or `Organization Owner`.
- Urgent security fixes can ignore window/protected hours.
- Window becomes immutable while maintenance is running.
- Each replica set undergoes ≥1 election; use Test Failover.
- Start time ≈ scheduled hour; active cluster changes may delay.
- Low disk IOPS ⇒ brief degradation (WiredTiger repopulation).
- Protected Hours: daily no-update span ≤ 18 h (for non-restart updates).

## CLI

```sh
# view
atlas maintenanceWindows describe [opts]

# set / update
atlas maintenanceWindows update --day <0-6> --hour <0-23> [--autoDefer]

# clear
atlas maintenanceWindows clear [opts]

# defer once (max 2×/event)
atlas maintenanceWindows defer [opts]
```

## UI
Project Settings → Set Maintenance Window  
1) Pick day/time.  
2) (Opt) “Automatically defer maintenance for one week”.  
3) (Opt) Enable Protected Hours & select ≤18 h range.  
4) Save.

Toggle off to clear settings.

## Notifications & Response
- Banner + email (Project Owners) 48–72 h before.
- In UI choose: do nothing, Begin Now, or Defer 1 Week (max 2 deferrals).

## Version Upgrades
Cluster card shows current → target MongoDB patch if scheduled within next window.

</section>
<section>
<title>Pause, Resume, or Terminate a Cluster</title>
<url>https://mongodb.com/docs/atlas/pause-terminate-cluster/</url>
<description>Manage clusters by pausing, resuming, or terminating them, with specific access requirements and considerations for paused clusters.</description>


# Pause, Resume, or Terminate a Cluster

## Key Limits & Behavior
- Unsupported: Serverless, Flex (pause/resume), deprecated M2/M5 (pause), NVMe storage.
- M0: Atlas auto-pauses after 60 days idle; no manual pause.
- M10+: Manual pause ≤30 days; must run ≥60 min before re-pause; storage-only billing.
- Paused cluster: no reads/writes/config changes, alerts, backups, `$search/$vectorSearch`; Search Node data wiped (re-indexed on resume); compliance policy auto-enables/adjusts Cloud Backup on resume.
- Access: Pause/Resume → Project Cluster Manager+. Terminate → Project Owner/Org Owner.

## Pause
CLI  
```sh
atlas clusters pause <clusterName> [options]
atlas deployments pause <deploymentName> [options]   # local
```
API → Modify One Cluster.

## Resume
CLI  
```sh
atlas clusters start <clusterName> [options]
atlas deployments start <deploymentName> [options]
```
M0 monitoring resumes on first connection. Atlas auto-resumes M10+ after 30 days.

## Terminate
Prereq: disable Termination Protection.  
CLI  
```sh
atlas clusters delete <clusterName> [options]
atlas deployments delete <deploymentName> [options]
```
Effects: finishes in-progress changes, removes Search Nodes, deletes snapshots (unless compliance policy retains), bills active hours, removes unused tags.

### Public IP retention (M10+)
Cluster lifetime <12 h → none; 12–35 h → retained equal to lifetime; ≥36 h → retained 36 h. Reused if a new cluster with same name appears within window. IP unchanged by pause/resume.

## Compliance & Encryption Notes
- On resume, Cloud Backup/Continuous Backup enforced per policy.
- Paused clusters without Encryption at Rest block enabling “Require Encryption at Rest using Customer KMS” in a compliance policy.



</section>
<section>
<title>Restore Data From Paused M0 Cluster</title>
<url>https://mongodb.com/docs/atlas/backup/restore-free-tier-cluster/</url>
<description>Learn how to restore data from a paused free tier (M0) cluster</description>


# Restore Data From Paused M0 Cluster

Prereqs: Project Owner role, `mongodump`, `mongorestore`.

Procedure  
1. Deploy temp `M10+` cluster **with same MongoDB version** as paused `M0` (required; if EOL, restore impossible). Delete later to avoid charges.  
2. Find M0 snapshots:  
   ```
   https://cloud.mongodb.com/v2/<project_id>#/clusters/backup/<cluster_name>
   ```  
3. For desired snapshot ⇒ **Restore** → Target Project/Cluster = new `M10`.  
4. After restore, **upgrade `M10` to latest MongoDB major**.  
5. `mongodump` the upgraded `M10`.  
6. Create new `M0` (runs latest version).  
7. `mongorestore` dump into new `M0`.  
8. Terminate `M10` cluster.

</section>
<section>
<title>Configure High Availability and Workload Isolation</title>
<url>https://mongodb.com/docs/atlas/cluster-config/multi-cloud-distribution/</url>
<description>Configure multi-cloud MongoDB deployments in Atlas to enhance availability and workload isolation using different cloud providers and regions.</description>


# Atlas High Availability & Workload Isolation (M10+)

## Core Toggle  
Enable `Multi-Cloud, Multi-Region & Workload Isolation` to split nodes across AWS, Azure, and GCP regions/providers.

## Global Constraints & Notes  
- Hostnames may map to different node types after topology changes.  
- Config-server placement (sharded clusters w/ CSRS):  
  • 1 electable region ⇒ all 3 nodes there  
  • 2 regions ⇒ 2 in highest, 1 in second  
  • ≥3 regions ⇒ 1 per top-3 regions  
- Per-project cap: `≤40` total nodes **outside any single region** (excludes free/flex & intra-GCP traffic).  
- Many regions / long distances ⇒ election delay & replication lag.  
- Removing an entire region can change the std connection string; always re-check **Connect** in UI.  
- Use built-in multi-region write concerns for consistency.  
- M10/M20 on some GCP regions may not support multi-region.  
- For VPC peering, review docs before first multi-region M10+ cluster.

---

## Electable Nodes (High Availability)  
- At least **3, 5, or 7** electable nodes cluster-wide.  
- First row = **Highest Priority**; drag rows to change primary region/provider.  
- Steps:  
  1. Add provider/region → pick cloud/region → set node count.  
  2. Regions marked ⭐ are Atlas-recommended.  
- Cannot delete Highest-Priority nodes.  
- Convert electable↔readOnly by adding new then removing old in same mod.  
- Redundancy guidance:  
  • Avoid provider failure ⇒ ≥1 node in each of 3 providers.  
  • Avoid region failure ⇒ ≥1 node in ≥3 regions (≥2 per if possible).  
  • Avoid node failure ⇒ ≥3 electables in one ⭐ region or spread across ≥2 regions.

---

## Read-Only Nodes (Optimized Local Reads)  
- Do **not** participate in elections; tag-based routing only.  
- Add/remove same as electable.  
- Convert purpose via simultaneous add/remove.

---

## Analytics Nodes (Workload Isolation)  
- Accept BI/analytical queries; tagged routing.  
- Add per provider/region; non-electable.  
- Optional separate **Analytics Tier** (M10+):  
  • Tier may differ from Base tier.  
  • Disk size/IOPS and storage class must match across node types.  
  • Large tier gap can cause oplog lag.  
  • General↔Low-CPU mix disables auto-scaling.  
  • Pricing shown per-node, prorated.

---

## Search Nodes (Dedicated `mongot`, Atlas Search / Vector Search)  

### Requirements  
- Cluster tier ≥ M10, MongoDB ≥ 6.0.  
- Min 2, max 32 nodes; identical count & tier in every region.  
- Not allowed on global clusters.  
- Unsupported regions (cannot enable):  
  AWS: `eu-west-3 eu-central-2 eu-south-1 eu-south-2 me-central-1 me-south-1 af-south-1 ap-east-1 ap-southeast-3 ap-south-4 ap-south-2`  
  Azure: `australiacentral australiacentral2 australiasoutheast brazilsoutheast canadaeast francesouth germanynorth westindia southindia italynorth japanwest koreasouth norwaywest southafricawest swedensouth switzerlandwest uaecentral ukw est westcentralus westus northcentralus`
- Tier (default `S20`): choose high-CPU, low-CPU, or larger tier; AWS may auto-bump if unavailable.  
- Encryption at Rest via AWS KMS supported.

### Add  
Atlas UI: toggle `Search nodes for workload isolation` → set node count → pick **Search Tier**.  
CLI:  
```sh
atlas clusters search nodes create [opts]
```  
API: `POST /api/atlas/v1.0/groups/{groupId}/clusters/{name}/fts/deployment`

### Modify / Remove  
- UI: change node count or toggle off (confirms loss of customer-managed encryption, brief query pause).  
- CLI: `atlas clusters search nodes delete [opts]`  
- API: `PATCH .../fts/deployment` (resize) or `DELETE` (remove all).  
- Deleting all nodes migrates back to embedded `mongot`; expect query downtime during index build.

---

## Private Connectivity in Multi-Cloud  
Private endpoints expose only nodes in the same provider+region. If primary is elsewhere, use `readPreference=secondary`. For full access: establish VPN + private endpoints to other providers, **or** deploy a sharded cluster—`mongos` will route to remote primaries without special read preference.

---

## CLI Command References  
- Create Search Nodes: `atlas clusters search nodes create`  
- Delete Search Nodes: `atlas clusters search nodes delete`

(See Atlas CLI docs for full syntax/flags.)

</section>
<section>
<title>Convert a Serverless Instance to a Dedicated Cluster</title>
<url>https://mongodb.com/docs/atlas/tutorial/convert-serverless-to-dedicated/</url>
<description>Convert a Serverless instance to a dedicated cluster using Atlas UI or command-line tools like `mongodump` and `mongorestore`.</description>


# Convert Serverless Instance ➜ Dedicated Cluster

## Options
1. Atlas UI (recommended, keeps connection string).
2. `mongodump` + `mongorestore`.
3. Restore from Cloud Backup.

---

## 1. Atlas UI Method  
Prereqs: Project `Cluster Manager`+, pause **all** writes (incl. Triggers, Data API, Functions).

Key limits  
- Downtime; charts unavailable during upgrade.  
- Cannot change cloud/region; upgrade is **irreversible**.  
- Re-create private endpoints after conversion.

Steps  
1. Atlas › Clusters › … › **Edit Configuration**.  
2. Select **Dedicated** tab.  
3. Choose tier: ≥M80 & 4 TB for ≥100 GB data; else ≥M30 & 40 GB. (Can down-scale later.)  
4. Adjust options (backups, tags, disk auto-scaling → min oplog 24 h).  
5. **Review Changes** – note above warnings.  
6. **Apply Changes**. Existing DNS seed list remains valid.  
7. Track progress: Metrics › “DB Storage” until size matches source, then Atlas verifies data.  
8. Resume writes.

---

## 2. `mongodump` / `mongorestore` Method  
Prereqs:  
- Target dedicated cluster running same major MongoDB version.  
- CLI tools installed.  
- Pause writes on source.

Dump  
```shell
mongodump --uri "mongodb+srv://<USER>:<PASS>@<SRV>/<DB>"
# Creates ./dump/
```
Repeat for each DB if needed.

Restore  
```shell
mongorestore --uri "mongodb+srv://<USER>:<PASS>@<DEDICATED_SRV>"
# Reads ./dump/ by default
```
Use `--nsInclude`/`--dir` to target specific DBs/paths.

Validate  
- Atlas › Browse Collections or connect and query.

---

</section>
<section>
<title>Manage Global Clusters</title>
<url>https://mongodb.com/docs/atlas/global-clusters/</url>
<description>Configure and manage Global Clusters in Atlas by defining zones for geographically local shards and supporting global low-latency reads.</description>


# Manage Global Clusters

Flex clusters & Serverless instances: no Global Cluster support.

Global Cluster = ≤9 write zones. Each zone:

- Highest Priority: primary nodes; drives country→zone write routing. For low-latency secondary reads, add a Read-only node in every other zone’s Highest Priority region.  
- Electable: secondaries eligible for failover.  
- Read-only: non-electable secondaries for reads.  
- Analytics: tagged read-only nodes for report queries.

Shard placement: Atlas spreads each shard across zone regions; ≤70 shards/cluster.

Builder offers templates (latency/coverage estimates).

## Configure Zones

1. In Atlas → Clusters → Edit Config → choose cluster.  
2. Define regions per zone, then Save.

(Atlas doesn’t auto-shard collections; UI sharding requires Atlas-Managed Sharding + compatible collection.)

## Connection String Note

If you delete a zone and use standard (non-DNS-seedlist) URI, string may change. After deployment: Clusters → Connect to obtain new URI.

</section>
<section>
<title>Move a Cluster to a Different Region</title>
<url>https://mongodb.com/docs/atlas/tutorial/move-cluster/</url>
<description>Learn how to move a cluster to a different region in Atlas, considering factors like cluster tier, node configuration, and billing implications.</description>


# Move Cluster to Different Region

Flex clusters & Serverless instances: not supported.

## Rules & Limits
- Tier support:  
  • M0/M2/M5/Flex ➜ upgrade tier to move.  
  • M10+ multi-region ➜ move anytime.  
- Electable nodes (Preferred + Electable regions): total must be 3, 5, 7; any node may become primary.
- Migration: Atlas moves one member at a time (secondaries → primary). Initial sync adds load; reads from secondaries lose 1 node during move.
- AWS VPC Peering: moving out of a peered region breaks that connection; create new peering and add IP access-list entries. Remaining nodes keep old peering.
- Billing: after region change you’re billed for backup storage in old+new regions until you disable then re-enable Continuous Cloud Backup (history is deleted).

## Move Single-Region Cluster
1. Atlas UI → Clusters.  
2. Edit Config (or Configuration) for cluster.  
3. Cloud Provider & Region → choose new region.  
   • M0 must also pick higher tier; region list limited.  
4. Review Changes → Apply Changes (or Apply & Checkout).

## Move Multi-Region (M10+) Cluster
1. Atlas UI → Clusters → Edit Config.  
2. Cloud Provider & Region:  
   • For each region, pick new Region or adjust Number of Nodes.  
   • Preferred region change triggers replica-set election; test failover beforehand.  
   • Total electable nodes across regions must remain odd.  
3. Confirm & Deploy.

</section>
<section>
<title>Monitor Query Performance with Query Profiler</title>
<url>https://mongodb.com/docs/atlas/tutorial/query-profiler/</url>

# Monitor Query Performance with Query Profiler

• Availability: M10+ clusters, Serverless. Enabled by default (toggle in Project Settings › Database Monitoring Tools › Performance Advisor and Profiler).  
• Required roles: enable/disable – Project/Org Owner; view – Project Read Only or Project Observability Viewer.

## Function
• Parses `mongod` logs to surface slow ops; unaffected by Database Profiler level.  
• Default view aggregates all cluster hosts; Filter by Hosts supports specific nodes/primary/secondaries.  
• Metrics: Operation/Server Execution Time (default), Keys Examined, Docs Returned, Examined:Returned, Num Yields, Response Length.  
• Time ranges: 7d, 5d, 2d, 24h (default), 12h, 8h, 1h, 10 min.  
• Chart/table allow point-click drill-down; drag to zoom.  
• Table filters: namespace, op-type, metric.

## Binning (scatterplot grouping)
Grouped if same op-type, namespace, `hasSort`, `usedIndex`, and close timestamp.

## Managed Slow-Op Threshold
Atlas auto-sets per-host threshold from avg exec time; modify with:
```js
db.setProfilingLevel(1, { slowms: <ms> })
```
• Impacts perf/logs; resets on node restart.  
• To fix at 100 ms and bypass Atlas management: Atlas Administration API › Disable Managed Slow Operation Threshold. Not available on M0/M2/M5/Flex/Serverless (they use fixed 100 ms by default).

## Limits & Caveats
• Displays ≤100 k sampled logs/points; batch processing may delay ≤5 min.  
• Log floods may pause collection (UI only; downloadable logs complete).  
• `$lookup` with local reads may omit foreign-collection slow log; still inflates Namespace Insights latency.  
• High-latency ops on shards may lack corresponding foreign collection entry.

## Security
Profile data can expose query contents; assess compliance before enabling.

## Navigation
Cluster: View Monitoring › Query Insights › Query Profiler.  
Serverless: Monitoring tab.



</section>
<section>
<title>Review Cluster Metrics</title>
<url>https://mongodb.com/docs/atlas/monitor-cluster-metrics/</url>
<description>Monitor cluster metrics in Atlas to identify performance issues and ensure your cluster meets requirements, with options for premium monitoring and data retention.</description>


# Review Cluster Metrics

- Metrics shown per cluster, replica set, sharded cluster, Serverless instance, or process (list, Overview, real-time, Atlas Search). Toggle Members to pick nodes; hover **S/P** for secondary/primary.

## Key Charts
Connections – active client conns; upgrade tier if near cap  
Disk IOPS – IO/s vs provisioned limit  
Disk Usage – data + journal/log size  
Query Targeting – read efficiency; high ratio ⇒ poor indexes or `mongot` change streams  
Normalized System CPU – CPU%/cores; spikes imply disk reads  
Oplog GB/Hour – oplog growth; enlarge oplog if high

## Sampling & Retention
Basic: 1-min granularity (replication 85 s).  
Premium (any M40+ in project): 10-s; enabled until last M40 removed.  
Compaction: 48 h → 60 min ⇒ 1 h; 63 d → 24 h ⇒ 1 d.  
Retention: 10 s 8 h • 1 min 48 h • 5 min 48 h • 1 h 63 d • 1 d ∞ (premium only).  
Historic metrics persist if new cluster has same name, type, project.

## Burst Metrics
“Agg-Max” value per broader interval (e.g., Max Disk IOPS).

## Tier Exceptions
M0/M2/M5/Flex & Serverless: limited charts.  
M0 monitoring paused after 7 d inactivity; resumes on next connection.

## Tags
Add/manage on Clusters or Overview. No PII/PHI; tags visible to Billing, DataDog, Prometheus.

</section>
<section>
<title>Review Project Overview</title>
<url>https://mongodb.com/docs/atlas/review-all-cluster-metrics/</url>
<description>Review cluster metrics in Atlas to monitor performance, identify issues, and ensure your cluster meets requirements.</description>


# Cluster Metrics Overview

## Atlas CLI
```sh
atlas metrics disks describe <host:port> <disk> [opts]   # partition metrics
atlas metrics disks list     <host:port>          [opts] # list disks
```
Requires Atlas CLI install & login.

## Atlas UI
Clusters → Overview shows up to 4 core charts per cluster for quick health checks. Data stored with decreasing granularity. Serverless metrics not yet exported to 3rd-party tools.

## Charts
- **Connections** – Active client connections  
  • RS: primary only • Sharded: sum of primaries  
  Upgrade tier if near limits.

- **Data Size** (*Serverless*) – Bytes of stored data. Check auto-scale, backup billing.

- **Disk IOPS** (≥M10) – Read+write IOPS vs provisioned.

- **Disk Latency** – ms per op on MongoDB partition. NVMe RAID tiers (`M80/200/400`) show max drive value.

- **Disk Usage** (*Serverless & ≥M10*) – Used disk bytes.  
  • RS: primary • Sharded: sum • Color: <75 % green, 75–89 % yellow, ≥90 % red.

- **Logical Size** (M0/2/5) – Docs+indexes bytes; time-series shows compressed size. Same color thresholds as Disk Usage.

- **Network** (*Serverless & M0/2/5*) – Avg bytes/requests/sec.

- **Operations** – Aggregate reads (R) & writes (W).  
  • RS: primary • Sharded: sum.

Use metrics to detect performance issues and validate cluster sizing.

</section>
<section>
<title>Review Sharded Clusters</title>
<url>https://mongodb.com/docs/atlas/review-sharded-cluster-metrics/</url>
<description>Explore and monitor sharded cluster metrics in Atlas to identify performance issues and ensure your cluster meets requirements, with options to view and filter data.</description>


# Sharded Cluster Metrics in Atlas

Access: Clusters → View Monitoring or open cluster → Metrics.  

Sections: controls, chart, data-source table.

## Controls
• Granularity: 10 s (M40+), 1 min–1 day, or Auto. Rendering max = 100 k total pts / 3 k per series.  
• Zoom: 1 h–5 y; sets Current Display.  
• Current Display: custom start/end; sets Zoom=custom.  
• Display: pick one metric.  
• Collection: filter namespace (appears for chunk/shard size metrics; supports deleted namespaces).  
• Display Data: Individually ‑ per shard, Sum, Averaged.  
• View: SHARDS, MONGOS, CONFIGS.

## Chart Use
• Click-drag to zoom; double-click to reset (Current Display updates).  
• Hover for point stats.

## Data-Source Table Columns
Shard Name (click for metrics), Alerts (open/resolve), Data Size (SHARDS view only), Show (Primaries | Secondaries | All), Read/Write/Queued (hover for details).

</section>
<section>
<title>Integrate with Third-Party Services</title>
<url>https://mongodb.com/docs/atlas/tutorial/third-party-service-integrations/</url>
<description>Integrate Atlas with third-party services to receive alerts and analyze performance metrics, with options for Datadog, Opsgenie, PagerDuty, and more.</description>


# Integrate with Third-Party Services

* Serverless instances: no 3rd-party metrics.  
* Access: Org Owner / Project Owner.

## Atlas CLI  
```sh
# create / update
atlas integrations create <TYPE> [options]
# list all
atlas integrations list [options]
# describe one
atlas integrations describe <TYPE> [options]
# delete
atlas integrations delete <TYPE> [options]
# TYPES: DATADOG | OPS_GENIE | PAGER_DUTY | VICTOR_OPS | WEBHOOK
```

## Atlas UI  
Org ▸ Project ▸ Options ▸ Integrations → Configure service.

### Service-specific fields  
• Datadog API Key, Region US1|US3|US5|EU1|AP1 (default US1)  
• Microsoft Teams Incoming Webhook URL  
• New Relic Account ID, License Key, Insights Insert & Query Keys (plugin EOL 2021-06-16)  
• OpsGenie Team API Key, Region US|EU  
• PagerDuty Service Key (Events API v2; v1 still valid)  
• Slack OAuth2 token & Channel; legacy tokens deprecated (read-only)  
• SumoLogic Configure in SumoLogic docs (no Atlas fields)  
• VictorOps/Splunk On-Call REST API Key, Routing Key (opt)  
• Webhook URL, optional Secret  
 – Atlas POSTs alert JSON (same as Admin API Alerts)  
 – Header X-MMS-Event: alert.open | close | update | acknowledge | cancel | inform  
 – Header X-MMS-Signature: Base64 HMAC-SHA1(body, Secret)  
 – Ensure firewall allows Atlas IPs  
• Prometheus Enable to expose deployment metrics  

Only Datadog & OpsGenie provide EU endpoints.

</section>
<section>
<title>Integrate with Datadog</title>
<url>https://mongodb.com/docs/atlas/tutorial/datadog-integration/</url>
<description>Configure Atlas to send metric data to Datadog dashboards for enhanced monitoring and analysis.</description>


# Atlas–Datadog Integration

## Access & Prereqs  
- Role: `Project Owner`.  
- Cluster tier: `M10+`.  
- Datadog account + API key.  

## Enable Integration  
### Atlas CLI  
```sh
atlas integrations create DATADOG \
  --apiKey <DD_API_KEY> \
  --region {US1|US3|US5|EU1|AP1} \
  [--sendDatabaseMetrics true] \
  [--sendCollectionLatencyMetrics true]
```

### Atlas UI  
Project → Options → Integrations → Datadog → Configure  
Enter API key, region (`US1` default).  
(Optional) toggle “Send Database Metrics” / “Send Collection Latency Metrics”.  
Save.

### High-Cardinality Toggles (API field names)  
- `sendDatabaseMetrics=true` → exposes `mongodb.atlas.dbstats.*`  
- `sendCollectionLatencyMetrics=true` → exposes `mongodb.atlas.latencyStats.*`

## Metrics Exposed  
Format: Atlas alias (Datadog metric) — description

Process / Cluster  
- CONNECTIONS (mongodb.atlas.connections.current) — open connections count  
- DB_STORAGE_TOTAL (…stats.totalstoragesize) — total storage bytes  
- DB_DATA_SIZE_TOTAL (…stats.totaldatasize) — total data bytes  
- DB_INDEX_SIZE_TOTAL (…stats.totalindexsize) — total index bytes  
- DOCUMENT_METRICS_{RETURNED|INSERTED|UPDATED|DELETED} (…metrics.document.*) — docs/sec  
- NETWORK_BYTES_{IN|OUT} (…network.bytes.*) — bytes/sec in/out  
- NETWORK_NUM_REQUESTS (…network.num.requests) — requests/sec  
- OPCOUNTER_{CMD|QUERY|UPDATE|DELETE|GETMORE|INSERT} (…opcounters.*) — ops/sec  
- OP_EXECUTION_TIME_{READS|WRITES|COMMANDS} (…oplatencies.*.avg) — ms/operation  
- OPCOUNTER_REPL_{CMD|UPDATE|DELETE|INSERT} (…opcountersrepl.*) — secondary ops/sec  
- OPLOG_RATE_GB_PER_HOUR (…replset.oplograte) — oplog GB/h  
- QUERY_TARGETING_SCANNED_OBJECTS_PER_RETURNED (…queryexecutor.scannedobjectsperreturned) — scan/return ratio  
- QUERY_SPILL_TO_DISK_DURING_SORT (…query.sort.spillToDisk) — sort spills  
- REPLICATION_{LAG|OPLOG_WINDOW} (…replset.*) — seconds  
- REPLICATION_STATUS_{HEALTH|STATE} (…replstatus.*) — health (1/0) / state 0-10  
- MEMORY_{RESIDENT|VIRTUAL} (…mem.*) — MB

Disk  
- DISK_LATENCY_{READS|WRITES} (…disk.latency.*) — ms  
- DISK_MAX_LATENCY_{READS|WRITES} (…disk.max.latency.*)  
- DISK_QUEUE_DEPTH / MAX_DISK_QUEUE_DEPTH (…queuedepth)  
- DISK_PARTITION_SPACE_{FREE|USED|PCT_FREE|PCT_USED} (…disk.space.*)  
- MAX_DISK_PARTITION_SPACE_{FREE|USED|PCT_FREE|PCT_USED} (…disk.max.space.*)  
- DISK_PARTITION_IOPS_{READ|WRITE|TOTAL|PCTUTIL} (…disk.iops.*)  
- MAX_DISK_PARTITION_IOPS_{READ|WRITE|TOTAL} (…disk.max.iops.*)

System  
- SYSTEM_MEMORY_{USED|AVAILABLE} (…system.memory.*)  
- MAX_SYSTEM_MEMORY_{USED|AVAILABLE} (…system.memory.max.*)  
- SYSTEM_NORMALIZED_CPU_{USER|KERNEL|NICE|IOWAIT|IRQ|SOFTIRQ|GUEST|STEAL} (…system.cpu.norm.*)  
- MAX_SYSTEM_NORMALIZED_CPU_* (…system.cpu.max.norm.*)  
- PROCESS_NORMALIZED_CPU_{USER|KERNEL|CHILDREN_USER|CHILDREN_KERNEL} (…mongoprocess.norm.*)  
- MAX_PROCESS_NORMALIZED_CPU_* (…mongoprocess.max.norm.*)  
- SYSTEM_NETWORK_BYTES_{IN|OUT} (…system.network.bytes.*)  
- MAX_SYSTEM_NETWORK_{IN|OUT} (…system.network.max.bytes.*)

WiredTiger Cache  
- CACHE_BYTES_{READ_INTO|WRITTEN_FROM} (…cache.bytes_*_cache)  
- CACHE_{USED|DIRTY}_BYTES (…cache.*_bytes_in_cache)  
- PAGES_{READ_INTO_CACHE|REQUESTED_FROM_CACHE} (…cache.pages_*)

WiredTiger Concurrency  
- TICKETS_AVAILABLE_{READS|WRITES} (…concurrenttransactions.*.available)

Global Locks  
- GLOBAL_LOCK_CURRENT_QUEUE_{READERS|WRITERS|TOTAL} (…global.lock.current.queue.*)

dbStats (requires `sendDatabaseMetrics`)  
- AVG_OBJECT_SIZE (…avg.object.size) — bytes  
- COLLECTIONS / VIEWS — counts  
- DATA_SIZE / STORAGE_SIZE / FILE_SIZE / INDEX_SIZE — bytes  
- INDEXES / OBJECTS / NUM_EXTENTS — counts

Collection Latency (requires `sendCollectionLatencyMetrics`)  
Suffixes: `.read|.write|.commands|.total`  
- *_LATENCY (…latencyStats.*.sum) — µs  
- *_OPS (…latencyStats.*.count) — ops  
- HISTOGRAM_{P50|P95|P99} (…latencyStats.*.pXX) — ops at percentile

Atlas Search  
Prefix `mongodb.atlas.search.*`  
- TOTAL_NUMBER_OF_{GETMORE_COMMANDS|DELETES|INDEX_FIELD|INSERTS_SERIES|UPDATES|ERROR_QUERIES|SUCCESS_QUERIES|TOTAL_QUERIES}  
- TOTAL_INDEX_SIZE_ON_DISK  
- MAX_REPLICATION_LAG  
- JVM_{CURRENT|MAX}_MEMORY

## Datadog Tags Added  
`organizationname`, `projectname`, `clustername`, `replicasetname`, `shardedclustername`, `databasename`, `collectionname`, `hostnameport`, `hostnamestate` – attached where applicable.

</section>
<section>
<title>Integrate with Microsoft Teams</title>
<url>https://mongodb.com/docs/atlas/tutorial/integrate-msft-teams/</url>
<description>Integrate Atlas with Microsoft Teams to receive alerts in your Teams channel by setting up a webhook and configuring alert settings.</description>


# Atlas–Microsoft Teams Alerts

## Access
- Org alerts: `Organization Owner` (billing-only alerts: `Organization Billing Admin`).
- Project alerts: `Project Owner` (Org Owners must add themselves to project).

## Prerequisite
Active Microsoft Teams account.

## Create Microsoft Teams Incoming Webhook
1. In desired Teams channel → `…` (More options) → **Connectors**.
2. Search **Incoming Webhook** → **Add** → **Configure**.
3. Name & (optional) image → **Create**.
4. Copy **Webhook URL** (used in Atlas) → **Done**.

---

## Organization-Level Alerts

1. Atlas UI: select organization → **Organization Settings** → **Alerts**.  
2. Create/Clone/Edit alert: **Add Alert** or `⋮` → **Clone/Edit**.  
3. Select Target: **User** or **Billing**.  
4. Choose Condition  
   • User: `no MFA`, `user joined`, `user left`, `role changed`.  
   • Billing: `card expiring`, `billed yesterday > $`, `project bill > $`, `org bill > $`. Supply USD amount where required.  
5. Under **Add Notification Method** → **Microsoft Teams** → paste Webhook URL.  
   • (Optional) **Post Test Alert**.  
   • Set **Recurrence** (trigger interval, resend).  
6. **Add** to save.

---

## Project-Level Integration & Alerts

### Enable Integration
1. Atlas: org & project selected → **Options** → **Integrations**.  
2. Find **Microsoft Teams** → **Configure** → paste Webhook URL → (optional) **Test Integration** → **Activate**.

### Configure Alerts
1. Atlas: project → **Project Alerts** (`bell` icon or Options → Project Settings → Alerts).  
2. **Add → New Alert**, or Alert Settings `⋮` → **Clone/Edit**.  
3. Define Condition (`Alert if`) and (optional) target filters (`For`, regex supported).  
4. **Send to**:  
   • (Optional) `send if condition lasts at least` minutes (delay).  
   • (Optional) `resend after` minutes (≥5).  
   • **Add → Microsoft Teams** (Webhook auto-filled).  
5. **Save**.

</section>
<section>
<title>Integrate with PagerDuty</title>
<url>https://mongodb.com/docs/atlas/tutorial/pagerduty-integration/</url>
<description>Integrate Atlas with PagerDuty to send alerts, record incidents, and synchronize resolutions between the platforms.</description>


# Atlas–PagerDuty Integration

• Sends Atlas alert events to PagerDuty, auto-closes incidents when alerts resolve.

Required role: **Project Owner** (org owner must add selves).  
Prereq: PagerDuty account (API v2 keys default; v1 still valid).

## Atlas CLI
```sh
# create / update
atlas integrations create PAGER_DUTY [options]

# delete
atlas integrations delete PAGER_DUTY [options]
```

## Atlas UI
1. Org & project → **Options ▸ Integrations** → PagerDuty card.  
2. Click **Configure**. Choose:

   a. **Sign in with PagerDuty** → log in → pick one or more services → select default → *(optional)* Test Integration → **Save**.  
   b. **Integration Key** → paste key → *(optional)* Test Integration → **Save**.  
   • Invalid keys may appear valid; Atlas sends an initial alert—verify incident appears in PagerDuty.

Remove integration: **Remove** on PagerDuty card.

Need help → MongoDB Support.

</section>
<section>
<title>Integrate with Prometheus</title>
<url>https://mongodb.com/docs/atlas/tutorial/prometheus-integration/</url>
<description>Integrate Atlas with Prometheus to monitor deployment metrics, configure service discovery, and visualize data using Grafana.</description>


# Integrate with Prometheus

## Limits & Prereqs  
- Not supported on Atlas for Government.  
- Cluster tier ≥ M10.  
- Prometheus instance running; its IP must be on the Project IP Access List. `0.0.0.0/0` in the list blocks this integration.  
- (Optional) Grafana for visualization.

## Setup  
1. Atlas UI → Project → Options → Integrations → Prometheus → Configure.  
2. Create & copy one-time username/password.  
3. Choose Service Discovery.

### HTTP SD (Prometheus ≥ 2.28)  
Whitelist Prometheus IP. Select “Public Internet Targets” or “Private IP for Peering”. Add to `prometheus.yml`:

```yaml
- job_name: "<job>"
  scrape_interval: 10s
  metrics_path: /metrics
  scheme: https
  basic_auth: {username: <user>, password: <pass>}
  http_sd_configs:
  - url: https://cloud.mongodb.com/prometheus/v1.0/groups/<group_id>/discovery
    refresh_interval: 60s
    basic_auth: {username: <user>, password: <pass>}
```

### File SD  
Fetch targets with Basic Auth and write `targets.json` periodically:

```sh
curl -u <user>:<pass> \
'https://cloud.mongodb.com/prometheus/v1.0/groups/<group_id>/discovery' \
-o /path/targets.json
```

Reference file in `prometheus.yml`:

```yaml
file_sd_configs:
  - files: [/path/targets.json]
```

4. Click Save, restart Prometheus, verify in Status → Targets.

## Sample Dashboards  
Grafana UI → + → Import → Upload `mongo-metrics.json` or `hardware-metrics.json`.

## Metrics Exposed

Categories:  
• MongoDB serverStatus / replSetGetStatus  
• `mongodb_info` gauge  
• Hardware (`hardware_*`)

### MongoDB metric labels  
availability_zone, cl_name, cl_role, group_id, group_name, org_id, node_type(ELECTABLE|READ_ONLY|ANALYTICS), process_port, provider(AWS|GCP|AZURE), region, rs_nm, rs_state.  
Extra in `mongodb_info`: mongodb_version, replica_state_name, process_type(mongod|mongos|config).

### Hardware metric labels  
availability_zone, cl_name, disk_name, group_id, group_name, org_id, node_type, process_port, provider, region, replica_set_name.

### Hardware metric names  
hardware_disk_metrics_{disk_space_free_bytes,disk_space_used_bytes,read_count,read_time_milliseconds,sectors_read,sectors_written,total_time_milliseconds,weighted_time_io_milliseconds,write_count,write_time_milliseconds}  
hardware_platform_num_logical_cpus  
hardware_process_cpu_{children_kernel_milliseconds,children_user_milliseconds,kernel_milliseconds,user_milliseconds}  
hardware_system_cpu_{guest,guest_nice,idle,io_wait,irq,kernel,nice,soft_irq,steal,user}_milliseconds  
hardware_system_memory_{buffers,cached,mem_available,mem_free,mem_total,shared_mem,swap_free,swap_total}_kilobytes  
hardware_system_network_{eth0_bytes_in_bytes,eth0_bytes_out_bytes,lo_bytes_in_bytes,lo_bytes_out_bytes}  
hardware_system_vm_page_{swap_in,swap_out}

(Use Prometheus expression browser for full descriptions.)

</section>
<section>
<title>Cluster Configuration Costs</title>
<url>https://mongodb.com/docs/atlas/billing/cluster-configuration-costs/</url>
<description>Understand how cloud provider, region, cluster tier, storage capacity, and backup options affect Atlas cluster costs.</description>


# Cluster Configuration Costs

## Cloud Provider & Region
Provider (AWS, GCP, Azure) and region determine all cluster, backup, and data-transfer prices. Multi-region clusters add cost per extra region. Preferred Region price shown at creation; full cost appears in Cluster Overview.

## Cluster Tier
Tier sets default RAM, storage GB, and IOPS.

### Storage Capacity
Default GB is billed in hourly cluster price; still billed while paused.  
Custom GB ⇒ pay for full requested size (default not deducted).  
IOPS limits rise with GB. Example: M10 default 10 GB, max 120 GB; selecting 50 GB bills for 50 GB.

### Storage Speed (IOPS)
AWS: Standard → Fast → Fastest (switches to provisioned IOPS SSD, higher cost).  
Azure: Premium SSD; IOPS scales with GB; extra IOPS billed.  
GCP: SSD persistent disk; IOPS scales with GB; no separate speed option.

### Auto-Scaling
Optional; Atlas up/down-sizes tier and/or storage automatically based on usage.

## Backup Billing

### Cloud Backups (Snapshot)
Charges: snapshot storage (replica + config sets), restore data transfer.

Rates per GB-month: AWS $0.14-0.19, Azure $0.34-0.65, GCP $0.08-0.12.

`GB-days` line items = (rate × 12)/365 per GB per day.

```text
daily_cost = GB * ((monthly_rate * 12) / 365)
```

Snapshot billing may equal full volume size if provider reports full-cap usage.

Restore via HTTPS adds:
• Atlas Backup Download VM (per hr)  
• Atlas Backup Restore Storage (full restore disk)  
• Data transfer (public or private link fees)

### Continuous Cloud Backups (PITR)
Billed on combined snapshot + oplog size (first 5 GB free).

Prices ($/GB-month):

| Provider | 5-100 GB | 100-250 GB | 250-500 GB | >500 GB |
|----------|----------|------------|------------|---------|
| AWS      | 1.00-1.55| 0.75-1.20  | 0.50-0.80  | 0.25-0.40 |
| Azure    | 1.00-3.95| 0.75-2.95  | 0.50-2.00  | 0.55-1.00 |
| GCP      | 0.60-0.95| 0.45-0.70  | 0.30-0.50  | 0.15-0.25 |

Example: AWS 115 GB → (95×1.00)+(15×0.75)=$106.25/mo.

### Multi-Region Backup Copies
Extra charges: inter-region transfer + storage in target region(s).  
GCP copies are full snapshots (no incrementality) ⇒ can multiply costs. AWS/Azure preserve incrementality.

### Reduce Backup Costs
Delete or retain fewer snapshots, lower snapshot frequency/retention, limit cross-region copies, improve data-change efficiency, switch provider/region, shorten PIT window.

## BI Connector (EOL Sept 2026)
Daily uplift (capped monthly) added to cluster price when enabled, except Enterprise/Platinum plans.

## Node Count Pricing
Charged per data-bearing node (replication factor × shards). Sharded clusters also run 3 config servers billed separately.

</section>
<section>
<title>Rotate Service Account Secrets</title>
<url>https://mongodb.com/docs/atlas/tutorial/rotate-service-account-secrets/</url>
<description>Rotate service account secrets before they expire, anywhere from 8 hours to 365 days.</description>


# Rotate Service Account Secrets

Service account secrets last 8 h–365 d. Atlas raises alert `Service Account Secrets are about to expire`. To rotate:

## Steps (UI)

1. Org Access Manager → Applications → Service Accounts → select account.  
2. Generate New Client Secret  
   • Pick duration → Generate → Copy secret (viewable only once) → Close.  
3. Update application with new secret ASAP.  
   • Old secret now expires in ≤7 d (min(original remaining time, 7 d)).  
4. Revoke old secret (Revoke → confirm).

## Steps (API)

Atlas Administration API endpoints:  
• POST `/api/atlas/v2/orgs/{orgId}/serviceAccounts/{id}/secrets` → new secret.  
• DELETE `/api/atlas/v2/orgs/{orgId}/serviceAccounts/{id}/secrets/{secretId}` → delete old.  
Same 7-day max overlap; update app promptly.

Configure alert settings separately as needed.

</section>
</guide>