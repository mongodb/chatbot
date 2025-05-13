<guide>
<guide_topic>Atlas Security</guide_topic>

<section>
<title>Manage the IP Access List</title>
<url>https://mongodb.com/docs/atlas/security/add-ip-address-to-list/</url>
<description>Add trusted IP addresses to the Atlas IP access list to securely connect to your cluster.</description>


# Manage IP Access List

Only IPs on the list can access a cluster.

• Permission needed: `Project Owner`.

• Your IP was added when the first cluster was created; use “Configure IP Access List Entries” to add others.

• After adding IPs, see “Connect to Your Cluster.”

</section>
<section>
<title>Configure Security Features for Clusters</title>
<url>https://mongodb.com/docs/atlas/setup-cluster-security/</url>
<description>Configure security features for Atlas clusters, including encryption, network access, and user authentication, to enhance security and meet specific needs.</description>


# Atlas Cluster Security (Compressed)

## Built-in
- FIPS 140-2 L2 enabled.
- TLS/SSL required; certs valid 90 d, auto-rotated 42 d before expiry.
- Dedicated VPC/VNet for each project w/ ≥M10 cluster.
- Storage encrypted at rest; customer-KMS optional.

## Required Setup
### Network
- Expose cluster via:  
  1) Public IP allowlist, 2) VPC/VNet peering, or 3) Private Endpoints.  
- Open egress 27015-27017/TCP to *.mongodb.net.  
- LDAP over TLS: allow Atlas → LDAP host (public or private DNS).
### IP Access List
- Add client/ service IPs (`Project → Network Access`).
### DB Users
- Create users per cluster; project membership controls UI/API access.

## Optional Features
- VPC/VNet Peering (`Network Access → Peering`).
- Private Endpoints: AWS PrivateLink, Azure/AWS Private Link, GCP PSC.
- Unified AWS Access: attach AWS IAM role (Data Federation, KMS).
### AuthN/AuthZ
- Custom DB roles.  
- AWS IAM DB auth.  
- LDAP auth/authorization.  
- X.509 client certs (Atlas-/self-managed).  
- Restrict MongoDB Support infra access (24 h bypass).
### Encryption
- Customer KMS: AWS KMS, Azure Key Vault, GCP KMS.
- Client-Side Field Level Encryption (automatic supported; Compass/UI/mongosh cannot decrypt).
### Audit & Monitoring
- Database auditing (system events).  
- Access tracking (auth logs in UI).  
- MFA for Atlas UI.
### Control Plane Access (webhooks, KMS, etc.)
GET /api/public/v1.0/controlPlaneIPAddresses → returns:
```json
{
 "inbound":{"aws":{"<region>":["<cidr>"]},...},
 "outbound":{"aws":{"<region>":["<cidr>"]},...}
}
```
Map:  
  network INBOUND ← controlPlane.outbound  
  network OUTBOUND ← controlPlane.inbound
### Data Federation
- Allow outbound HTTPS and TCP/27017 to `controlPlane.inbound` CIDRs.
### OCSP
- Allow egress to CA OCSP responder URLs for TLS revocation; or disable in driver.

## Ports & IPs Summary
- App → Atlas: 27015-27017/TCP (egress).
- Control-plane IPs: fetch via API; update firewall/KMS allowlists accordingly.

Avoid sensitive data in namespace/field names (not obfuscated).

</section>
<section>
<title>Configure Cluster Access with the Quickstart Wizard</title>
<url>https://mongodb.com/docs/atlas/security/quick-start/</url>
<description>Configure cluster access in Atlas using the Quickstart Wizard by setting up database users and IP access list entries.</description>


# Quickstart Wizard – Configure Cluster Access

1. Open Security › Quickstart  
   • Missing? Project Settings › toggle “Atlas Security Quickstart” ON.

2. Auth Method  
   Username/Password  
   • Set Username (immutable) & Password → Create User.  
   • Escape special chars in connection string.  
   X.509 Certificate  
   • Enter Common Name.  
   • Optional: toggle “Download certificate when user is added”, select expiry 3/6/12/24 mo.  
   • Add User (gets Project Data Access Read/Write).

3. Network Access  
   Local Environment  
   • Enter IP/CIDR + description or “Add My Current IP Address” → Add Entry.  
   Cloud Environment (M10+)  
   • Same IP entry workflow.  
   • Optional: “Configure in New Tab” for VPC Peering or Private Endpoint.

4. Finish & Close  
   • Quickstart hides after first-cluster setup.  
   • Re-show via Project Settings › toggle Atlas Security Quickstart ON/OFF.

</section>
<section>
<title>Configure IP Access List Entries</title>
<url>https://mongodb.com/docs/atlas/security/ip-access-list/</url>
<description>How to view, add, modify, and delete IP access list entries using the Atlas CLI or Atlas user interface.</description>


# Atlas IP Access List

Atlas restricts client connections to IP access list entries (≤ 200 per project; legacy pre-25 Aug 2017 sharded clusters: ≤ 100).

Entry types  
• IPv4/IPv6 address  
• CIDR range  
• AWS: Security Group ID (same-region VPC peering only; not allowed when project has multi-region peerings)  

Temporary entries: optional, auto-expire 6 h | 1 d | 1 w (max 7 days). AWS SGs cannot be temporary. Temp → permanent allowed; permanent → temp not. Activity Feed logs add/delete/modify (address change = delete+add; comment edits not logged).

Role required: Project Owner (Org Owner must add self to project).

## Entry Status
Inactive – no containers yet  
Pending – configuring  
Active – applied to all containers  
Active in regions: <rgns> – SG applied only in listed AWS regions  
Failed – could not configure

## CLI (atlascli)
```sh
# list all
atlas accessLists list [--projectId ID]

# describe one
atlas accessLists describe <IP|CIDR|SG> [--projectId ID]

# create
atlas accessLists create <IP|CIDR|SG> \
  [--comment txt] [--projectId ID] \
  [--type TEMPORARY --duration {6h|1d|1w}]

# delete
atlas accessLists delete <IP|CIDR|SG> [--projectId ID] [--force]
```
CLI can’t update; use API/UI.

## Administration API
POST /groups/{groupId}/accessList       – add  
PATCH /groups/{groupId}/accessList/{id} – update  
DELETE /groups/{groupId}/accessList/{id} – remove

## UI (Network Access → IP Access List)
Add → enter IP/CIDR/SG, optional temp duration, comment → Save.  
Edit → change address/CIDR/comment, extend/convert temp → Confirm.  
Delete → Delete → Confirm.

## Activity Feed
Project Settings or Activity Feed icon → view IP access list events.

## Notes
• Add the IP/CIDR you’ll use as admin.  
• 0.0.0.0/0 allows access from anywhere—use strong credentials.  
• Removing an entry drops new connections immediately; existing ones linger per driver/protocol behavior.

</section>
<section>
<title>Atlas Resource Policies</title>
<url>https://mongodb.com/docs/atlas/atlas-resource-policies/</url>
<description>Use the Atlas Administration API to create an Atlas Resource Policy that restricts how your users configure clusters, including limiting the cloud provider, region, and use of wildcard IPs.</description>


# Atlas Resource Policies (ARP)

Atlas org-level “deny” controls applied to all projects/clusters.

Capabilities  
• Force min TLS version / cipher suite  
• Limit cloud providers/regions  
• Block wildcard IP or any IP list modifications  
• Require empty IP list (private networking only)  
• Constrain cluster tier (min/max)  
• Require maintenance window  
• Block VPC peering / private endpoint edits  
Default = allow; non-compliant resources allowed to exist but can only be changed toward compliance (`GET /orgs/{ORG-ID}/nonCompliantResources`).

Roles  
view ≥ Organization Read Only modify = Organization Owner.

Interfaces  
• POST/GET/DELETE `/api/atlas/v2/orgs/{ORG-ID}/resourcePolicies`  
• Terraform ≥1.33.0, CloudFormation, Atlas UI.

JSON body (v1)  
```json
{
  "name": "<UNIQUE>",
  "policies": [{ "body": "<CEDAR_TEXT>" }]
}
```
If `"` inside body, escape with `\`. Duplicate names ⇒ 400.

---

## Cedar Quick Reference (only `forbid` allowed)

```
forbid (principal, action == <ACTION>, resource)
  when|unless { <CONDITION> };
```

Actions  
```
ResourcePolicy::Action::"cluster.modify"
ResourcePolicy::Action::"project.ipAccessList.modify"
ResourcePolicy::Action::"project.maintenanceWindow.modify"
ResourcePolicy::Action::"project.vpcPeering.modify"
ResourcePolicy::Action::"project.privateEndpoint.modify"
```

Context fields  
```
context.cluster.cloudProviders          # [CloudProvider]
context.cluster.regions                 # [Region]
context.cluster.minTLSVersion           # TLSVersion
context.cluster.cipherConfigMode        # CipherConfigMode
context.cluster.cipherSuites            # [CipherSuite]
context.cluster.minGeneralClassInstanceSizeValue
context.cluster.maxGeneralClassInstanceSizeValue

context.project.ipAccessList            # [ip]
context.project.hasDefinedMaintenanceWindow
context.project.peeringConnections      # [string]
context.project.privateEndpoints        # [string]
```

Enums  
CloudProvider::"aws"|"azure"|"gcp"  
Region::"<provider>:<region>" (e.g. aws:us-east-1)  
TLSVersion::"tls1_0"|"tls1_1"|"tls1_2"  
CipherConfigMode::"default"|"custom"  
CipherSuite::"TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384"|"TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256"

Helpers  
`contains`, `containsAny`, `containsAll`, `isEmpty`, logical `&& ||`, `ip("x.x.x.x/len")`.

---

## Example Policy Snippets

Restrict cloud provider (no GCP)  
```json
{ "body":
  "forbid(principal,action==ResourcePolicy::Action::\"cluster.modify\",resource)
   when {context.cluster.cloudProviders.contains(ResourcePolicy::CloudProvider::\"gcp\")};"
}
```

Allow ONLY GCP  
```json
"forbid(principal,action==ResourcePolicy::Action::\"cluster.modify\",resource)
 unless {context.cluster.cloudProviders==[ResourcePolicy::CloudProvider::\"gcp\"]};"
```

Block region aws:us-east-1  
```json
"forbid(principal,action==ResourcePolicy::Action::\"cluster.modify\",resource)
 when {context.cluster.regions.contains(ResourcePolicy::Region::\"aws:us-east-1\")};"
```

Allow ONLY regions aws:us-east-1 & azure:westeurope  
```json
"forbid(principal,action==ResourcePolicy::Action::\"cluster.modify\",resource)
 unless {[ResourcePolicy::Region::\"aws:us-east-1\",ResourcePolicy::Region::\"azure:westeurope\"].containsAll(context.cluster.regions)};"
```

Block wildcard IP edits  
```json
"forbid(principal,action==ResourcePolicy::Action::\"project.ipAccessList.modify\",resource)
 when {context.project.ipAccessList.contains(ip(\"0.0.0.0/0\"))};"
```

Require empty IP list (private networking only)  
```json
"forbid(principal,action==ResourcePolicy::Action::\"project.ipAccessList.modify\",resource)
 unless {context.project.ipAccessList.isEmpty()};"
```

Cluster tier between M30–M60  
```json
"forbid(principal,action==ResourcePolicy::Action::\"cluster.modify\",resource)
 when {(context.cluster has minGeneralClassInstanceSizeValue && context.cluster.minGeneralClassInstanceSizeValue < 30) ||
       (context.cluster has maxGeneralClassInstanceSizeValue && context.cluster.maxGeneralClassInstanceSizeValue > 60)};"
```

Require maintenance window  
```json
"forbid(principal,action==ResourcePolicy::Action::\"project.maintenanceWindow.modify\",resource)
 when {context.project.hasDefinedMaintenanceWindow == false};"
```

Freeze specific peering list  
```json
"forbid(principal,action==ResourcePolicy::Action::\"project.vpcPeering.modify\",resource)
 when {context.project.peeringConnections==[\"aws:123456789012:vpc-abc:10.0.0.0/16\"]};"
```

Freeze private endpoints  
```json
"forbid(principal,action==ResourcePolicy::Action::\"project.privateEndpoint.modify\",resource)
 when {context.project.privateEndpoints==[\"aws:vpce-042d72ded1748f314\"]};"
```

Enforce min TLS 1.2  
```json
"forbid(principal,action==ResourcePolicy::Action::\"cluster.modify\",resource)
 unless {context.cluster.minTLSVersion==ResourcePolicy::TLSVersion::\"tls1_2\"};"
```

Require custom cipher suite  
```json
"forbid(principal,action==ResourcePolicy::Action::\"cluster.modify\",resource)
 unless {context.cluster.cipherConfigMode==ResourcePolicy::CipherConfigMode::\"custom\" &&
         context.cluster.cipherSuites==[ResourcePolicy::CipherSuite::\"TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384\"]};"
```

---

## Terraform Skeleton

```terraform
terraform {
  required_providers {
    mongodbatlas = { source = "mongodb/mongodbatlas" version = "~>1.33" }
  }
}
provider "mongodbatlas" {}

resource "mongodbatlas_resource_policy" "example" {
  org_id = var.org_id
  name   = "my-policy"
  policies = [{
    body = "forbid(principal,action==ResourcePolicy::Action::\"cluster.modify\",resource) when { ... };"
  }]
}
```

</section>
<section>
<title>Set Up a Network Peering Connection</title>
<url>https://mongodb.com/docs/atlas/security-vpc-peering/</url>
<description>Set up network peering connections between Atlas VPCs and cloud provider VPCs for enhanced security and private connectivity.</description>


# Atlas Network Peering

Unsupported: `M0`, Flex clusters, Serverless, `M2/M5`.  
Roles: `Organization Owner` or `Project Owner`.

Peering types  
• Outbound – Atlas initiates request.  
• Inbound – External VPC initiates.  
No cross-cloud single-region peering.

---

## Network Peering Containers (project-scoped)

```sh
# List
atlas networking containers list [opts]

# Delete
atlas networking containers delete <containerId> [opts]
```
API: GET/DELETE networkPeering/{containerId}

---

## Peering Connections

```sh
# List
atlas networking peering list [opts]

# Create
atlas networking peering create aws   [opts]  # or azure | gcp
# Wait until AVAILABLE
atlas networking peering watch <peerId> [opts]

# Delete
atlas networking peering delete <peerId> [opts]
```

Per-project limit: 50 total / 25 pending.

---

## AWS

### Requirements
• Enable DNS hostnames & resolution on peer VPC.  
• Security group: allow outbound TCP 27015-27017 to Atlas CIDR.  
• One peering per Atlas region; update AWS route table: `Dest=<Atlas CIDR> → Target=pcx-…`.

### atlas networking peering create aws Required flags
```
--accountId <AWS-Acct#>
--vpcId     <vpc-...>
--vpcCidr   <non-overlap private CIDR>
--region    <peer VPC region>
--atlasCidr </24–/21 private>   # once per Atlas region
--atlasRegion <Atlas region>    # default = peer region
```
CIDR must be in 10/8, 172.16/12, or 192.168/16. Atlas locks atlasCidr after first use; change requires no ≥M10 clusters/snapshots/other peerings.

Connection string: use “pri-” host from Connect → Private Endpoint.

---

## Azure

### Permissions
Grant on peer VNet (can revoke after peer):  
`Microsoft.Network/virtualNetworks/virtualNetworkPeerings/{read,write,delete}`  
`Microsoft.Network/virtualNetworks/peer/action`

### atlas networking peering create azure Required flags
```
--subscriptionId <sub>
--resourceGroup  <rg>
--vnetName       <vnet>
--directoryId    <tenant>
--vnetCidr       <peer CIDR>
--atlasCidr      </24–/21 private>
--atlasVnetRegion <Atlas region>
```
Multi-region clusters: create one peer per Atlas region.

Same CIDR, locking, and node-count limits as AWS.

---

## GCP

Limitations: route-based GKE, Cloud VPN/Interconnect, non-VPC-native serverless need alternatives.

### atlas networking peering create gcp Required flags
```
--projectId <GCP project>
--vpcName   <vpc>
--atlasCidr </18 default; /21–/24 via API container>
```
Google VPC is global → single peering per project.

Smaller atlasCidr (/21–/24) limits regions (needs /24 per region):  
/21 → 1-8 regions, /22 → 1-4, /23 → 1-2, /24 → 1.

To shrink/expand regions: delete clusters, delete container, create new.

---

## IP Access List

After peering APPROVED, add peer VPC/VNet CIDR or security group to Atlas access list before connecting.



</section>
<section>
<title>Configure Private Endpoints</title>
<url>https://mongodb.com/docs/atlas/security-configure-private-endpoints/</url>
<description>Set up private endpoints to securely connect your cloud provider to Atlas without using a public network.</description>


# Private Endpoints

Unavailable for M0 Free & Flex clusters.  
Creates unidirectional, private VPC↔Atlas link (no public internet).

Docs:
- Learn About Private Endpoints
- Set Up a Private Endpoint for Dedicated Cluster
- Manage & Connect from Private Endpoints
- Troubleshoot Private Endpoint Connection Issues

</section>
<section>
<title>Learn About Private Endpoints in Atlas</title>
<url>https://mongodb.com/docs/atlas/security-private-endpoint/</url>
<description>Explore how to set up private endpoints in Atlas for secure connections to dedicated clusters across AWS, Azure, and Google Cloud.</description>


# Atlas Private Endpoints

Supports dedicated clusters & Online Archive (not `M0`/Flex).  
Clouds:  
• AWS PrivateLink • Azure Private Link • GCP Private Service Connect (PSC)

---

## Key Properties
* One-way traffic: Atlas VPC/VNet/VPC-SC never initiates connections.  
* Transitive use through peered VPC/VNet or on-prem (AWS DirectConnect / Azure ExpressRoute / GCP VPN).  
* Org/Project Owner required.

---

## High Availability
AWS: place interface endpoints in subnets across AZs.  
Azure & GCP: no additional steps; PSC supports global access.

---

## Port Ranges
| Provider | Ports Used | Addr targets/region* |
|----------|-----------|----------------------|
| AWS | 1024-65535 | 50 (req.); contact Support for 100 |
| Azure | 1024-2524 | 150 |
| GCP | 27015-27017 | 50 nodes (single region), 40 nodes (multi region) |

*Addressable targets = each `mongod`, each `mongos` (unless sharded-cluster optimized), each BI Connector.

Allow-list entire range; use DNS seedlist strings so ports change transparently.

---

## Connection Strings

### AWS
```none
mongodb+srv://cluster0-pl-0.<id>.mongodb.net         # seedlist
mongodb://pl-0-<region>.<id>.mongodb.net:1024,...    # standard
```

### Azure
```none
mongodb+srv://cluster0-pl-0.<id>.mongodb.net
mongodb://pl-0-<region>.<id>.mongodb.net:1024,...
```

### GCP
```none
mongodb+srv://cluster0-pl-0.<id>.mongodb.net
mongodb://pl-00-000-<region>.<id>.mongodb.net:27017,...
```

DNS records map host → interface/endpoint IPs; fail-over is automatic.  
Sharded clusters can request optimized SRV (AWS only).

---

## Regionalized Private Endpoints (Multi-Region Shards)
Enables multiple endpoints (one/region) when VPCs can’t peer.  
CLI:
```sh
atlas privateEndpoints regionalModes enable|disable|describe [opts]
```
Warning: toggling changes connection strings → update apps.

---

## Coexistence
Private endpoints may coexist with public IP allow-lists, peering, etc.  
Multi-cloud clusters: endpoint lets you reach only nodes in same provider/region.

---

## Removal / Maintenance
For multi-region clusters keep all endpoints until maintenance completes or cluster is single-region and traffic cut over.

---

## Billing
See “Private Endpoints for Dedicated Clusters”.

---

## Limitations

### Common
* Endpoint service must exist in every region used by a multi-region cluster.
* Choose ONE:  
  1) multi-region cluster with one endpoint/region, or  
  2) multiple endpoints in one region only.  
  Exception: regionalized private endpoints for multi-region sharded clusters.
* Paused clusters in region must be resumed before adding endpoints.

### AWS
* If cluster spans AWS + other cloud, create endpoint in each provider & VPN between clouds.
* VPCs in regions without endpoint must peer to region with endpoint.
* TCP addressable targets limit above; AWS PrivateLink supports 50 interface endpoints/region.
* Each VM limited to 64k TCP ports (implicit).

### Azure
* Clusters created before 2020-10-16 might be incompatible; create new cluster if required.
* Global VNet peering for regions without endpoint.
* 150 targets/region; 64k TCP connections per target.

### GCP
* Atlas auto-creates 50 PSC service attachments (/27); adjustable via Administration API limits:  
  `atlas.project.deployment.privateServiceConnectionsPerRegionGroup`  
  `atlas.project.deployment.privateServiceConnectionsSubnetMask`
* Must create equal # of PSC endpoints as attachments.
* VM → PSC limit: 1024 outbound connections.
* PSC is regional; use “global access” to reach from other regions (no VPC peering).
* When endpoint & primary in different regions, set readPreference (e.g. `secondaryPreferred`) and ensure a secondary in same region.

---

## Prerequisites

### AWS
* Endpoint & cluster in same region.
* AWS IAM user able to `create/modify/describe/delete` endpoints; AWS CLI recommended.
* Existing VPC & EC2 instances.

### Azure
* Azure CLI; VNet & compute resources ready.

### GCP
* IAM user with Compute Network Admin; gcloud CLI.
* VPC, compute, egress rules to PSC IP, plus VPC-SC rules if enforced.
* Enable PSC global access if cross-region.

All providers: valid payment method on organization.

---

</section>
<section>
<title>Set Up a Private Endpoint for a Dedicated Cluster</title>
<url>https://mongodb.com/docs/atlas/security-cluster-private-endpoint/</url>
<description>Set up a private endpoint for a dedicated Atlas cluster using AWS, Azure, or GCP to enable secure client connections.</description>


# Private Endpoints for Atlas Dedicated Clusters

Not supported on M0/Flex. Requires Org/Project Owner.

## AWS PrivateLink (Atlas CLI)

1. Create service  
   ```sh
   atlas privateEndpoints aws create --region <REGION> [...]
   # → returns <ENDPOINT_SERVICE_ID>
   ```
2. Get service name  
   ```sh
   atlas privateEndpoints aws describe <ENDPOINT_SERVICE_ID>
   # note ENDPOINT SERVICE (e.g. com.amazonaws.vpce.…)
   ```
3. Create AWS interface endpoint  
   ```sh
   aws ec2 create-vpc-endpoint \
     --vpc-id <VPC-ID> --region <REGION> \
     --service-name <SERVICE-NAME> \
     --vpc-endpoint-type Interface \
     --subnet-ids <SUBNET-IDS>
   # → returns VpcEndpointId=<VPC-ENDPOINT-ID>
   ```
4. Register interface with Atlas  
   ```sh
   atlas privateEndpoints aws interfaces create <ENDPOINT_SERVICE_ID> \
     --privateEndpointId <VPC-ENDPOINT-ID>
   ```
5. Allow traffic:  
   • Resource SG → outbound ALL to interface-endpoint IPs  
   • Interface SG → inbound ALL from resources  
6. Verify  
   ```sh
   atlas privateEndpoints aws interfaces describe <VPC-ENDPOINT-ID> \
     --endpointServiceId <ENDPOINT_SERVICE_ID>   # STATUS should be AVAILABLE
   ```

## Azure Private Link (Atlas CLI)

1. Create service  
   ```sh
   atlas privateEndpoints azure create --region <REGION> [...]
   # → <ENDPOINT_SERVICE_ID>
   ```
2. Get service name  
   ```sh
   atlas privateEndpoints azure describe <ENDPOINT_SERVICE_ID>
   # note ENDPOINT SERVICE (e.g. pls_…)
   ```
3. Create Azure private endpoint  
   ```sh
   az network private-endpoint create \
     --resource-group <RG> \
     --name <PE-NAME> \
     --vnet-name <VNET> --subnet <SUBNET> \
     --private-connection-resource-id /subscriptions/<SUB>/resourceGroups/<RG-ID>/providers/Microsoft.Network/privateLinkServices/<ENDPOINT-SERVICE-NAME> \
     --connection-name <ENDPOINT-SERVICE-NAME> \
     --manual-request true
   # save: RESOURCE_ID, PRIVATE_IP
   ```
4. Register interface with Atlas  
   ```sh
   atlas privateEndpoints azure interfaces create <ENDPOINT_SERVICE_ID> \
     --privateEndpointId <RESOURCE_ID> \
     --privateEndpointIpAddress <PRIVATE_IP>
   ```
5. Verify  
   ```sh
   atlas privateEndpoints azure interfaces describe <RESOURCE_ID> \
     --endpointServiceId <ENDPOINT_SERVICE_ID>   # STATUS AVAILABLE
   ```

## GCP Private Service Connect (Atlas CLI)

1. Create endpoint group  
   ```sh
   atlas privateEndpoints gcp create --region <REGION> [...]
   # → <ENDPOINT_SERVICE_ID>
   ```
2. Wait until `STATUS=AVAILABLE`  
   ```sh
   atlas privateEndpoints gcp describe <ENDPOINT_SERVICE_ID>
   ```
3. In your GCP project create 50 IPs & forwarding rules (example script):  
   ```bash
   gcloud config set project <GCP-PROJECT-ID>
   for i in {0..49}; do
     gcloud compute addresses create <PREFIX>-ip-$i --region=<REGION> --subnet=<SUBNET>
     gcloud compute forwarding-rules create <PREFIX>-$i \
       --region=<REGION> --network=<VPC-NAME> \
       --address=<PREFIX>-ip-$i \
       --target-service-attachment=projects/<ATLAS-GCP-PROJECT-ID>/regions/<REGION>/serviceAttachments/sa-<REGION>-<GROUP-ID>-$i
   done
   ```
   Build `atlasEndpoints.txt` with `name@IP` pairs:  
   ```sh
   gcloud compute forwarding-rules list --regions=<REGION> \
     --format="csv(name,IPAddress)" --filter="name:(<PREFIX>*)" > atlasEndpoints.txt
   # reformat to comma-sep list: name@ip,...
   ```
4. Register interfaces  
   ```sh
   atlas privateEndpoints gcp interfaces create <PREFIX> \
     --endpointServiceId <ENDPOINT_SERVICE_ID> \
     --gcpProjectId <GCP-PROJECT-ID> \
     --endpoint "$(cat atlasEndpoints.txt)"
   ```
5. Verify  
   ```sh
   atlas privateEndpoints gcp interfaces describe <PREFIX> \
     --endpointServiceId <ENDPOINT_SERVICE_ID>   # STATUS AVAILABLE
   ```

## Next

Manage/verify connections and troubleshoot via Atlas docs.

</section>
<section>
<title>Manage and Connect from Private Endpoints</title>
<url>https://mongodb.com/docs/atlas/security-manage-private-endpoint/</url>
<description>Manage and connect to Atlas clusters using private endpoints, including setup, access requirements, and connection methods.</description>


# Atlas Private Endpoints – Manage & Connect

Not supported on `M0` Free/Flex clusters.

## Access
- View: `Project Read Only`
- Delete: `Project Owner` (Org Owners must add themselves as Project Owners)

## Key Considerations
- Multi-region clusters: create one PE per region; don’t modify PEs during maintenance.
- After downsizing to single-region, remove old PEs only after traffic cut-over.
- Use PE-aware connection strings.

## Connect (Atlas UI)
1. Clusters ➜ Connect ➜ Private Endpoint ➜ select PE.
2. If prompted, create DB user (Username & Password/Autogenerate, role default Atlas Admin).
3. Choose connection method.

## CLI Reference

```
# <provider> = aws | azure | gcp
# <id>        = privateEndpointId
# <iface>     = interfaceEndpointId | privateEndpointResourceId | id
```

### List / Describe
```sh
atlas privateEndpoints <provider> list [options]
atlas privateEndpoints <provider> describe <id> [options]
atlas privateEndpoints <provider> interfaces describe <iface> [options]
```

### Delete
```sh
atlas privateEndpoints <provider> delete <id> [options]
atlas privateEndpoints <provider> interfaces delete <iface> [options]
```

## UI: View / Remove
Network Access ➜ Private Endpoint tab  
• Terminate ➜ Confirm to delete PE.

</section>
<section>
<title>Set Up Access to Cloud Providers</title>
<url>https://mongodb.com/docs/atlas/security/cloud-provider-access/</url>
<description>Configure cloud provider access for Atlas, including AWS and Azure service principal setup.</description>


# Set Up Access to Cloud Providers

Configure:  
- Unified AWS Access  
- Azure Service Principal Access

</section>
<section>
<title>Set Up Unified AWS Access</title>
<url>https://mongodb.com/docs/atlas/security/set-up-unified-aws-access/</url>
<description>Set up unified AWS access for Atlas by configuring IAM roles for features like Data Federation and Encryption at Rest.</description>


# Unified AWS Access for Atlas

Atlas features (Data Federation, Encryption at Rest, etc.) assume an AWS IAM role. Supported only for AWS.

Access needed: Organization Owner or Project Owner.

## Key CLI Commands
```sh
# create role, returns AtlasAWSAccountArn & AtlasAssumedRoleExternalId
atlas cloudProviders accessRoles aws create [opts]

# authorize role for project services
atlas cloudProviders accessRoles aws authorize <roleId> [opts]

# deauthorize role
atlas cloudProviders accessRoles aws deauthorize <roleId> [opts]
```

## Trust Policy Template
```json
{
 "Version":"2012-10-17",
 "Statement":[{
   "Effect":"Allow",
   "Principal":{"AWS":"<AtlasAWSAccountArn>"},
   "Action":"sts:AssumeRole",
   "Condition":{"StringEquals":{"sts:ExternalId":"<AtlasAssumedRoleExternalId>"}}
 }]
}
```
Add this statement (with returned values) to the AWS role’s trust policy, then save.

## Administration API
POST `/cloudProviderAccess` → returns `atlasAWSAccountArn`, `atlasAssumedRoleExternalId`, `roleId`.  
PATCH/POST authorize endpoint with `roleId`.  
DELETE same endpoint to deauthorize.

## Atlas UI (Project Integrations → AWS IAM Role Access)
Actions:  
• Configure/Edit → Authorize an AWS IAM Role.  
   – Create New: copy displayed trust policy to `role-trust-policy.json`, run provided AWS CLI, paste returned ARN, Validate & Finish.  
   – Existing Role: paste trust policy in Trust relationships tab, enter Role ARN, Validate & Finish.  
• Resume in-progress role (Resume button) or delete.  
• List shows ARN, created date, bound services; ellipsis (…) → View Role Details.  
• Delete role to deauthorize (remove linked Atlas services first).

Prereqs: Atlas account, AWS CLI.

</section>
<section>
<title>Set Up and Manage Azure Service Principal Access</title>
<url>https://mongodb.com/docs/atlas/security/set-up-azure-access/</url>
<description>Set up Azure Service Principal access for Atlas projects using the UI or API to securely manage Azure Blob Storage resources.</description>


# Azure Service Principal Access

Grant Atlas (e.g., Data Federation) secure access to Azure Blob Storage via an Azure Service Principal.

## Requirements
- Atlas Project Owner role  
- Azure CLI or Azure PowerShell

## Create/Authorize Service Principal

### Atlas UI
1. Project ➜ Options ➜ Integrations ➜ Azure ➜ **Authorize Azure Service Principal**.  
2. Copy the **AppId** shown.  
3. Run one of:

```powershell
# PowerShell
$tenantId = (Get-AzContext).Tenant.Id
New-AzADServicePrincipal -AppId <AppId> -Role "Storage Blob Data Contributor"
```

```bash
# Azure CLI
tenantId=$(az account show --query tenantId -o tsv)
az ad sp create --id <AppId> --role "Storage Blob Data Contributor"
```

4. Paste the created Service Principal **ObjectId** in UI ➜ **Validate & Finish**.

### API
```http
POST /groups/{projectId}/cloudProviderAccess
{ "providerName": "AZURE" }

POST /groups/{projectId}/cloudProviderAccess/{roleId}/authorize
{
  "tenantId": "<tenantId>",
  "servicePrincipalId": "<objectId>"
}
```

## List Service Principals
UI: Integrations ➜ Azure Service Principal Access.  
API:
```http
GET /groups/{projectId}/cloudProviderAccess
```
Returns `servicePrincipalId`, `createdDate`, etc.

## Get Service Principal Details
UI: … ➜ View Service Principal Details (shows `appId`, `tenantId`, `servicePrincipalId`).  
API:
```http
GET /groups/{projectId}/cloudProviderAccess/{roleId}
```

## Remove Service Principal
(Not allowed if in use)

UI: … ➜ Delete ➜ confirm by entering ID.  
API:
```http
DELETE /groups/{projectId}/cloudProviderAccess/AZURE/{servicePrincipalId}
```



</section>
<section>
<title>Set Up and Manage Google Cloud Service Account Access</title>
<url>https://mongodb.com/docs/atlas/security/set-up-gcp-access/</url>

# GCP Service Account Access for Atlas

Atlas Data Federation & other GCP-backed features need a Google Cloud Service Account (SA) your project **Project Owner** must create.

Prereqs: Atlas account + GCP M10+ cluster.

## Atlas UI
1. Org ⇢ Project ⇢ Options ⇢ Integrations.  
2. Click **Configure** › **Create Google Cloud Service Account** › **Create** › **Done**.  
3. **Google Cloud Service Account Access** page lists:  
   • Service Account ID ┊ Created Date ┊ Actions (View details, Create federated DB, Delete).  
4. View details: Ellipsis › **View Service Account Details** → shows **Atlas GCP Service Account** (Atlas app-ID) & **Service Account ID**.  
5. Delete unused SA: Ellipsis › **Delete**, type SA-ID to confirm.

## Atlas Admin API
Base: `/api/atlas/v1.0/groups/{PROJECT_ID}/cloudProviderAccess`

```http
POST   /                       # create SA role
PATCH  /{ROLE-ID}              # authorize role (if required)
GET    /                       # list roles
GET    /providers/GCP/{ROLE-ID}# role details
DELETE /providers/GCP/{ROLE-ID}# deauthorize & delete (fails if in use)
```

See endpoints: *Create One Cloud Provider Access Role*, *Authorize One Cloud Provider Access Role*, *Return All/Specified Cloud Provider Access Role(s)*, *Deauthorize One Cloud Provider Access Role*.

</section>
<section>
<title>Configure Cluster Authentication and Authorization</title>
<url>https://mongodb.com/docs/atlas/security/config-db-auth/</url>
<description>Explore how to configure cluster authentication and authorization in Atlas, including options like AWS IAM, LDAP, OIDC, and X.509.</description>


# Cluster Auth & Authorization

Atlas clusters require authenticated DB users. Core options:

- Database Users: create via “Configure Database Users”.
- Custom Roles: define when built-in roles insufficient.
- AWS IAM: create DB user mapped to AWS IAM role ARN; connect via `mongosh`/drivers with role creds. See “Set Up Authentication with AWS IAM”.
- LDAP: configure external authZ/authN. See “Set up User Authentication and Authorization with LDAP”.
- OIDC/OAuth2: external authN/authZ. See “Authentication and Authorization with OIDC/OAuth 2.0”.
- X.509: Atlas-managed or self-managed client certs. See “Set Up Self-Managed X.509 Authentication”.

</section>
<section>
<title>Configure Database Users</title>
<url>https://mongodb.com/docs/atlas/security-add-mongodb-users/</url>
<description>Create and manage database users in Atlas, specifying roles and authentication methods, and learn how to view, modify, or delete users.</description>


# Configure Database Users

Atlas lets Org/Project Owners and Project Database Access Admins manage up to 100 DB users per project (raise via Admin API). DB users authenticate to MongoDB; Atlas users authenticate to the Atlas UI. Atlas rolls back users changed outside Atlas/CLI/API. Creation/updates/deletions are logged in Project Activity Feed.

## Authentication Methods

| Method | Cluster Ver. | Auth DB | Notes |
|--------|--------------|---------|-------|
| SCRAM-SHA-256 (pwd) | any | `admin` | Update pre-4.0 users to SHA-256. |
| X.509 | any | `$external` | mTLS; cannot be used with Atlas-managed certs + LDAP auth; cert download/expiry alert; delete user to revoke. |
| AWS IAM | ≥5.0 | `$external` | Use user/role ARN; `mongosh` example below. |
| OIDC | ≥7.0 | `$external` | Requires Workforce IdP. |
| LDAP | deprecated 8.0 (removed future) | `$external` | Self-managed X.509 needed if LDAP authz enabled. |

Auth method is immutable; create new user to change.

## Privileges & Scope

Assign any combo of:
* Built-in role (1 via UI)
* Custom roles (0+)
* Specific privileges

Optionally restrict access to selected clusters / federated instances. Users can be temporary (6 h, 1 d, 1 w). Converting: temp→perm permitted; perm→temp not.

## CLI Commands (atlas-cli)

```sh
# Create
atlas dbusers create [builtInRole]... [flags]
atlas dbusers certs create [flags]          # issue X.509 cert

# List / Describe
atlas dbusers list [flags]
atlas dbusers describe <username> [flags]
atlas dbusers certs list <username> [flags] # list unexpired certs

# Update / Delete
atlas dbusers update <username> [flags]
atlas dbusers delete <username> [flags]
```

## Admin API Endpoints

Create One, Get All, Update One, Delete One (see Admin API docs).

## UI Summary

Security → Database Access → Database Users tab  
Actions: Add / Edit / Delete. In Add dialog:
1. Choose auth method (Password, Certificate, AWS IAM, Federated Auth, LDAP).
2. Enter identifier (+ pwd / ARN / CN; optional cert download & expiry).
3. Assign roles/privileges.
4. (Optional) restrict clusters.
5. (Optional) mark Temporary + duration.
6. Add User (or Group).

Editing allows password reset, cert download, privilege changes, temp duration edit (if not expired). Auth method cannot be changed.

## AWS IAM `mongosh` Example

```sh
mongosh "mongodb+srv://<atlas-host>/test?authSource=%24external&authMechanism=MONGODB-AWS" \
  --username <access-key-id> --password <secret-key>
```

## Activity Feed

Nav-bar → Project Activity Feed (or Project Settings → Activity Feed) to audit DB-user events.



</section>
<section>
<title>Configure Custom Database Roles</title>
<url>https://mongodb.com/docs/atlas/security-add-mongodb-roles/</url>
<description>Create, modify, and delete custom database roles in Atlas to tailor user privileges beyond built-in roles.</description>


# Atlas Custom Database Roles

Create, view, update, delete, and assign custom MongoDB roles via Atlas CLI, Admin API, or UI only; direct cluster changes are rolled back.

Limits & Behavior  
- ≤20 custom roles/user, ≤100/project (contact support to raise).  
- Deploy lag ≤30 s on M0/Flex/M2+/Serverless (deprecated).  
- Highest privilege wins when roles conflict.  
- Audited in project Activity Feed.

Access required: Organization Owner, Project Owner, or Project Database Access Admin.

## Naming Rules
Alphanumerics, `_`, `-` only. Forbidden: duplicates, built-in role names, `atlasAdmin`, names starting `xgen-`.

## Privilege Selection (UI)
Categories: Collection, Database, Global, Custom.  
Choose from ONE category per row (Global+Custom allowed together).  
DB/Collection fields mandatory for Collection and Database categories.  
“Apply to any …” also grants on `admin`,`local`,`config` (writes discouraged).  
Unavailable actions are greyed if incompatible with cluster versions.

## CLI Commands
```sh
atlas customDbRoles create   <roleName> [opts]
atlas customDbRoles list              [opts]
atlas customDbRoles describe <roleName> [opts]
atlas customDbRoles update   <roleName> [opts]
atlas customDbRoles delete   <roleName> [opts]
```

## Admin API Endpoints
Create One, Get All, Update One, Remove One (see API docs).

## UI Paths
Security → Database Access → Custom Roles  
Buttons: Add New Custom Role │ Edit │ Delete │ Add action/role │ Add database/collection.

## Deletion Blockers
Cannot delete if it would leave:  
1) child roles without parents/actions, or  
2) users without any roles.

## Assignment
Assign custom roles while adding or editing users (UI) or via Admin API (Create/Update User).

</section>
<section>
<title>Set Up Authentication with AWS IAM</title>
<url>https://mongodb.com/docs/atlas/security/aws-iam-authentication/</url>
<description>Set up AWS IAM authentication for database users to connect to Atlas clusters using IAM roles, reducing authentication mechanisms and secret management.</description>


# AWS IAM Authentication

Not supported with LDAP; use a separate project if LDAP is enabled.

## Attach IAM Role
- Assign an IAM role to Lambda, EC2, ECS, or EKS in AWS Console.

### Lambda  
Environment vars auto-set: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`.

### ECS (EC2 launch type)  
Creds URI: `http://169.254.170.2${AWS_CONTAINER_CREDENTIALS_RELATIVE_URI}`.

### EC2  
IMDSv2 URI: `http://169.254.169.254/latest/meta-data/iam/security-credentials/`.

### EKS  
Set pod env vars:  
`AWS_WEB_IDENTITY_TOKEN_FILE` (path to token)  
`AWS_ROLE_ARN` (role ARN)

## Grant Atlas Access
Create a database user mapped to the IAM role via Atlas UI/CLI/API (Configure Database Users).

## Connect (`mongosh` ≥ 0.9.0)
```sh
mongosh "mongodb+srv://<host>/test?authSource=%24external&authMechanism=MONGODB-AWS" \
  --username <AWS_ACCESS_KEY_ID> --password <AWS_SECRET_ACCESS_KEY>
```

</section>
<section>
<title>Set Up User Authentication and Authorization with LDAP</title>
<url>https://mongodb.com/docs/atlas/security-ldaps/</url>
<description>Set up user authentication and authorization in Atlas using LDAP, including configuration, limitations, and procedures for managing LDAP users and groups.</description>


# Set Up User Authentication & Authorization with LDAP

**Status**: Deprecated in MongoDB 8.0; removed in a future major release.  
**Unsupported deployments**: M0, M2/M5, Flex, Serverless.

## Access & Prereqs
- Role: Org/Project Owner.  
- Cluster: MongoDB ≥ 4.0.  
- LDAPS reachable via VPC/VNet peering or public IP.  
- Each LDAP user entry must contain group membership (for authZ).

## Connectivity Recommendations
1. VPC/VNet → peer to Atlas; public FQDN → private IP.  
2. Datacenter: public FQDN/IP, allow Atlas cluster public IPs.  
Public-IP changes require updating LDAP allow-list.

## Limitations & Conflicts
- Cannot mix LDAP with SCRAM.  
- OIDC fails if LDAP authZ enabled.  
- Atlas-managed X.509 blocked when LDAP authZ on; self-managed X.509 CN must equal LDAP DN.  
- Atlas username = full DN (e.g. `cn=ralph,cn=Users,dc=example,dc=com`).

## Client Connection
Override:
```
authSource=$external
authenticationMechanism=PLAIN
```
Example:
```sh
mongosh "mongodb+srv://<host>/?authSource=%24external" \
  --authenticationMechanism PLAIN \
  --username cn=rob,cn=Users,dc=ldaps-01,dc=myteam,dc=com
```

## CLI Commands
```sh
# Create/Update LDAP config (authN & authZ)
atlas security ldap save [options]

# Get config
atlas security ldap get [options]

# Delete (disables LDAP)
atlas security ldap delete [options]

# Add LDAP DB user/group
atlas dbusers create [builtInRole]... [options]
```
Key options (save):  
`--hostname <host[:port]>, --bindUsername <DN>, --bindPassword <pwd>, --caCertificate <file>, --authzQueryTemplate '{USER}?memberOf?base'` (default template).

## UI (summary)
Security → Advanced: toggle **LDAP Authentication** and **LDAP Authorization**. Enter server(s), bind DN/pwd, CA cert(s). For authZ add **Query Template** (RFC 4515 syntax, `{USER}` placeholder). Click **Verify & Save**.

Database Access → Add New Database User: choose LDAP User/Group, enter DN, assign built-in/custom roles or specific privileges, optional cluster restriction and TTL.

## Behavior Notes
- Enabling authZ without group membership ⇒ user gets no roles.  
- Disabling authZ restores role mapping to user object.  
- Default query template searches `memberOf` attribute on user DN.

</section>
<section>
<title>Configure User Authentication and Authorization with Microsoft Entra ID Domain Services</title>
<url>https://mongodb.com/docs/atlas/security-ldaps-azure/</url>
<description>Configure Atlas to authenticate and authorize database users using Microsoft Entra ID Domain Services for LDAP integration.</description>


# Atlas LDAP Integration with Microsoft Entra ID Domain Services

Prereqs  
- Atlas: Enterprise tier, ≥ M10 cluster, Org/Project Owner role.  
- Azure: subscription, Entra ID tenant, Global Admin, custom routable domain.  

## 1  Prepare Entra ID Domain Services (AAD-DS)

1. Create managed domain (`<managed-domain>`, e.g. aadds.example.com).  
2. SSL: wildcard cert (`*. <managed-domain>`) w/ private key (`.pfx`). Self-signed only for testing.  
   ```sh
   # create key, csr, crt then
   openssl pkcs12 -export -out cert.pfx -inkey key.key -in cert.crt
   ```  
3. Enable secure LDAP (TCP 636) on AAD-DS.  
4. DNS: host record `ldap.<managed-domain>` → AAD-DS LDAP external IP.  
5. Firewall: allow inbound TCP 636 from Atlas IPs / Internet.  
6. Create bind user in custom domain; generate Kerberos/NTLM hash; add roles:  
   - Directory Readers  
   - Microsoft Entra ID DC Administrators (for ldapsearch troubleshooting)  
7. Create Entra users & groups that will map to DB roles.

## 2  Enable LDAP Auth in Atlas

Atlas → Security → Advanced  
1. Toggle **LDAP Authentication** ON.  
2. Server Hostname(s): `ldaps://ldap.<managed-domain>.com:636` (comma-sep if HA, same port).  
3. Bind DN / password (user created above).  
4. (Optional) User-to-DN mapping:  
   ```json
   [
     {
       "match": "(.+)",
       "substitution": "CN={0},OU=AADDC Users,DC=<managed>,DC=<domain>,DC=com"
     }
   ]
   ```  
5. CA Root Certificate(s) (PEM, comma-sep).  
6. Verify & Save (Atlas tests connectivity).

### Add Users (Auth-only)

Security → Database Access → Add New Database User → LDAP User  
- If no mapping: `CN=<user>,OU=AADDC Users,DC=<managed>,DC=<domain>,DC=com`  
- Else: username per mapping.  
- Assign DB roles.

## 3  Enable LDAP Authorization (Groups)

1. Add each Entra group DN as “LDAP Group” in Database Access:  
   `CN=<group>,OU=AADDC Users,DC=<managed>,DC=<domain>,DC=com` → choose DB roles.  
2. Security → Advanced → toggle **LDAP Authorization** ON.  
3. Query Template (RFC4515). Default:  
   ```text
   {USER}?memberOf?base
   ```  
4. Verify & Save.

## 4  Client Connection (mongosh)

Parameters to override:  
`authSource=$external&authMechanism=PLAIN`  
Example:  
```sh
mongosh "mongodb+srv://<srv>/?authSource=$external&authMechanism=PLAIN" \
  --username "CN=Jane\ Doe,OU=AADDC\ Users,DC=aadds,DC=example,DC=com" \
  --password "<pwd>"
```
(Use full DN unless mapping; escape spaces.)

## 5  Troubleshooting

ldapsearch template (bind user must be DC Admin):  
```sh
ldapsearch -H ldaps://ldap.<managed-domain>.com \
  -b "DC=<managed>,DC=<domain>,DC=com" \
  -D "CN=<bind>,OU=AADDC Users,DC=<managed>,DC=<domain>,DC=com" -w '<pwd>' \
  "(&(objectCategory=user)(memberOf=CN=<group>,OU=AADDC Users,DC=<managed>,DC=<domain>,DC=com))"
```
If auth works but authz fails, verify `Query Template`, group DNs, and that LDAP search returns expected entries.

Limitations: Not supported on M0, M2/M5, Flex, Serverless; LDAP deprecated in MongoDB 8 → removed in future.

</section>
<section>
<title>Configure User Authentication and Authorization with Okta LDAP Interface</title>
<url>https://mongodb.com/docs/atlas/security-ldaps-okta/</url>
<description>Enable Atlas to authenticate and authorize database users from Okta using LDAP, with options for authentication only or both authentication and authorization.</description>


# Atlas LDAP (Okta) Auth & AuthZ Setup

> LDAP deprecated starting MongoDB 8 but fully supported in v8; requires Atlas Enterprise M10+ (not M0/M2/M5/Flex/Serverless). Needs Org/Project Owner.

## 1 Okta Prep  

1. Enable Okta LDAP Interface; record `<okta-id>` (from `https://<okta-id>.admin.okta.com`).  
2. Create **bind user** (do NOT use your own acct). DN:  
   ```
   uid=<bind-email>,ou=users,dc=<okta-id>,dc=okta,dc=com
   ```  
3. Create desired Okta users (email usernames, avoid `+`).  

### (Optional) AuthZ  
4. Create Okta groups (one per privilege, e.g. `db-read`).  
5. Add users to groups.  
6. Grant bind user “Read Only Administrator” (Security → Administrators).

## 2 Atlas Auth Configuration  

1. Project → Security → Advanced → enable **LDAP Authentication**.  
2. Provide:  
   • `Server Hostname(s)` (comma-sep, same port)  
   • `Bind DN` / password  
   • CA root(s) (PEM)  
3. **User-to-DN Mapping** (email login):  
   ```json
   [{
     "match":"(.+)",
     "substitution":"uid={0},ou=users,dc=<okta-id>,dc=okta,dc=com"
   }]
   ```  
4. Verify & Save.  

### Add LDAP Users (no AuthZ)  
Security → Database Access → Add New Database User → LDAP User  
• DN if no mapping:  
  ```
  uid=<user-email>,ou=users,dc=<okta-id>,dc=okta,dc=com
  ```  
• else supply mapped value. Assign desired built-in role(s).

## 3 Atlas Authorization (group-based)  

Skip if user-based only.

1. Database Access → Add New Database User → **LDAP Group**.  
   DN:  
   ```
   cn=<group>,ou=groups,dc=<okta-id>,dc=okta,dc=com
   ```  
   Assign privileges to group; repeat per group.  
2. Security → Advanced → enable **LDAP Authorization**.  
3. Set **Query Template** (RFC 4515), ex:  
   ```
   ou=groups,dc=<okta-id>,dc=okta,dc=com?dn?sub?(&(objectClass=groupofUniqueNames)(uniqueMember={USER}))
   ```  
4. Verify & Save.

## 4 Client Connection Test (`mongosh`)  

Connection string overrides:  
```
?authSource=$external&authMechanism=PLAIN
```  
Connect with user’s full DN (or mapped username) & password, then run read/write commands to confirm access.

## 5 Troubleshooting  

Bind user must be “Read Only Administrator”.

Test query via `ldapsearch` (LDAPS):  
```sh
ldapsearch -H "ldaps://<okta-id>.ldap.okta.com" \
  -D "uid=<bind-email>,ou=users,dc=<okta-id>,dc=okta,dc=com" \
  -w "<bind-pwd>" \
  -b "ou=groups,dc=<okta-id>,dc=okta,dc=com" \
  '(&(objectClass=groupofUniqueNames)(uniqueMember=uid=<user-email>,ou=users,dc=<okta-id>,dc=okta,dc=com))'
```

</section>
<section>
<title>Configure User Authentication and Authorization with OneLogin VLDAP</title>
<url>https://mongodb.com/docs/atlas/security-ldaps-onelogin/</url>
<description>Configure Atlas to authenticate and authorize database users from OneLogin using LDAP, detailing steps for setup, limitations, and required access.</description>


# Atlas + OneLogin VLDAP AuthN/AuthZ (MongoDB ≥8.0)

> LDAP deprecated; works through 8.x. Not on M0/Flex/Serverless/M2-M5.

Cluster req: M10+ (Atlas Enterprise).  
Atlas role req: Org Owner or Project Owner.

## OneLogin Setup
1. Enable VLDAP (contact OneLogin). Note `<onelogin-instance-id>` from `https://<id>.onelogin.com`.
2. VLDAP → Allow access by IP:  
   • every Atlas node IP (`nslookup cluster0-shard-00-00-*.mongodb.net`)  
   • (opt) your ldapsearch host.
3. Create bind user (email == username). DN:  
   `cn=<bind-email>,ou=users,dc=<id>,dc=onelogin,dc=com`
4. Grant bind user privilege: Manage users | Manage group | Super user. If Manage group, select that group.
5. Set bind user password.
6. Create DB users (Email & Username same, avoid ‘+’) and set passwords.

## Atlas – Enable LDAP Authentication
1. Project → Security → Advanced → toggle LDAP Authentication = On.
2. Configure LDAP Server(s):  
   • host(s): `ldap.us.onelogin.com` port 636 (LDAPS) or 389 (STARTTLS).  
   • bind DN/pwd from OneLogin.  
3. User-to-DN Mapping (allows email login):
```json
[{"match":"(.+)","substitution":"cn={0},ou=users,dc=<id>,dc=onelogin,dc=com"}]
```
4. Paste CA root(s) (can be self-signed).  
5. Verify & Save (Atlas deploys).
6. Database Access → Add New Database User → LDAP User:  
   • if no mapping: full DN template above, else email/username.  
   • choose built-in role or custom permission.

## Optional: Group-Based Authorization
### OneLogin
1. Create groups per privilege (e.g. `db-read`). DN:  
   `cn=<group>,ou=groups,dc=<id>,dc=onelogin,dc=com`
2. Add users to groups (Users → user → Authentication tab).

### Atlas
1. Database Access → Add New Database User → LDAP Group: enter group DN, select roles.
2. Security → Advanced → toggle LDAP Authorization = On.  
   • Query Template (RFC4515/4516):  
     `{USER}?memberOf?base`
3. Verify & Save.

Note: turning on authorization disables LDAP users not in an authorized group.

## Client Connection (mongosh)
Add to connection string:  
`?authSource=$external&authMechanism=PLAIN`  
If no mapping, use user’s full DN as username.

## Troubleshooting
Whitelist ldapsearch host IP in OneLogin.  
Command template:
```sh
ldapsearch -H 'ldaps://ldap.us.onelogin.com:636' \
  -D '<bind_user_dn>' -w '<bind_pwd>' \
  -b 'dc=<id>,dc=onelogin,dc=com' -s sub
```
Verify query returns expected group DNs if AuthZ fails.

</section>
<section>
<title>Authentication and Authorization with OIDC/OAuth 2.0</title>
<url>https://mongodb.com/docs/atlas/security-oidc/</url>
<description>Authenticate and authorize access to Atlas clusters using OIDC or OAuth 2.0 with your identity provider for both human users and applications.</description>


# Atlas OIDC/OAuth 2.0 Auth

- Human SSO ➔ Workforce Identity Federation (OIDC).  
- Programmatic access ➔ Workload Identity Federation (OAuth 2.0; e.g., Azure SP/MI, GCP SA).  

Notes  
• SCRAM, X.509, AWS-IAM remain usable.  
• LDAP authorization cannot be combined with OIDC auth.

</section>
<section>
<title>Set up Workforce Identity Federation with OIDC</title>
<url>https://mongodb.com/docs/atlas/workforce-oidc/</url>
<description>Set up Workforce Identity Federation with OIDC to manage access to MongoDB deployments using an external Identity Provider for authentication and authorization.</description>


# Atlas Workforce Identity Federation (OIDC)

Supported: Atlas dedicated clusters ≥M10 running MongoDB 7.0.11+. Clients: Compass ≥1.38, mongosh ≥2.1.4. Admin role required: Organization Owner.

## Workflow
1. Register OIDC “public/native” app in external IdP.  
   • Redirect URI: `http://localhost:27097/redirect`  
   • Grant type: Auth Code + PKCE (preferred) or Device Flow  
   • Token type: JWT only  
   • (If group auth) output `groups` claim  
   • Optional: `offline_access` scope (refresh tokens), set `exp` to match DB session  
   • Record `issuer`, `clientId`, `audience`
2. In Atlas → Federation Mgmt:  
   a. Verify domain (HTML file or DNS TXT).  
   b. Add Identity Provider → Workforce Identity Provider → OIDC for Data Access.  
   c. Protocol settings:  

   | Field               | Required | Value |
   |---------------------|----------|-------|
   | Configuration Name  | ✔︎       | Label |
   | Issuer URI          | ✔︎       | `issuer` from IdP (`/.well-known/openid-configuration` must exist) |
   | Client ID           | ✔︎       | `clientId` |
   | Audience            | ✔︎       | `audience` (often same as clientId) |
   | Authorization Type  | ✔︎       | Group Membership or User ID |
   | Requested Scopes    | Opt.     | Include `offline_access`; Azure: `<clientId>/.default` |
   | User Claim          | ✔︎       | default `sub` |
   | Groups Claim        | req. if Group auth | default `groups` |

   d. Save → Associate domain(s) → Connect organization(s). Federation applies to all projects in the org.

3. Create DB User/Group (Project → Security → Database Access → Add):  
   • Authentication Method: “Federated Auth”  
   • Select IdP; enter user identifier or group Object Id (Azure).  
   • Assign built-in/custom roles or specific privileges; optionally restrict clusters; optionally mark Temporary (6h, 1d, 1w).

## Azure Entra ID Quick-ref
1. Register app: single-tenant, redirect URI above.  
2. Token Configuration → Add groups claim (Security, Group ID).  
3. Add optional claim: Access → e.g. `upn` (email).  
4. Manifest: `requestedAccessTokenVersion` = 2.  
5. Values needed:  
   • Application (client) ID → Client ID / Audience  
   • OIDC metadata doc URL (minus `/.well-known/openid-configuration`) → Issuer URI.

## Key Management
• MongoDB auto-refreshes JWKS on key rotation.  
• If private key compromised: IdP → rotate keys → Atlas Federation → Identity Providers → Workforce card → Revoke (forces JWKS reload; restart clients).

## Delete Workforce IdP
Federation Mgmt → Organizations → Disconnect for each org → Identity Providers → Workforce card → Delete.



</section>
<section>
<title>Set up Workload Identity Federation with OAuth 2.0</title>
<url>https://mongodb.com/docs/atlas/workload-oidc/</url>
<description>Set up Workload Identity Federation to access Atlas clusters using external identities like Azure Service Principals and Google Service Accounts.</description>


# Workload Identity Federation (Atlas)

Access M10+ clusters (MongoDB ≥7.0.11) with OAuth2 tokens from external IdPs. Supported only via drivers (not mongosh/Compass).

## Auth Flows

Built-in (driver fetches cloud JWT automatically)  
 GCP: Compute Engine, App Engine (Std/Flex), Cloud Functions, Cloud Run, GKE, Cloud Build — Service Accounts  
 Azure: VM — Managed Identity (user/system)  

Callback: driver calls user-supplied function to obtain JWT from any OAuth2 IdP.

## Driver Versions

Java 5.1+, C#/.NET 2.25+, Go 1.17+, PyMongo 4.7+, Node/TS 6.7+, Kotlin 5.1+.

## Setup Overview

1. External IdP config (Azure or GCP).  
2. Atlas: add Workload Identity Provider (Org Owner).  
3. Grant DB access (Project Owner).  
4. App connects with supported driver.

---

## 1. External IdP Configuration

### Azure Entra ID

1. Portal → Entra ID → App registrations → New registration  
   • Name: “Atlas Database – Workload”  
   • Accounts: Single-tenant  
   • Redirect URI: Web (any).  
2. (Opt) Token Configuration → Add groups claim (Security, Group ID).  
3. Expose an API → enable Application ID URI (keep default).  
4. Manifest: set `"requestedAccessTokenVersion": 2`.  
5. Record:  
   • Issuer URI = OIDC metadata URL sans `/.well-known/...`  
   • Client ID = Application (client) ID  
   • Audience = Application ID URI.

### Google Cloud

No changes needed. Issuer URI is `https://accounts.google.com`. Choose any Audience value.

---

## 2. Atlas Configuration (Federation Management App)

Settings per provider:

| Field              | Azure value                              | GCP value                          |
|--------------------|------------------------------------------|------------------------------------|
| Configuration Name | free text                                | free text                          |
| Issuer URI         | recorded Issuer                          | `https://accounts.google.com`      |
| Audience           | Application ID URI                       | custom string                      |
| Authorization Type | `User ID` (typical) or `Group Membership`|
| Groups Claim       | `groups` (req. if Group auth)            | n/a unless Group auth              |
| User Claim         | `sub` (do not change)                    | `sub`                              |

Save → Connect Organizations → select org → Connect.

Enables federation for all projects in org.

---

## 3. Add Database User / Group (Project → Security → Database Access)

Authentication Method: Federated Auth  
Select IdP, then Identifier:  
 Azure = Object ID of Managed Identity / Service Principal / AD Group  
 GCP   = Unique ID of Service Account  
Assign roles → Add.

---

## 4. Driver Connection (example)

```python
# PyMongo ≥4.7, built-in auth on GCP Cloud Run
from pymongo import MongoClient
client = MongoClient("mongodb+srv://<cluster>/?authMechanism=MONGODB-OIDC")
```

For callback flow supply `callback` per driver docs.

---

## Management

Revoke JWKS (custom signing keys only): Federation App → Identity Providers → Workload IdP → Manage → Revoke (restart clients).

Delete Provider: Disconnect all orgs (Organizations tab → Manage → Disconnect) then Identity Providers → Workload IdP → Delete.



</section>
<section>
<title>Set Up Self-Managed X.509 Authentication</title>
<url>https://mongodb.com/docs/atlas/security-self-managed-x509/</url>
<description>Set up self-managed X.509 authentication for database users in Atlas, enabling secure access to clusters using mutual TLS certificates.</description>


# Self-Managed X.509 (mTLS) Authentication

## Notes
* Atlas-managed X.509 **can't** be used after LDAP auth is enabled.  
* Self-managed certs **can** be used with LDAP if the cert CN matches the user’s LDAP DN.  
* Both self-managed and Atlas-managed cert users may coexist.

## Access / Prereqs
Role: `Org Owner` or `Project Owner`.  
Need external PKI that issues client certs.

## Enable Self-Managed X.509 in a Project
1. Atlas UI → Security › **Advanced** → toggle **Self-Managed X.509 Authentication** ON.  
2. Supply PEM-encoded CA(s):  
   • UI: Upload `.pem` or paste text → Save.  
   • CLI:  
     ```sh
     atlas security customerCerts create [--projectId ID] --cas <pemFile>
     ```
   Multiple CAs may be concatenated. Atlas auto-creates alert 30 days before CA expiry.

## View / Disable CA
```sh
atlas security customerCerts describe [--projectId ID]
atlas security customerCerts disable  [--projectId ID]
```
UI: click Self-Managed X.509 Authentication Settings icon.

## Add X.509 DB User
1. UI → Security › **Database Access** → **Add New Database User**.  
2. Auth Method: **CERTIFICATE**.  
3. Distinguished Name: enter CN plus optional RFC 4514 attrs, e.g.  
   ```
   CN=Jane Doe,O=MongoDB,C=US
   ```  
4. Assign privileges:  
   • Atlas admin  
   • Read/Write Any DB  
   • Read Any DB  
   • Custom role(s) or manual role list (Add Default Privileges).  
5. Click **Add User**.

## CLI equivalents (user creation not yet supported).

</section>
<section>
<title>Encryption at Rest using Customer Key Management</title>
<url>https://mongodb.com/docs/atlas/security-kms-encryption/</url>
<description>Enable encryption at rest in Atlas using your cloud provider's Key Management Service for added security.</description>


# Encryption at Rest w/ Customer Key Management (CKM)

• Unsupported: Flex clusters, Serverless.  
• Atlas always encrypts storage; CKM adds provider KMS layer (extra cost).  
• Providers: AWS KMS, Azure Key Vault (AKV), GCP KMS. Cluster cloud ≠ KMS cloud OK.  
• Enabling/Disabling CKM → full resync + Search/Vector index rebuild.  
• Azure-only M10+ clusters: use Admin API to auto-create AKV Private Link.  
• Atlas never rotates keys; 90-day rotation alert. Cluster keeps running if KMS offline until a restart.  

## Roles
Project Owner (org owner must add self to project).

## Project-Level Setup
1. UI → Security → Advanced.  
2. Toggle “Encryption at Rest using your Key Management” = On.  
   • Optional “Search Node Data Encryption” (AWS only).  
3. Enter KMS creds + key, Save.  
4. (If restricted) allow Atlas control-plane IPs:  
   ```http
   GET /api/atlas/v1.0/controlPlanes/returnAllControlPlaneIpAddresses
   ```  
   Add returned outbound CIDRs to provider ACL.

## Cluster-Level Enablement
• New cluster: set “Manage your own encryption keys”=Yes before deploy.  
• Existing cluster: Clusters → … → Edit Configuration → Additional Settings → Enable key mgmt.  
• Require Private Networking must be Active if CKM-over-private-endpoint configured.

### KMS ACL for Nodes
```http
GET /api/atlas/v1.0/groups/{PROJECT-ID}/processes/returnAllIpAddresses
```  
Add listed (in|out)bound IPs within 3 days or plan rolls back.

## Search Node CKM (AWS)
Toggle “Search Node Data Encryption” in project settings. Disabling CKM or key invalid → cluster paused, Search nodes removed; re-provision & re-index when fixed.

## Scaling
When adding nodes/shards repeat IP list/ACL step above.

## Validation & Failure Modes
Atlas validates: on credential change, every 15 min, or via API.  
Shuts down mongod/s if:  
• creds invalid OR key deleted/disabled.  
Network block only fires alert `Encryption at Rest KMS network access denied` (enabled by default).  
Disabled clusters: no reads/writes, still billed, maintenance continues. Update creds/key then click “Try Again” or wait for next check.

Cannot change key or disable CKM without valid key.

### Key Restore
Follow provider docs: AWS “Delete customer master keys”, Azure “Recover deleted key”, GCP “Restore key versions”.

## Backups
• Snapshot volumes encrypted; CKM can also encrypt snapshot storage, data files, PIT oplog.  
• Cannot restore snapshots if key invalid.  
• 6 h base schedule; downloads behave like unencrypted ones (use role-based key access).

## APIs referenced
- `/controlPlanes/returnAllControlPlaneIpAddresses`  
- `/groups/{projectId}/processes/returnAllIpAddresses`

</section>
<section>
<title>Manage Customer Keys with AWS KMS</title>
<url>https://mongodb.com/docs/atlas/security-aws-kms/</url>
<description>Configure Atlas to use AWS KMS for managing encryption keys, enabling role-based access and key rotation for enhanced security.</description>


# Manage Customer Keys with AWS KMS

## Prerequisites
- Atlas role: **Project Owner** (Org Owners must add themselves).
- Configure KMS at **Project** level before enabling on clusters.
- Supported only on dedicated/Serverless Next clusters (not M0, M2, M5, Flex, deprecated serverless).

## Key Hierarchy
CMK (AWS-KMS, customer-managed) → encrypts MongoDB Master Key (one per node) → encrypts per-database keys.  
Revoking CMK access shuts down cluster.

## Enable / Edit KMS
1. Atlas UI → **Security / Advanced** → Encryption at Rest → **Edit**.  
2. Provide:  
   - **AWS IAM role** with `DescribeKey`, `Encrypt`, `Decrypt`.  
   - **Customer Master Key ID**.  
   - **Customer Master Key Region** (KMS-supported).  
3. Click **Save**; wait for deployment before disabling old CMK.

## CMK Rotation (your responsibility)
- Atlas auto-rotates MongoDB Master Keys ≤90 days (rolling, no data rewrite).
- CMK not auto-rotated; Atlas creates 90-day alert (customizable/disable).
- Manual rotation: create new CMK in AWS, then update fields above.
- Snapshots keep CMK used at creation; do **not** delete old CMK until all dependent snapshots expire per retention policy.

## Reconfigure KMS Region During Outage
Requires **multi-Region CMK**.
1. Security / Advanced → **Edit**.  
2. Ensure IAM role & Key ID unchanged.  
3. Change **Customer Master Key Region** to available region → **Save**.

## Network Options
- Use public AWS KMS endpoint or AWS PrivateLink.

## Related
- Encryption at Rest (MongoDB docs)  
- Cloud Backup encryption

</section>
<section>
<title>Manage Customer Keys with AWS Over a Public Network</title>
<url>https://mongodb.com/docs/atlas/security/aws-kms-over-public-network/</url>

# Atlas Encryption at Rest with AWS KMS (CMK) over Public Network

## Prereqs
- Cluster tier ≥ M10.  
- AWS KMS CMK in same or cross account. Atlas IAM role needs `kms:Encrypt|Decrypt|DescribeKey`.  
  • Cross-acct: add CMK key-policy & IAM inline policy; supply full CMK ARN.  
- Allow Atlas & cluster node IPs in IAM role `Condition` if you restrict IPs.

---

## 1 Enable Role-Based KMS Access for Project

### UI (summary)
Security → Advanced → “Encryption at Rest” = On  
1 “Authorize a new IAM role” → create/choose role.  
2 Attach policy:
```json
{
 "Version":"2012-10-17",
 "Statement":[{
   "Effect":"Allow",
   "Action":["kms:Decrypt","kms:Encrypt","kms:DescribeKey"],
   "Resource":"arn:aws:kms:<region>:<acct>:key/<uuid>"
 }]
}
```  
3 Select role, enter CMK ID/ARN & region, Save.

### API Flow
1 Create role entry:
```bash
POST /groups/{groupId}/cloudProviderAccess
```
→ note `atlasAWSAccountArn`, `atlasAssumedRoleExternalId`.

2 Edit AWS trust policy:
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

3 Enable KMS on project:
```bash
PATCH /groups/{groupId}/encryptionAtRest
{
 "awsKms":{
   "enabled":true,
   "roleId":"<roleId>",
   "customerMasterKeyID":"<cmk-id-or-arn>",
   "region":"<aws-region>"
 }
}
```

---

## 2 Migrate User-Cred Projects to Role Access  
Repeat steps above; once migrated, cannot revert to user creds.

---

## 3 Enable CMK per Cluster  
Cluster → Edit Configuration → Additional Settings → “Manage your own encryption keys” = Yes → Review & Apply.

</section>
<section>
<title>Manage Customer Keys with AWS Over Private Endpoints</title>
<url>https://mongodb.com/docs/atlas/security/aws-kms-over-private-endpoint/</url>

# AWS PrivateLink CMK for Atlas

## Overview
Encrypt Atlas data with your AWS KMS CMK routed only through AWS PrivateLink.

Benefits: no public IPs, no IP-whitelists.  
Limits: single-cloud projects, project must be `ACTIVE`.

## Prereqs
- M10+ cluster.
- AWS KMS CMK + IAM role allowing `kms:Encrypt|Decrypt|DescribeKey`.
- Role trust must include Atlas principal & per-project `ExternalId`.
- If CMK is in another AWS account use full key ARN and update key & role policies.
- Same role/CMK used for all clusters in project.

### Sample key-access policy
```json
{
 "Version":"2012-10-17",
 "Statement":[{
   "Effect":"Allow",
   "Action":["kms:Decrypt","kms:Encrypt","kms:DescribeKey"],
   "Resource":"arn:aws:kms:us-east-1:123456789012:key/12x345y6-..."
 }]
}
```

## 1 Authorize AWS IAM Role

### API (preferred)
```bash
# create Atlas cloud-provider access
POST /api/atlas/v1.0/groups/{groupId}/cloudProviderAccess
→ returns atlasAWSAccountArn, atlasAssumedRoleExternalId
```

Update role trust:
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

Authorize role & enable KMS:
```bash
PATCH /v1.0/groups/{groupId}/encryptionAtRest
{
 "awsKms":{
   "enabled":true,
   "roleId":"<roleId>",
   "customerMasterKeyID":"<cmk-arn-or-id>",
   "region":"<aws-region>"
 }
}
```

## 2 Enable PrivateLink

### a) Require private networking
```bash
PATCH /v2/groups/{groupId}/encryptionAtRest
{
 "awsKms":{"requirePrivateNetworking":true,...}
}
```

### b) Create endpoint per region
```bash
POST /v2/groups/{groupId}/encryptionAtRest/AWS/privateEndpoints
{ "regionName":"US_EAST_1" }
```

### c) Check status
```bash
GET /v2/groups/{groupId}/encryptionAtRest/AWS/privateEndpoints
# status: INITIATING | ACTIVE | FAILED
```

Restrictions: new/expanded clusters deploy only in regions with `ACTIVE` endpoints.

## 3 Enable CMK on Cluster
When creating or editing a cluster set “Manage your own encryption keys” = Yes.  
Require Private Networking shows Active when endpoints exist.

## 4 Endpoint Management

Create additional endpoints: same POST as above.  
Delete:
```bash
DELETE /v2/groups/{groupId}/encryptionAtRest/AWS/privateEndpoints/{endpointId}
```
Endpoint states: ACTIVE, FAILED, DELETING, PENDING_RECREATION (if AWS side removed).

Disable PrivateLink: remove all endpoints, then
```bash
PATCH ... "requirePrivateNetworking":false
```

## 5 Disable CMK Project-wide
1. Remove all endpoints.  
2. Disable CMK on every cluster.  
3. PATCH project `awsKms.enabled:false`.  
Do NOT delete the CMK until feature disabled or data becomes inaccessible.

</section>
<section>
<title>Manage Customer Keys with Azure Key Vault</title>
<url>https://mongodb.com/docs/atlas/security-azure-kms/</url>
<description>Configure customer key management in Atlas using Azure Key Vault to encrypt data at rest, manage key rotation, and ensure secure access through Azure Private Link.</description>


# Manage Customer Keys with Azure Key Vault

Not supported on: `M0` Free, Flex, Serverless (deprecated), `M2/M5` Shared (deprecated).

Atlas encrypts each node’s per-db key → MongoDB Master Key → your AKV CMK.  
CMK decrypts Master Keys at startup; revoking CMK stops cluster. Master Keys auto-rotate ≥90 days; Azure Client Secret expires after 2 yrs—rotate before expiry. Atlas never rotates the AKV Key ID; set alert (90 d default) or Azure auto-rotate (~365 d).

During AKV regional outage, Azure routes to paired region; Atlas continues if one node can encrypt/decrypt.

## Prereqs
• Atlas Project Owner role.  
• Configure project-level CMK before enabling on clusters.  
• Grant Atlas AKV access via Access Policy or Azure RBAC.

## AKV Access Policy
1. IAM: add `Microsoft.KeyVault/vaults/read`.  
2. Access Policies → new policy, Key Permissions: `get`, `encrypt`, `decrypt`.  
3. Assign same app principal.

## Azure RBAC
IAM role with:  
```json
"actions": [
  "Microsoft.KeyVault/vaults/read",
  "Microsoft.KeyVault/vaults/keys/read"
],
"dataActions": [
  "Microsoft.KeyVault/vaults/keys/read",
  "Microsoft.KeyVault/vaults/keys/encrypt/action",
  "Microsoft.KeyVault/vaults/keys/decrypt/action"
]
```

## Networking Options
• Public network  
• Azure Private Link (preferred, can automate via Atlas Admin API).

## Next Steps
See guides for configuring over Private Endpoints or public network.

</section>
<section>
<title>Manage Customer Keys with Azure Key Vault Over a Public Network</title>
<url>https://mongodb.com/docs/atlas/security/azure-kms-over-public-network/</url>

# Manage Customer Keys with Azure Key Vault

Unsupported: M0, M2/M5, Flex, Serverless.

Prerequisites  
• Cluster ≥ M10  
• AKV data:  
  – clientID, tenantID, secret  
  – subscriptionID, resourceGroupName, keyVaultName  
  – keyIdentifier URL `https://{vault}.vault.azure.net/keys/{key}/{ver}`  
• Atlas control-plane / node IPs (or Private Link) must reach AKV.

## Enable CMK for a Project

UI: Security → Advanced → Encryption at Rest using your Key Management = On → Azure Key Vault  
1. Enter Account creds (clientID, tenantID, secret, Azure environment).  
2. Enter Vault creds (subscriptionID, resourceGroupName, keyVaultName).  
3. Enter keyIdentifier URL.  
4. (Opt) configure Private Endpoint (then `keyVaultName`, `resourceGroupName`, `subscriptionID` become immutable).  
5. Save.

API:

```bash
PATCH /api/atlas/v2/groups/{groupId}/encryptionAtRest
{
 "azureKeyVault":{
  "enabled":true,
  "azureEnvironment":"AZURE",
  "clientID":"<app>",
  "tenantID":"<tenant>",
  "secret":"<secret>",
  "subscriptionID":"<sub>",
  "resourceGroupName":"<rg>",
  "keyVaultName":"<kv>",
  "keyIdentifier":"<url>"
 }
}
```

Verify: `GET /groups/{groupId}/encryptionAtRest` → `enabled:true`, `valid:true`.

## Enable CMK for a Cluster

Clusters → Edit Configuration → Additional Settings → Manage your own encryption keys = Yes (check Require Private Networking status) → Review & Apply. Project Owner role required.

## Disable CMK

1. Disable on every cluster.  
2. Disable on project.  
Never delete/disable AKV key before CMK is off; encrypted data becomes unreadable.

## Revoke Key Access

Remove Atlas app or key in AKV. Clusters auto-pause if control-plane IPs allowed; otherwise pause manually. Keep AKV IP list updated.

## Rotate Key Identifier

Not supported on M0, M2/M5, Flex, Serverless.  
1. Create new key in same Vault.  
2. Advanced → Edit → Encryption Key → replace keyIdentifier URL → Update Credentials.  
3. Do NOT delete original key until rotation (and backup snapshots) succeed.

</section>
<section>
<title>Manage Customer Keys with Azure Key Vault Over Private Endpoints</title>
<url>https://mongodb.com/docs/atlas/security/azure-kms-over-private-endpoint/</url>

# Atlas: AKV Customer-Managed Keys via Private Endpoints

## Unsupported
`M0`, Flex, Serverless (deprecated), `M2/M5` shared (deprecated) clusters.

## Limits & Notes
• Single-cloud Azure projects only.  
• Projects must be `ACTIVE`; ≥ M10 tier.  
• Enabling CMK+Private Link on a multi-cloud project disables non-Azure clusters.  
• Register `Microsoft.Network` in your Azure subscription.  
• Conditional-access app regs must allow Atlas control-plane IPs.

## Required Azure Data
```
clientID, tenantID, secret,
subscriptionID, resourceGroupName, keyVaultName,
keyIdentifier = https://<kv>.vault.azure.net/<type>/<name>/<version>
azureEnvironment = AZURE | AZURE_GOVERNMENT | …
```

---

## API Quick-Start

### Enable CMK for Project
```bash
PATCH /api/atlas/v2/groups/{groupId}/encryptionAtRest
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
    "keyIdentifier": "...",
    "requirePrivateNetworking": false   # true after PE setup
  }
}
```
Immutable after PE setup: `keyVaultName`, `resourceGroupName`, `subscriptionID`.

Verify:
```bash
GET /groups/{groupId}/encryptionAtRest
```

### Require Private Networking
```bash
PATCH /groups/{groupId}/encryptionAtRest
{ "azureKeyVault": { "requirePrivateNetworking": true } }
```

### Create Private Endpoint (per Azure region)
```bash
POST /groups/{groupId}/encryptionAtRest/AZURE/privateEndpoints
{ "regionName": "US_CENTRAL" }
```

### List / Status
```bash
GET /groups/{groupId}/encryptionAtRest/AZURE/privateEndpoints
```
Status values:  
`INITIATING` | `PENDING_ACCEPTANCE` | `ACTIVE` | `PENDING_RECREATION` | `FAILED` | `DELETING`

### Delete PE
```bash
DELETE /groups/{groupId}/encryptionAtRest/AZURE/privateEndpoints/{endpointId}
```
All PEs must be deleted before disabling CMK or private networking.

---

## Cluster-Level Encryption
Project owners must toggle “Manage your own encryption keys” to Yes (UI) or include `"customerManagedKey": true` when creating/updating clusters. When PE is active, clusters automatically migrate to private-only access.

---

## Disable CMK / Private Networking
1. Remove every PE (state irrelevant).  
2. Disable CMK on each cluster.  
3. `PATCH` project with `"enabled": false` or `"requirePrivateNetworking": false`.

Do NOT delete/disable AKV keys until CMK is disabled everywhere; data becomes unreadable.

---

## Rotate Key Identifier
1. Create new key in same Key Vault.  
2. UI: Advanced › Azure Key Vault › Encryption Key › update **Key Identifier**.  
   Or API `PATCH` with new `keyIdentifier`.  
3. Wait for rotation; keep old key until all clusters & backups re-keyed.

---

## Revoke Key (Freeze Data)
Remove Atlas principal’s access to key in AKV; Atlas pauses clusters automatically.

---

## UI Parity
All API actions have UI equivalents under Project › Advanced › “Encryption at Rest using your Key Management”.

</section>
<section>
<title>Manage Customer Keys with Google Cloud KMS</title>
<url>https://mongodb.com/docs/atlas/security-gcp-kms/</url>
<description>Manage customer keys with Google Cloud KMS to encrypt data at rest in Atlas, including key rotation and enabling encryption for clusters.</description>


# Atlas GCP KMS Customer-Managed Keys (CMK)

## Unsupported
`M0`, Flex, Serverless, `M2/M5`.

## Key Hierarchy
CMK (in GCP KMS) → encrypts MongoDB Master Key (per node) → encrypts per-database keys.

Revoking CMK access shuts down the cluster.

## Required Access & Prereqs
- Atlas role: Project Owner.  
- Cluster: ≥ M10.  
- GCP:  
  • Service Account Key (JSON).  
  • Symmetric Encryption Key + Key Version Resource ID.  
  • Service account perms: `cloudkms.cryptoKeyVersions.get`, `encrypt`, `decrypt` on key.  
  • (If required) allow Atlas & node IPs via VPC-SC Access Levels.

## Enable CMK (Project)
UI → Security → Advanced  
1. Toggle “Encryption at Rest using your Key Management” ON.  
2. Provider: Google Cloud KMS.  
3. Paste Service Account Key JSON.  
4. Enter Key Version Resource ID (full `projects/.../cryptoKeyVersions/n`).  
5. Save.  
Atlas auto-creates “encryption key rotation” alert (90 d default).

## Enable CMK (Cluster)
Clusters → Edit Configuration  
Additional Settings → “Manage your own encryption keys” = Yes.  
If Private Endpoint CMK configured, Require Private Networking must be Active.  
Review → Apply Changes.

## Key Rotation

### MongoDB Master Key (Atlas)
Rotated automatically ≤ 90 d during maintenance.

### GCP CMK (User)
Not auto-rotated. Options:  
- Manually update Key Version Resource ID in Atlas (procedure below).  
- Configure GCP automatic rotation (~365 d).  
Adjust Atlas alert period accordingly.

#### Rotate Key Version Resource ID
Prereq: new Service Account Key in GCP.  
UI → Security → Advanced → Edit  
Google Cloud KMS tab → Encryption Key Credentials → replace Key Identifier with new fully-qualified `CryptoKeyVersion` path → Update Credentials.  
Keep old Key Version active until all clusters & backups finish update.  
Alert timer resets on completion.

## Alerts
Atlas creates/updates “encryption key rotation” alert whenever CMK enabled or Key Version changed.

</section>
<section>
<title>Configure Federated Authentication</title>
<url>https://mongodb.com/docs/atlas/security/federated-authentication/</url>
<description>Configure Federated Authentication in Atlas to link credentials across MongoDB systems using the Federated Identity Management model with your Identity Provider.</description>


# Configure Federated Authentication

Prereq: Organization Owner on delegated orgs.

Console: Organization Settings → Visit Federation Management App.

Quick Start (run in order)  
1. Add & verify domains.  
2. Exchange metadata with IdP.  
3. Map domains → IdP.  
4. Activate IdP for MongoDB access.

Manual tasks  
1. Manage Identity Providers → Link IdP.  
2. Manage Domains → map domains.  
3. Manage Organizations → map orgs; map Atlas roles ↔ IdP groups.

Key points  
• Federation disables all other Atlas auth; 2FA must be enforced by IdP.  
• If UI IP access list blocks a user from any federated org, they can’t open the console.  
• Supported IdPs: Microsoft Entra ID, Google Workspace, Okta, PingOne.

</section>
<section>
<title>Manage Identity Providers</title>
<url>https://mongodb.com/docs/atlas/security/manage-federated-auth/</url>
<description>Configure federated authentication in Atlas by linking your Identity Provider to manage user credentials across MongoDB services.</description>


# Atlas Federated Identity (SAML)

Org role required: **Organization Owner**. Enabling federation disables all other Atlas auth.

## 1. Prepare SAML IdP App  
Create new SAML app; enter placeholders for:  
• **SP Entity ID / Issuer**  
• **Audience URI**  
• **Assertion Consumer Service (ACS) URL**

Mandatory IdP values  
```
Signature Algorithm   SHA-1 | SHA-256
NameID                user email (also username)
NameID Format         urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified
                      urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress
Attributes (case-sensitive):
    firstName -> First Name
    lastName  -> Last Name
    memberOf  -> User Groups
```
Save.

## 2. Add IdP in Atlas  
Org Settings ➜ Visit Federation Management App ➜ Configure Identity Providers ➜ Add.

Required fields
```
Configuration Name          free-text
IdP Issuer URI              placeholder
IdP Single Sign-On URL      placeholder
IdP Signature Certificate   PEM upload/paste
Request Binding             HTTP POST | HTTP REDIRECT
Response Sig Algorithm      SHA-256 | SHA-1
```
Click **Next**.

## 3. Exchange Metadata  
• Download `metadata.xml` from Atlas (contains ACS & Audience).  
• Upload to IdP.  
• Replace the two placeholder values in Atlas with real Issuer URI & SSO URL from IdP.  
• Optionally set RelayState in IdP:

Destination → RelayState URL
```
Atlas            Login URL from Federation Mgmt App
Support Portal   https://auth.mongodb.com/app/salesforce/exk1rw00vux0h1iFz297/sso/saml
University       https://auth.mongodb.com/home/mongodb_thoughtindustriesstaging_1/0oadne22vtcdV5riC297/alndnea8d6SkOGXbS297
Community Forum  https://auth.mongodb.com/home/mongodbexternal_communityforums_3/0oa3bqf5mlIQvkbmF297/aln3bqgadajdHoymn297
Feedback Engine  https://auth.mongodb.com/home/mongodbexternal_uservoice_1/0oa27cs0zouYPwgj0297/aln27cvudlhBT7grX297
JIRA             https://auth.mongodb.com/app/mongodbexternal_mongodbjira_1/exk1s832qkFO3Rqox297/sso/saml
```

Click **Finish**. IdP status = *Inactive* until at least one verified domain is mapped to it.

Next: map user email domains to the IdP to activate federated login.

</section>
<section>
<title>Manage Domain Mapping for Federated Authentication</title>
<url>https://mongodb.com/docs/atlas/security/manage-domain-mapping/</url>
<description>Map domains to your Identity Provider in Atlas for streamlined user authentication and manage domain verification methods.</description>


# Manage Domain Mapping for Federated Authentication

Access: Organization Owner of a delegated federation org.

Prereq: IdP already linked.

## Add & Verify Domain
1. Org Settings → Open Federation Management App → Add a Domain.
2. Enter Display Name, Domain Name → Next.
3. Choose ONE verification method (immutable; delete/re-add to change):
   • HTML: download `mongodb-site-verification.html`, host at `https://<host>/<domain>/mongodb-site-verification.html`.
   • DNS TXT: add record  
   ```ini
   mongodb-site-verification=<32-char-string>
   ```
4. Finish, then click Verify next to domain.

## Associate Domain with IdP
Federation App → Identity Providers → Edit Associated Domains → select domain → Confirm.

## Test
• Save IdP “Bypass SAML Mode” URL (emergency access).  
• Incognito → Atlas Login → enter user `*@<verified-domain>` → Next. Success redirects to IdP, then Atlas.  
• Or go directly to IdP Login URL.

## Delete Domain
Disassociate first: Identity Providers → Edit Associated Domains → deselect → Confirm.  
Then Domains list → Actions → Delete → Confirm.

</section>
<section>
<title>Manage Organization Mapping for Federated Authentication</title>
<url>https://mongodb.com/docs/atlas/security/manage-org-mapping/</url>
<description>Manage organization mapping for federated authentication by configuring Identity Providers to grant user access across multiple Atlas organizations.</description>


# Manage Organization Mapping for Federated Authentication

**Access**: Org Owner in each target org.

**Prereqs**:  
• IdP already linked to Atlas  
• At least one domain mapped to that IdP  

## Map Org → IdP

1. Org Settings → Open Federation Management App.  
2. View Organizations → Connect (next to desired org).  
3. In org list, click org name → Apply Identity Provider.  
4. Select IdP → Add Organizations → choose org(s) → Confirm.  
5. Verify org shows expected IdP.

Atlas auto-creates “Organization's IdP certificate is about to expire” alert; deleted when mapping removed.

## Change Org’s IdP

1. Organizations → click current IdP.  
2. Modify → deselect org → Next → Finish (unmap).  
3. Modify new IdP → select org → Next → Finish (map).

## Optional Settings

• Default Role: assign role for users authenticating via IdP (ignored if role already mapped to IdP group).  
• Domain Restriction: allow login only from specified domains.

## Disconnect Org from Federation

Federation Console → View Organizations → Actions ▸ Disconnect → Confirm.

</section>
<section>
<title>Manage Mapping Atlas Roles to IdP Groups</title>
<url>https://mongodb.com/docs/atlas/security/manage-role-mapping/</url>
<description>Streamline authorization by mapping IdP groups to Atlas roles, simplifying access to organizations, projects, and clusters.</description>


# Manage Mapping Atlas Roles to IdP Groups

Atlas lets you bind IdP `memberOf` groups to Atlas org/project roles. Mappings are evaluated at each login.

## Behavior
* If user’s IdP groups match mappings → grant mapped roles.
* If no mappings or result = no roles → grant org default role.
* If user loses IdP group, Atlas removes mapped roles on next login.
* Each org must always retain ≥1 `Organization Owner`; removal fails otherwise.

## Permissions
* Only an `Organization Owner` can manage federation/role mappings.

## Prereqs
* IdP app with SAML attr `memberOf` (or Entra “Group Id” → Object ID).
* IdP linked to Atlas; org delegated to federation.
* At least one IdP group containing a user.

---

## Add Role Mapping
1. Org Settings → Manage Federation Settings → **Open Federation Management App**.  
2. Manage Organizations → `Connect` (if needed) → ▸ **View**.
3. Create Role Mappings → **Create A Role Mapping**.
4. Map Group and Assign Roles  
   • Enter exact IdP group (or Entra Object ID).  
   • Select Atlas org roles. → `Finish` or `Next`.
5. Assign Project Roles (optional) → `Finish` or `Next`.
6. Review & Confirm → `Finish`.

---

## Edit Role Mapping
Same nav as “Add”, but Organization Role Mappings → ▸ **Edit** next to group, then repeat steps 4–6.

---

## Delete Role Mapping
Organization Role Mappings → ▸ **Delete** next to group → **Delete** (confirm). Cancel aborts.

---

```text
Constraints:
- UI role assignment disabled on Access Manager when IdP mappings exist.
- Atlas orgs listed only where you are Owner.
```

</section>
<section>
<title>Configure Federated Authentication from Microsoft Entra ID</title>
<url>https://mongodb.com/docs/atlas/security/federated-auth-azure-ad/</url>
<description>Configure federated authentication in Atlas using Microsoft Entra ID as the Identity Provider for secure single sign-on access.</description>


# Microsoft Entra ID Federation for MongoDB Atlas

## Access & Prereqs
- Atlas `Organization Owner`.
- Azure subscription + Entra ID tenant.
- Tenant roles: `Cloud App Administrator`, `User Administrator`.
- Routable custom domain.

## Azure Configuration

### 1. Domain & Users
1. Add custom domain to Entra ID; publish provided `TXT` DNS record; verify.
2. Create tenant users in that domain.

### 2. Enterprise Application (Gallery “MongoDB Cloud” or Non-Gallery)
1. Create app → Assign target users.
2. SAML SSO → Section 1: set **temporary** values, then Save & refresh:  
   ```
   Identifier (Entity ID): https://www.okta.com/saml2/service-provider/MongoDBCloud
   Reply URL (ACS)     : https://auth.mongodb.com/sso/saml2/
   ```
   (Re-generates unique signing cert.)
3. Download **Certificate (Base64)**.
4. Copy **Login URL** and **Entra ID Identifier** (Issuer).

#### Manual-app extras
- Delete default Additional claims.
- Unique User Identifier:  
  `Format: Unspecified`, `Source: Attribute`, `user.userprincipalname` (or email attr).
- Add user claims (Namespace blank, case-sensitive):
  | Name      | Source attr        |
  |-----------|--------------------|
  | firstName | user.givenname     |
  | lastName  | user.surname       |
- (Optional) Group claim for role mapping:  
  Add Group claim → Security groups → `Group Id` → Advanced: Name `memberOf`, Namespace blank, clear “Emit groups as role claims”.

Ensure cert algorithm SHA-256.

## Add Entra ID IdP in Atlas
1. Atlas → Organization Settings → Open **Federation Management App** (FMC).
2. Identity Providers → Add:  
   | Field                    | Value                                       |
   |--------------------------|---------------------------------------------|
   | Configuration Name       | e.g. Microsoft Entra ID                     |
   | IdP Issuer URI          | Entra ID Identifier                          |
   | IdP SSO URL             | Login URL                                    |
   | IdP Signature Certificate | Base64 cert                                |
   | Request Binding          | HTTP POST                                   |
   | Response Sig Algorithm   | SHA-256                                     |
3. Next → Download **metadata.xml**.

## Finish in Azure
Upload Atlas `metadata.xml` on SAML page (Upload metadata file).  
(Optional) add RelayState to skip redirects; common URLs:

| Service | RelayState |
|---------|------------|
| Atlas (generated) | Login URL from FMC |
| Support Portal | `https://auth.mongodb.com/app/salesforce/exk1rw00vux0h1iFz297/sso/saml` |
| University | `https://auth.mongodb.com/home/mongodb_thoughtindustriesstaging_1/0oadne22vtcdV5riC297/alndnea8d6SkOGXbS297` |
| Forums | `https://auth.mongodb.com/home/mongodbexternal_communityforums_3/0oa3bqf5mlIQvkbmF297/aln3bqgadajdHoymn297` |
| Feedback | `https://auth.mongodb.com/home/mongodbexternal_uservoice_1/0oa27cs0zouYPwgj0297/aln27cvudlhBT7grX297` |
| JIRA | `https://auth.mongodb.com/app/mongodbexternal_mongodbjira_1/exk1s832qkFO3Rqox297/sso/saml` |

## Domain Mapping
1. FMC → Domains → Add Domain: enter Display Name & Domain.
2. Verify ownership (choose once):
   - HTML: upload `mongodb-site-verification.html` to `https://<host>/mongodb-site-verification.html`
   - DNS: add TXT  
     ```
     mongodb-site-verification=<32-char string>
     ```
   Click **Verify**.
3. Identity Providers → Edit » Associated Domains → select domain.

## Testing & Safety
- Save **Bypass SAML URL** from IdP page (emergency local login).
- In private browser: Atlas login → enter `user@<verified-domain>` → should redirect to Entra ID, then back to Atlas.

## (Optional) Map Organizations
FMC → Organizations:
1. Connect desired orgs.
2. For each org → Apply Identity Provider → choose Entra ID.  

Advanced options (require org mapping): default user role, domain-restricted access, restrict user membership, Bypass SAML mode.

## User Sign-In
Assigned Entra ID users access Atlas via:
- Domain-based redirect at `cloud.mongodb.com`, or
- IdP Login URL (use for alternate IdP if multiple mapped).  

If a default org role is set, first-time users receive it automatically.

</section>
<section>
<title>Configure Federated Authentication from Google Workspace</title>
<url>https://mongodb.com/docs/atlas/security/federated-auth-google-ws/</url>
<description>Configure federated authentication in Atlas using Google Workspace as your Identity Provider to enable login with company credentials.</description>


# Google Workspace Federated Auth for Atlas

## Access & Prereqs
- Must be Atlas **Organization Owner**.
- Need Google Workspace subscription + admin user.

## 1. Add Atlas App in Google Workspace
1. Admin console → **Apps → Web and mobile apps → Add custom SAML app**.  
2. Name e.g. “MongoDB Cloud”. Continue.
3. Option 2: copy **SSO URL**, **Entity ID**, download **Certificate** (leave tab open).

## 2. Create IdP in Atlas FMC
1. Atlas → Organization Settings → **Open Federation Management App**.  
2. Identity Providers → **Setup / Add Identity Provider**. Fill:
   - Configuration Name: free-text  
   - Issuer URI: Google **Entity ID**  
   - Single Sign-On URL: Google **SSO URL**  
   - Certificate: upload/paste `.cer`  
   - Request Binding: `HTTP POST`  
   - Response Signature Algo: `SHA-256`  
3. Next → copy **Assertion Consumer Service URL** & **Audience URI**; Finish. Copy FMC **Login URL**.

## 3. Finish SAML in Google Workspace
1. Back to Google tab → Continue. Enter:
   - ACS URL: Atlas **Assertion Consumer URL**
   - Entity ID: Atlas **Audience URI**
   - Start URL: Atlas **Login URL**
   - Signed Response ✅  
   - Name ID Format: `UNSPECIFIED`
   - Name ID: `Primary Email`
2. Continue → Add attribute mappings:  
   - First name → `firstName`  
   - Last name  → `lastName`
3. (Optional) Role map: Google groups (select) → `memberOf`.
4. Finish. Enable user access (ON for everyone or selected groups/OUs).

## 4. Map Domain to IdP
FMC → Domains → **Add Domain**: Display Name, Domain Name.  
Choose verification once:

HTML File: download, host at `https://<domain>/mongodb-site-verification.html` → Finish  
OR  
DNS TXT: `mongodb-site-verification=<32-char>` → add at registrar → Finish  

Verify → Associate: Identity Providers → Edit **Associated Domains** → select domain → Confirm.

## 5. Test
Save **Bypass SAML Mode URL**. In private window: Atlas login → enter `user@yourdomain` → should redirect to Google SSO → return to Atlas.

## 6. (Optional) Map Organizations
FMC → Organizations → Connect → select Org → Apply Identity Provider → Confirm.

## 7. Advanced Options (require Org mapping)
- Bypass SAML Mode
- Default User Role
- Restrict Org by Domain
- Restrict Federation Membership

## Login URL
Users assigned in Google Workspace use Atlas **Login URL** to access mapped orgs. Multiple IdPs per domain allowed; first match auto-redirects, alternate IdP requires its specific Login URL.

</section>
<section>
<title>Configure Federated Authentication from Okta</title>
<url>https://mongodb.com/docs/atlas/security/federated-auth-okta/</url>
<description>Configure federated authentication with Okta for Atlas, allowing users to log in using company credentials and manage domain mappings and identity provider settings.</description>


# Configure Okta Federated Authentication for MongoDB Atlas

## Access & Prereqs
- Must be Atlas **Organization Owner**.  
- Okta account + routable domain.

## 1. Okta – Create SAML App
1. Admin → Applications → Create App Integration → **SAML 2.0**.  
2. Name app, optional logo, Next.  
3. Configure SAML (temporary values):  
   - Single sign-on URL: `http://localhost`  
   - Audience URI: `urn:idp:default`  
4. Finish → SAML Signing Certificates → Actions → **Download certificate** (`.cert`).  
5. Convert to PEM:
   ```sh
   openssl x509 -in mycert.crt -out mycert.pem -outform PEM
   ```

## 2. Atlas – Add Identity Provider (FMC)
Federation Management Console (Organization Settings → Federated Authentication → Open FMC):
```
Configuration Name         <label>
Issuer URI                 <placeholder>
Single Sign-On URL         <placeholder>
Identity Provider Cert     <mycert.pem>
Request Binding            HTTP POST
Response Sig Algorithm     SHA-256
```
Click **Next → Finish** to obtain Atlas values (ACS URL, Audience URI, Login URL).

## 3. Okta – Final SAML Settings
Edit SAML Settings in Okta:
```
Single sign-on URL       <Atlas ACS URL>
   ✓ Use for Recipient & Destination
Audience URI             <Atlas Audience URI>
Default RelayState       (optional; see common URLs below)
Name ID format           Unspecified
Application username     Email
Update username on       Create and update
```
Advanced Settings:
```
Response                Signed
Assertion Signature     Signed
Signature Algorithm     RSA-SHA256
Digest Algorithm        SHA256
Assertion Encryption    Unencrypted
```
Attribute Statements:
```
firstName   Unspecified   user.firstName
lastName    Unspecified   user.lastName
```
(Optional) Group Attribute for role mapping:
```
memberOf    Unspecified   Matches regex   .*
```
Finish. Common RelayState targets:
```
Atlas Login URL (from FMC)
Support Portal        https://auth.mongodb.com/app/salesforce/…/sso/saml
University            https://auth.mongodb.com/home/mongodb_thoughtindustriesstaging_1/…
Community Forums      https://auth.mongodb.com/home/mongodbexternal_communityforums_3/…
Feedback Engine       https://auth.mongodb.com/home/mongodbexternal_uservoice_1/…
JIRA                  https://auth.mongodb.com/app/mongodbexternal_mongodbjira_1/…/sso/saml
```

## 4. Atlas – Replace Placeholders
FMC → Identity Providers → Edit Okta:
```
Issuer URI            <Okta Issuer>
Single Sign-On URL    <Okta SSO URL>
Certificate           <X.509 from Okta>
```
Next → Finish.

## 5. Okta – Assign Users
Okta App → **Assignments** → add all Atlas users.

## 6. Map & Verify Domain
FMC → Domains → Add Domain:
```
Display Name   <label>
Domain Name    example.com
```
Choose ONE verification method:
- HTML: upload `mongodb-site-verification.html` to `https://example.com/`.
- DNS TXT: `mongodb-site-verification=<32-char-key>`.

Click **Verify** when ready.

## 7. Associate Domain with IdP
FMC → Identity Providers → Edit → Associated Domains → select domain → Confirm.

## 8. Test
Save **Bypass SAML Mode URL**.  
Incognito → Atlas login → enter `user@example.com` → should redirect to Okta and back to Atlas.  
Or open IdP **Login URL** directly.

## 9. (Optional) Map Organizations
FMC → Organizations:
1. **Connect** desired orgs to Federation.
2. Organization → Apply Identity Provider → select Okta → Confirm.

## 10. Advanced Options (FMC)
- Bypass SAML Mode  
- Default user role per org  
- Restrict access by domain  
- Restrict user membership

## Sign-In
Users use Atlas Login URL or Atlas console (domain-based redirect). For alternative IdP, start from its Login URL.

</section>
<section>
<title>Configure Federated Authentication from PingOne</title>
<url>https://mongodb.com/docs/atlas/security/federated-auth-ping-one/</url>
<description>Configure federated authentication with PingOne as your Identity Provider to enable login to Atlas using company credentials.</description>


# PingOne Federated Auth for MongoDB Atlas

## Access & Prereqs
- Atlas Organization Owner role.
- PingOne subscription + admin.

## 1  Configure PingOne IdP

### 1.1 Download cert  
PingOne Setup → Certificates → download origination certificate.

### 1.2 Create SAML app  
Applications → Add → New SAML Application  
Name e.g. “MongoDB Atlas” → Continue.

### 1.3 Get Atlas FMC values  
Atlas Org Settings → Open Federation Management App → Identity Providers → Setup.  
Enter placeholders → Next → copy:  
• Assertion Consumer Service URL (ACS)  
• Audience URI

### 1.4 PingOne SAML settings (“I have the SAML configuration”)  
Field | Value  
---|---  
Signing Cert | downloaded cert  
Protocol Version | SAML v2.0  
Assertion Consumer Service | Atlas ACS  
Entity ID | Atlas Audience URI  
Logout fields | leave blank  
Encrypt Assertion | off  
Signing | Sign Assertion  
Signing Algorithm | RSA_SHA256  
Continue → add user groups → Review; note Issuer and `idpid` → Finish.

### 1.5 Atlas IdP entry  
Identity Providers → Modify PingOne config:  
- Issuer URI = noted Issuer  
- Single Sign-On URL = `https://sso.connect.pingidentity.com/sso/idp/SSO.saml2?idpid=<idpid>`  
- Identity Provider Signature Certificate = PingOne cert  
- Request Binding = HTTP POST  
- Response Signature Algorithm = SHA-256  
Save.

### 1.6 Attribute mapping (PingOne)  
Add:  
```
SAML_SUBJECT → Email
firstName     → First Name
lastName      → Last Name
```  
NameID Format:  
`urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified` or `...:emailAddress`

## 2  Map & Verify Domain
FMC → Domains → Add Domain → enter Display Name & Domain.  
Choose ONE verification method:  

HTML: download `mongodb-site-verification.html`, host at `https://<domain>/mongodb-site-verification.html`.  
DNS: create TXT record `mongodb-site-verification=<32-char>`.  
Click Verify.

## 3  Associate Domain ↔ IdP
FMC → Identity Providers → Edit Associated Domains → select verified domain → Confirm.

## 4  Test
Save Bypass SAML Mode URL.  
Incognito → atlas.mongodb.com → enter user@<domain> → should redirect to PingOne → authenticate → return to Atlas.

## 5  (Optional) Map Organizations
FMC → View Organizations → Connect (if not yet) → select organization → Apply Identity Provider.  
Advanced options (require org mapping): default org role, restrict org by domain, restrict federation membership, Bypass SAML Mode.

## User Sign-in
Users assigned to PingOne app log in via:  
- Atlas console (auto-redirect by domain), or  
- IdP-specific Login URL.  
If multiple IdPs on domain, first match wins unless user starts from desired Login URL.

</section>
<section>
<title>Advanced Options for Federated Authentication</title>
<url>https://mongodb.com/docs/atlas/security/federation-advanced-options/</url>
<description>Configure advanced options for Federated Authentication in Atlas to control user roles, domain access, and authentication settings.</description>


# Advanced Options for Federated Authentication

Requires `Organization Owner`.  
Open console: Atlas → Organization Settings → Manage Federation Settings → Open Federation Management App.

## Default User Role (per Org)
Navigate: Organizations → <Org> → Default User Role.  
Role auto-provisions IdP users lacking an org role. Remove via ✕.

## Restrict Access to Org by Domain
Organizations → <Org> → Advanced Settings → toggle Restrict Access by Domain.  
Effects:  
- Only emails in Approved Domains can be invited.  
- Existing users with other domains keep access.  
- Domains mapped to any IdP auto-added.  
Add domains:  
• Add Domains from Existing Members (checkbox modal)  
• Add Domains (manual entry). Submit to save.

## Bypass SAML Mode
Per-IdP fallback login URL bypasses SAML, allows Atlas creds. Enabled by default.  
Identity Providers → <IdP> → toggle Bypass SAML Mode (confirm to disable).  
Login requirements: use Bypass URL + username with mapped domain previously used in Atlas/Cloud Manager.

## Restrict User Membership to Federation
Advanced Settings → toggle Restrict Membership.  
Results:  
- Federated users cannot join/accept orgs outside federation.  
- Federation Org Owners may create new orgs (auto-federated); others cannot.  
- Existing external org memberships remain.  
If conflicts exist, banner → View User Conflicts lists users to contact.

</section>
<section>
<title>Manage Your Multi-Factor Authentication Options</title>
<url>https://mongodb.com/docs/atlas/security-multi-factor-authentication/</url>
<description>Manage multi-factor authentication options in Atlas, replacing Legacy 2FA, by setting up and enabling various authentication methods for enhanced security.</description>


# Manage MFA in Atlas

## Key Points
- Legacy 2FA retired 30 May 2024 → all users must use MFA.  
- MFA = password + 1 factor; configure ≥2 factors for backup.  
- Org Owner enables MFA org-wide; all members must comply or lose org access.

## Supported Factors
1. Security Key / Biometrics (FIDO2, e.g., YubiKey, Windows Hello)  
2. Okta Verify mobile (OTP & Push)  
3. Authenticator App (TOTP: Authy, Google, Microsoft) – enable cloud backup  
4. Email (ensure `mongodb.com` mail allowed)  
5. SMS (deprecated, no new registrations)

## Prerequisites
- Install/prepare desired factor(s) on device(s).  
- Verify email used for MongoDB account.

## Enable MFA
1. Atlas UI: **Name ▸ Manage your MongoDB Account ▸ Security**.  
2. Next to a factor, click **Set up** and follow below:

| Factor | Steps |
|--------|-------|
| Okta Verify | Okta app → “+” → scan Atlas QR → Done |
| Security Key | Atlas “Enroll” → touch/verify key/biometric |
| Authenticator App | Auth app → “+” → Scan QR → enter 6-digit code in Atlas |
| Email | Open **Verify Your Identity** mail → copy 6-digit code → enter in Atlas |

3. Repeat for at least one additional factor.

## Remove Factor
Security page → **Delete** beside factor → re-authenticate with MFA.

</section>
<section>
<title>Manage Your MongoDB Atlas Account</title>
<url>https://mongodb.com/docs/atlas/security/manage-your-mongodb-atlas-account/</url>
<description>Manage your Atlas account settings, unlink from Google or GitHub, configure multi-factor authentication, and change your email or name.</description>


# Manage MongoDB Atlas Account

## Access Account Settings  
Menu bar → <Account Name> → Manage your MongoDB Account.

## Profile Info  
- Edit First/Last Name.  
- Change Email: Change Email Address → verify pwd (+MFA) → new email → Save → click Verify Email in mail → login with new address. (Email must be unused.)  
- Unlink SSO (Google/GitHub): Profile Info → Unlink → Confirm → reset pwd via emailed link (within 2 h).  
  Password rules: ≥8 chars, exclude email/username, differ from last 24 & common pwds.

## MFA Options  
Settings in Security panel.

## Delete Account (irreversible; recreation blocked ≤2 wks)  
Prereqs: 0 invoices, clusters, projects, orgs; local-auth (IdP users contact admin).  
Steps: Profile Info → Delete Account → Confirm Account Deletion → identity verification (MFA, email code, or pwd+email code). Accounts using Google SSO auto-unlink.

## Remove Projects & Organizations (needed before account deletion)

### Terminate Clusters / Serverless  
Clusters page: if Termination Protection On → Edit Config → Additional Settings → toggle Off → Review/Apply.  
Terminate: • (…) → Terminate • optional Keep snapshots (Cloud Backup only) • type cluster name → Terminate.  
Serverless: Edit Config → disable protection → (…) → Terminate.

### Delete Project  
Requires Project Owner or Org Owner. No invoices/clusters.  
Org Projects view or Project Settings → Delete Project → enter MFA code if prompted.

### Leave/Delete Organization  
Leave: Org list → Leave. Must not be sole Org Owner.  
Delete: Org Settings → Delete Organization (Org Owner role; org must have 0 projects).

## Support / Community / University  
Available from Overview page.

</section>
<section>
<title>Configure MongoDB Support Access to Atlas Backend Infrastructure</title>
<url>https://mongodb.com/docs/atlas/security-restrict-support-access/</url>
<description>Configure and manage temporary access for MongoDB Support to your Atlas infrastructure, including granting and revoking access at the cluster level.</description>


# Atlas Support Access Control

Org owner controls MongoDB Production Support access.

## Block All Support Infrastructure Access

Atlas UI → Org Settings → toggle “Block MongoDB Production Support Employee Access to Atlas Infrastructure”.

## 24-h Temporary Cluster Access

Grant per cluster; no DB read permission.

### API
POST /.../employeeAccess  
`grantType`:  
- `CLUSTER_INFRASTRUCTURE` – infra + logs  
- `CLUSTER_DATABASE_LOGS` – logs only  

Revoke: DELETE /.../employeeAccess

### UI
Project → Clusters → … →  
• Grant Temporary Infrastructure Access to MongoDB Support  
 – “Atlas cluster infrastructure and all cluster logs”  
 – or “Only database logs” → Grant Access  
Access auto-expires in 24 h.

## Revoke (before expiry)

Clusters → … → Revoke Temporary Infrastructure Access → Revoke Access.

## Activity Feed Identifiers

Access events show anonymized ID `mongodb-employee####`, unique per org/employee, rotates every 30 d, not reused ≥365 d.

Blocking support access can delay issue resolution & affect availability.

</section>
</guide>