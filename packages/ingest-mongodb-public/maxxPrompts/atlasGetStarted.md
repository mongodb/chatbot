<guide>
<guide_topic>MongoDB Atlas - Get Started Tutorials</guide_topic>

<section>
<title>Get Started with Atlas</title>
<url>https://mongodb.com/docs/atlas/getting-started/</url>
<description>How to create an Atlas cluster, connect to it, and load sample data using the Atlas CLI or user interface.</description>


# Get Started with Atlas

## Atlas CLI
```sh
atlas setup [options]   # creates acct, free cluster, loads sample data, adds your IP, creates DB user, prints conn string
```
Run anytime to init or finish cluster setup. See Atlas CLI docs for flags.

## Atlas UI
1. Create account (Google or email).  
2. Deploy Free cluster.  
3. Add DB users (required for auth).  
4. Configure IP access list (only listed IPs can connect).  
5. Connect via mongosh, Node, PyMongo, or Compass.  
6. Insert/view documents with drivers.  
7. Load sample or synthetic data.

## Next Steps
Explore Atlas Search.

</section>
<section>
<title>Create an Atlas Account</title>
<url>https://mongodb.com/docs/atlas/tutorial/create-atlas-account/</url>
<description>How to get started with MongoDB Atlas by setting up a new account, organization, and project.</description>


# Create an Atlas Account

• One login method only: email, GitHub, or Google.  
• Federated Auth → use company email.  
• GitHub/Google sign-in: user details, pwd, 2FA managed by provider; Atlas 2FA disabled; can unlink later.  
• Cloud Manager creds work in Atlas.

Prereqs  
• Allowlist CDN: `https://assets.mongodb-cdn.com/`  
• GitHub registration requires public email (GitHub > Settings > Public profile > Public email).

## Register

CLI  
```sh
atlas auth register [options]   # or run 'atlas setup'
```

UI  
1. Go to Atlas registration.  
2. Choose Email, GitHub, or Google, then follow provider prompts.  
Email pwd rules: ≥8 chars, not email/username, not last 24 pwds, not common.

## Login

CLI  
```sh
atlas auth login [options]
```

UI  
Visit Atlas login page and select Email, GitHub, or Google.

## Org & Project

Atlas auto-creates an organization + project; you may add more. Org = global security/users; Project = cluster-level roles.

Next: open project and Deploy a Free Cluster.

</section>
<section>
<title>Deploy a Free Cluster</title>
<url>https://mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/</url>
<description>How to deploy a free tier cluster in MongoDB Atlas using the Atlas CLI, Admin API, or Atlas user interface.</description>


# Deploy a Free Cluster

Free `M0` cluster (one per project) gives perpetual dev environment.

CLI  
```sh
atlas setup [options]   # creates M0, loads sample data, adds IP, creates DB user
```

API  
```http
POST /api/atlas/v1.0/groups/{PROJECT-ID}/clusters
{
  "name": "<clusterName>",
  "providerSettings": {...},
  "clusterType": "REPLICASET",
  "instanceSize": "M0"
}
```

UI  
1. Log in → select Org/Project → Overview → **Create**.  
2. Pick **M0**.  
3. Choose cloud: AWS, GCP, or Azure; then supported region.  
4. Name ≤64 ASCII letters/numbers/hyphens (immutable).  
5. Create → wait (~10 min).  
6. In Security Quickstart:  
   • Create DB user (username & password).  
   • Add current IP to access list.  

Next: manage database users.

</section>
<section>
<title>Manage the Database Users for Your Cluster</title>
<url>https://mongodb.com/docs/atlas/tutorial/create-mongodb-user-for-cluster/</url>
<description>Create a database user to access your Atlas cluster, requiring authentication for security purposes.</description>


# Manage Database Users

- Atlas clients must authenticate via MongoDB database users (distinct from Atlas UI users).
- Create/manage users: Project/Org **Owner** role required.
- First user made during cluster creation; edit/add via “Configure Database Users”.
- After user setup, configure IP Access List and other security settings.

</section>
<section>
<title>Connect to Your Cluster</title>
<url>https://mongodb.com/docs/atlas/tutorial/connect-to-your-cluster/</url>
<description>How to connect to your Atlas cluster using mongosh, Compass, or a driver.</description>


# Connect to an Atlas Cluster

Prerequisites  
• Atlas account, project, active cluster  
• DB user created (username + password)  
• Client IP in IP Access List  

Navigation (all methods)  
Clusters → Connect → choose Connection Type  
• Standard (public IP)  
• Private IP for Peering  
• Private Endpoint  
Connect modal → choose: Shell | Compass | Drivers  
Copy the unique URI shown (`mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority`).  
Escape reserved URI chars (e.g. `@` → `%40`).  
For multi-cloud reads: append `readPreference=primaryPreferred|secondary|secondaryPreferred`.

---

## MongoDB Shell (`mongosh`)

Install  
Windows/Linux: download tgz/zip or package; add `mongosh` to `PATH`.  
macOS: `brew install mongosh`.

Test  
```sh
mongosh --version
```

Connect  
```sh
mongosh "mongodb+srv://<user>@<cluster>/?retryWrites=true&w=majority"
# enter password when prompted
```

---

## MongoDB Compass

Install from Connect → Compass or https://www.mongodb.com/try/download/compass  
Open Compass → New Connection → paste URI (or Fill Fields for SSL/SSH/X.509, multi-cloud). → Connect.  
(Optional) Create Favorite to save.

---

## Driver Quick Starts

After Connect → Drivers pick language, copy URI, replace `<password>`.

### C#
```bash
dotnet new console -n connect && cd connect
dotnet add package MongoDB.Driver
```
```csharp
using MongoDB.Bson; using MongoDB.Driver;

var client = new MongoClient("<uri>");
try {
  client.GetDatabase("admin").RunCommand<BsonDocument>(new BsonDocument("ping",1));
  Console.WriteLine("Connected");
} catch(Exception e){Console.WriteLine(e);}
```
```bash
dotnet run
```

### Go
```bash
mkdir connect && cd connect
go mod init connect
go get go.mongodb.org/mongo-driver/v2/mongo
```
```go
package main
import (
  "context" ; "fmt"
  "go.mongodb.org/mongo-driver/v2/mongo"
  "go.mongodb.org/mongo-driver/v2/mongo/options"
  "go.mongodb.org/mongo-driver/v2/mongo/readpref")
func main(){
  client, _ := mongo.Connect(options.Client().ApplyURI("<uri>"))
  defer client.Disconnect(context.TODO())
  if err:=client.Ping(context.Background(),readpref.Primary()); err!=nil{panic(err)}
  fmt.Println("Connected")
}
```
```bash
go run .
```

### Java (Sync)
Add dependency (Maven/Gradle).  
```java
import com.mongodb.*; import com.mongodb.client.*; import org.bson.*;
public class Connect{
  public static void main(String[] args){
    String uri="<uri>";
    MongoClientSettings s=MongoClientSettings.builder()
        .applyConnectionString(new ConnectionString(uri))
        .serverApi(ServerApi.builder().version(ServerApiVersion.V1).build())
        .build();
    try(MongoClient c=MongoClients.create(s)){
      c.getDatabase("admin").runCommand(new BsonDocument("ping",new BsonInt64(1)));
      System.out.println("Connected");
    }
  }
}
```
```bash
javac Connect.java && java Connect
```

### Node.js
```bash
npm install mongodb --save
```
```javascript
const {MongoClient}=require("mongodb");
const client=new MongoClient("<uri>");
(async ()=>{
  try{await client.connect();console.log("Connected");}
  finally{await client.close();}
})();
```
```bash
node connect.js
```

### Python
```bash
python -m pip install "pymongo[snappy,gssapi,srv,tls]"
```
```python
from pymongo import MongoClient
client=MongoClient("<uri>")
client.admin.command("ping")
print("Connected")
```

---

Troubleshooting  
• Ensure IP allowed and credentials correct.  
• For forgotten credentials create a new DB user.  
• Private IP/Endpoint options require corresponding atlas network config to be `AVAILABLE`.

</section>
<section>
<title>Insert and View a Document</title>
<url>https://mongodb.com/docs/atlas/tutorial/insert-data-into-your-cluster/</url>

# Insert & View Documents

Prereqs: connect to Atlas cluster as a DB user.

Sample docs (used in all examples):
```json
[
  {
    "name": { "first": "Alan", "last": "Turing" },
    "birth": ISODate("1912-06-23"),
    "death": ISODate("1954-06-07"),
    "contribs": ["Turing machine", "Turing test", "Turingery"],
    "views": 1250000
  },
  {
    "name": { "first": "Grace", "last": "Hopper" },
    "birth": ISODate("1906-12-09"),
    "death": ISODate("1992-01-01"),
    "contribs": ["Mark I", "UNIVAC", "COBOL"],
    "views": 3860000
  }
]
```
Query filter: `{ "name.last": "Turing" }`

---

## Atlas UI  
1. Clusters ▸ Browse Collections.  
2. +Create Database → name `gettingStarted`, collection `people`.  
3. Insert Document ▸ JSON view ▸ paste docs above.  
4. Filter field ▸ paste query ▸ Apply → view result.

## MongoDB Shell (`mongosh`)
```shell
use gettingStarted
db.people.insertMany(<docs>)
db.people.find({ "name.last": "Turing" })
```

## MongoDB Compass  
1. +Create Database (`gettingStarted.people`).  
2. Documents ▸ Add Data ▸ Insert Document ▸ paste docs.  
3. Filter bar ▸ query ▸ Find.

---

## Driver Templates  
Replace `<CONN>` with your Atlas URI; all snippets:  
```pseudo
client = Connect(<CONN>)
col    = client.db("gettingStarted").collection("people")
col.insertMany(<docs>)
print(col.findOne({ "name.last": "Turing" }))
```

### C#  
```csharp
var client = new MongoClient("<CONN>");
var col = client.GetDatabase("gettingStarted").GetCollection<BsonDocument>("people");
col.InsertMany(docs);
var doc = col.Find("{\"name.last\":\"Turing\"}").First();
Console.WriteLine(doc);
```

### Go  
```go
client,_ := mongo.Connect(ctx, options.Client().ApplyURI("<CONN>"))
col := client.Database("gettingStarted").Collection("people")
col.InsertMany(ctx, docs)
var res Person
col.FindOne(ctx, bson.D{{"name.last", "Turing"}}).Decode(&res)
fmt.Println(res)
```

### Java (Sync)  
```java
try (MongoClient mc = MongoClients.create("<CONN>")) {
  MongoCollection<Document> col = mc.getDatabase("gettingStarted").getCollection("people");
  col.insertMany(Arrays.asList(doc1, doc2));
  System.out.println(col.find(eq("name.last","Turing")).first());
}
```

### Node.js  
```javascript
const client=new MongoClient("<CONN>");
await client.connect();
const col=client.db("gettingStarted").collection("people");
await col.insertMany(docs);
console.log(await col.findOne({"name.last":"Turing"}));
```

### Python  
```python
client = pymongo.MongoClient("<CONN>")
col = client["gettingStarted"]["people"]
col.insert_many(docs)
print(col.find_one({"name.last":"Turing"}))
```

---

Next: scale cluster, load sample or synthetic data if needed.

</section>
<section>
<title>Create a Cluster</title>
<url>https://mongodb.com/docs/atlas/tutorial/create-new-cluster/</url>
<description>Create a new Atlas cluster by following steps for configuration, cloud provider selection, and deployment options.</description>


# Create a Cluster

Access  
- Org Owner or Project Owner required.

Cluster types & deprecation  
- Flex: new default (replaces M2/M5 Feb 2025).  
- Dedicated: M10 + (M30 + recommended for prod, sharded/global/multi-region allowed).  
- Free: 1 × M0 per project.  
- Serverless, M2, M5 creation disabled Feb 2025.  
  • Auto-migrate M2/M5 → Flex Apr 2 2025.  
  • Auto-migrate Serverless → Free/Flex/Dedicated May 5 2025.

Limits  
- ≤25 clusters per project.  
- Cross-region node cap: Σ nodes in “other regions” ≤ 40 (excludes Free, Flex, intra-GCP). CSRS electable nodes count. No new multi-region cluster if ≥ 40 already.  
- Contact support to raise limits.

Security/Compliance  
- TLS ≥ 1.2 enforced July 31 2025.  
- Backup Compliance Policy auto-enables Cloud Backup on new clusters when policy active.  
- Network container/VPC auto-created if absent.  
- No sensitive data in cluster names (< 64 chars, first 23 internal; 23rd char ≠ “-”; names < 23 chars can’t end “-”).  
- No PII/PHI in tags.

Auto-Scaling (Dedicated)  
- Storage: auto-increase at 90 % disk (opt-out).  
- Tier: scale between min/max tiers (defaults: current & next).

CLI quick reference
```sh
# create cluster
atlas clusters create <name> \
  --provider AWS|AZURE|GCP \
  --region <region> \
  --tier FLEX|M10|... \
  [--diskSizeGB N] \
  [--mongoDBMajorVersion X.Y] \
  [--numShards N] \
  [--backup] \
  [--tag k=v] \
  [--enableTerminationProtection] \
  [--autoScale diskGB,compute]

# wait for readiness
atlas clusters watch <name>

# list deployable regions
atlas clusters availableRegions list
```

UI/API options  
- Cloud Provider & Region (single or multi-cloud/region; workload-isolation nodes: electable, read-only, analytics, search).  
- Cluster tier & storage (auto-scaling on/off).  
- Additional settings: sharding, BI Connector, customer-managed keys, termination protection.  
- Tags.

Basic UI workflow  
1. Clusters → Build/Create.  
2. Choose template or advanced config.  
3. Select cluster type, provider/region, tier, extras.  
4. Name cluster, add tags.  
5. Review cost, Confirm & Deploy.

Key dates  
- Feb 2025: creation of M2/M5/Serverless disabled.  
- Apr 2 2025: M2/M5 migrate.  
- May 5 2025: Serverless migrate.  
- Jul 31 2025: TLS 1.0/1.1 rejected.

</section>
<section>
<title>Create a Global Cluster</title>
<url>https://mongodb.com/docs/atlas/tutorial/create-global-cluster/</url>
<description>Learn how to enable Global Writes on an Atlas cluster, including configuring sharding and selecting cloud providers and regions.</description>


# Create a Global Cluster

## Prerequisites
- Role: `Organization Owner` or `Project Owner`.
- Cluster tier: `M30`+ (Dedicated, Sharded).
- Cannot convert to non-global, load sample data, or change sharding mode after deploy.
- Review VPC Peering if first paid cluster in region(s).

## Quick Steps
1. Atlas UI → Clusters → **Create** (or Build a Database → Advanced).
2. Choose **Dedicated**.
3. Expand **Global Cluster Configuration** → toggle **Enable Global Writes**.
4. Pick **Sharding Configuration**  
   • Atlas-Managed (auto `location` key & zones) – RECOMMENDED  
   • Self-Managed – you configure shard keys/zones via `mongosh` or driver.
5. Select Cloud Provider & Regions.

### Configure Zones (max 9 zones, 70 shards total)
Option | Key Points
---|---
Templates | Pre-built single-region zones + location map; editable. “Configure Local Reads in All Zones” converts to multi-region.
Single Region Zone | For each zone: choose preferred region, shards (#), adjust location mappings.
Multi-Region Zone | For each zone configure: Electable nodes (3/5/7 total; first row = primary priority), Read-only nodes, Analytics nodes. Supports cross-cloud/providers. Remove zone may change non-DNS connection strings.

### Cluster Tier & Settings
- Must remain `M30` or larger.
- Optional: MongoDB version, Cloud Backups, BI Connector, Customer-Managed Keys, etc.

### Cluster Name Rules
- ≤ 64 chars; internals use first 23 chars.  
  • Names <23 chars must NOT end with `-`.  
  • 23rd char cannot be `-`.  
  • First 23 chars unique within project.  
- Immutable; avoid sensitive data.

### Deploy
Click **Create Cluster**, review cost, then **Confirm and Deploy Cluster** (project limit: 25 clusters).

## After Deployment
- Atlas-Managed: shard collections via UI (Shard a Global Collection).
- Self-Managed: create shard key & shard collection manually.

For advanced zoning commands, see `Manage Zones` and `Zones` docs.

</section>
<section>
<title>Transition from Atlas BI Connector to Atlas SQL</title>
<url>https://mongodb.com/docs/atlas/tutorial/transition-bic-to-atlas-sql/</url>
<description>Migrate from Atlas BI Connector to Atlas SQL for enhanced data analysis capabilities and cost efficiency.</description>


# Transition from Atlas BI Connector to Atlas SQL

Atlas SQL (read-only, SQL-92) replaces Atlas BI Connector. Benefits: Data Federation sources, user-defined schema, pay-per-query, custom Tableau/Power BI drivers. Same Data Federation limits/pricing (Data Processed / Data Returned & Transferred).  

## Prereqs
• Atlas Federated DB instance  
• MongoDB DB user  

## Generate Readiness Report
Download OS-specific Atlas SQL Readiness Tool → `chmod +x <file>`.  
Optional inputs:  
• BI Connector logs (`mongosql.gz` → decompress)  
• Cluster URI (`mongodb+srv://…`).  

CLI:  
```sh
<file> [-i <logPath>] [--uri <URI>] -u <username> \
       [-o <outDir>] [--resolver cloudflare|google|quad9] \
       [--include <nsGlob>] [--exclude <nsGlob>] [--quiet]
```  
`--help` shows all flags. Output: HTML index + details on schema issues, incompatible queries, unknown data types.

## Transition Steps
1. Enable Atlas SQL on federated DB.  
2. Connect via Atlas SQL Interface (Tableau/Power BI/etc.).  
3. Run BI queries; update schema or syntax per failures (see SQL Language Reference & Schema Management).  
4. Validate in sandbox before production cutover.

## Limitations
• Read-only • SQL-92 only • inherits Data Federation limits.

## Troubleshooting Resources
Community Forum, Support, Professional Services, Customer Success.

</section>
<section>
<title>Create a System DSN</title>
<url>https://mongodb.com/docs/atlas/tutorial/create-system-dsn/</url>
<description>Create a system DSN for the BI Connector to connect SQL clients and BI tools to MongoDB using ODBC.</description>


# Create a System DSN

Not available for Atlas Flex or Serverless.

## Prerequisites
Windows: install “Visual C++ Redistributable 2015”.  
All OSs: install MongoDB BI Connector ODBC driver (ANSI=faster / Unicode=wider charset).

## Windows
1. Open “ODBC Data Sources (64-bit or 32-bit)”.
2. System DSN → Add → select “MongoDB ODBC ANSI” or “MongoDB ODBC Unicode”.
3. Click **Details**; fill:  
   • Data Source Name – any name  
   • TCP/IP Server – Atlas host  
   • Port – Atlas port, default `27015`  
   • Database – target DB  
   • User – `<username>?source=<authDB>`  
     ‑ SCRAM: authDB=`admin` (suffix optional)  
     ‑ LDAP:  authDB=`$external` (e.g. `myUser?source=$external`)  
   • Password – for User
4. Test → OK.

## macOS
1. Launch **ODBC Manager** → System DSN → Add → select ANSI/Unicode driver.
2. Enter DSN (optional Description).
3. Add keyword/value pairs (Add, double-click to edit):  
   • SERVER = Atlas host  
   • PORT = `27015` (or Atlas port)  
   • DATABASE = target DB (required by Excel)  
   • UID = `<username>?source=<authDB>` (rules above)  
   • PWD = password  
   (For full list see Connector/ODBC docs.)
4. OK to save.

</section>
<section>
<title>Connect from Excel</title>
<url>https://mongodb.com/docs/atlas/tutorial/connect-bic-excel/</url>
<description>Connect Excel to Atlas using the BI Connector for M10+ clusters, with steps for both Windows and macOS systems.</description>


# Connect from Excel

Flex clusters & Serverless not supported. BI Connector EOL Sept 2026 → migrate to Atlas SQL.

Prereqs  
Windows:  
- M10+ cluster with BI Connector enabled  
- System DSN targeting cluster  

macOS:  
- Same cluster  
- Excel 64-bit (`file -N /Applications/Microsoft\ Excel.app/Contents/MacOS/Microsoft\ Excel`)  
- iODBC (64-bit) + ODBC Manager  
- System DSN  

## Excel → Atlas via BI Connector

Windows:  
1. Data → From Other Sources → Data Connection Wizard.  
2. ODBC DSN → select cluster DSN → Next.  
3. Choose database/collection → Next → Finish.  
4. Pick worksheet format → OK.

macOS:  
1. Data → New Database Query → From Database.  
2. iODBC chooser: System DSN → select DSN → OK.  
3. Enter `username?source=<authDB>` & password.  
4. Pick collection, Run (optional preview) → Return Data.  
5. Import to Existing Sheet, New Sheet, or PivotTable → OK.

See MongoDB Connector for BI Manual & “Transition from Atlas BI Connector to Atlas SQL” for details.

</section>
<section>
<title>Connect from Tableau Desktop</title>
<url>https://mongodb.com/docs/atlas/tutorial/connect-bic-tableau/</url>
<description>Connect Tableau Desktop to Atlas using the BI Connector for SQL-based access to MongoDB databases, available for M10+ clusters.</description>


# Connect from Tableau Desktop (BI Connector)

• Supported: Atlas clusters ≥ M10 with BI Connector enabled.  
  – Not supported: Flex, Serverless.  
  – Heavy CPU/RAM; M10/20 may throttle → scale ≥ M30 or disable.  
  – BI Connector EOL Sept 2026; see Atlas SQL migration.

## Enable & Obtain Connection Info
Atlas UI: Cluster → Connect → Standard Connection → Connect Your Business Intelligence Tool. Note `Hostname`, `Port`, suggested `username`.

## Prereqs
Windows: Tableau ≥ 10.3, system DSN using MongoDB ODBC.  
macOS: Tableau ≥ 10.4, system DSN using MongoDB ODBC.

## Tableau Procedure
1. Start Tableau Desktop.  
2. To a server → More… → Other Databases (ODBC).  
3. Pick created DSN.  
4. Fill attributes:  
   • Server = Hostname  
   • Port = Port  
   • Username = `<user>?source=<auth_db>`  
   • Password = user’s password  
5. Sign In (macOS identical after DSN selection).

More: MongoDB Connector for BI Manual; Connection Tutorials.

</section>
<section>
<title>Connect from Qlik Sense</title>
<url>https://mongodb.com/docs/atlas/tutorial/connect-bic-qlik/</url>
<description>Connect Qlik Sense to Atlas using the BI Connector by creating a data connection with a system DSN.</description>


# Qlik Sense ↔ Atlas BI Connector

Unsupported: Flex/Serverless. BI Connector EOL Sep 2026 → migrate to Atlas SQL.

Prereqs  
• M10+ cluster with BI Connector enabled  
• System DSN (includes user/pass)  
• Qlik Sense Desktop

Connect  
1. Atlas UI: Cluster → Connect → Standard → Connect Your Business Intelligence Tool; record BI host/port.  
2. Qlik Sense: Create New App → Open → Add data → ODBC → Create New Connection → pick System DSN, leave user/pass blank → Create.

Refs: Atlas Connection Tutorials, BI Connector Manual.

</section>
<section>
<title>Connect from MySQL Workbench</title>
<url>https://mongodb.com/docs/atlas/tutorial/connect-bic-workbench/</url>
<description>Connect MySQL Workbench to Atlas using the BI Connector, following steps to configure connection parameters and test the connection.</description>


# Connect from MySQL Workbench

Flex & Serverless unsupported. BI Connector EOL Sept 2026 → migrate to Atlas SQL.

Prereqs  
- M10+ cluster with BI Connector enabled  
- MySQL Workbench 6.3–8.0.31 (5.7-compatible)

Procedure (Workbench 6.3)  
1. Start Workbench → “+” (or Manage Connections)  
2. Connection Parameters  
   - Hostname: value from Atlas “Connect” dialog  
   - Port: value from Atlas “Connect” dialog  
   - Username:  
     ```text
     <username>?source=<authDB>
     ```  
   - Password: store in keychain  
   - Default Schema: optional database  
3. SSL section → Use SSL: “If available”  
4. Advanced section → Enable Cleartext Authentication Plugin: checked  
5. Test Connection → OK → Close  
6. From Welcome page, double-click connection to open SQL Editor.

Troubleshoot failures by re-checking credentials & IP access list.

See MongoDB BI Connector manual for details.

</section>
<section>
<title>Connect from Power BI Desktop (Windows)</title>
<url>https://mongodb.com/docs/atlas/tutorial/connect-bic-powerbi/</url>
<description>Connect Power BI Desktop to Atlas using the BI Connector for data visualization, noting the transition to Atlas SQL by June 2025.</description>


# Connect Power BI Desktop to Atlas BI Connector (Windows)

Flex clusters & Serverless not supported. BI Connector deprecated Sept 2026 → migrate to Atlas SQL.

Prereqs  
- M10+ Atlas cluster with BI Connector enabled  
- System DSN pointing to the cluster  

Connect steps  
1. Atlas UI: Connect → Standard Connection → Choose a connection method → Connect Your Business Intelligence Tool. Copy ODBC info.  
2. Power BI Desktop: Home → Get Data → More… → ODBC → Connect.  
3. Select DSN → OK.  
4. In Navigator, choose database & collections → Load.  
5. Build visualizations.

Docs: MongoDB Connector for BI Manual; Transition guide to Atlas SQL.

</section>
<section>
<title>Connect Azure (Microsoft Azure) Services to Atlas with Azure (Microsoft Azure) Service Connector</title>
<url>https://mongodb.com/docs/atlas/tutorial/azure-service-connector/</url>
<description>Connect Azure compute services to your Atlas clusters by configuring your application with the necessary connection details.</description>


# Connect Azure Services to Atlas with Azure Service Connector (Preview)

### Limits  
- No connection-string validation; runtime errors possible.  
- String exposed in portal during setup.  
- Not in all Azure regions.  
- Env vars/console UI may lag or mis-name; only value editable.  
- Only SCRAM auth.  
- AKS: `MONGODBATLAS_CLUSTER_CONNECTIONSTRING` may be missing.  

### Prereqs  
Azure subscription, supported Azure compute (App Service, Function, AKS, etc.), Atlas cluster, its connection string.

### Steps  
1. Azure Portal › select compute resource › Settings › **Service Connector** › **+ Create**.  
2. Service type: **MongoDB Atlas Cluster (preview)**.  
3. Name connection › Next.  
4. Auth: keep “Connection string”.  
   - Paste Atlas URI.  
   - (Optional) Advanced › edit env-var name.  
5. Skip Networking (handle in Atlas).  
6. Review + Create ▸ wait until status succeeds.  
7. Verify new connector in list.

### App Usage  
Compute service now exposes the chosen env var (default `MONGODBATLAS_CLUSTER_CONNECTIONSTRING`). Application reads it with any MongoDB driver.

</section>
<section>
<title>Test Resilience</title>
<url>https://mongodb.com/docs/atlas/tutorial/test-resilience/</url>
<description>Simulate failovers and regional outages for clusters in Atlas using the UI or API to test resilience.</description>


# Test Resilience

Atlas UI/API  
- `Test Primary Failover`: simulate cluster primary failover.  
- `Simulate Regional Outage`: simulate regional outage for multi-region clusters.  

Access: `Project Cluster Manager` or higher.

</section>
<section>
<title>Test Primary Failover</title>
<url>https://mongodb.com/docs/atlas/tutorial/test-resilience/test-primary-failover/</url>
<description>Test the resilience of your Atlas cluster by simulating a primary failover and observing how your application handles the event.</description>


# Test Primary Failover

Unsupported on M0 Free & Flex clusters.

Access needed: Organization Owner, Project Owner, Project Cluster Manager, or Project Stream Processing Owner.

Prereqs  
• No pending changes; all nodes healthy.  
• Each repl-set/shard has a PRIMARY, <10 s lag, ≥5 % free disk, PRIMARY oplog ≥3 h.

Failover simulation  
1. Atlas stops current PRIMARY.  
2. Secondaries elect new PRIMARY.  
3. Old PRIMARY rejoins as SECONDARY; unreplicated writes roll back.  
Sharded: only mongos & shard primaries restart (in parallel).

CLI  
```sh
atlas clusters failover <clusterName> [options]
```

API: use Test Failover endpoint.

UI: Clusters → … → Test Resilience → Primary Failover → Restart Primary.

Post-check: Overview shows former PRIMARY as SECONDARY and another node as PRIMARY.

Troubleshoot: SRV connection string, latest driver, retryWrites=true, app retry logic.

</section>
<section>
<title>Simulate Regional Outage</title>
<url>https://mongodb.com/docs/atlas/tutorial/test-resilience/simulate-regional-outage/</url>
<description>Simulate a regional outage in Atlas to test application resilience using the UI or API, ensuring proper handling of connectivity loss in multi-region clusters.</description>


# Simulate Regional Outage

Unsupported: `M0`, Flex, Serverless, `M2/M5`.  
Required role: Org/Project Owner.

Process  
• Atlas drops network to chosen regions; no “Replica set has no primary” alert.  
• If app needs >15 min to detect loss, lower TCP retransmission (`tcp_retries2`).  

Atlas UI  
1. Clusters → … → Test Resilience → Regional Outage.  
2. Select Regions → choose:  
   • Minority (<½ electable nodes).  
   • Majority (>½; at least 1 electable left). Majority ⇒ no primary ⇒ writes & unsuitable reads fail.  
3. Simulate Regional Outage.  
4. End: click End Simulation. For Majority you may first add electable nodes (see “Reconfigure a Replica Set During a Regional Outage”).  

API  
Call Test Outage endpoint to start/stop simulations.  

Verification  
Ensure app reads/writes behave as expected.  

Troubleshooting  
If highest-priority regions lost: set readPreference to secondary, then add electable nodes and reconfigure.

</section>
<section>
<title>Manage Organization Access</title>
<url>https://mongodb.com/docs/atlas/tutorial/manage-organizations/</url>
<description>Manage organization access in Atlas by enabling multi-factor authentication and configuring IP access lists for API and UI.</description>


# Manage Organization Access

Org role required: `Organization Owner`.

## Require Multi-Factor Authentication
Atlas UI → Organizations menu → ⚙️ Organization Settings → toggle **Require Multi-Factor Authentication** ON.  
All users must have MFA enabled on their Atlas accounts.

## Require IP Access List for Atlas Administration API
Organization Settings → toggle **Require IP Access List for the Atlas Administration API** ON.  
Every Admin API call must originate from an IP in its key’s access list (see API Access Lists endpoint).

## Require IP Access List for Atlas UI
Feature must be enabled by Atlas Support.

### Configure / Enable
1. Organization Settings → Define **IP Access List for the Atlas User Interface** → **Configure**.  
2. Add IPv4 / IPv6 or CIDR entries. Rules:  
   • Must include your current IP/CIDR or **Enable** remains disabled.  
   • Cannot remove all addresses or your own.  
   • No malformed, duplicate, or out-of-range values.  
   • To modify an entry, delete and re-add.  
3. Optional description → **Add Entry** (or **Add my Current IP Address**).  
4. Click **Enable** → confirm.  
   Result: Atlas UI access limited to listed IPs; blocked users see:  
   ```
   You don't have permission to view <org-URL> in the Atlas UI...
   ```
   Admin API keys that inherit this list now enforce it.

### Edit
Organization Settings → Define list → **Edit** → adjust entries under same validation rules → **Save**.  
Save disabled if your IP/CIDR absent.

### Disable
Define list → **Configure** → **Disable** → confirm.  
Removes UI IP restrictions; list retained; inherited API keys stop enforcing it.

</section>
<section>
<title>Manage Organization Settings</title>
<url>https://mongodb.com/docs/atlas/tutorial/manage-organization-settings/</url>
<description>Manage organization settings in Atlas, including adding security contacts, disabling generative AI features, and configuring integrations like Slack and Vercel.</description>


# Manage Organization Settings

- All org-level settings require **Organization Owner** role.

## Security Contact
- Single email address for all security notifications; use a mailing-list address if multiple recipients needed.
- Deleting the user clears the contact.
### Add / Update
1. Org Settings → “Atlas Security Contact Information” → edit icon.
2. Enter email → Save.
### Delete
1. Org Settings → “Atlas Security Contact Information” → edit icon.
2. Clear email → Save.

## Disable Generative AI
- Enabled by default; when ON, Project Owners can toggle per project.
- Org Settings → toggle **Enable Atlas features that use generative AI** OFF (affects all projects).

## Integrations

### Slack
- One workspace per org.
#### Add
1. Org Settings → Integrations → **Add to Slack**.
2. Enter workspace, authenticate, Authorize → Save.
#### Remove
1. Org Settings → Integrations → **Remove Integration**.  
   (Alerts continue until Slack alert destinations are deleted.)

### Vercel
- Connect clusters to Vercel apps; see “Integrate with Vercel”.

## Live Migration
- Use an Atlas organization connection when migrating from Cloud/Ops Manager.

</section>
<section>
<title>Manage Project Access</title>
<url>https://mongodb.com/docs/atlas/tutorial/manage-projects/</url>
<description>Manage projects in Atlas by creating, viewing, moving, or deleting them within an organization.</description>


# Manage Project Access

Projects isolate envs, users, security, and alerts within an Atlas organization.

## Create Project
Prereqs: `Organization Owner` or `Organization Project Creator` (creator becomes `Project Owner`).

CLI  
```sh
atlas projects create <projectName> [options]
```

API: POST Create One Project  
UI: Projects → New Project → Name (≤64 chars, letters/numbers/space/-/_) → Add members → Assign roles → Create.

## View Projects
Access: `Org/Project Owner` or invited user. (Project invitations deprecated 13 Sep 2023; org invite covers all projects; expires 30 d).

CLI  
```sh
atlas projects list   [options]
atlas projects describe <ID> [options]
```

API: GET Return One Project(/by name)  
UI: Projects page (backup-policy icon shown when enabled).

## Move Project
Prereq: `Organization Owner` in both orgs.

Effects  
• Users/roles copied; teams not.  
• No downtime; connection string unchanged.  
• Existing API keys deleted—create new.

UI: Projects → ⋯ → Move Project → select dest org → Confirm.  
Billing hour credited to org that owned project during that hour.

## Delete Project
Blocked if Backup Compliance Policy has snapshots.

Prereqs  
• `Project Owner` or `Organization Owner`  
• No active clusters/serverless, Charts, App Services, private endpoints, federated DBs  
• No outstanding invoices

CLI  
```sh
atlas projects delete <ID> [options]
```

API: DELETE Remove One Project  
UI: Projects list or Project Settings → Delete Project (enter MFA code if prompted).

</section>
<section>
<title>Manage Project Settings</title>
<url>https://mongodb.com/docs/atlas/tutorial/manage-project-settings/</url>
<description>Manage project settings in Atlas, including updating settings via the CLI and configuring options like custom DNS, time zone, and performance features.</description>


# Manage Project Settings

Project Owner role required.

## Atlas CLI
```sh
# Update project settings
atlas projects settings update [opts]

# Describe project settings
atlas projects settings describe [opts]

# AWS Custom DNS
atlas customDns aws enable|disable|describe [opts]
```

## Atlas UI Settings (edit via Project Settings)
- Project Name  
- Project Time Zone (affects maintenance, alerts)  
- Tags (key=value)  
- Connect via Peering Only (GCP/Azure, deprecated; toggle only when no active dedicated clusters)  
- Custom DNS on AWS with VPC Peering (expose private-IP conn string; visible when AWS peering enabled)  
- Multiple Regionalized Private Endpoints  
  • Enable only if no non-sharded replica sets  
  • Post-enable: conn strings change; must update apps  
  • Cannot disable if >1 private endpoint across regions  
  • Only sharded clusters allowed after enable  
- Collect Database Specific Statistics  
- Preferred Cluster Maintenance Start Time  
- Project Overview landing page  
- Real Time Performance Panel  
- Data Explorer (disabling also blocks killing ops & index creation from UI)  
- Performance Advisor & Profiler  
- Schema Advisor (not available for Serverless)  
- Managed Slow Operations (auto slow-query threshold)  
- Enable Extended Storage Sizes (M40+, single-region; adds sync/restore latency, less HA)  
- Delete Charts (irreversible loss of dashboards, sources)  
- Delete Project (allowed only when no Online Archives)

User account settings: click username ➜ Account.

</section>
<section>
<title>View Activity Feed</title>
<url>https://mongodb.com/docs/atlas/tutorial/activity-feed/</url>
<description>Access and filter activity feeds in Atlas to view organization and project events, using the Atlas UI, CLI, or Administration API.</description>


# View Activity Feed

• Org feed: shows org-level events (billing, access, etc.) from creation→deletion.  
  ‑ Access: Org Member+  
• Project feed: shows project/cluster events (autoscale, etc.).  
  ‑ Access: Project Read Only+

## Access via

### Atlas CLI  
Org:  
```sh
atlas events organizations list [flags]
```  
Project:  
```sh
atlas events projects list [flags]
```

### Atlas Admin API  
GET /organizations/{orgId}/events  
GET /projects/{projectId}/events  

### Atlas UI  
Org: Org Settings ➜ Activity Feed  
Project: Project nav ➜ Activity Feed icon or Project Settings ➜ Activity Feed  

## UI Filtering  
• Filter by category + optional individual events  
• Date range (Start/End ➜ Apply Dates)  
• Project feed also filter by cluster(s)

### Event Categories

Organization & Project share core categories; Project feed adds extra (★):

Access – users, teams, API keys, service accounts, MFA, IAM/Federation  
Agent★ – Automation/Monitoring/Backup agent up/down, version  
Alerts – alert configs & acknowledgments  
Atlas★ – auto-indexing, auto-healing, Online Archive, auto-scale, cloud-provider access  
Atlas Network & Security★ – VPC peering, private endpoint, KMS, encryption-key rotation, MongoDB users/roles, audit log cfg  
Audit★ – kill op/session, support infra access, maintenance requests  
Backup★ – snapshots, restores, compliance policy, backup state/sync  
Billing – payments, credits, invoices, account plan, spending thresholds  
Charts★ – Charts tenant lifecycle  
Clusters★ – create/update/delete, SSL cert, host state, elections, maintenance, migrations, replicas/shards, rolling index build  
Data Federation★ – tenant create/update/delete, query logs  
Maintenance★ – window create/update, agent/instance OS maintenance  
Organization – creation, rename, limits, suspension, IP list policy, bill thresholds  
Others – mLab migration, BI Connector, support email, log retrieval  
Projects – project create/delete/move, maintenance, limits  
Resource Tags★ – tag add/modify  
Search★ – Atlas Search index ops  
Serverless★ – serverless instance/deployment lifecycle

## Custom Audit Filters (Data Explorer)

Project feed stops logging user names (reads/modifies) after 30 Jun 2025.  
Use database auditing to track roles:  
```javascript
{ role:"atlasDataAccessReadWrite", db:"admin" }
{ role:"atlasDataAccessReadOnly", db:"admin" }
{ role:"atlasDataAccessAdmin",  db:"admin" }
```  
Sample filter:  
```json
{
  "roles": { "$elemMatch": { "$or": [
    {"role":"atlasDataAccessReadWrite","db":"admin"},
    {"role":"atlasDataAccessReadOnly","db":"admin"},
    {"role":"atlasDataAccessAdmin","db":"admin"}
  ]}}
}
```

</section>
<section>
<title>Access an Encrypted Snapshot</title>
<url>https://mongodb.com/docs/atlas/tutorial/access-encrypted-snapshot/</url>
<description>Obtain access to data in your encrypted backup by accessing a kmip server proxy standalone.</description>


# Access an Encrypted Snapshot

Atlas-encrypted snapshots need a local KMIP Proxy plus `mongod` with KMIP to decrypt.

Considerations  
• Proxy reads creds from `<dbpath>/cloudProviderCredentials/<keyID>.<cloud>.metadata`. Update after key rotation.  
• Role-based KMS: metadata empty. Supply temp IAM keys by editing file (set `"roleId":""`) or add CLI flags `awsAccessKey awsSecretAccessKey awsSessionToken awsRegion`.  
• Snapshot download flow is identical to unencrypted.

Procedure  
1. Atlas UI → Clusters › Backup › Snapshots › Actions › Download. Get 1-hour URL.  
2. Download KMIP Proxy Standalone from modal (or Restores & Downloads / Security › Advanced).  
3. Start proxy  

AWS
```sh
kmipProxyStandalone \
  -cloudProvider aws \
  -awsAccessKey <id> -awsSecretAccessKey <key> \
  -awsSessionToken <token> -awsRegion <reg> \
  -dbpath <dbpath> -kmipPort <kmipPort> -mongodPort <mongodPort>
```
Azure / GCP
```sh
kmipProxyStandalone \
  -cloudProvider <azure|gcp> \
  -dbpath <dbpath> -kmipPort <kmipPort> -mongodPort <mongodPort>
```
(dbpath = snapshot dir)

Proxy writes `kmipCA.pem` and `kmipClient.pem` to `<dbpath>`.

4. Start `mongod`
```sh
mongod --dbpath <dbpath> --port <mongodPort> --enableEncryption \
  --kmipPort <kmipPort> --kmipServerName 127.0.0.1 \
  --kmipServerCAFile <dbpath>/kmipCA.pem \
  --kmipClientCertificateFile <dbpath>/kmipClient.pem \
  --kmipActivateKeys false
```

5. Access data via `mongosh`, Compass, `mongodump`, or `mongorestore`.

</section>
<section>
<title>Upgrade Major MongoDB Version for a Cluster</title>
<url>https://mongodb.com/docs/atlas/tutorial/major-version-change/</url>
<description>Upgrade your Atlas cluster's MongoDB version by creating a staging cluster to test application compatibility before updating the production environment.</description>


# Upgrade Major MongoDB Version (Atlas)

### Key Rules
- Cluster must be healthy.
- Upgrade **one major version at a time**; review Release Notes or use Stable API for compat.
- Downgrade impossible **unless FCV was pinned first**.
- Starting 6.0: `$$SEARCH_META` invalid after `$searchMeta`.
- Live migration usually requires matching FCV.
- Role needed: **Project Owner+**.

### Staging Workflow (strongly recommended)
1. Create staging cluster mirroring prod (use latest snapshot or Live Import).
2. Point staging app to it; validate functionality.
3. (Optional) Update drivers to latest for that MongoDB version.
4. In Atlas UI: Cluster → **Edit Config → Version = target major → Confirm & Deploy**.  
   Expect at least one replica-set election.
5. Run performance / failover tests.
6. When satisfied, repeat step 4 on production and monitor apps.
7. Issues → open Support ticket.

### Feature Compatibility Version (FCV)

Purpose: temporarily block new disk formats so you can roll back after an upgrade.

Limits  
- Dedicated clusters only; pin lasts **≤4 weeks**; not on rapid-release tiers.  
- Cannot pin once version is EOL.  
- Pinned FCV must be **<2 versions** behind desired binary version.

Actions (UI)  
- Pin: Cluster ⋮ → **Pin Feature Compatibility Version** → pick expiry (MM/DD/YYYY UTC, ≤4 weeks).  
- Unpin: Cluster ⋮ → **Edit Pinned Feature Compatibility Version → Unpin**.  
- Atlas auto-unpins on first maintenance after expiry.  
- API: `pinFCV` / `unpinFCV` endpoints.

### Downgrade One Major Version
Allowed only if:
- FCV pinned before original upgrade.
- Pinned FCV = desired downgrade version.
- Version not EOL and rapid-release OFF.

UI: Cluster ⋮ → **Edit Configuration → Additional Settings → Select Version (matches pinned FCV)** → Confirm.  
API: `modifyCluster`.

### Support
For migration/upgrade errors, file a High Priority ticket from the Atlas UI.

</section>
<section>
<title>Configure Maintenance Window</title>
<url>https://mongodb.com/docs/atlas/tutorial/cluster-maintenance-window/</url>
<description>Configure the hour for Atlas to start weekly maintenance on your cluster, with options for protected hours and urgent maintenance considerations.</description>


# Configure Maintenance Window

Configure from Project Settings (Org/Project Owner only).

Maintenance:
- Weekly, rolling; at least 1 replica-set election.  
- Atlas may ignore window for urgent security fixes.  
- Cannot edit window during active maintenance.  
- Start time ≈ scheduled start; may delay if cluster busy.  
- Low disk IOPS → brief slowdown while WiredTiger repopulates.  
- DB patch versions shown (current → target).

Protected Hours:
- Optional daily window (≤18 h) when Atlas skips standard, non-restart updates.

# Atlas CLI

```sh
atlas maintenanceWindows describe [opts]   # view
atlas maintenanceWindows update   [opts]   # set day/time, protectedHours, autoDefer
atlas maintenanceWindows clear    [opts]   # reset to default
atlas maintenanceWindows defer    [opts]   # push scheduled maint. 1 week (max 2)
```

# Atlas UI

Project Settings → Set Maintenance Window  
Select day/time → (optional) Auto-defer 1 week, toggle Protected Hours (≤18 h) → Save.  
To clear: toggle off.  
During scheduled maintenance banner/email (48–72 h). Options: Begin Now, Defer 1 Week (×2), or wait.

Cluster cards show target MongoDB patch version when upgrade pending.

</section>
<section>
<title>Convert a Serverless Instance to a Dedicated Cluster</title>
<url>https://mongodb.com/docs/atlas/tutorial/convert-serverless-to-dedicated/</url>
<description>Convert a Serverless instance to a dedicated cluster using Atlas UI or command-line tools like `mongodump` and `mongorestore`.</description>


# Convert Serverless → Dedicated Cluster

## Methods
1. Atlas UI (recommended) – keeps existing connection string.  
2. `mongodump` / `mongorestore`.  
3. Restore from Atlas Backup.

## Atlas UI Migration
Prereqs: Role ≥ Project Cluster Manager.

Key limits/warnings  
• Downtime; pause **all writes** (incl. Triggers, Data API, Functions).  
• No provider/region change; irreversible.  
• Must recreate private endpoints after upgrade.  
• Charts unavailable during migration.  
• If disk auto-scaling enabled, oplog ≥24 h.

Steps  
1. Clusters → ⋯ → Edit Configuration → Dedicated tab.  
2. Choose tier (≥M30/40 GB; 100 GB+ ⇒ M80/4 TB).  
3. (Opt) set other options, backups, tags.  
4. Review Changes → Apply Changes.  
5. Track progress: Metrics → “DB Storage”; migration completes after Atlas data-consistency check.  
6. Resume writes.

Connection: existing DNS SRV string works for new cluster.

## CLI Migration (`mongodump`/`mongorestore`)
Prereqs  
• Target dedicated cluster, same MongoDB major version.  
• Tools installed: `mongodump`, `mongorestore`.

1. Pause all writes on Serverless.  
2. Export:  
   ```bash
   mongodump --uri "mongodb+srv://<USER>:<PWD>@<HOST>/<DB>"
   ```  
   (Run per DB; output goes to ./dump/)
3. Import to dedicated cluster:  
   ```bash
   mongorestore --uri "mongodb+srv://<USER>:<PWD>@<HOST>"
   ```  
   (Use `--dir <path>` if dump not in ./dump.)
4. (Opt) Verify: Atlas → Browse Collections or connect and query.



</section>
<section>
<title>Move a Cluster to a Different Region</title>
<url>https://mongodb.com/docs/atlas/tutorial/move-cluster/</url>
<description>Learn how to move a cluster to a different region in Atlas, considering factors like cluster tier, node configuration, and billing implications.</description>


# Move Cluster to Different Region

Unsupported: Flex, Serverless.  

Supported:  
- `M0` only when tier upgraded (`M2/M5` deprecated).  
- `M10+` multi-region anytime.  

Electable nodes total must be 3/5/7; preferred & electable can become primary.  

Migration = one member at a time (secondaries → primary). Expect load during initial sync; one secondary unavailable, possible perf hit.  

AWS VPC: after region move, old peering unusable; create new peering + IP access list for new CIDRs.  

Billing: after region change, continuous backup bills old+new regions until you disable & re-enable it (history lost).  

## Procedure

1. Atlas → Clusters. (Select Org → Project if needed.)  
2. Edit Config (or Configuration).  
3. Cloud Provider & Region:  
   • Single-region: pick new region; `M0` must also raise tier.  
   • Multi-region `M10+`: for each region choose new region and/or change node count (total odd). Changing Preferred triggers elections; test failover first.  
4. Review/Confirm → Apply Changes / Confirm & Deploy.

</section>
<section>
<title>Monitor Query Performance with Query Profiler</title>
<url>https://mongodb.com/docs/atlas/tutorial/query-profiler/</url>

# Query Profiler (Atlas)

Availability  
• Only on M10+ clusters & Serverless.  
• Disabled for M0/M2/M5/Flex and can’t be enabled.

Purpose  
• Samples `mongod` logs to surface slow ops (independent of `db.setProfilingLevel` level).  
• UI: Query Insights → Query Profiler (cluster) or Monitoring tab (Serverless).

Host & Time Filters  
• Filter by host group/individual nodes.  
• View window: 7d, 5d, 2d, 24h, 12h, 8h, 1h, 10 min.

Metrics (chart & table)  
Operation Execution Time (default) | Server Execution Time (SLI) | Keys Examined | Docs Returned | Examined:Returned Ratio | Num Yields | Response Length.

Binning (ops aggregated) when all match: op type, namespace, `hasSort`, `usedIndex`, close timestamp.

Slow-op Threshold  
• Atlas auto-sets per host; editable with `db.setProfilingLevel(thresholdMS)` (resets on node restart; impacts perf/logging).  
• Opt-out to fixed 100 ms via Atlas Admin API (Disable Managed Slow Operation Threshold).  
• Atlas-managed threshold off by default on Serverless & free/low-tier clusters.

Limits  
• Displays ≤100 k sampled logs / datapoints; ≤5 min ingest lag.  
• Excessive log volume may pause collection (downloadable logs unaffected).  
• `$lookup` on same shard may not log foreign collection.

Security  
Profiler data may include sensitive query text; ensure compliance.

Required Roles  
Enable/disable: Project Owner or Org Owner.  
View: Project Read Only or Project Observability Viewer.

Enable/Disable  
Project Settings → Database Monitoring Tools → toggle “Performance Advisor and Profiler”.

Navigation  
Cluster card → View Monitoring → Query Insights → Query Profiler.  
Serverless → Monitoring.

UI Tips  
• Click point to view full query stats; zoom axes for detail (re-fetches data).  
• Table filters: namespace, operation, metric.

</section>
<section>
<title>Integrate with Third-Party Services</title>
<url>https://mongodb.com/docs/atlas/tutorial/third-party-service-integrations/</url>
<description>Integrate Atlas with third-party services to receive alerts and analyze performance metrics, with options for Datadog, Opsgenie, PagerDuty, and more.</description>


# Third-Party Integrations

Serverless metrics ⇒ no 3rd-party support.  
Access: Organization/Project Owner.

## Atlas CLI
Prereqs: install & auth.  
Create/Update  
```sh
atlas integrations create DATADOG|OPS_GENIE|PAGER_DUTY|VICTOR_OPS|WEBHOOK [opts]
```  
List  
```sh
atlas integrations list [opts]
```  
Describe  
```sh
atlas integrations describe <integrationType> [opts]
```  
Delete  
```sh
atlas integrations delete <integrationType> [opts]
```

## Atlas UI
Path: Org ▶ Project ▶ Options ▶ Integrations › Configure.

Required fields per service:  
• Datadog – API Key, Region US1/3/5, EU1, AP1 (def US1).  
• Microsoft Teams – incoming-webhook URL.  
• New Relic (plugin EOL) – Account ID, License Key, Insights Insert+Query Keys.  
• OpsGenie – Team Integration API Key, Region US/EU.  
• PagerDuty – Service Key (Events API v1/v2).  
• Slack – OAuth2 “Sign in with Slack”; legacy tokens read-only.  
• SumoLogic – follow Sumo docs; no Atlas fields.  
• VictorOps (Splunk On-Call) – API Key, Routing Key (opt).  
• Webhook – URL (+Secret). Atlas POST body matches Alerts API; header X-MMS-Event = alert.open|close|update|acknowledge|cancel|inform. If Secret, adds X-MMS-Signature (Base64 HMAC-SHA1). Allow Atlas IPs.  
• Prometheus – enable metrics export.

European endpoints only for OpsGenie & Datadog.

</section>
<section>
<title>Integrate with Datadog</title>
<url>https://mongodb.com/docs/atlas/tutorial/datadog-integration/</url>
<description>Configure Atlas to send metric data to Datadog dashboards for enhanced monitoring and analysis.</description>


# Integrate with Datadog

## Access & Prereqs  
- Atlas `Project Owner` role (`Org Owner` must add self).  
- Cluster tier ≥ M10.  
- Datadog account + API key.

## Enable Integration  
CLI  
```sh
atlas integrations create DATADOG \
  --apiKey <DD_API_KEY> \
  --region {US1|US3|US5|EU1|AP1} \
  [--sendDatabaseMetrics] \
  [--sendCollectionLatencyMetrics]
```  
UI: Project → Options → Integrations → Datadog → Configure; enter key, region, optional metric toggles → Save.

High-cardinality metrics require `sendDatabaseMetrics` and/or `sendCollectionLatencyMetrics`.

## Metric Families (Datadog metric name → meaning)
Process  
- CONNECTIONS mongodb.atlas.connections.current → open conns  
- DB_* `{totalstoragesize,totaldatasize,totalindexsize}` → bytes  
- DOCUMENT_{RETURNED,INSERTED,UPDATED,DELETED} → docs/s  
- NETWORK_{BYTES_IN,BYTES_OUT,NUM_REQUESTS} → rate/s  
- OPCOUNTER_{CMD,QUERY,UPDATE,DELETE,GETMORE,INSERT} → ops/s  
- OP_EXECUTION_TIME_{READS,WRITES,COMMANDS}.avg → ms  
- OPCOUNTER_REPL_{CMD,UPDATE,DELETE,INSERT} → secondary ops/s  
- OPCACHE/WT: CACHE_* , PAGES_*, TICKETS_AVAILABLE_{READS,WRITES}  
- MEMORY_{RESIDENT,VIRTUAL} MB  
- REPLICATION_{LAG,OPLOG_WINDOW} sec; OPLOG_RATE_GB_PER_HOUR  
- REPLICATION_STATUS_{HEALTH,STATE}  
- QUERY_* `{scannedobjectsperreturned,sort.spillToDisk}`  
- GLOBAL_LOCK_CURRENT_QUEUE_{READERS,WRITERS,TOTAL}

Disk  
- DISK_LATENCY_{READS,WRITES}, DISK_MAX_LATENCY_{READS,WRITES} ms  
- DISK_QUEUE_DEPTH, MAX_DISK_QUEUE_DEPTH  
- DISK_PARTITION_SPACE_{FREE,USED,PERCENTFREE,PERCENTUSED} (+MAX_*)  
- DISK_PARTITION_IOPS_{READ,WRITE,TOTAL,PERCENTUTILIZATION} (+MAX_*)

System  
- SYSTEM_MEMORY_{USED,AVAILABLE} (+MAX_*) bytes  
- SYSTEM_NORMALIZED_CPU_{USER,KERNEL,NICE,IOWAIT,IRQ,SOFTIRQ,GUEST,STEAL} (+MAX_*) %  
- PROCESS_NORMALIZED_CPU_{USER,KERNEL,CHILDREN_USER,CHILDREN_KERNEL} (+MAX_*) %  
- SYSTEM_NETWORK_BYTES_{IN,OUT} (+MAX_*)

Atlas Search  
- search.index.stats.{commands.getmore,deletes,index.fields,index.size,inserts,max.replication.lag,updates,queries.{error,success,total}}  
- search.jvm.{current,max}.memory

Database-level (`sendDatabaseMetrics`) – prefix `mongodb.atlas.dbstats.`  
- {avg.object.size,collections,data.size,file.size,index.size,indexes,num.extents,objects,storage.size,views}

Collection latency (`sendCollectionLatencyMetrics`) – prefix `mongodb.atlas.latencyStats.`  
- *_{read,write,commands,total}.{sum,count,p50,p95,p99}

## Datadog Tags  
organizationname, projectname, clustername, replicasetenname, shardedclustername, databasename, collectionname, hostnameport, hostnamestate

</section>
<section>
<title>Integrate with Microsoft Teams</title>
<url>https://mongodb.com/docs/atlas/tutorial/integrate-msft-teams/</url>
<description>Integrate Atlas with Microsoft Teams to receive alerts in your Teams channel by setting up a webhook and configuring alert settings.</description>


# Integrate with Microsoft Teams

• Roles  
‒ Org alerts: Organization Owner (Billing Admin = billing-only).  
‒ Project alerts: Project Owner (Org Owner must add self to project).

• Prereq: Microsoft Teams account.

## 1. Create Teams Incoming Webhook (once per channel)
Teams channel → ... → Connectors → Incoming Webhook → Add → Configure name/icon → Create → Copy URL.

---

## 2. Organization Alerts
1. Atlas: Org Settings → Alerts.  
2. Add/Clone/Edit alert.  
3. Select Target  
   • User: no MFA | user joined | left | role changed  
   • Billing: card expiring | billed yesterday > $X | any project bill > $X | org bill > $X  
4. Notification Method: Microsoft Teams → paste webhook → Post Test Alert (optional).  
5. Set Recurrence (send if lasts ≥ min, resend after ≥ 5 min).  
6. Add.

---

## 3. Project Alerts
A. Atlas: Project Integrations → Microsoft Teams → Configure → paste webhook → Test → Activate.  
B. Atlas: Project Alerts  
   1. Add/Clone/Edit alert.  
   2. Define “Alert if” condition (+ optional regex target filter).  
   3. Send to → Microsoft Teams (URL auto-filled); set delays/resend.  
   4. Save.

</section>
<section>
<title>Integrate with PagerDuty</title>
<url>https://mongodb.com/docs/atlas/tutorial/pagerduty-integration/</url>
<description>Integrate Atlas with PagerDuty to send alerts, record incidents, and synchronize resolutions between the platforms.</description>


# Integrate with PagerDuty

- Sends Atlas alerts to PagerDuty; incidents auto-resolve when alerts close.  
- Access: Project Owner.  
- Prereq: PagerDuty account (Events API v1 or v2 key OK).

## Atlas CLI
Create / update:  
```sh
atlas integrations create PAGER_DUTY --integrationKey <key> [opts]
```  
Delete:  
```sh
atlas integrations delete PAGER_DUTY [opts]
```

## Atlas UI
1. Org/Project → Options → Integrations → PagerDuty → Configure.  
2. Choose one method:  
   • Sign in with PagerDuty → pick services → choose default → Save.  
   • Enter Integration Key → Save.  
3. (Optional) Test Integration; Atlas also sends an initial alert—verify incident in PagerDuty.

Remove: Integrations page → PagerDuty card → Remove.

</section>
<section>
<title>Integrate with Prometheus</title>
<url>https://mongodb.com/docs/atlas/tutorial/prometheus-integration/</url>
<description>Integrate Atlas with Prometheus to monitor deployment metrics, configure service discovery, and visualize data using Grafana.</description>


# Prometheus Integration (Atlas)

## Requirements
- Atlas cluster ≥ M10; not supported on Atlas for Government.
- Prometheus v2.28+ up and reachable.
- **IP Access List** must include Prometheus host, NOT `0.0.0.0/0`.
- Optional: Grafana for visualization.

## Setup in Atlas UI
1. Project → Options → Integrations → Prometheus → Configure.  
2. Generate **username/password** (one-time copy).  
3. Choose **Service Discovery**:

### HTTP SD (preferred)
```yaml
# prometheus.yml
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
Select “Public Internet” or “Private IP for Peering”; private endpoints not supported.

### File SD
1. Periodically fetch targets:
```bash
curl -u <user>:<pass> \
  "https://cloud.mongodb.com/prometheus/v1.0/groups/<group_id>/discovery" \
  -H 'Accept: application/json' > /path/targets.json
```
2. Prometheus:
```yaml
- job_name: "<job>"
  ...
  file_sd_configs:
  - files: [/path/targets.json]
```

Restart Prometheus; verify under Status → Targets.

## Metrics Overview
- MongoDB serverStatus & replSetGetStatus
- `mongodb_info` gauge (always 1) + labels.
- Hardware metrics (disk, cpu, memory, network, vm).

### Common MongoDB Metric Labels
`availability_zone, cl_name, cl_role, group_id, group_name, org_id, node_type, process_port, provider, region, rs_nm, rs_state`

`mongodb_info` adds: `mongodb_version, replica_state_name, process_type`.

### Hardware Metric Names (selection)
```
hardware_disk_metrics_{disk_space_free_bytes,disk_space_used_bytes,read_count,read_time_milliseconds,sectors_read,sectors_written,total_time_milliseconds,weighted_time_io_milliseconds,write_count,write_time_milliseconds}
hardware_platform_num_logical_cpus
hardware_process_cpu_{children_kernel_milliseconds,children_user_milliseconds,kernel_milliseconds,user_milliseconds}
hardware_system_cpu_{guest,guest_nice,idle,io_wait,irq,kernel,nice,soft_irq,steal,user}_milliseconds
hardware_system_memory_{buffers,cached,mem_available,mem_free,mem_total,shared_mem,swap_free,swap_total}_kilobytes
hardware_system_network_{eth0,lo}_{bytes_in_bytes,bytes_out_bytes}
hardware_system_vm_page_{swap_in,swap_out}
```
Hardware metric labels: same as MongoDB labels plus `disk_name, replica_set_name`.

## Grafana
Import provided `mongo-metrics.json` and `hardware-metrics.json` dashboards (Upload JSON).

</section>
<section>
<title>Rotate Service Account Secrets</title>
<url>https://mongodb.com/docs/atlas/tutorial/rotate-service-account-secrets/</url>
<description>Rotate service account secrets before they expire, anywhere from 8 hours to 365 days.</description>


# Rotate Service Account Secrets

Secrets expire (8 h–365 d). Atlas alert: `Service Account Secrets are about to expire`.

## Atlas UI
1. Organizations ▶ Access Manager ▶ Organization Access Manager ▶ Applications ▶ Service Accounts ▶ <select account>.
2. Generate New Client Secret  
   • Generate New → choose duration → Copy secret (only view).  
3. Update application; previous secret disabled ≤7 d after new one (or original expiry if sooner).  
4. Revoke old secret: Revoke → confirm.

## Administration API
Use API to POST a new client secret and DELETE the old one. Same ≤7 d overlap; update app promptly.

</section>
</guide>