<guide>
<guide_topic>Atlas Stream Processing</guide_topic>

<section>
<title>Atlas Stream Processing</title>
<url>https://mongodb.com/docs/atlas/atlas-stream-processing/</url>
<description>Explore how to process complex data streams using Atlas Stream Processing, including setup, security, and managing stream processors.</description>


# Atlas Stream Processing

Process real-time streams with Atlas `/query-api`.

## Docs Overview
- Windows: capture time-bounded subsets  
- Security: control org/project/db permissions  
- Get Started guide  
- Instance: create | modify | delete  
- Stream Processors: create/manage  
- Aggregation Pipelines: define stream ops  
- Limitations

</section>
<section>
<title>Atlas Stream Processing Overview</title>
<url>https://mongodb.com/docs/atlas/atlas-stream-processing/overview/</url>
<description>Learn how MongoDB Atlas can connect to sources and sinks of streaming data to provide real time data processing leveraging the full power of MongoDB aggregation pipelines.</description>


# Atlas Stream Processing

• Stream = append-only log (Kafka topic, change stream, etc.).  
• Stream Processor = continuous MongoDB aggregation pipeline:

```txt
$source ➔ [$validate] ➔ stateless stages ➔ [window{stateful stages}] ➔ $emit | $merge
```

  – `$source`: bind to named connection.  
  – `$validate`: optional schema checks; bad docs routed to DLQ.  
  – Stateless ops anywhere.  
  – One window stage max; inside it use `$group`, $avg, etc.  
  – Terminal stage: `$emit` (Kafka) OR `$merge` (Atlas collection), exclusive.

Checkpointing: on commit, store checkpoint id + per-stateful-op state; on restart resume from last checkpoint.

Dead Letter Queue: assign Atlas collection; stores failed doc + error info.

## Stream Processing Instance
• Bound to cloud/region (AWS, Azure) & project.  
• Components  
  – Workers (4 processors/worker). Autoscale by running-processor count; deprovision when idle. Tier sets CPU/RAM.  
  – Connection registry: instance-scoped named endpoints; unlimited processors; any conn can be source or sink; each processor uses 1 source + 1 sink.  
  – Security context, instance connection string.  
• Workers run in customer-dedicated containers on multi-tenant infra.

Processors may access clusters on other providers/regions within the same project.

</section>
<section>
<title>Get Started with Atlas Stream Processing</title>
<url>https://mongodb.com/docs/atlas/atlas-stream-processing/tutorial/</url>
<description>Set up and run your first stream processor using Atlas Stream Processing with step-by-step guidance.</description>


# Atlas Stream Processing – Quickstart

## Prereqs
- Atlas project & cluster  
- mongosh ≥ 2.0  
- Project Owner or Project Stream Processing Owner  
- DB user with `atlasAdmin`  

## 1  Create Instance  
UI → Stream Processing → **Get Started → Create instance**  
```
Tier: SP30 | Provider: AWS | Region: us-east-1 | Name: tutorialInstance
```

## 2  Get Connection String  
Instance panel → **Connect → I have the MongoDB shell → latest mongosh → copy string**

## 3  Register Sink Connection  
Instance → **Configure → Connection Registry → + Add Connection → Atlas Database**  
```
Connection Name: mongodb1
Atlas Cluster: <empty-data cluster>
```

## 4  Verify Source Emits  
```bash
mongosh "mongodb://<atlas-stream-processing-url>/" \
  --tls --authenticationDatabase admin --username <atlasAdmin>
# interactive test (non-persistent)
sp.process([{ $source:{ connectionName:"sample_stream_solar" } }])
```

## 5  Build Persistent Processor  
```javascript
// stages
let s = {$source:{connectionName:"sample_stream_solar"}};

let g = {$group:{
  _id:"$group_id",
  max_temp:{$avg:"$obs.temp"},
  avg_watts:{$avg:"$obs.watts"},
  median_watts:{$median:"$obs.watts"},   // corrected operators
  max_watts:{$max:"$obs.watts"},
  min_watts:{$min:"$obs.watts"}
}};

let t = {$tumblingWindow:{
  interval:{size:NumberInt(10),unit:"second"},
  pipeline:[g]
}};

let m = {$merge:{into:{
  connectionName:"mongodb1",db:"solarDb",coll:"solarColl"}}};

// create
sp.createStreamProcessor("solarDemo",[s,t,m]);
```

## 6  Run & Monitor  
```javascript
sp.solarDemo.start();       // start
sp.solarDemo.stats();       // runtime stats
sp.solarDemo.sample();      // view output
/*
{_id:10,max_watts:136,min_watts:130,avg_watts:133,
 median_watts:130,max_temp:7}
*/
```
Data also visible in Atlas → Clusters → Browse Collections → `solarDb.solarColl`.

## 7  Clean Up  
```javascript
sp.solarDemo.drop();
sp.listStreamProcessors();
```

</section>
<section>
<title>Stream Processor Windows</title>
<url>https://mongodb.com/docs/atlas/atlas-stream-processing/windows/</url>
<description>Learn how stream processors use windows to organize and operate on subsets of data streams.</description>


# Stream Processor Windows

Atlas windows bound streaming data for aggregation stages (`$group`, `$push`, `$top`, etc.). `boundary` field selects `eventTime` (default) or `processingTime`.

### Types
- Tumbling: `{interval: <ms>}`. Sequential, no overlap.  
- Hopping: `{interval: <ms>, hop: <ms>}`. Hop < interval ⇒ overlap; hop > interval ⇒ gaps.  
- Session: `{partitionBy: <expr>, gap: <ms>}`. Same session if same partition value and time diff < gap.

All accept:
```jsonc
{
  allowedLateness: <ms>,   // extra time window stays open for late docs
  idleTimeout:     <ms>    // close if source idle after window end
}
```
Exceptions: `processingTime` windows can’t set `allowedLateness` or `idleTimeout`.

Late docs after close go to Dead Letter Queue (DLQ) when configured.

### Event-Time Semantics
- Each doc carries a timestamp (`event time`).  
- Watermark = max seen event time per partition. Window closes when watermark ≥ window_end (+ allowedLateness).  
- `partitionIdleTimeout` on `$source` lets watermark advance if a partition stalls.  

Example: 5-min tumbling window  
– Without watermark: windows open/close on system clock; out-of-order events may be mis-bucketed.  
– With watermark: window closes only after ingesting an event past window_end, ensuring correct inclusion.

Allowed Lateness: keeps closed window open `allowedLateness` ms beyond watermark so very late docs can still join; downstream windows may open meanwhile.

Idle Timeout: if source idle after window_end for `idleTimeout`, window closes and watermark advances even without new events.

### Processing-Time Semantics
- Timestamp assigned on arrival (server clock).  
- Simpler but vulnerable to source/network latency.  
- No `allowedLateness`/`idleTimeout`.

### Summary of Key Options
```
interval            // window duration (tumbling, hopping)
hop                 // open frequency (hopping)
gap                 // inactivity gap (session)
partitionBy         // session partition key
boundary            // "eventTime" | "processingTime"
allowedLateness     // keep window open past watermark
idleTimeout         // close if idle
partitionIdleTimeout// advance watermark if Kafka partition idle
```

</section>
<section>
<title>Security</title>
<url>https://mongodb.com/docs/atlas/atlas-stream-processing/security/</url>
<description>Learn key concepts of Atlas Stream Processing security</description>


# Security

## Roles  
Project-level management: `Project Stream Processing Owner` (create/manage instances, connection registries, project DBs). Same rights via `Project Owner` / `Organization Owner`.

## DB-Level Privilege Actions  
`processStreamProcessor` `createStreamProcessor` `startStreamProcessor` `stopStreamProcessor` `dropStreamProcessor` `listStreamProcessors` `sampleStreamProcessor` `streamProcessorStats` `listConnections`  
Grant individually or via `atlasAdmin` / `readWriteAnyDatabase`.

### Restrict to Specific Instances (UI)  
Database Access → Edit User → toggle “Restrict Access to Specific … Stream Processing Instances” → check desired instances → Update.

## Networking to External Sources  
Add Atlas egress IPs to source ACL:  
```sh
curl -H 'Accept: application/vnd.atlas.2023-11-15+json' \
'https://cloud.mongodb.com/api/atlas/v2/unauth/controlPlaneIPAddresses'
```  
Use returned IPs for stream-processing instance’s provider/region. Optionally use VPC peering.

## Execution Profiles  
In Stream Processing UI: instance pane → Configure → Connection Registry → edit DB connection → “Execute As” = role used when connecting (`$source` / `$merge` sink). Create least-privilege custom role.

## Auditing  
Immutable per-instance log (retained 30 days post-delete). Events recorded:

Authentication: successful, failed, connection termination.  
Entity mgmt: `startStreamProcessor` `createStreamProcessor` `stopStreamProcessor` `dropStreamProcessor` `.process()` `.sample()` audit-log access.  

Download via “Download Audit Logs”.

</section>
<section>
<title>Manage Stream Processing Instances</title>
<url>https://mongodb.com/docs/atlas/atlas-stream-processing/manage-processing-instance/</url>
<description>Learn how to create, configure, and manage Stream Processing Instances</description>


# Manage Stream Processing Instances

## Prerequisites
• Atlas project  
• User role: `Project Owner` | `Project Stream Processing Owner` | `Project Data Access Admin`

---

## CLI Commands
```sh
# List / Describe
atlas streams instances list [opts]
atlas streams instances describe <name> [opts]

# Create
atlas streams instances create <name> [opts]

# Update
atlas streams instances update <name> [opts]

# Delete
atlas streams instances delete <name> [opts]

# Download Audit Logs
atlas streams instances download <name> [opts]
```
Consult `atlas streams instances <cmd> --help` for flags.

---

## Atlas Administration API (REST)
• GET `/groups/{projectId}/streams/instance` – list  
• GET `/groups/{projectId}/streams/instance/{name}` – describe  
• POST `/groups/{projectId}/streams/instance` – create  
• PATCH `/groups/{projectId}/streams/instance/{name}` – update  
• DELETE `/groups/{projectId}/streams/instance/{name}` – delete  
• GET `/groups/{projectId}/streams/instance/{name}/auditLog` – download audit logs  

Auth: Atlas API keys with project-level role above.

---

## Atlas UI (quick path)
Project → Stream Processing → [Create | Edit | Delete] instance, or ⋯ → Audit Logs.

</section>
<section>
<title>Manage Connections</title>
<url>https://mongodb.com/docs/atlas/atlas-stream-processing/manage-connection-registry/</url>
<description>Learn how to manage connections in your Stream Processing Instance connection registry</description>


# Manage Connections

## Prerequisites
- Atlas project & cluster  
- Role: `Project Owner` or `Project Stream Processing Owner`

## Add Connection
Create specific connectors (Kafka, Atlas DB, HTTPS) per their config pages.

## View Connections

### Atlas CLI
```sh
atlas streams connections list [options]
atlas streams connections describe <connectionName> [options]
```

### mongosh
```js
sp.listConnections()
```

### Atlas UI  
Project ➜ Stream Processing ➜ <Instance> ➜ Configure ➜ Connection Registry

### Admin API  
Endpoints to list or retrieve one connection.

## Modify Connection

### CLI
```sh
atlas streams connections update <connectionName> [options]
```

### UI  
Same path as “View” ➜ pencil icon. Connection must not be used by running processors.

### Admin API  
Endpoint to edit a connection.

## Delete Connection

### CLI
```sh
atlas streams connections delete <connectionName> [options]
```

### UI  
Connection Registry ➜ trash icon ➜ Delete.

### Admin API  
Endpoint to delete a connection.

## Private Link Connections (Admin API)
- List all
- View one
- Delete one

</section>
<section>
<title>Apache Kafka Connections</title>
<url>https://mongodb.com/docs/atlas/atlas-stream-processing/kafka-connection/</url>
<description>Learn how to create and configure Apache Kafka connections in your Stream Processing Instance connection registry</description>


# Kafka Connections (Atlas Stream Processing)

## Create/Update Connection  
CLI:  
```sh
atlas streams connections create <name> --file <config.json>
```  
Admin API: `POST /groups/{groupId}/streams/spinstance/connections`  
UI: Stream Processing → Instance → Connection Registry → +Add connection.

Minimal JSON:  
```json
{
  "name": "<unique>",
  "bootstrapServers": "<host:port>",
  "security": { "protocol": "SASL_SSL" | "SSL" | "SASL_PLAINTEXT" },
  "authentication": {
    "mechanism": "PLAIN" | "SCRAM-SHA-256" | "SCRAM-SHA-512",
    "username": "<user>",
    "password": "<pwd>"
  },
  "type": "Kafka",
  "networking": {
    "access": {
      "type": "PUBLIC_IP" | "VPC_PEERING" | "PRIVATE_LINK" | "TRANSIT_GATEWAY",
      "connectionId": "<privateLinkId>",      // PRIVATE_LINK only
      "tgwId": "<tgwId>",                     // TRANSIT_GATEWAY only
      "vpcCIDR": "<AtlasCIDR>"                // TRANSIT_GATEWAY only
    }
  },
  "config": { …allowed producer/consumer params… }
}
```
Notes  
• `SASL_PLAINTEXT` not allowed with VPC Peering.  
• Upload CA / client cert-key when `SSL` or `SASL_SSL` & mTLS required.  
• After creating, add Atlas control-plane IPs to Kafka ACL/firewall.

## Private Link (PL)

1. Request PL: `POST /groups/{groupId}/streams/privateLinkConnections`  
   Required keys per vendor:

| Vendor | Provider | Keys |
|--------|----------|------|
| Confluent AWS | AWS | `serviceEndpointId`, `dnsDomain`, `dnsSubDomain[]` |
| MSK | AWS | `vendor:"msk"`, `provider:"AWS"`, `arn` |
| Confluent Azure | Azure | `region`, `dnsDomain`, `azureResourceIds[]` |
| EventHub | Azure | `serviceEndpointId` (ARM namespace ID), `dnsDomain` |

Response → `_id` = `<privateLinkId>`.

2. Approve PL in cloud console (Confluent, AWS, Azure).  
3. Create Atlas-side Kafka connection JSON (see template above) with  
   ```
   "networking.access": { "type":"PRIVATE_LINK", "connectionId":"<id>" }
   ```

## Transit Gateway (TGW)

1. Build TGW between Confluent Cloud and your AWS account (per Confluent docs).  
2. Share TGW with Atlas AWS account, accept invites, create attachment from Atlas VPC.  
3. Connection JSON:  
```json
"networking": {
  "access": {
    "type": "TRANSIT_GATEWAY",
    "tgwId": "<tgwId>",
    "vpcCIDR": "<AtlasCIDR>"
  }
}
```

## Allowed Kafka Config Parameters  

Producer: `acks, batch.size, client.dns.lookup, client.id, compression.type, connections.max.idle.ms, delivery.timeout.ms, enable.idempotence, linger.ms, max.in.flight.requests.per.connection, message.max.bytes, queue.buffering.max.messages, request.timeout.ms, retries, transactional.id`  

Consumer: `allow.auto.create.topics, auto.offset.reset, client.dns.lookup, client.id, connections.max.idle.ms, fetch.max.bytes, fetch.min.bytes, group.id, heartbeat.interval.ms, isolation.level, max.partition.fetch.bytes, max.poll.interval.ms, request.timeout.ms, session.timeout.ms`

</section>
<section>
<title>Atlas Connections</title>
<url>https://mongodb.com/docs/atlas/atlas-stream-processing/atlas-connection/</url>
<description>Learn how to create and configure Atlas connections in your Stream Processing Instance connection registry</description>


# Atlas Connections

Supports source/sink links to Atlas clusters.

## CLI
```sh
atlas streams connections create <connectionName> [options]
```
Config file:
```json
{
  "name": "<name>",
  "type": "Cluster",
  "clusterName": "<clusterName>"
}
```

## UI
Organization → Project → Services › Stream Processing → instance **Configure** → **Connection Registry** → **+ Add connection**.  
Select “Atlas Database”, enter unique Connection Name, pick dedicated-tier Cluster, **Add**.

## Administration API
Call “Add Connection to the Connection Registry” endpoint.

</section>
<section>
<title>HTTPS Connections</title>
<url>https://mongodb.com/docs/atlas/atlas-stream-processing/https-connection/</url>
<description>Learn how to create and configure HTTPS connections in your Stream Processing Instance connection registry</description>


# HTTPS Connections

HTTPS sources only added via Atlas Administration API (CLI/UI unsupported).

POST https://cloud.mongodb.com/api/atlas/v2/groups/{projectID}/streams/{tenantName}/connections  
Headers:  
• Content-Type: application/json  
• Accept: application/vnd.atlas.2023-02-01+json  
• Auth: API key or Bearer token (Digest/OAuth unsupported).

JSON body: `{"name":"<connName>","type":"Https","url":"<apiBasePath>"}`

```sh
curl --user "<publicApiKey>:<privateApiKey>" \
  -H "Content-Type: application/json" \
  -H "Accept: application/vnd.atlas.2023-02-01+json" \
  -d '{"name":"HTTPSConnection","type":"Https","url":"<apiBasePath>"}' \
  -X POST "https://cloud.mongodb.com/api/atlas/v2/groups/<projectID>/streams/<tenantName>/connections"
```

</section>
<section>
<title>Manage Stream Processors</title>
<url>https://mongodb.com/docs/atlas/atlas-stream-processing/manage-stream-processor/</url>
<description>Manage stream processors in Atlas Stream Processing by creating, starting, stopping, modifying, and viewing statistics for streaming data pipelines.</description>


# Atlas Stream Processor Commands (mongosh)

Prereqs  
- Stream processing instance, Atlas cluster, `mongosh` ≥ 2.0, db user w/ `atlasAdmin`.

Name syntax: non-alphanumerics → `sp.["my-name"].cmd()`.

Workers: ≤ 4 processors/worker; extras create new worker.

## Quick Prototype (non-persistent)

```js
sp.process(pipelineArray)
```
• Runs immediately, streams I/O to shell, auto-stops after 10 min/Ctrl-C, no state saved.

## Persistent Processor

```js
sp.createStreamProcessor(name, pipeline, {
  dlq: {connectionName, db, coll} // optional
})
```
• `name` unique per instance, ideally alphanumeric.  
• DLQ object required if `options` supplied.

## Lifecycle

```js
sp.<name>.start()  // returns true/false
sp.<name>.stop()   // "
sp.<name>.drop()   // destroys state, returns true/false
```
State of processors stopped ≥ 45 days is discarded.

## Modify

Requires `mongosh` ≥ 2.3.4.

```js
sp.<name>.modify(newPipeline?, {
  resumeFromCheckpoint: <bool>, // default true
  name: <string>,               // optional rename
  dlq:  {connectionName, db, coll} | {} // add/replace/remove
})
```

Limitations when `resumeFromCheckpoint=true`  
- `$source`, window interval/type removal/change forbidden.  
- Can only change window if inner pipeline keeps `$group` or `$sort`.  
- Data in windows may re-process.

Setting `resumeFromCheckpoint=false` recomputes windows & keeps only summary stats.

## Listing

```js
sp.listStreamProcessors(filterDoc?)
```
Returns array `{id, name, last_modified, state, pipeline, ...}`.

## Sampling

```js
sp.<name>.sample()
```
Streams results until Ctrl-C or 40 MB; invalid docs emitted as `_dlqMessage`.

## Stats

```js
sp.<name>.stats({scale: <int>, verbose: <bool>})
```
Default sizes in bytes; `scale:1024` ⇒ KB.  
Summary fields: `name,status,scaleFactor,inputMessage{Count/Size},outputMessage{Count/Size},dlqMessage{Count/Size},stateSize,watermark,changeStream* (if CS source),kafkaPartitions[] (if Kafka)`.  
`verbose:true` adds per-operator stats (`input/​output/​dlq counts & sizes, stateSize, maxMemoryUsage, executionTimeSecs, min/​maxOpenWindowStartTime`).

</section>
<section>
<title>Manage VPC Peering Connections</title>
<url>https://mongodb.com/docs/atlas/atlas-stream-processing/manage-vpc-peering-connections/</url>
<description>Learn how to create, update, and delete outgoing and incoming VPC Peering connections to your Stream Processing Instance.</description>


# Manage VPC Peering Connections

Supported: dedicated clusters (AWS, GCP, Azure incl. multi-cloud shard).  
Not supported: M0/M2/M5, Flex, deprecated Serverless.  
No cross-cloud peering in same region.

Connection types  
• Outbound – Atlas initiates & you approve on external VPC.  
• Inbound  – External VPC initiates & you accept in Atlas.

Prereqs: Atlas project, role `Project Owner` or `Project Stream Processing Owner`, existing cluster/stream instance.

---

## Outbound Peering

UI: “Add an Apache Kafka Connection”.  
API: `GET /api/atlas/v2/groups/{GROUP-ID}/streams/vpcPeeringConnections` (create/update via standard VPC Peering endpoints).

---

## Inbound Peering (example: Confluent ➞ Atlas on AWS)

```sh
# 1. Get Atlas acct/VPC/CIDR for region
GET /api/atlas/v2/groups/{GROUP-ID}/streams/accountDetails\
?cloudProvider=aws&regionName={REGION}

# ⇒ { "awsAccountId": "...", "cidrBlock": "...", "vpcId": "..." }
```
2. In Confluent Cloud, create VPC Peering Network using the values above.  
3. Poll pending request in Atlas:
```sh
GET /api/atlas/v2/groups/{GROUP-ID}/streams/vpcPeeringConnections\
?requesterAccountId={CONFLUENT_AWS_ACCT}
```
4. Accept:
```sh
POST /api/atlas/v2/groups/{GROUP-ID}/streams/vpcPeeringConnections/{PCX}:accept \
-d '{"requesterVpcId":"{REQ_VPC}","requesterAccountId":"{REQ_AWS_ACCT}"}'
```
5. Repeat step 3 until `cloudStatus: "active"`.

---

## Other Admin Operations

List all: `GET .../streams/vpcPeeringConnections`  
Reject: `POST .../{PCX}:reject`  
Delete: `DELETE .../vpcPeeringConnections/{PCX}`

---

### Curl Skeleton
```sh
curl -s --user "<PUBLIC_KEY>:<PRIVATE_KEY>" --digest \
 -H 'Accept: application/vnd.atlas.<VER>+json' -H 'Content-Type: application/json' \
 -X <METHOD> <URL> [-d '<JSON>']
```

</section>
<section>
<title>Supported Aggregation Pipeline Expression</title>
<url>https://mongodb.com/docs/atlas/atlas-stream-processing/stream-aggregation-expression/</url>
<description>Learn how to use the aggregation pipeline expressions provided by Atlas Stream Processing.</description>


# Aggregation Expressions

| Expression | Purpose |
|------------|---------|
| `$convert` | Converts Kafka header binData ↔︎ int/long/double/string. |

</section>
<section>
<title>$convert</title>
<url>https://mongodb.com/docs/atlas/atlas-stream-processing/sp-agg-convert/</url>
<description>Learn how to use the $convert expression to provide schema enforcement
for your streaming data</description>


# `$convert`

Converts between `binData`, `int`, `long`, `double`, `string`.

```javascript
// binData ↔ number
{input:"$bin",  to:<int|long|double>,       byteOrder:"little"|"big"}
{input:"$num",  to:"binData",               byteOrder:"little"|"big"}

// binData ↔ string (encoding)
{input:"$bin",  to:"string",  format:<base64|base64url|hex|uuid|utf8>}
{input:"$str",  to:"binData", format:<base64|base64url|hex|uuid|utf8>}
```

Field summary  
- `input` (req): value to convert (`binData|int|long|double|string`).  
- `to` (req): target type.  
- `byteOrder` (opt, default little): endian of `binData` I/O, not internal numeric order. Prefer `"big"` unless needed.  
- `format` (req for string/`binData` routes): encoding. `$toString` can’t create utf-8; use `$convert` with `format:"utf8"`.  

Numeric width rules (bytes) when reading `binData` → number  
• int: 1,2,4 • long: 1,2,4,8 • double: 4,8 (IEEE754).  
Unexpected length → error (override via `onError`).

Number → `binData` widths  
int=4, long=8, double=8.

Conversions follow two’s-complement for integers.

Examples  
```javascript
{$convert:{input:BinData(0b00000000 00000010), to:"int", byteOrder:"big"}} // 2
{$convert:{input:BinData(0xFFFE7960),          to:"int", byteOrder:"big"}} // -100000
{$convert:{input:BinData(0xC04CCCCD),          to:"double", byteOrder:"big"}} // -3.2…
{$convert:{input:BinData(0x0001 0000 0000 0000), to:"int", byteOrder:"big"}} // error: len≠1,2,4
{$convert:{input:true,  to:"binData"}}          // 0x01
{$convert:{input:NumberLong(42), to:"binData", byteOrder:"little"}} // 0x2A00000000000000
```

</section>
<section>
<title>$currentDate</title>
<url>https://mongodb.com/docs/atlas/atlas-stream-processing/sp-agg-currentdate/</url>
<description>Learn how to use the $currentDate expression to
ensure continuously refreshed date-time.</description>


# $currentDate

Returns the stream-instance system time at each evaluation.

Syntax:  
```json
{ "$currentDate": {} }
```

Use wherever an ISODate is accepted, e.g.  
```json
{ "$addFields": { "ts": { "$currentDate": {} } } }
```

Every evaluation (even within the same pipeline) produces a fresh timestamp.

</section>
<section>
<title>$meta</title>
<url>https://mongodb.com/docs/atlas/atlas-stream-processing/sp-agg-meta/</url>
<description>Learn how to use the $meta expression to access metadata for your streaming data</description>


# $meta

Returns streaming metadata. Form: `{ "$meta": "stream[.<subpath>]" }`.  

Metadata object:
```json
stream:{
  source:{type,ts,topic,partition,offset,key,headers},
  window:{start,end},
  https:{url,method,httpStatusCode,responseTimeMs}
}
```

Valid paths  
- `stream` – all metadata  
- `stream.source.[type|ts|topic|partition|offset|key|headers]`  
- `stream.window.[start|end]` (set inside $hoppingWindow/$tumblingWindow)  
- `stream.https.[url|method|httpStatusCode|responseTimeMs]` (set after $https)

Notes  
- Atlas Stream Processing only; not for classic MongoDB aggregation.

Examples
```json
// Append Kafka topic
{ $emit:{connectionName:"kafka",
         topic:{$concat:[{$meta:"stream.source.topic"},"out"]}}}

// Window start time
{ $addFields:{start:{$meta:"stream.window.start"}}}
```

</section>
<section>
<title>$createUUID</title>
<url>https://mongodb.com/docs/atlas/atlas-stream-processing/sp-agg-createuuid/</url>
<description>Learn how to use the $createUUID expression to
generate UUID values in your pipeline.</description>


# `$createUUID`

Generates an RFC 4122 v4 UUID (`BinData` subtype 4).

Syntax  
```jsonc
{$createUUID: {}}
```
• Empty object only; any field → error.  

Usage  
```jsonc
{$project:{u:$createUUID:{}}}            // BinData UUID
{$project:{s:{$toString:{$createUUID:{}}}}} // String UUID
```

</section>
<section>
<title>Supported Aggregation Pipeline Stages</title>
<url>https://mongodb.com/docs/atlas/atlas-stream-processing/stream-aggregation/</url>
<description>Learn how to use the extensions to the aggregation pipeline syntax provided by Atlas Stream Processing.</description>


# Atlas Stream Processing – Aggregation Stages

Pipeline size ≤ 16 MB.

## Stream-specific / modified stages
- `$source` – ingest from a registered streaming source.  
- `$validate` – schema validation.  
- `$https` – REST call inside pipeline.  
- `$externalFunction` – call serverless functions (same nesting rules as `$https`).  
- `$hoppingWindow` – overlapping windows (size, hop).  
- `$tumblingWindow` – fixed, non-overlapping windows (size).  
- `$sessionWindow` – dynamic windows per partition & gap.  
- `$lookup` (modified) – `from` must reference Connection Registry collection.  
- `$merge` (modified) – `connectionName` must reference remote collection.  
- `$emit` – write to registered stream or time-series collection.

## Where stages are allowed
Main pipeline:  
`$addFields $project $replaceRoot $set $redact $match $replaceWith $unset $unwind $validate $https $externalFunction $lookup $merge $tumblingWindow $hoppingWindow $sessionWindow $emit`

Inside `$tumblingWindow|$hoppingWindow|$sessionWindow` sub-pipelines:  
All main-pipeline stages **except** `$merge $emit`, **plus** `$group $sort $count $limit`.

Inside `$https|$externalFunction` sub-pipelines:  
`$addFields $project $replaceRoot $set`.

</section>
<section>
<title>$source</title>
<url>https://mongodb.com/docs/atlas/atlas-stream-processing/sp-agg-source/</url>
<description>Learn how to use the $source stage to pull in streaming
data for processing</description>


# `$source`

`$source` (must be 1st & only source stage) ingests streaming data. Common options:  
- `timeField`: `{ $toDate|$dateFromString: <expr> }` authoritative ts (else source ts).  
- `tsFieldName`: output field for ts.  
- Unsupported on Atlas Serverless.

---

## Apache Kafka

```json
{ "$source": {
  "connectionName": "<conn>",               // REQUIRED
  "topic": "t"|["t1",...],                  // REQUIRED
  "timeField": {…},                         // opt.
  "tsFieldName": "<str>",                   // opt.
  "partitionIdleTimeout": { "size": <int>, "unit":"ms|second|minute|hour|day" },  // opt.
  "config": {
    "auto_offset_reset": "latest|earliest", // default latest
    "group_id": "<id>",                     // default asp-<procId>-consumer
    "keyFormat": "binData|string|json|int|long",     // default binData
    "keyFormatError": "dlq|passThrough"     // opt.
  }
}}
```
Docs must be valid json/ejson; invalid msgs → DLQ (if configured).

---

## MongoDB Change Streams

Prototype (differences in bold):

```jsonc
{ "$source": {
  "connectionName": "<conn>",
  "timeField": {…},
  "tsFieldName": "<str>",
  /* Collection stream */  "db":"<db>", "coll":"<coll>"|["c1",...],
  /* Database stream  */   "db":"<db>",
  /* Cluster stream   */   // no db/coll
  "config": {
    "startAfter": <token> | "startAtOperationTime": <ts>,     // only one
    "fullDocument": "updateLookup|required|whenAvailable",    // default updateLookup
    "fullDocumentOnly": <bool>,
    "fullDocumentBeforeChange": "off|required|whenAvailable", // default off
    "pipeline": [ { <stage>:{…} }, ... ]                      // server-side filter
  }
}}
```
`fullDocument*` need Pre/Post Images enabled (collection-level for coll streams, db-wide for db/cluster streams).

---

## Document Array

```json
{ "$source": {
  "timeField": {…},
  "tsFieldName": "<str>",
  "documents": [ {<doc>}, ... ] | <expr>     // REQUIRED (omit connectionName)
}}
```

---

## Behavior

- Only one `$source` per pipeline, and it must be the first stage.

---

## Minimal Examples

### Kafka → MongoDB

```json
[
 { "$source": { "connectionName":"weatherKafka",
                "topic":"my_weatherdata",
                "tsFieldName":"ingestionTime" } },
 { "$match": { "dewPoint.value": { "$gt": 5 } } },
 { "$merge": { "into": { "connectionName":"weatherOut",
                         "db":"sample_weatherstream","coll":"stream" } } }
]
```

### Collection Change Stream → Collection

```json
[
 { "$source": { "connectionName":"cluster0",
                "db":"sample_weatherdata",
                "coll":"data" } },
 { "$merge": { "into": { "connectionName":"cluster0",
                         "db":"sample_weatherdata",
                         "coll":"data_changes" } } }
]
```

(delete on `data` writes corresponding change doc to `data_changes`).

</section>
<section>
<title>$validate</title>
<url>https://mongodb.com/docs/atlas/atlas-stream-processing/sp-agg-validate/</url>
<description>Learn how to use the $validate stage to provide schema enforcement
for your streaming data</description>


# `$validate`

```json
{
  "$validate": {
    "validator": { <filter> },          // REQUIRED. Query & $jsonSchema (Draft ≤4) allowed. Disallowed: $near, $nearSphere, $text, $where
    "validationAction": "discard"|"dlq" // OPTIONAL. discard (default) silently drops; dlq logs & best-effort drops.
  }
}
```

Placement: anywhere after `$source`, before `$emit`/`$merge`.

## Logging (when `validationAction` = discard|dlq)

```json
{
  "t": <datetime>, "s": <level>, "c": "streams-<job>", "ctx": "<pipeline>",
  "msg": "<offending-doc>", "attrs": <logAttributes-result>, "tags": [...],
  "truncated": {...}, "size": <bytes>
}
```

Key fields:  
• c – job name • ctx – pipeline name • msg – failed doc • attrs – custom diagnostics.

## Minimal validator example

```json
{
  "$validate": {
    "validator": {
      "$and": [
        { "$expr": { "$ne": ["$Racer_Name", "Pace Car"] } },
        { "$jsonSchema": {
            "required": ["Racer_Num","Racer_Name","lap","Corner_Num","timestamp"],
            "properties": {
              "Racer_Num":  { "bsonType": "int" },
              "Racer_Name": { "bsonType": "string" },
              "lap":        { "bsonType": "int", "minimum": 1 },
              "Corner_Num": { "bsonType": "int", "min": 1, "max": 4 },
              "timestamp":  { "bsonType": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{6}$" }
            }
        }}
      ]
    },
    "validationAction": "dlq"
  }
}
```

## Pipeline snippet

```jsonc
[
  { "$source": { connectionName: "sample_weatherdata", topic: "my_weatherdata", tsFieldName: "ingestionTime" } },
  { "$validate": { validator: { "$jsonSchema": { properties: { "position": {}, "sections": {} } } }, validationAction: "dlq" } },
  { "$match": { "wind.speed.rate": { "$lt": 30 } } },
  { "$merge": { into: { connectionName: "weatherStreamOutput", db: "sample_weatherstream", coll: "stream" } } }
]
```

Query results:

```js
// valid docs
db.getSiblingDB("sample_weatherstream").stream.find()

// failures
db.getSiblingDB("sample_weatherstream").dlq.find()
```

DLQ docs include `errInfo.reason: "Input document found to be invalid in $validate stage"`.

</section>
<section>
<title>$https</title>
<url>https://mongodb.com/docs/atlas/atlas-stream-processing/sp-agg-https/</url>
<description>Learn how to use the $https stage to pull in streaming
data for processing using API calls in a curl-like format</description>


# $https Stage

## Syntax
```json
{
  "$https": {
    "connectionName": "<conn>",             // required
    "path": "<subpath>|<expr>",             // optional
    "parameters": { "<k>": "<v|expr>" },    // optional
    "method": "GET|POST|PUT|PATCH|DELETE",  // default "GET"
    "headers": { "<k>": "<v|expr>" },       // optional
    "as": "<responseField>",                // required
    "onError": "dlq|ignore|fail",           // default "dlq"
    "payload": [ { <inner-pipeline> } ],    // optional
    "config": {
      "connectionTimeoutSec": <int>,        // default 30
      "requestTimeoutSec":   <int>,         // default 60
      "parseJsonStrings":    <bool>         // default false
    }
  }
}
```

## Field Notes
- connectionName: registry entry to call.  
- path: string/expr appended to base URL; endpoint should be idempotent.  
- parameters: keys string, values num/str/bool/expr.  
- method: HTTP verb.  
- headers: keys string, values string/expr; invalid names/values skipped; non-string eval ⇒ DLQ.  
- as: field for API response; absent if 0-byte reply; supports `application/json`, `text/plain`; other content types follow onError.  
- onError:  
  • `dlq` – send doc to dead letter queue  
  • `ignore` – continue silently  
  • `fail` – stop processor  
  Success = 2xx. Codes 400,404,410,413,414,431 obey onError; others → fail.  
- payload: mini-pipeline ($project, $addFields, $replaceRoot, $set) to build request body; default = whole doc; invalid body ⇒ DLQ.  
- config: override timeouts; parseJsonStrings recursively converts JSON strings to BSON.  

## Behavior
Place after `$source`, before `$emit`/`$merge`; allowed inside window pipelines.

## Minimal Example
```jsonc
[
 { "$source": {
     "connectionName": "sample_weatherdata",
     "topic": "my_weatherdata",
     "tsFieldName": "ingestionTime"
 }},
 { "$https": {
     "connectionName": "https_weather",
     "path": "forecast",
     "parameters": {
       "latitude":  { "$arrayElemAt": ["$$ROOT.position.coordinates", 0] },
       "longitude": { "$arrayElemAt": ["$$ROOT.position.coordinates", 1] }
     },
     "as": "airTemperatureForecast"
 }},
 { "$merge": {
     "into": { "connectionName": "weatherStreamOutput",
               "db": "sample_weatherstream",
               "coll": "stream" }
 }}]
```
Produces original weather records plus `airTemperatureForecast` array.

</section>
<section>
<title>$lookup</title>
<url>https://mongodb.com/docs/atlas/atlas-stream-processing/sp-agg-lookup/</url>
<description>Learn how to use the $lookup stage to perform joins across
disparate data sources</description>


# $lookup

Performs a left-outer join between `$source` messages and an Atlas collection registered in the Connection Registry.

Allowed syntaxes  
1. Equality match: `localField/foreignField` only  
2. Pipeline join: `let` + `pipeline`  
3. Correlated subquery (concise): `localField/foreignField` + `let` + `pipeline`

Prototype
```json
{
  $lookup: {
    from:{connectionName:"<conn>",db:"<db>",coll:"<coll>"},   // omit if only `pipeline`
    localField:"<srcField>",          // req. for equality / concise
    foreignField:"<joinField>",       // req. for equality / concise
    let:{<var>:<expr>,...},           // req. for pipeline / concise
    pipeline:[ /* stages on joined coll */ ], // req. for pipeline / concise
    as:"<outputArray>"                // REQUIRED
  }
}
```

Field rules  
from.*: all or none.  
as: new/overwritten array of matches.  

Behavior  
• Collection must be in Connection Registry.  
• Nested `$lookup` inside the `pipeline` must specify `from:"<coll>"` and use the same remote connection.  
• Mixing `$lookup` & `$merge` on the same coll can return partially-materialized results when multiple source docs share the same `_id`.

Example: enrich weather stream
```js
[
 {$source:{connectionName:"sample_weatherdata",topic:"my_weatherdata",tsFieldName:"ingestionTime"}},
 {$lookup:{
   from:{connectionName:"weatherStream",db:"humidity",coll:"humidity_descriptions"},
   localField:"dewPoint.value",
   foreignField:"dewPoint",
   as:"humidity_info"
 }},
 {$match:{humidity_info:{$ne:[]}}},
 {$merge:{into:{connectionName:"weatherStream",db:"sample_weatherstream",coll:"enriched_stream"}}}
]
```
Result docs now include `humidity_info` array with descriptors.

</section>
<section>
<title>$hoppingWindow</title>
<url>https://mongodb.com/docs/atlas/atlas-stream-processing/sp-agg-hopping/</url>
<description>Learn how to use the $hoppingWindow stage to aggregate data across
overlapping or staggered timeframes.</description>


# $hoppingWindow

```jsonc
{
  $hoppingWindow: {
    boundary: "eventTime"|"processingTime",   // default eventTime
    interval:  { size: <int>, unit: "ms"|"second"|"minute"|"hour"|"day" }, // window length
    hopSize:   { size: <int>, unit: "ms"|"second"|"minute"|"hour"|"day" }, // start-to-start gap
    pipeline:  [ <agg-stages> ],              // executed per window
    offset:    { offsetFromUtc:<int>, unit:"ms"|"second"|"minute"|"hour" }, // UTC shift
    idleTimeout:    { size:<int>, unit:"ms"|"second"|"minute"|"hour"|"day" }, // close if source idle
    allowedLateness:{ size:<int>, unit:"ms"|"second"|"minute"|"hour"|"day" }  // late-data grace
  }
}
```

Rules  
• Positive non-zero `size` for all time docs.  
• `idleTimeout` & `allowedLateness` forbidden when `boundary:"processingTime"`.  
• `allowedLateness` default = 3 s.  
• On idle, window closes after max(remainingWindow, idleTimeout).  
• Single window stage per pipeline; `$group` key ≤ 100 MB RAM.  
• Window state checkpointed; limited agg stage support inside.

Example

```js
[
  {$source:{connectionName:"streamsExampleConnectionToKafka",topic:"my_weatherdata"}},
  {$hoppingWindow:{
     interval:{size:100,unit:"second"},
     hopSize:{size:20,unit:"second"},
     pipeline:[
       {$group:{_id:{$meta:"stream.window.start"},
                averagePrecipitation:{$avg:"$liquidPrecipitation.depth"}}}
     ]
  }},
  {$merge:{into:{connectionName:"streamsExampleConnectionToAtlas",
                 db:"streamDB",coll:"streamCollection"}}}
]
```

Read results:

```javascript
db.getSiblingDB("streamDB").streamCollection.find()
```

</section>
<section>
<title>$tumblingWindow</title>
<url>https://mongodb.com/docs/atlas/atlas-stream-processing/sp-agg-tumbling/</url>
<description>Learn how to use the $tumblingWindow stage to aggregate data across
contiguous time periods.</description>


# $tumblingWindow

```json
{
  "$tumblingWindow": {
    "boundary": "eventTime" | "processingTime",           // default eventTime
    "interval": { "size": <int>, "unit": "ms|second|minute|hour|day" }, // req
    "pipeline": [ <agg-stages> ],                         // req
    "offset": { "offsetFromUtc": <int>, "unit": "ms|second|minute|hour" }, // opt
    "idleTimeout": { "size": <int>, "unit": "ms|second|minute|hour|day" } | 0, // opt
    "allowedLateness": { "size": <int>, "unit": "ms|second|minute|hour|day" } | 0 // opt
  }
}
```

Key rules  
- Exactly one window stage per pipeline.  
- `boundary` = `processingTime` prohibits `idleTimeout` & `allowedLateness`.  
- `size` & `offsetFromUtc` must be positive non-zero ints.  
- Default `allowedLateness` = 3 s if omitted.  
- Each `$group` key ≤ 100 MB RAM.  
- Windows are checkpointed & recoverable.  

Field behavior  
- `interval`: window length.  
- `offset`: shifts boundary from UTC.  
- `idleTimeout`: close open windows if source idle longer than `max(remainingWindowTime, idleTimeout)`.  
- `allowedLateness`: keep window open for late events after end time.  

Minimal example

```js
{
  $source: { connectionName: 'sample_weatherdata', topic: 'my_weatherdata', tsFieldName: 'ingestionTime' }
},
{
  $tumblingWindow: {
    interval: { size: 30, unit: "second" },
    pipeline: [{
      $group: {
        _id: "$_stream_meta.window.start",
        avg: { $avg: "$val" },
        max: { $max: "$val" },
        min: { $min: "$val" }
      }
    }]
  }
},
{ $merge: { into: { connectionName: 'weatherStreamOutput', db: 'sample_weatherstream', coll: 'stream' } } }
```

Query output contains one doc per 30 s window with `_stream_meta.window.{start,end}`.

</section>
<section>
<title>$emit</title>
<url>https://mongodb.com/docs/atlas/atlas-stream-processing/sp-agg-emit/</url>
<description>Learn how to use the $emit stage to output processed data
to streaming data platforms.</description>


# `$emit`

Emit pipeline output to either Kafka or an Atlas time-series collection. `$emit` must be the **last** and only emit stage in a pipeline.

## Kafka form
```json
{
  "$emit": {
    "connectionName": "<registry-name>",            // required
    "topic": "<topic>|<expr>",                      // required; expr must eval to string
    "config": {
      "acks": -1|0|1|"all",                        // default "all"
      "compression_type": "none"|"gzip"|"snappy"|"lz4"|"zstd",
      "dateFormat": "default"|"ISO8601",
      "headers": <expr>,                           // obj → k:v hdrs, or [{k,v},...]
      "key": <expr>,                               // must set keyFormat too
      "keyFormat": "binData"|"string"|"json"|"int"|"long", // default binData
      "outputFormat": "relaxedJson"|"canonicalJson" // default relaxedJson
    }
  }
}
```
• If `key` can't deserialize to `keyFormat`, doc → DLQ.  
• Missing/unevaluable `topic` expr → DLQ or dropped if no DLQ.  
• Non-existent topic auto-creates.

## Time-series form
```json
{
  "$emit": {
    "connectionName": "<registry-name>",    // required
    "db":  "<database>",                    // required, must exist
    "coll": "<timeseries-coll>",            // required, auto-created if absent
    "timeseries": { <ts-options> }          // required
  }
}
```
Max document size 4 MB.

## Notes
• One stream processor may write to only one time-series collection.  
• Dynamic `topic` enables per-message routing (e.g. `"topic": "$customerStatus"`).  
• Header value types: binData, string, object, int, long, double, null.

## Minimal example
```json
[
  { "$source": { connectionName: "sample_weatherdata", topic: "my_weatherdata", tsFieldName: "ingestionTime" } },
  { "$match": { "airTemperature.value": { "$lt": 30 } } },
  { "$addFields": { processorMetadata: { "$meta": "stream" } } },
  { "$emit": { connectionName: "weatherStreamOutput", topic: "stream" } }
]
```

</section>
<section>
<title>$merge</title>
<url>https://mongodb.com/docs/atlas/atlas-stream-processing/sp-agg-merge/</url>
<description>Learn how to use the $merge stage to output processed data
to persistent storage systems.</description>


# $merge

```json
{
 "$merge": {
  "into": {                       // REQUIRED
    "connectionName":"<atlas-conn>",
    "db":"<db>|<expr>",           // string or expr → must resolve to string
    "coll":"<coll>|<expr>"
  },
  "on":"<field>|[<field>]",       // shard key rules apply
  "let":{ "<var>":<expr>, ... },
  "whenMatched":"replace|keepExisting|merge",
  "whenNotMatched":"insert|discard",
  "parallelism":<1-16>            // threads; if into.db/coll uses expr ⇒ must be 1
 }
}
```

Essentials  
• Only one `$merge`, and it must be the final stage.  
• Dynamic `into.db` / `into.coll` lets each message route to a different target; unresolved expr ⇒ message to DLQ (if none, message skipped).  
• Higher `parallelism` ⇢ more throughput, more cluster/processor CPU.  

Dynamic routing example
```json
{
 "$merge":{
  "into":{
   "connectionName":"db1",
   "db":"$customerStatus",
   "coll":"$transactionType"
  }
 }
}
```

Kafka → Atlas pattern
```json
{ "$source": { "connectionName":"<kafka-conn>", "topic":["t1","t2"] } },
{ "$merge":  { "into":{ "connectionName":"<atlas-conn>", "db":"<db>", "coll":"<coll>" } } }
```

Weather sample
```json
{ "$source":{ connectionName:"sample_weatherdata", topic:"my_weatherdata", tsFieldName:"ingestionTime" } },
{ "$match":{ "dewPoint.value":{ "$gt":5 } } },
{ "$merge":{ into:{ connectionName:"weatherStreamOutput", db:"sample_weatherstream", coll:"stream" } } }
```
Query result: `db.getSiblingDB("sample_weatherstream").stream.find()`.

</section>
<section>
<title>$externalFunction</title>
<url>https://mongodb.com/docs/atlas/atlas-stream-processing/sp-agg-externalFunction/</url>
<description>Learn how to use the $externalFunction stage to run external processes while streaming
data</description>


# $externalFunction

Invokes an AWS Lambda from Atlas Stream Processing.

## Setup

1. Deploy Lambda in same AWS region; auth type `AWS_IAM`; only buffered response supported.  
2. Unified AWS Access (Org/Project Owner): IAM role with trust policy shown in Atlas UI, plus inline policy:

```json
{"Version":"2012-10-17","Statement":[
 {"Effect":"Allow","Action":["lambda:InvokeFunction"],
  "Resource":"arn:aws:lambda:us-east-1:<acct>:function:<function-name>"}]}
```

3. In Atlas Streams create connection:

```bash
curl -u USER:PWD --digest -H "Content-Type: application/json" \
'https://cloud.mongodb.com/api/atlas/v2/groups/<group_id>/streams/<tenant>/connections' \
-d '{"name":"myLambdaConn","type":"AWSLambda",
     "aws":{"roleArn":"arn:aws:iam::<acct>:role/<role_name>"}}'
```

## Stage Syntax

Minimal:

```json
{$externalFunction:{
  connectionName:"myLambdaConn",
  functionName:"arn:aws:lambda:region:acct:function:function-name",
  as:"response"}}
```

Optional fields:  
• execution: "sync"(default) | "async"  
• onError: "dlq"(default) | "ignore" | "fail"  
• payload: aggregation pipeline (supports $project,$addFields,$replaceRoot,$set)

Custom example:

```json
{$externalFunction:{
  connectionName:"myLambdaConn",
  functionName:"arn:aws:lambda:region:acct:function:function-name",
  execution:"sync",
  as:"response",
  onError:"fail",
  payload:[
    {$replaceRoot:{newRoot:"$fullDocument.payloadToSend"}},
    {$addFields:{sum:{$sum:"$randomArray"}}},
    {$project:{success:1,sum:1}}
  ]}}
```

Notes  
• `sync` required if later stages use Lambda output.  
• `onError` handles HTTP/Lambda runtime failures; not config errors.

</section>
<section>
<title>$sessionWindow</title>
<url>https://mongodb.com/docs/atlas/atlas-stream-processing/sp-agg-session/</url>
<description>Learn how to use the $sessionWindow stage to aggregate data across
overlapping or staggered timeframes.</description>


# $sessionWindow

Aggregates per “session”: docs sharing `partitionBy` whose timestamp gaps < `gap`. Window closes when watermark ≥ maxTimestamp + gap + allowedLateness; emits `pipeline` results.

```jsonc
{
 $sessionWindow: {
  partitionBy: <expr>,                       // required
  gap: {size:<pos-int>, unit:"ms|second|minute|hour|day"}, // required
  pipeline: [<agg-stages>],                  // required
  boundary: "eventTime"| "processingTime",   // opt, default eventTime
  allowedLateness:{size:<int>,unit:<unit>}   // opt, default 3s; forbidden if boundary=processingTime
 }
}
```

Behavior  
• Each doc assigned to partition; failed `partitionBy` ⇒ DLQ.  
• Doc ts < watermark and no open session ⇒ DLQ.  
• Window start = first ts; end = last ts + gap.  
• Late doc within gap of existing windows merges them.  
• On arrival stage sets `window.partition`, `window.start`, `window.end`.

</section>
<section>
<title>Atlas Stream Processing Monitoring and Alerting</title>
<url>https://mongodb.com/docs/atlas/atlas-stream-processing/monitoring/</url>
<description>Learn about Atlas Stream Processing's monitoring and alerting capabilities so you can gain insight into your stream processor performance</description>


# Atlas Stream Processing – Monitoring & Alerts

• `sp.processor.sample()` – returns live document samples to validate pipeline output.  
• `sp.processor.stats()` – returns runtime metrics:  
  – msgsIngested, msgsProcessed, msgsToDLQ, stateMemBytes, pipelineDef  
  – Kafka sources add `partitionOffsetLag`, `kafkaTotalOffsetLag`.

Alerts fire on processor state or throughput thresholds. Targets: (a) all processors in project, (b) all in an instance matching predicate, (c) names matching predicate; multiple targets allowed per alert.

</section>
<section>
<title>Limitations</title>
<url>https://mongodb.com/docs/atlas/atlas-stream-processing/limitations/</url>
<description>Known limitations of Atlas Stream Processing</description>


# Atlas Stream Processing Limits

• Σ`state.stateSize` per worker ≤ 80 % RAM (SP30 8 GB→6.4 GB); exceed ⇒ OOM; check via `sp.processor.stats()`.  
• Sources/sinks restricted to clusters in same project.  
• Pipeline JSON ≤ 16 MB.  
• Only Project Owner / Atlas Admin may run ASP.  
• Connections: Kafka & Atlas DB (src/sink), Sample (src).  
• Kafka: new partitions ignored while running; after restart/checkpoint ⇒ fail—recreate processor.  
• Data format: JSON only.  
• Kafka security: `SASL_PLAINTEXT`, `SASL_SSL`, `SSL`; SASL mech `PLAIN`, `SCRAM-SHA-256/512`; SSL needs CA, client cert, key.  
• No JavaScript `$function` UDFs.  
• Aggregation limited to documented subset of stages.

</section>
<section>
<title>Atlas Stream Processing Changelog</title>
<url>https://mongodb.com/docs/atlas/atlas-stream-processing/changelog/</url>
<description>Learn about new Atlas Stream Processing features, improvements, and bug fixes.</description>


# Atlas Stream Processing Changelog (condensed)

2025  
• 04-30: `$sessionWindow`; Azure-Confluent PrivateLink  
• 03-26: `$externalFunction` → AWS Lambda  
• 03-23: AWS Transit Gateway → Confluent  
• 03-12: `$https` UI creation; `$merge.parallelism`; new alerts (Output, DLQ, KafkaLag, ChangeStreamDelay)  
• 03-05: `createUUID`, window `processingTime`, `$meta`, `$https.parseJsonStrings`  
• 02-14: Kafka PrivateLink (AWS MSK); region `us-east-2`  
• 01-20: `$currentDate`; JSON w/ magic bytes  
• 01-14: stat `executionTimeMillis`; `$emit` Kafka buffer 5 ms  

2024  
• 12-10: VPC peering with Confluent AWS  
• 12-02: Admin API edit processors; AWS & Azure PrivateLink (Confluent/EventHubs)  
• 11-11: Kafka timeout 30 s  
• 10-23: auto-retry `REPAIRING` clusters; verbose watermarks  
• 10-11: multitopic Kafka source; near-real-time offsets; `$emit`/`$merge` `compression.type` & `acks`; collectionless `$lookup`; Kafka error serialization; dynamic expr limit 1000; window `$lookup`  
• 08-28: `$convert` from `Binary`; per-partition watermarks

</section>
</guide>