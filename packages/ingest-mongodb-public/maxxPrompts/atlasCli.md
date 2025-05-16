<guide>
<guide_topic>MongoDB Atlas CLI</guide_topic>
<guide_description>CLI for administering MongoDB Atlas</guide_description>

<section>
<title>What is the Atlas CLI?</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/</url>

# MongoDB Atlas CLI Overview

Interact with MongoDB Atlas from your terminal via concise commands.

## Install
```bash
brew install mongodb-atlas-cli   # macOS
```
(See docs for other OS.)

## Quick Start
```bash
atlas setup
```
Performs:  
1. Atlas account signup & auth  
2. Creates free cluster, loads sample data  
3. Adds client IP to access list  
4. Creates DB user  
5. Opens `mongosh` to new cluster  

## Key Commands
* atlas setup – full guided onboarding (details above)  
* atlas deployments setup – create local/cloud deployment (overview)  
* atlas deployments search indexes create – create Atlas Search index (overview)

Explore docs for more commands, tutorials, and updates.

</section>
<section>
<title>Install or Update the Atlas CLI</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/install-atlas-cli/</url>
<description>Install the Atlas CLI to quickly provision and manage Atlas database deployments from the terminal.</description>


# Atlas CLI – Install & Update (≈10 % original)

## Supported installers
Homebrew (macOS/Linux) · Yum (RHEL/CentOS/Amazon) · Apt (Ubuntu/Debian) · Chocolatey (Windows) · Docker · Direct binary download  

---

## Install

### Homebrew
```sh
brew install mongodb-atlas        # atlas + mongosh
atlas                             # verify
```

### Yum
1. Create `/etc/yum.repos.d/mongodb-(org|enterprise)-<ver>.repo` (see docs for URL templates).  
2. Install:
```sh
sudo yum install -y mongodb-atlas        # atlas + mongosh
sudo yum install -y mongodb-atlas-cli    # atlas only
atlas
```

### Apt
```sh
# import key
curl -fsSL https://pgp.mongodb.com/server-<ver>.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-<ver>.gpg --dearmor
# repo (example Ubuntu 22.04)
echo "deb [arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-<ver>.gpg] \
https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/<ver> multiverse" | \
sudo tee /etc/apt/sources.list.d/mongodb-org-<ver>.list
sudo apt-get update
sudo apt-get install -y mongodb-atlas        # or mongodb-atlas-cli
atlas
```

### Chocolatey
```powershell
choco install mongodb-atlas
atlas
```

### Docker
```sh
docker pull mongodb/atlas[:<tag>]   # latest if tag omitted
# run container with desired atlas command
```

### Direct binary
1. Download archive for OS/arch (.zip/.tar.gz/.deb/.rpm).  
2. Extract & move `atlas` into a directory on `$PATH` (or add dir to PATH).  
3. Run `atlas` to verify.

---

## Update

```sh
brew update && brew upgrade mongodb-atlas[-cli]
yum  update mongodb-atlas[-cli]
sudo apt-get install --only-upgrade mongodb-atlas[-cli]
choco upgrade mongodb-atlas
# binary: replace old executable with new download
atlas --version                     # confirm
```

---

Next step: `atlas auth login` (or other commands) to begin using the CLI.

</section>
<section>
<title>Check Compatibility</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/compatibility/</url>

# Compatibility

**OS & Architectures**

- Amazon Linux 2023 — x86-64, ARM  
- Debian 11/12 — x86-64, ARM  
- macOS 12+ — x86-64, ARM  
- Windows 10 — x86-64  
- Windows Server 2012/2012R2/2016/2019 — x86-64  
- RHEL/CentOS 8/9 — x86-64, ARM  
- SLES 12/15 — x86-64, ARM  
- Ubuntu 20.04/22.04/24.04 — x86-64, ARM  

**MongoDB Services**

- Atlas: current release  
- MongoDB Server: any stable, non-EOL version (rapid releases unsupported)

</section>
<section>
<title>Verify the Integrity of Atlas CLI Packages</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/verify-packages/</url>

# Verify Atlas CLI Package Integrity

MongoDB signs Linux/Windows packages & Docker images. Verify before install.

## Linux (.tar.gz) – PGP

1. Download binaries & `.sig`:
```bash
curl -LO https://fastdl.mongodb.org/mongocli/mongodb-atlas-cli_<ver>_linux_x86_64.tar.gz
curl -LO https://fastdl.mongodb.org/mongocli/mongodb-atlas-cli_<ver>_linux_x86_64.tar.gz.sig
```
2. Get key & import:
```bash
curl -LO https://pgp.mongodb.com/atlas-cli.asc
gpg --import atlas-cli.asc
```
3. Verify:
```bash
gpg --verify mongodb-atlas-cli_<ver>_linux_x86_64.tar.gz.sig \
     mongodb-atlas-cli_<ver>_linux_x86_64.tar.gz
# “Good signature from Atlas CLI Release Signing Key” expected
```

## Windows (.msi/.zip) – SHA-256

1. Download installer.  
2. From GitHub release, copy matching hash in `checksums.txt` → save as `atlas-cli-key.txt`.  
3. Compare:
```powershell
$sig = (Get-Content "$env:USERPROFILE\Downloads\atlas-cli-key.txt").Substring(0,64).ToUpper()
$pkg = (Get-FileHash "$env:USERPROFILE\Downloads\mongodb-atlas-cli_<ver>_windows_x86_64.<ext>").Hash.Trim()
$sig; $pkg; $sig -eq $pkg   # True ⇒ verified
```

## Docker image – Cosign

```bash
brew install cosign      # or other install method
curl -s https://cosign.mongodb.com/atlas-cli.pem > atlas-cli.pem
COSIGN_REPOSITORY=docker.io/mongodb/signatures \
  cosign verify --private-infrastructure \
  --key=atlas-cli.pem docker.io/mongodb/atlas:<tag>
# Output lists validated signature & digest
```

</section>
<section>
<title>Connect from the Atlas CLI</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/connect-atlas-cli/</url>

# Connect from the Atlas CLI

Auth commands  
- `atlas auth login`: interactive; Atlas creds + 12-h token; optional API keys; manual usage.  
- `atlas config init`: prompts for public/private API keys; creates profile; best for automation.  

Notes  
- API keys saved plaintext in `config.toml`; secure file.  
- Profiles hold default Org/Project IDs, output format, shell path, and optional keys. Use profile name or pass `--projectId` / `--orgId` on each command.

## Quick Start – Non-programmatic
1. Install CLI; whitelist host IP if org enforces UI IP list.  
2. `atlas auth login` → browser opens, 10-min activation code → sign in, paste code.  
3. CLI shows “Successfully logged in …”; accept default Org/Project/output settings.  
4. Old MongoCLI profiles migrate; conflict error (“Global user is from outside access listed subnets”) ⇒ remove default profile and rerun.  
5. Run commands:  
```sh
atlas alerts list --projectId <PROJECT_ID>
```

## Quick Start – Programmatic
1. Install CLI; have API keys.  
2. `atlas config init` → enter public & private keys → accept remaining defaults.  
3. Run commands:  
```sh
atlas alerts list --projectId <PROJECT_ID>
```

Next: edit default profile or add new ones (see “Save Connection Settings”).

</section>
<section>
<title>Save Connection Settings</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/atlas-cli-save-connection-settings/</url>

# Atlas CLI – Connection Profiles (compressed)

Profiles store default org/project IDs, optional API keys, output format, and `mongosh` path in `config.toml`.  
Precedence: CLI flags (`--projectId`/`--orgId`) > env vars > profile settings.

## Config file path
- Windows: `%AppData%/atlascli`  
- macOS: `~/Library/Application Support/atlascli`  
- Linux: `$XDG_CONFIG_HOME/atlascli` or `$HOME/.config/atlascli`  

File is user-read/write only.

## Create profile

Choose method:

| Command               | Auth | Best for |
|-----------------------|------|----------|
| `atlas auth login`    | Atlas credentials + OAuth token | interactive / non-programmatic |
| `atlas config init`   | Public/Private API keys         | scripts / programmatic |

Both commands (optionally `--profile <name>`) prompt:

1. Org selection  
2. Project selection  
3. Output (`plaintext` or `json`)  
4. `mongosh` path (default `/usr/local/bin/mongosh`)

`atlas auth login` auto-opens browser, requires 10-min one-time code.  
`atlas config init` asks for API keys.

Example default profile:
```sh
atlas auth login          # or atlas config init
```

Named profile:
```sh
atlas auth login --profile myProfile
# or
atlas config init --profile myProfile
```

Verify:
```sh
atlas config describe <profileName>
```
(redacted tokens/keys shown).

## Proxy support  
Set `HTTP_PROXY` / `HTTPS_PROXY` (`http|https|socks5://user:pass@host`) when CLI is behind firewall; allow `cloud.mongodb.com/`.

## Update profile
- Edit `config.toml` manually, or
```sh
atlas config set <setting> <value> [--profile <name>]
```

## Use profile
```sh
atlas <command> --profile myProfile   # named
atlas <command>                       # default
```

Approx. 10% original size.

</section>
<section>
<title>Migrate to the Atlas CLI</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/migrate-to-atlas-cli/</url>

# Migrate to Atlas CLI

- `mongocli atlas` deprecated → replace with `atlas` commands  
- Install/upgrade Atlas CLI: auto-converts `~/.config/mongocli.toml` → `config.toml`, retaining profiles & API keys  
- Update scripts: switch commands & config path; env vars: may keep MongoCLI names or switch to Atlas, but don’t mix  
- Authenticate: `atlas auth login` or `atlas config init`  
- Use `--profile <name>` to access migrated profiles

</section>
<section>
<title>atlas</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas/</url>

# atlas

MongoDB Atlas CLI.

Options  
```
-h, --help        Show help  
-P, --profile str Use named profile  
```

Example  
```sh
atlas config --help
```

Top-level commands  
- accessLists – IP allowlist  
- accessLogs – Cluster access logs  
- alerts – Alert policies/events  
- api – Raw Atlas Admin API calls  
- auditing – DB auditing settings  
- auth – CLI auth state  
- backups – Cloud backups  
- cloudProviders – IAM role access  
- clusters – Cluster ops  
- completion – Shell completion  
- config – CLI profiles  
- customDbRoles – Custom DB roles  
- customDns – Cluster DNS (AWS)  
- dataFederation – Query multiple sources  
- dbusers – DB users  
- deployments – Cloud/local deployments  
- events – Org/project events  
- federatedAuthentication – SAML/OIDC  
- integrations – 3rd-party services  
- kubernetes – K8s resources  
- liveMigrations – Live migration to Atlas  
- logs – Download host logs  
- maintenanceWindows – Maintenance scheduling  
- metrics – Process metrics  
- networking – Peering & network config  
- organizations – Atlas orgs  
- performanceAdvisor – Slow query insights  
- plugin – CLI plugins  
- privateEndpoints – Private endpoints  
- processes – MongoDB processes  
- projects – Atlas projects  
- security – Security config  
- setup – Guided cluster setup  
- streams – Stream processing  
- teams – Atlas teams  
- users – Atlas users

</section>
<section>
<title>atlas accessLists</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-accessLists/</url>

# atlas accessLists

Manage IP/CIDR or AWS security-group entries that can reach your Atlas project.

**Options**  
- `-h, --help` Show help  
- `-P, --profile <name>` Use saved profile  

**Subcommands (overview only)**  
- `atlas accessLists create` Add an entry  
- `atlas accessLists delete` Remove an entry  
- `atlas accessLists describe` Show entry details  
- `atlas accessLists list` List all entries

</section>
<section>
<title>atlas accessLists create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-accessLists-create/</url>

# atlas accessLists create
Add one trusted IP, CIDR, or AWS security-group entry to a project’s access list (append only). Requires Read Write user/API key.

</section>
<section>
<title>atlas accessLists delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-accessLists-delete/</url>

# atlas accessLists delete

Remove an IP, CIDR, or AWS security-group entry from a project’s access list. Requires authenticated user or API key with **Read Write** role. Prompts for confirmation unless `--force`. Success message:  
`Project access list entry '<Name>' deleted`

</section>
<section>
<title>atlas accessLists describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-accessLists-describe/</url>

# atlas accessLists describe

Fetch one project access-list entry. Requires Org Member auth.

```
atlas accessLists describe <entry> [--output json|json-path|go-template|go-template-file] [--projectId <id>] [-P <profile>]
```
* `entry` (req): IP, CIDR, or AWS SG ID.

Example  
```bash
atlas accessLists describe 192.0.2.0/24 -o json --projectId <projId>
```

</section>
<section>
<title>atlas accessLists list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-accessLists-list/</url>

# atlas accessLists list  
List all IP access list entries for the current or specified project (auth: user/API key with Org Member).

</section>
<section>
<title>atlas accessLogs</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-accessLogs/</url>

# atlas accessLogs

Retrieve cluster access logs.

```
-h, --help       Show command help  
-P, --profile    Use specified Atlas CLI profile (global)
```

Related:  
`atlas accessLogs list` – list logs for given cluster/host.

</section>
<section>
<title>atlas accessLogs list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-accessLogs-list/</url>

# atlas accessLogs list

Get database access logs for a cluster by name or host FQDN (clusterName ≠ hostname). Requires Project Monitoring Admin (user/API key).

</section>
<section>
<title>atlas alerts</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-alerts/</url>

# atlas alerts
Manage project alerts.

```
atlas alerts [options]
```

Options  
- `-h, --help` Show help.  
Inherited:  
- `-P, --profile <name>` Use named config profile.

Subcommands (overview only)  
- `acknowledge` Acknowledge an alert.  
- `describe` Show alert details.  
- `list` List alerts.  
- `settings` Manage alert configuration.  
- `unacknowledge` Reopen alert.

</section>
<section>
<title>atlas alerts acknowledge</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-alerts-acknowledge/</url>

# atlas alerts acknowledge
Acknowledges/unacknowledges a project alert (requires Project Owner role). Takes `alertId` and optional `--until`, `--forever`, or `--comment`; returns confirmation string.

</section>
<section>
<title>atlas alerts describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-alerts-describe/</url>

# atlas alerts describe

Fetch details of a specific alert. Requires user/API key with Project Read Only.

```bash
atlas alerts describe <alertId> \
  [-o json|json-path|go-template|go-template-file] \
  [--projectId <projId>] [-P <profile>]
```

• alertId (string, required): Alert UUID.  
• --projectId overrides config project.  
• -o sets output format (use `json` for full).  

Output:

```
ID TYPE METRIC STATUS
<Id> <EventTypeName> <MetricName> <Status>
```

Example:

```bash
atlas alerts describe 5d1113b25a115342acc2d1aa \
  --projectId 5e2211c17a3e5a48f5497de3 -o json
```

</section>
<section>
<title>atlas alerts list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-alerts-list/</url>

# atlas alerts list
List project alerts. Auth: user or API key with Project Read Only.

</section>
<section>
<title>atlas alerts settings</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-alerts-settings/</url>

# atlas alerts settings
Manage project alert configurations (create, list, describe, update, delete, enable/disable, manage fields).

</section>
<section>
<title>atlas alerts settings create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-alerts-settings-create/</url>

# atlas alerts settings create
Create a new alert configuration for the current project (Project Owner auth required).

</section>
<section>
<title>atlas alerts settings delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-alerts-settings-delete/</url>

# atlas alerts settings delete
Delete a specified alert configuration in a project. Requires authentication as Project Owner.

</section>
<section>
<title>atlas alerts settings describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-alerts-settings-describe/</url>

# atlas alerts settings describe
Show details of a specific alert configuration in a project.

</section>
<section>
<title>atlas alerts settings disable</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-alerts-settings-disable/</url>

# atlas alerts settings disable  
Disable a single alert configuration in a project.

</section>
<section>
<title>atlas alerts settings enable</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-alerts-settings-enable/</url>

# atlas alerts settings enable

Enable an alert configuration.

## Syntax
```bash
atlas alerts settings enable <alertConfigId> [--projectId <projId>] [-o json|json-path|go-template|go-template-file] [-P <profile>]
```
• alertConfigId (required): alert ID.  
• --projectId: override current project.  
• -o: output format.  
• -P: CLI profile.

## Example
```bash
atlas alerts settings enable 5d1113b25a115342acc2d1aa --projectId 5e2211c17a3e5a48f5497de3
```
Success → `Alert configuration '<Id>' enabled`

</section>
<section>
<title>atlas alerts settings fields</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-alerts-settings-fields/</url>

# atlas alerts settings fields

Manage alert configuration fields in a project; see subcommand `type` to list valid `matcherFieldName` field types for alert configs.

</section>
<section>
<title>atlas alerts settings fields type</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-alerts-settings-fields-type/</url>

# atlas alerts settings fields type
Lists allowed `matcherFieldName` values for alert configurations (requires Project Read Only access).

</section>
<section>
<title>atlas alerts settings list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-alerts-settings-list/</url>

# atlas alerts settings list  
Lists all alert configurations for the selected project (`--projectId` or current). Requires authenticated user/API key with Project Read Only. Syntax:  
```bash
atlas alerts settings list [options]
```

</section>
<section>
<title>atlas alerts settings update</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-alerts-settings-update/</url>

# atlas alerts settings update

Update an existing project alert configuration.  
Usage: `atlas alerts settings update <alertConfigId> [options]` (Project Owner auth required).

</section>
<section>
<title>atlas alerts unacknowledge</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-alerts-unacknowledge/</url>

# atlas alerts unacknowledge

Unacknowledge a specified alert in a project (Project Owner privileges required).

</section>
<section>
<title>atlas api</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-api/</url>

# atlas api

Call any Atlas Admin API endpoint. Useful for scripts. *(experimental)*  

## Options
`-h, --help` Show help  

### Inherited
`-P, --profile string` Use named profile (see docs)

## Sub-commands (high-level)
- accessTracking – Access logs for auth attempts  
- alertConfigurations – CRUD alert conditions & notifications  
- alerts – List & acknowledge alerts  
- atlasSearch – CRUD Atlas Search indexes  
- auditing – Audit config  
- awsClustersDns – Custom DNS for AWS clusters  
- cloudBackups – Snapshots, export buckets, restore jobs, schedules  
- cloudMigrationService – Manage migrations  
- cloudProviderAccess – AWS IAM roles  
- clusterOutageSimulation – Start/stop outage simulation  
- clusters – CRUD clusters  
- collectionLevelMetrics – Manage pinned namespaces  
- customDatabaseRoles – CRUD custom DB roles  
- dataFederation – CRUD Federated DB Instances  
- dataLakePipelines – Manage Data Lake Pipelines & runs  
- databaseUsers – CRUD DB users  
- encryptionAtRestUsingCustomerKeyManagement – Customer KMS config  
- events – List events  
- federatedAuthentication – Manage federation, role mappings, org configs  
- flexClusters – CRUD flex clusters  
- flexRestoreJobs – Restore jobs for flex clusters  
- flexSnapshots – Download flex snapshots  
- globalClusters – Manage Global Cluster namespaces & zone maps  
- invoices – List invoices  
- ldapConfiguration – LDAP config CRUD & verify  
- legacyBackup – Legacy snapshot, restore, schedule, checkpoint mgmt  
- maintenanceWindows – CRUD maintenance windows  
- mongoDbCloudUsers – CRUD Cloud users  
- monitoringAndLogs – Deployment monitoring & logs  
- networkPeering – CRUD peering containers & connections  
- onlineArchive – CRUD online archives  
- openApi – Atlas spec info  
- organizations – CRUD organizations  
- performanceAdvisor – Suggested indexes & slow query data  
- privateEndpointServices – CRUD private endpoint services  
- programmaticApiKeys – CRUD API keys  
- projectIpAccessList – CRUD project IP allowlist  
- projects – CRUD projects  
- pushBasedLogExport – Continuous log export to S3  
- resourcePolicies – Org resource policies  
- rollingIndex – Rolling index creation  
- root – Build details & token info  
- serverlessInstances – CRUD serverless instances  
- serverlessPrivateEndpoints – CRUD serverless private endpoints  
- serviceAccounts – Manage Service Accounts & secrets  
- sharedTierRestoreJobs – Restore jobs for shared-tier clusters  
- sharedTierSnapshots – Download shared-tier snapshots  
- streams – CRUD Streams Instances  
- teams – CRUD teams  
- test – Test endpoints  
- thirdPartyIntegrations – CRUD 3rd-party integrations  
- x509Authentication – X.509 auth config

</section>
<section>
<title>atlas auditing</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-auditing/</url>

# atlas auditing

Returns DB auditing settings for a project.

Options  
`-h, --help` Show help  

Inherited  
`-P, --profile <name>` Use saved profile  

Related cmds  
• `atlas auditing describe` Show current config  
• `atlas auditing update` Modify config

</section>
<section>
<title>atlas auditing describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-auditing-describe/</url>

# atlas auditing describe
Retrieve current project auditing configuration. Requires Project Owner auth.

</section>
<section>
<title>atlas auditing update</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-auditing-update/</url>

# atlas auditing update
Updates auditing settings for a project (enable/disable, set audit filter, etc.). Requires Project Owner authentication.

</section>
<section>
<title>atlas auth</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-auth/</url>

# atlas auth
Manage Atlas CLI authentication.

• Options: `-h/--help` show help  
• Inherited: `-P/--profile <name>` select config profile  

Subcommands:  
`login` authenticate · `logout` sign out · `register` create account · `whoami` show current auth

</section>
<section>
<title>atlas auth login</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-auth-login/</url>

# atlas auth login
Authenticate to MongoDB Atlas (or Atlas for Government with --gov).  
Key opts:  
• --noBrowser – skip browser flow  
• -P/--profile <name> – use saved profile.

</section>
<section>
<title>atlas auth logout</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-auth-logout/</url>

# atlas auth logout

Log out of Atlas CLI.

```
atlas auth logout [--force] [-P profile]
```

Options  
- `--force` Skip confirmation prompt  
- `-P, --profile <name>` Use config profile  
- `-h, --help` Show help

Example
```bash
atlas auth logout
```

</section>
<section>
<title>atlas auth register</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-auth-register/</url>

# atlas auth register

Register with Atlas via interactive flow.

```
atlas auth register [--noBrowser] [-P profile]
```

Options  
- `--noBrowser` Skip browser launch  
- `-P, --profile string` Config profile  
- `-h, --help` Show help

Example
```bash
atlas auth register
```

</section>
<section>
<title>atlas auth whoami</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-auth-whoami/</url>

# atlas auth whoami

Verify current login identity.

```bash
atlas auth whoami [--profile <name>] [-h]
```

Options  
- `-P, --profile string` – use config profile  
- `-h, --help` – command help  

Example  
```bash
atlas auth whoami
```

</section>
<section>
<title>atlas backups</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups/</url>

# atlas backups

Manage project cloud backups.

**Options**

| Flag | Description |
|------|-------------|
| `-h, --help` | Show help |

**Inherited**

| Flag | Description |
|------|-------------|
| `-P, --profile <name>` | Use named config profile |

**Related Commands (high-level)**  
- `atlas backups compliancePolicy` – Compliance policy (`setup`, `enable`).  
- `atlas backups exports` – Export jobs.  
- `atlas backups restores` – Restore jobs.  
- `atlas backups schedule` – View cluster schedule.  
- `atlas backups snapshots` – Snapshot management.

</section>
<section>
<title>atlas backups compliancePolicy</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-compliancePolicy/</url>

# atlas backups compliancePolicy

Manage project Backup Compliance Policy.  
Quick use:  
• `atlas backups compliancePolicy setup` – enable & configure via file  
• `atlas backups compliancePolicy enable` – enable with defaults  

**Options**  
`-h, --help` Show help  

**Global**  
`-P, --profile <name>` CLI profile  

**Subcommands (overview only)**  
• copyProtection – manage snapshot copy-protection  
• describe – show current policy  
• enable – enable policy (no config)  
• encryptionAtRest – require Customer KMS  
• pointInTimeRestores – toggle Continuous Backup window  
• policies – manage individual policy items  
• setup – configure policy via file

</section>
<section>
<title>atlas backups compliancePolicy copyProtection</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-compliancePolicy-copyProtection/</url>

# atlas backups compliancePolicy copyProtection

Manage your project’s backup compliance policy copy-protection.

Subcommands  
• atlas backups compliancePolicy copyProtection disable — turn off copy protection  
• atlas backups compliancePolicy copyProtection enable — turn on copy protection  

Docs: https://www.mongodb.com/docs/atlas/backup/cloud-backup/backup-compliance-policy/#-optional--keep-all-snapshots-when-removing-additional-snapshot-regions

</section>
<section>
<title>atlas backups compliancePolicy copyProtection disable</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-compliancePolicy-copyProtection-disable/</url>

# atlas backups compliancePolicy copyProtection disable
Disable copy protection for a project's backup compliance policy.

</section>
<section>
<title>atlas backups compliancePolicy copyProtection enable</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-compliancePolicy-copyProtection-enable/</url>

# atlas backups compliancePolicy copyProtection enable
Enable backup copy-protection in the project’s compliance policy.

</section>
<section>
<title>atlas backups compliancePolicy describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-compliancePolicy-describe/</url>

# atlas backups compliancePolicy describe  
Return the backup compliance policy for a project.

</section>
<section>
<title>atlas backups compliancePolicy enable</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-compliancePolicy-enable/</url>

# atlas backups compliancePolicy enable  
Enables a project's Backup Compliance Policy. Requires authorized representative info; supports `--force`, `--watch`, `--output`, and standard project/profile options.

</section>
<section>
<title>atlas backups compliancePolicy encryptionAtRest</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-compliancePolicy-encryptionAtRest/</url>

# atlas backups compliancePolicy encryptionAtRest

Manage project Backup Compliance Policy encryption-at-rest (Customer Key Management required).

Options  
- `-h, --help` Show help  
Inherited:  
- `-P, --profile <name>` Use specified config profile

Related Commands  
- `atlas backups compliancePolicy encryptionAtRest enable` Enable  
- `atlas backups compliancePolicy encryptionAtRest disable` Disable

</section>
<section>
<title>atlas backups compliancePolicy encryptionAtRest disable</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-compliancePolicy-encryptionAtRest-disable/</url>

# atlas backups compliancePolicy encryptionAtRest disable  
Disables project backup encryption-at-rest compliance policy.

</section>
<section>
<title>atlas backups compliancePolicy encryptionAtRest enable</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-compliancePolicy-encryptionAtRest-enable/</url>

# atlas backups compliancePolicy encryptionAtRest enable

Enables encryption-at-rest in the project’s backup compliance policy.

</section>
<section>
<title>atlas backups compliancePolicy pointInTimeRestores</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-compliancePolicy-pointInTimeRestores/</url>

# atlas backups compliancePolicy pointInTimeRestores
Manage Continuous Cloud Backups compliance policy (Point-in-Time restores). Docs: https://www.mongodb.com/docs/atlas/backup/cloud-backup/configure-backup-policy/#configure-the-restore-window.  
Subcommand: `atlas backups compliancePolicy pointInTimeRestores enable` – turns on Point-in-Time restores for the project.

</section>
<section>
<title>atlas backups compliancePolicy pointInTimeRestores enable</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-compliancePolicy-pointInTimeRestores-enable/</url>

# atlas backups compliancePolicy pointInTimeRestores enable  
Enable PIT restores for a project’s backup compliance policy.

</section>
<section>
<title>atlas backups compliancePolicy policies</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-compliancePolicy-policies/</url>

# atlas backups compliancePolicy policies

Manage individual backup compliance policy items for your project.

Subcommands:  
• describe – show items  
• ondemand – manage on-demand item  
• scheduled – manage scheduled items

</section>
<section>
<title>atlas backups compliancePolicy policies describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-compliancePolicy-policies-describe/</url>

# atlas backups compliancePolicy policies describe
Retrieve individual backup compliance policy items for the specified project.

</section>
<section>
<title>atlas backups compliancePolicy policies ondemand</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-compliancePolicy-policies-ondemand/</url>

# atlas backups compliancePolicy policies ondemand

Manage a project's on-demand backup compliance policy.

Subcommands (overview only):
- `create`  – add the on-demand policy item
- `describe` – show the current item
- `update`   – modify the item

</section>
<section>
<title>atlas backups compliancePolicy policies ondemand create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-compliancePolicy-policies-ondemand-create/</url>

# atlas backups compliancePolicy policies ondemand create

Creates an on-demand item for a project’s backup compliance policy.

</section>
<section>
<title>atlas backups compliancePolicy policies ondemand describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-compliancePolicy-policies-ondemand-describe/</url>

# atlas backups compliancePolicy policies ondemand describe  
Fetch the on-demand policy item of a project's backup compliance policy.

</section>
<section>
<title>atlas backups compliancePolicy policies ondemand update</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-compliancePolicy-policies-ondemand-update/</url>

# atlas backups compliancePolicy policies ondemand update  
Update the on-demand backup compliance retention policy for a project.

</section>
<section>
<title>atlas backups compliancePolicy policies scheduled</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-compliancePolicy-policies-scheduled/</url>

# atlas backups compliancePolicy policies scheduled

Manage scheduled policy items in a project's backup compliance policy.

**Options**  
- `-h, --help`  
Inherited: `-P, --profile <name>` – use config profile.

**Subcommands (overview)**  
- `create` – add a scheduled policy item.  
- `describe` – list scheduled policy items.

</section>
<section>
<title>atlas backups compliancePolicy policies scheduled create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-compliancePolicy-policies-scheduled-create/</url>

# atlas backups compliancePolicy policies scheduled create

Create a scheduled backup compliance policy item (daily/weekly/monthly/hourly) for a project.

</section>
<section>
<title>atlas backups compliancePolicy policies scheduled describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-compliancePolicy-policies-scheduled-describe/</url>

# atlas backups compliancePolicy policies scheduled describe  
Shows scheduled items of a project's backup compliance policy.

</section>
<section>
<title>atlas backups compliancePolicy setup</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-compliancePolicy-setup/</url>

# atlas backups compliancePolicy setup

Creates/updates project backup compliance policy using a JSON config file.

</section>
<section>
<title>atlas backups exports</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-exports/</url>

# atlas backups exports

Manage cloud backup export jobs for the project.  

Related:  
• `atlas backups exports buckets` – manage export buckets  
• `atlas backups exports jobs` – manage export jobs

</section>
<section>
<title>atlas backups exports buckets</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-exports-buckets/</url>

# atlas backups exports buckets

Manage cloud backup export buckets (AWS S3) for a project.

Subcommands  
- `create` – add an existing S3 bucket as export destination  
- `delete` – remove an export bucket  
- `describe` – show details of one bucket  
- `list` – list all export buckets

</section>
<section>
<title>atlas backups exports buckets create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-exports-buckets-create/</url>

# atlas backups exports buckets create

Create an AWS S3 export destination for Atlas backups. Requires Project Owner auth.

```bash
atlas backups exports buckets create <bucketName> \
  --cloudProvider AWS --iamRoleId <roleID> [--projectId <id>] [-o json] [-P <profile>]
```

Arguments  
• bucketName (req) – existing S3 bucket.

Options  
• --cloudProvider AWS (req)  
• --iamRoleId string (req) – Atlas-assigned role with bucket access.  
• --projectId, -o, -P, -h – standard.

Output  
`Export destination created using '<BucketName>'.`

Example  
```bash
atlas backups exports buckets create test-bucket \
  --cloudProvider AWS --iamRoleId 12345678f901a234dbdb00ca
```

</section>
<section>
<title>atlas backups exports buckets delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-exports-buckets-delete/</url>

# atlas backups exports buckets delete

Deletes a snapshot export bucket. Requires Project Owner-level auth.

</section>
<section>
<title>atlas backups exports buckets describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-exports-buckets-describe/</url>

# atlas backups exports buckets describe  
Fetches details of a snapshot export bucket (requires Project Read Only access).

</section>
<section>
<title>atlas backups exports buckets list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-exports-buckets-list/</url>

# atlas backups exports buckets list

Lists cloud backup restore buckets for your project/cluster. Requires user/API key with Project Read Only.

</section>
<section>
<title>atlas backups exports jobs</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-exports-jobs/</url>

# atlas backups exports jobs

Manage Atlas cluster cloud-backup export jobs.

Subcommands  
- create – export one snapshot to an existing AWS S3 bucket (M10+).  
- describe – show details of one export job.  
- list – list all export jobs.  
- watch – wait for a job to finish.

</section>
<section>
<title>atlas backups exports jobs create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-exports-jobs-create/</url>

# atlas backups exports jobs create

Create an export job that copies a specified snapshot from an M10+ cluster to a configured AWS S3 bucket. Requires Project Owner credentials.

</section>
<section>
<title>atlas backups exports jobs describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-exports-jobs-describe/</url>

# atlas backups exports jobs describe

Return one cloud backup export job for the given project and cluster (requires Project Owner auth). Outputs: `ID, EXPORT BUCKET ID, STATE, SNAPSHOT ID`.

</section>
<section>
<title>atlas backups exports jobs list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-exports-jobs-list/</url>

# atlas backups exports jobs list
List all cloud backup export jobs for the specified cluster in a project. Requires Project Owner privileges.  
Syntax: `atlas backups exports jobs list <clusterName>`

</section>
<section>
<title>atlas backups exports jobs watch</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-exports-jobs-watch/</url>

# atlas backups exports jobs watch

Polls export job until completed/cancelled/failed; interrupts with Ctrl-C. Requires Project Owner auth.

Syntax: `atlas backups exports jobs watch <exportJobId> --clusterName <cluster> [--projectId <id>]`.

</section>
<section>
<title>atlas backups restores</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-restores/</url>

# atlas backups restores

Manage Atlas cloud backup restore jobs.

## Flags
- `-h, --help` Show help  
- `-P, --profile <name>` Use saved CLI profile

## Subcommands (overview)
- `atlas backups restores describe` Describe a restore job  
- `atlas backups restores list` List restore jobs  
- `atlas backups restores start` Start a restore job  
- `atlas backups restores watch` Watch job until completion

</section>
<section>
<title>atlas backups restores describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-restores-describe/</url>

# atlas backups restores describe

High-level: `atlas backups restores describe <restoreJobId>`  
Shows details of a cloud backup restore job for a specified cluster. Requires Project Owner or API key.

</section>
<section>
<title>atlas backups restores list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-restores-list/</url>

# atlas backups restores list  
Return all cloud backup restore jobs for the specified cluster in the current (or `--projectId`) project. Requires Project Owner role.

</section>
<section>
<title>atlas backups restores start</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-restores-start/</url>

# atlas backups restores start

Starts a restore job (automated, download, or pointInTime) for a project’s cluster. Requires Project Owner authentication. Supported on Flex (automated only) and M10+ clusters. Automated and point-in-time restores overwrite target data.

</section>
<section>
<title>atlas backups restores watch</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-restores-watch/</url>

# atlas backups restores watch

Polls a restore job until completed/failed/canceled; stop with `CTRL-C`.

```
atlas backups restores watch <restoreJobId> --clusterName <name> [--projectId <id>] [global opts]
```

Prints `Restore completed.` on success.

Example:
```bash
atlas backups restores watch 507f1f77bcf86cd799439011 --clusterName Cluster0
```

</section>
<section>
<title>atlas backups schedule</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-schedule/</url>

# atlas backups schedule

Return the cloud backup schedule for a specified cluster.

Related:  
• `atlas backups schedule delete` – delete all schedules  
• `atlas backups schedule describe` – view schedule details  
• `atlas backups schedule update` – modify schedule

</section>
<section>
<title>atlas backups schedule delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-schedule-delete/</url>

# atlas backups schedule delete  
Delete all backup schedules for a specified cluster (Project Owner auth required).  
Syntax: `atlas backups schedule delete <clusterName> [--force] [--projectId <id>]`

</section>
<section>
<title>atlas backups schedule describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-schedule-describe/</url>

# atlas backups schedule describe  
Returns cloud backup schedule for specified cluster. Requires authenticated user/API key with Project Read Only role.

</section>
<section>
<title>atlas backups schedule update</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-schedule-update/</url>

# atlas backups schedule update

Update a project's cluster backup schedule and related settings (snapshot timing, retention, auto-export to AWS, policy updates). Requires Project Owner role.

</section>
<section>
<title>atlas backups snapshots</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-snapshots/</url>

# atlas backups snapshots

Manage cloud backup snapshots for a project.

Subcommands  
• create – create snapshot  
• delete – remove snapshot  
• describe – show snapshot details  
• download – download snapshot from flex cluster  
• list – list snapshots for project/cluster  
• watch – wait until snapshot is available

</section>
<section>
<title>atlas backups snapshots create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-snapshots-create/</url>

# atlas backups snapshots create
Create an on-demand snapshot for an M10+ cluster.  
Syntax: `atlas backups snapshots create <clusterName> [--desc <text> --retention <days>]`  
Requires Project Owner-level auth. Returns: `Snapshot '<id>' created.`

</section>
<section>
<title>atlas backups snapshots delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-snapshots-delete/</url>

# atlas backups snapshots delete  
Delete a specific backup snapshot on M10+ clusters. Requires Project Owner/API Key.  
Example:  
```bash
atlas backups snapshots delete <snapshotId> --clusterName <cluster>
```

</section>
<section>
<title>atlas backups snapshots describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-snapshots-describe/</url>

# atlas backups snapshots describe

Show details of a specific backup snapshot (requires snapshotId, clusterName, Project Read Only access or higher).

</section>
<section>
<title>atlas backups snapshots download</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-snapshots-download/</url>

# atlas backups snapshots download

Download a specified snapshot (`snapshotId`) from an Atlas Flex cluster. Requires Project Owner auth; supports Flex clusters only.

</section>
<section>
<title>atlas backups snapshots list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-snapshots-list/</url>

# atlas backups snapshots list

List all cloud backup snapshots for a specified cluster in the current or `--projectId` project. Requires Project Read Only user/API key.  

`atlas backups snapshots list <clusterName>`

</section>
<section>
<title>atlas backups snapshots watch</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-backups-snapshots-watch/</url>

# atlas backups snapshots watch

Polls a snapshot’s status until it completes or fails, then prints “Snapshot changes completed.” Blocks session; break with Ctrl-C. Requires Project Read Only access.

</section>
<section>
<title>atlas cloudProviders</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-cloudProviders/</url>

# atlas cloudProviders

Manage AWS IAM role access for Atlas clusters.

**Options**  
`-h, --help`  Show help.

**Inherited**  
`-P, --profile <name>`  Use specified CLI profile.

**Related**  
`atlas cloudProviders accessRoles`  Manage AWS IAM role access.

</section>
<section>
<title>atlas cloudProviders accessRoles</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-cloudProviders-accessRoles/</url>

# atlas cloudProviders accessRoles  
Manage AWS IAM role access in Atlas. Subcommands: `aws`, `list`.

</section>
<section>
<title>atlas cloudProviders accessRoles aws</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-cloudProviders-accessRoles-aws/</url>

# atlas cloudProviders accessRoles aws

Manage AWS IAM roles in Atlas.

Subcommands  
• authorize – authorize role  
• create – create role  
• deauthorize – remove role  

Global flag  
`-P, --profile <name>` – use saved CLI profile

</section>
<section>
<title>atlas cloudProviders accessRoles aws authorize</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-cloudProviders-accessRoles-aws-authorize/</url>

# atlas cloudProviders accessRoles aws authorize  
Authorizes an existing AWS IAM role (`<roleId>`) for Atlas access; optional `--iamAssumedRoleArn`. Returns confirmation message.

</section>
<section>
<title>atlas cloudProviders accessRoles aws create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-cloudProviders-accessRoles-aws-create/</url>

# atlas cloudProviders accessRoles aws create

Creates an AWS IAM role in the specified Atlas project (Project Owner privilege required).  
Success output:  
```
AWS IAM role '<RoleId>' successfully created.
Atlas AWS Account ARN: <AtlasAWSAccountArn>
Unique External ID: <AtlasAssumedRoleExternalId>
```

</section>
<section>
<title>atlas cloudProviders accessRoles aws deauthorize</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-cloudProviders-accessRoles-aws-deauthorize/</url>

# atlas cloudProviders accessRoles aws deauthorize

Removes an AWS IAM role from a project.  
Usage: `atlas cloudProviders accessRoles aws deauthorize <roleId>` (Project Owner auth required).

</section>
<section>
<title>atlas cloudProviders accessRoles list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-cloudProviders-accessRoles-list/</url>

# atlas cloudProviders accessRoles list
Lists AWS IAM roles mapped to the current project. Requires Project Owner privileges or equivalent API key.

</section>
<section>
<title>atlas clusters</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters/</url>

# atlas clusters

Manage clusters in a project: create, list, modify, pause/start, failover, upgrade, delete, etc.

Options  
`-h, --help` Show help

Inherited  
`-P, --profile <name>` Use profile from config

Subcommands  
advancedSettings, availableRegions, connectionStrings, create, delete, describe, failover, indexes, list, onlineArchives, pause, sampleData, search, start, update, upgrade, watch

</section>
<section>
<title>atlas clusters advancedSettings</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-advancedSettings/</url>

# atlas clusters advancedSettings

Manage advanced configuration settings for a cluster.

Flags  
`-h|--help` show help  
`-P|--profile <name>` use specified CLI profile  

Subcommands (overview only)  
• `describe` – retrieve settings  
• `update` – modify settings

</section>
<section>
<title>atlas clusters advancedSettings describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-advancedSettings-describe/</url>

# atlas clusters advancedSettings describe
Retrieve advanced configuration settings for a specified cluster (Project Read Only role required).

</section>
<section>
<title>atlas clusters advancedSettings update</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-advancedSettings-update/</url>

# atlas clusters advancedSettings update

Updates advanced config of an M10+ cluster (`read/write concern, oplog size/retention, TLS min version, BI Connector sampling, JavaScript, collection scans, long index keys`).  
Syntax:  
```bash
atlas clusters advancedSettings update <clusterName> [options]
```

</section>
<section>
<title>atlas clusters availableRegions</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-availableRegions/</url>

# atlas clusters availableRegions

High-level: Manage/query regions supported for new Atlas clusters (see `atlas clusters availableRegions list`). Inherits global flags like `--profile`.

</section>
<section>
<title>atlas clusters availableRegions list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-availableRegions-list/</url>

# atlas clusters availableRegions list

Return regions where Atlas can deploy new clusters.

</section>
<section>
<title>atlas clusters connectionStrings</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-connectionStrings/</url>

# atlas clusters connectionStrings
Manage MongoDB cluster connection strings (parent of `describe`).

</section>
<section>
<title>atlas clusters connectionStrings describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-connectionStrings-describe/</url>

# atlas clusters connectionStrings describe
Retrieve the (standard/private/privateEndpoint) SRV connection string for a specified cluster. Requires authenticated user/API key with Project Read Only role.

```bash
atlas clusters connectionStrings describe <clusterName>
```

</section>
<section>
<title>atlas clusters create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-create/</url>

# atlas clusters create

Create a new Atlas cluster in a project (Project Owner/API Key required).  
Quick setup: name+`--provider`+`--region` → 3-node replica set, latest MongoDB.  
Full control / multi-cloud: supply JSON via `--file`.

Deprecation: selecting M2/M5 now provisions FLEX.

```bash
atlas clusters create <name> \
  --provider AWS|AZURE|GCP --region <REGION> [options]
# or
atlas clusters create --file <cfg.json>
```

Key args / flags  
• `<name>` – cluster id (omit if `--file`).  
• --file <json> – all settings; incompatible with most flags.  
• --tier FLEX|M0|M10… (default FLEX).  
• --type REPLICASET|SHARDED (def REPLICASET).  
• --members N (def 3), --shards N (def 1).  
• --diskSizeGB GB (def 2).  
• --mdbVersion "8.0" …  
• --provider, --region – required unless `--file`.  
• --backup – enable continuous backup (≥ M10).  
• --biConnector – enable BI Connector.  
• --enableTerminationProtection.  
• --tag k=v (repeatable).  
• --watch [--watchTimeout SEC].  
Common: --projectId, -o json|json-path|go-template, -P profile, -h.

Output:  
`Cluster '<Name>' is being created.`

Examples
```bash
# Free M0
atlas clusters create myCluster --projectId 5e2211c17a3e5a48f5497de3 \
  --provider AWS --region US_EAST_1 --tier M0

# FLEX with tag
atlas clusters create myFlexCluster --provider AWS --region US_EAST_1 \
  --tier FLEX --tag env=dev

# M10 replica set
atlas clusters create myRS --provider AWS --region US_EAST_1 \
  --members 3 --tier M10 --mdbVersion 5.0 --diskSizeGB 10

# From JSON
atlas clusters create --projectId <projectId> --file myfile.json
```

</section>
<section>
<title>atlas clusters delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-delete/</url>

# atlas clusters delete

Delete a cluster (and its backups). Requires Project Owner auth.

```bash
atlas clusters delete <clusterName> [--force] [--projectId <id>] \
                       [--watch] [--watchTimeout <sec>] [-P <profile>]
```

Args  
• clusterName (required): target cluster.

Options  
• --force ‑ skip confirmation.  
• --projectId ‑ override current project.  
• --watch / --watchTimeout ‑ poll until done.  
• -P --profile ‑ config profile.  
• -h --help.

Output: `Deleting cluster '<Name>'`

Examples
```bash
atlas clusters delete myCluster           # prompt
atlas clusters delete myCluster --force   # no prompt
```

</section>
<section>
<title>atlas clusters describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-describe/</url>

# atlas clusters describe

Get details of the specified cluster (Project Read Only or higher).

```bash
atlas clusters describe <clusterName>
```

Outputs cluster ID, name, MongoDB version, and state (use `-o json` for full JSON).

</section>
<section>
<title>atlas clusters failover</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-failover/</url>

# atlas clusters failover

Start a primary failover test for a cluster.  
Syntax: `atlas clusters failover <clusterName> [--force] [--projectId <id>] [-P <profile>]`  
Success: `Failover test for '<Name>' started`. Example: `atlas clusters failover myCluster`

</section>
<section>
<title>atlas clusters indexes</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-indexes/</url>

# atlas clusters indexes
Manage rolling indexes on a cluster.  
Subcommand: `atlas clusters indexes create` – create a rolling index.

</section>
<section>
<title>atlas clusters indexes create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-indexes-create/</url>

# atlas clusters indexes create  
Rolling create of an index on a cluster. Usage: `atlas clusters indexes create [indexName]`. Must provide `--clusterName`; define keys with `--db`, `--collection`, `--key field:type...`, or supply a JSON `--file`. Auth role: Project Data Access Admin.

</section>
<section>
<title>atlas clusters list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-list/</url>

# atlas clusters list

List clusters in a project (requires Project Read Only or higher).

```bash
atlas clusters list \
  [--limit 1-500] [--page N] [--tier TIER] \
  [--omitCount] [--projectId ID] \
  [-o json|json-path|go-template|go-template-file] \
  [-P PROFILE]
```

Options  
• --limit: page size (def. 100)  
• --page: page number (def. 1)  
• --tier: filter by cluster tier  
• --omitCount: exclude `totalCount` in JSON  
• --projectId: override project selection  
• -o: output format  
• -P: config profile  
• -h: help

Output

```
ID   NAME   MDB VER   STATE
```

Example

```bash
atlas clusters list --projectId 5e2211c17a3e5a48f5497de3 -o json
```

</section>
<section>
<title>atlas clusters onlineArchives</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-onlineArchives/</url>

# atlas clusters onlineArchives

Manage online archives for a cluster.

Flags:  
`-h/--help` show help.  
Inherited: `-P/--profile <name>` use saved CLI profile.

Subcommands (high-level only):  
• `create` – create archive for a collection.  
• `delete` – remove archive.  
• `describe` – show archive details.  
• `list` – list all archives.  
• `pause` – pause archive.  
• `start` – resume paused archive.  
• `update` – modify archive rule.  
• `watch` – wait until archive available.

</section>
<section>
<title>atlas clusters onlineArchives create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-onlineArchives-create/</url>

# atlas clusters onlineArchives create

Creates an online archive for a specified collection on an M10+ cluster. Supports inline flags or a JSON config file for settings (archive criteria, date field/format, partition keys, retention, etc.). Requires Project Data Access Admin credentials.

</section>
<section>
<title>atlas clusters onlineArchives delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-onlineArchives-delete/</url>

# atlas clusters onlineArchives delete  
Deletes the specified online archive from a cluster. Requires Data Access Admin privileges and user/API key authentication.

</section>
<section>
<title>atlas clusters onlineArchives describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-onlineArchives-describe/</url>

# atlas clusters onlineArchives describe
Return details of a specified online archive in a cluster (requires Project Read Only role or API key).

</section>
<section>
<title>atlas clusters onlineArchives list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-onlineArchives-list/</url>

# atlas clusters onlineArchives list

Lists all online archives for a given cluster (Project Read Only+ required). Use after authenticating.

Syntax  
```bash
atlas clusters onlineArchives list
```

Returns table: `ID DATABASE COLLECTION STATE` (or JSON via `-o json`).

</section>
<section>
<title>atlas clusters onlineArchives pause</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-onlineArchives-pause/</url>

# atlas clusters onlineArchives pause
Pause an online archive for a cluster (requires Project Data Access Admin).

</section>
<section>
<title>atlas clusters onlineArchives start</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-onlineArchives-start/</url>

# atlas clusters onlineArchives start

Resume a paused online archive for the given cluster.  
Auth: Project Data Access Admin.

```
atlas clusters onlineArchives start <archiveId> --clusterName <cluster> [--projectId <proj>] [global flags]
```

Success output:  
`Online archive '<Id>' started.`

</section>
<section>
<title>atlas clusters onlineArchives update</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-onlineArchives-update/</url>

# atlas clusters onlineArchives update

Updates archiving settings of an existing online archive (`archiveId`) on a cluster. Requires Project Data Access Admin. Core flags:  
• `--clusterName` (required)  
• `--archiveAfter` or `--expireAfterDays` or `--file` (JSON config, mutually exclusive)  

Success message: `Online archive '<Id>' updated.`

</section>
<section>
<title>atlas clusters onlineArchives watch</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-onlineArchives-watch/</url>

# atlas clusters onlineArchives watch

Poll archive status until it leaves PENDING/PAUSING, then prints “Online archive available.” Requires Project Read Only role or API key.

</section>
<section>
<title>atlas clusters pause</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-pause/</url>

# atlas clusters pause

Pause an M10+ cluster. Requires Project Cluster Manager role.

```bash
atlas clusters pause <clusterName> [options]
```

Arguments  
- `clusterName` (string, required) – target cluster name

Options  
- `--projectId <hex>` – override project  
- `-o, --output <json|json-path|go-template|go-template-file>`  
- `-P, --profile <name>` – config profile  
- `-h, --help`

Output  
`Pausing cluster '<Name>'.`

Example  
```bash
atlas clusters pause myCluster --projectId 5e2211c17a3e5a48f5497de3 -o json
```

</section>
<section>
<title>atlas clusters sampleData</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-sampleData/</url>

# atlas clusters sampleData

Manage sample data on a cluster.

Subcommands:  
• `describe` – show details of a sample data load job.  
• `load` – load sample data into a cluster.  
• `watch` – monitor a sample data job until completion.

</section>
<section>
<title>atlas clusters sampleData describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-sampleData-describe/</url>

# atlas clusters sampleData describe

Fetches details of a sample data load job (ID required).

</section>
<section>
<title>atlas clusters sampleData load</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-sampleData-load/</url>

# atlas clusters sampleData load

Load Atlas sample data into a cluster (Project Owner auth required).

```bash
atlas clusters sampleData load <clusterName> [options]
```

Arg | Req | Description
--- | --- | ---
`clusterName` | ✓ | Target cluster name.

Option | Description
------ | -----------
`-o, --output <fmt>` | json, json-path, go-template(\*-file).
`--projectId <id>` | Override project.
`-h` | Help.
Inherited: `-P, --profile <name>`.

Output:
```
Sample Data Job <Id> created.
```

Example:
```bash
atlas clusters sampleData load myCluster -o json
```

</section>
<section>
<title>atlas clusters sampleData watch</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-sampleData-watch/</url>

# atlas clusters sampleData watch

Polls a sample-data job until COMPLETED (Ctrl-C to stop).  
Required arg: `<id>` (job ID).  
Opts: `--projectId`, `-P/--profile`. Requires Project Read Only auth.

</section>
<section>
<title>atlas clusters search</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-search/</url>

# atlas clusters search

Manage Atlas Search for an Atlas cluster.  

Related subcommands:
- `atlas clusters search indexes` – manage search indexes  
- `atlas clusters search nodes` – manage search nodes

</section>
<section>
<title>atlas clusters search indexes</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-search-indexes/</url>

# atlas clusters search indexes

Manage Atlas Search indexes on a cluster.

Subcommands  
• `create` – create index  
• `delete` – delete index  
• `describe` – show index details  
• `list` – list indexes  
• `update` – modify index

</section>
<section>
<title>atlas clusters search indexes create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-search-indexes-create/</url>

# atlas clusters search indexes create  
Create an Atlas Search (or Vector Search) index on a specified cluster. Requires Project Data Access Admin authentication.

</section>
<section>
<title>atlas clusters search indexes delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-search-indexes-delete/</url>

# atlas clusters search indexes delete  
Deletes the specified Atlas Search index from a cluster. Requires Project Data Access Admin privileges.

</section>
<section>
<title>atlas clusters search indexes describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-search-indexes-describe/</url>

# atlas clusters search indexes describe  
Return details of a specified search index in a cluster (requires Project Data Access Read/Write).

</section>
<section>
<title>atlas clusters search indexes list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-search-indexes-list/</url>

# atlas clusters search indexes list

List all Atlas Search indexes for the specified cluster (`--clusterName`), database (`--db`), and collection (`--collection`). Requires Project Data Access Read/Write.

</section>
<section>
<title>atlas clusters search indexes update</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-search-indexes-update/</url>

# atlas clusters search indexes update
Update an Atlas Search / Vector Search index on a cluster.  
Requires: Project Data Access Admin auth, `indexId` arg.  
Key opts: `--clusterName` (req), `--file` (JSON config), `--projectId`, `-o`.  
Success: `Index <Name> updated.`

</section>
<section>
<title>atlas clusters search nodes</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-search-nodes/</url>

# atlas clusters search nodes

Manage Atlas Search nodes for a cluster.

Subcommands: create, delete, list, update.

</section>
<section>
<title>atlas clusters search nodes create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-search-nodes-create/</url>

# atlas clusters search nodes create

Create Atlas Search nodes for a cluster (Org/Project Owner auth required).

</section>
<section>
<title>atlas clusters search nodes delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-search-nodes-delete/</url>

# atlas clusters search nodes delete
Remove an Atlas Search node from a cluster. Requires Organization or Project Owner authentication.

</section>
<section>
<title>atlas clusters search nodes list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-search-nodes-list/</url>

# atlas clusters search nodes list

List all Atlas Search nodes in a specified cluster (Project Read Only privileges required).

</section>
<section>
<title>atlas clusters search nodes update</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-search-nodes-update/</url>

# atlas clusters search nodes update

Update Atlas Search Nodes for a specified cluster (requires Org/Project Owner auth).

</section>
<section>
<title>atlas clusters start</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-start/</url>

# atlas clusters start  

Resume a paused M10+ cluster (Project Cluster Manager required).

```sh
atlas clusters start <clusterName> \
  [--projectId <projId>] \
  [--output json|json-path|go-template|go-template-file] \
  [--profile <cfgProfile>]
```

• clusterName (required) — cluster to start  
Output: `Starting cluster '<Name>'.`  

Example  
```sh
atlas clusters start myCluster --projectId 5e2211c17a3e5a48f5497de3 -o json
```

</section>
<section>
<title>atlas clusters update</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-update/</url>

# atlas clusters update

Modify an M10+ cluster’s settings  
(no renaming, no MongoDB downgrade, replica-set→single-shard only).  
JSON config via `--file`; M2/M5 auto-migrate to FLEX.  
Auth: Project Cluster Manager (user or API key).

```bash
atlas clusters update <clusterName> [options]
```

Arguments  
• `clusterName` – target cluster (omit to use interactive selector).

Key options (mutually exclusive with `--file` where noted):  
• `--tier <string>` – new instance size.  
• `--diskSizeGB <float>` – root volume GB.  
• `--mdbVersion <major.minor>` – upgrade only.  
• `--tag key=value` – replace all tags; use `--tag =` to clear.  
• `--enableTerminationProtection` / `--disableTerminationProtection`.  
• `-f, --file <path>` – JSON spec (overrides tier/disk/tag/termination flags).  
• `--projectId <hex>` – override profile project.  
Output control: `-o` format, `-P` profile, `-h` help.

Success message:  
`Updating cluster '<Name>'.`

Examples
```bash
# change tier
atlas clusters update myCluster --projectId 5e2211c17a3e5a48f5497de3 --tier M50

# add/replace tags
atlas clusters update myCluster --projectId 5e2211... --tag key1=value1

# clear tags
atlas clusters update myCluster --projectId 5e2211... --tag =

# resize disk
atlas clusters update myCluster --projectId 5e2211... --diskSizeGB 20

# upgrade MongoDB
atlas clusters update myCluster --projectId 5e2211... --mdbVersion 5.0

# use JSON file
atlas clusters update myCluster --projectId 5e2211... --file cluster-config.json -o json
```

</section>
<section>
<title>atlas clusters upgrade</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-upgrade/</url>

# atlas clusters upgrade
Upgrade shared (M0–M50) clusters: change tier, disk size, MongoDB major version, termination protection, tags, or use a JSON config. Requires Project Cluster Manager; unsupported for dedicated clusters.

</section>
<section>
<title>atlas clusters watch</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-clusters-watch/</url>

# atlas clusters watch

Polls the specified cluster until its state is **IDLE**, then prints  
`Cluster available.` Blocks terminal; cancel with `Ctrl-C`. Requires Project Read Only access.

```
atlas clusters watch <clusterName> [--projectId <projId>] [-P <profile>]
```

Arguments  
• **clusterName** (string, required) — target cluster name.

Options  
• **--projectId** hex string — overrides default project.  
• **-P, --profile** name — config profile.  
• **-h, --help** — show help.

Example  
```bash
atlas clusters watch myCluster --projectId 5e2211c17a3e5a48f5497de3
```

</section>
<section>
<title>atlas completion</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-completion/</url>

# atlas completion

Generate shell autocompletion scripts for `atlas`.

```
atlas completion <bash|fish|powershell|zsh> [--profile <name>]
```

Options  
- `-h, --help` Show help  
- `-P, --profile string` Use named profile  

Sub-commands (high-level)  
- `atlas completion bash` Bash script  
- `atlas completion fish` Fish script  
- `atlas completion powershell` PowerShell script  
- `atlas completion zsh` Zsh script

</section>
<section>
<title>atlas completion bash</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-completion-bash/</url>

# atlas completion bash

Generate Bash autocompletion (needs `bash-completion`).

```bash
atlas completion bash [--no-descriptions] [-h] [-P profile]
```

Load once: `source <(atlas completion bash)`  
Persist:  
• Linux  `atlas completion bash > /etc/bash_completion.d/atlas`  
• macOS  `atlas completion bash > /usr/local/etc/bash_completion.d/atlas`

Options  
- `--no-descriptions`  Disable hint text  
- `-h, --help`  Help  
- `-P, --profile <name>` Config profile

</section>
<section>
<title>atlas completion fish</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-completion-fish/</url>

# atlas completion fish  
Generate fish shell autocompletion script for the Atlas CLI.

</section>
<section>
<title>atlas completion powershell</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-completion-powershell/</url>

# atlas completion powershell

Create Powershell autocomplete script.  
Load in current session:  
```powershell
atlas completion powershell | Out-String | Invoke-Expression
```  
Persist for all sessions: append the above output to your Powershell profile.

</section>
<section>
<title>atlas completion zsh</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-completion-zsh/</url>

# atlas completion zsh  
Generates zsh completion script for Atlas CLI tab-completion.

</section>
<section>
<title>atlas config</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-config/</url>

# atlas config

Manage user profiles for Atlas CLI.  
All profile fields optional; set via:
```bash
atlas config set <key> <value>
# or env vars: MONGODB_ATLAS_*
```
Docs: https://dochub.mongodb.org/core/atlas-cli-env-variables  

Options  
- `-P, --profile <name>`: use named profile  
- `-h, --help`: show help  

Sub-commands  
- `delete` Remove profile  
- `describe` Show profile  
- `edit` Open config in editor  
- `init` Interactive profile setup  
- `list` List profiles  
- `rename` Rename profile  
- `set` Set specific keys

</section>
<section>
<title>atlas config delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-config-delete/</url>

# atlas config delete  
Delete the named Atlas CLI profile; optional `--force` skips confirmation.

</section>
<section>
<title>atlas config describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-config-describe/</url>

# atlas config describe
Return the specified Atlas CLI profile.

</section>
<section>
<title>atlas config edit</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-config-edit/</url>

# atlas config edit

Open the CLI config in your default editor ($EDITOR/$VISUAL).

```bash
atlas config edit [-h] [-P profile]
```

Options  
- `-h` help  
- `-P, --profile <name>` use specified profile  

Example  
```bash
atlas config edit
```

</section>
<section>
<title>atlas config init</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-config-init/</url>

# atlas config init

Set up a local profile with Atlas credentials.

```bash
atlas config init [--gov] [-P <profile>] [-h]
```

Options  
• --gov Create default Atlas Gov profile  
• -P, --profile <name> Use specified profile (inherited)  
• -h, --help Show help  

Examples  
```bash
atlas config init          # Atlas
atlas config init --gov    # Atlas for Government
```

</section>
<section>
<title>atlas config list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-config-list/</url>

# atlas config list

List saved CLI profiles; unnamed profile shows as *default*.

```bash
atlas config list [--output json|json-path|go-template|go-template-file] [-P/--profile <name>]
```

Flags  
- `-o, --output` Choose output format (use `json` for full).  
- `-P, --profile` Profile to operate on.  
- `-h, --help` Show help.

Example  
```bash
atlas config ls
```

</section>
<section>
<title>atlas config rename</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-config-rename/</url>

# atlas config rename

Rename a stored Atlas CLI profile.

```bash
atlas config rename <oldProfileName> <newProfileName> [-P <profile>] [-h]
```

Args:  
• oldProfileName – current name (req)  
• newProfileName – new name (req)

Options:  
• -P/--profile string – profile for this op  
• -h/--help – show help

Example:
```bash
atlas config rename myProfile testProfile
```

</section>
<section>
<title>atlas config set</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-config-set/</url>

# atlas config set

Configure a profile property.

```sh
atlas config set <propertyName> <value> [-P profile] [--help]
```

propertyName:  
`project_id | org_id | service | public_api_key | private_api_key | output | mongosh_path | skip_update_check | telemetry_enabled | access_token | refresh_token`  
value: string.  
-P/--profile: select profile.

Example
```sh
atlas config set org_id 5dd5aaef7a3e5a6c5bd12de4
```

</section>
<section>
<title>atlas customDbRoles</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-customDbRoles/</url>

# atlas customDbRoles

Manage custom database roles in a project.

Options  
`-h, --help` Show help  
`-P, --profile <name>` Use config profile

Subcommands  
• `atlas customDbRoles create` Create role  
• `atlas customDbRoles delete` Delete role  
• `atlas customDbRoles describe` Show one role  
• `atlas customDbRoles list` List roles  
• `atlas customDbRoles update` Update role

</section>
<section>
<title>atlas customDbRoles create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-customDbRoles-create/</url>

# atlas customDbRoles create

Create a custom DB role (Project Owner auth).

```sh
atlas customDbRoles create <roleName> \
  [--privilege <action[@db[.coll]]>] \
  [--inheritedRole <role@db>] \
  [--projectId <id>] \
  [-o json|json-path|go-template|go-template-file] \
  [-P <profile>]
```

Key flags  
• `--privilege`  Comma-separated actions; omit db/coll for cluster scope.  
• `--inheritedRole`  Comma-separated role@db pairs.  
• `--projectId`  Override cfg/env project.  
• `-o`  Output format.  
• `-P`  Config profile.  

Success:  
```
Custom database role '<RoleName>' successfully created.
```

Examples  
```sh
atlas customDbRoles create customRole \
  --privilege FIND@myDB,UPDATE@myDB.myColl

atlas customDbRoles create customRole \
  --privilege GET_CMD_LINE_OPTS

atlas customDbRoles create customRole \
  --inheritedRole read@myDB
```

</section>
<section>
<title>atlas customDbRoles delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-customDbRoles-delete/</url>

# atlas customDbRoles delete

Delete a custom DB role (Project Owner auth).

```bash
atlas customDbRoles delete <roleName> [--force] [--projectId ID] [-P profile]
```

Args  
• **roleName** (string, required): role to remove.

Options  
• **--force** Skip confirm  
• **--projectId** Hex project ID  
• **-P/--profile** Config profile  
• **-h/--help** Help

Success:  
`Custom database role '<Name>' deleted`

</section>
<section>
<title>atlas customDbRoles describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-customDbRoles-describe/</url>

# atlas customDbRoles describe

`atlas customDbRoles describe <roleName>` – Retrieve one custom DB role for the current/`--projectId` project (requires Project Read Only access).

</section>
<section>
<title>atlas customDbRoles list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-customDbRoles-list/</url>

# atlas customDbRoles list  
List project custom DB roles (requires Project Read Only or API key).

</section>
<section>
<title>atlas customDbRoles update</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-customDbRoles-update/</url>

# atlas customDbRoles update

Update a project custom DB role (Project Owner or API Key required).

```bash
atlas customDbRoles update <roleName> \
  [--append] \
  [--inheritedRole role@db ...] \
  [--privilege action@db[.coll] ...] \
  [-o json|json-path|go-template|go-template-file] \
  [--projectId ID] \
  [-P profile]
```

Arguments  
• roleName (string, required) – role to modify.

Flags  
• --append    – add given privileges/inheritedRoles instead of replacing.  
• --inheritedRole strings – new list of inherited roles (db.role); replaces unless --append.  
• --privilege strings – new list of action scopes; replaces unless --append.  
• -o/--output – output format.  
• --projectId – override project.  
• -P/--profile – config profile.

Success:  
`Custom database role '<RoleName>' successfully updated.`

</section>
<section>
<title>atlas customDns</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-customDns/</url>

# atlas customDns

Manage DNS settings for Atlas project clusters on AWS.

Options  
- `-h, --help` – show help  
Inherited: `-P, --profile <name>` – use config profile.

Subcommand  
- `atlas customDns aws` – DNS management for AWS-deployed clusters.

</section>
<section>
<title>atlas customDns aws</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-customDns-aws/</url>

# atlas customDns aws

Manage custom DNS for Atlas clusters on AWS.

Subcommands  
- describe – show current config  
- disable – turn off custom DNS  
- enable – turn on custom DNS  

Inherited option  
`-P, --profile <name>` – use saved CLI profile

</section>
<section>
<title>atlas customDns aws describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-customDns-aws-describe/</url>

# atlas customDns aws describe  
Shows custom DNS settings for an AWS-deployed Atlas cluster in the target project (Project Read Only access required).

</section>
<section>
<title>atlas customDns aws disable</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-customDns-aws-disable/</url>

# atlas customDns aws disable

Disable custom DNS on an AWS-hosted Atlas cluster in the specified project. Requires Project Owner authentication.

```bash
atlas customDns aws disable [options]
```

Success message:  
```
DNS configuration disabled.
```

</section>
<section>
<title>atlas customDns aws enable</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-customDns-aws-enable/</url>

# atlas customDns aws enable

Enable a project's custom DNS for an Atlas cluster on AWS.  
Syntax: `atlas customDns aws enable [options]`.  
Requires Project Owner/API key. Success message: `DNS configuration enabled.`

</section>
<section>
<title>atlas dataFederation</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-dataFederation/</url>

# atlas dataFederation

Manage Data Federation databases.

**Options**  
`-h, --help` Show help  
`-P, --profile <name>` Use named Atlas CLI profile

**Subcommands**  
create · delete · describe · list · logs · privateEndpoints · queryLimits · update

</section>
<section>
<title>atlas dataFederation create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-dataFederation-create/</url>

# atlas dataFederation create
Creates a Data Federation database (Project Owner auth required).

</section>
<section>
<title>atlas dataFederation delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-dataFederation-delete/</url>

# atlas dataFederation delete

Delete a data federation database from the project (Project Owner required).  
`atlas dataFederation delete <name> [--projectId <id>] [--force]` → `'<name>' deleted`.

</section>
<section>
<title>atlas dataFederation describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-dataFederation-describe/</url>

# atlas dataFederation describe  
Show details of a specified data federation database in the current or given project (Project Owner role required).

</section>
<section>
<title>atlas dataFederation list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-dataFederation-list/</url>

# atlas dataFederation list
List all Data Federation databases in a project (auth: user/API key with Project Read Only role).

</section>
<section>
<title>atlas dataFederation logs</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-dataFederation-logs/</url>

# atlas dataFederation logs

`atlas dataFederation logs <name> [opts]` — Download logs for the specified Data Federation database within the project (requires Project Read Only role).

</section>
<section>
<title>atlas dataFederation privateEndpoints</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-dataFederation-privateEndpoints/</url>

# atlas dataFederation privateEndpoints

Manage Data Federation private endpoints.

Subcommands:  
- create – Add a private endpoint  
- delete – Remove a private endpoint  
- describe – Show details of a private endpoint  
- list – List all private endpoints

</section>
<section>
<title>atlas dataFederation privateEndpoints create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-dataFederation-privateEndpoints-create/</url>

# atlas dataFederation privateEndpoints create

Creates a Data Federation private endpoint (`atlas dataFederation privateEndpoints create <endpointId> [options]`). Requires Project Owner/API key. Returns confirmation on success.

</section>
<section>
<title>atlas dataFederation privateEndpoints delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-dataFederation-privateEndpoints-delete/</url>

# atlas dataFederation privateEndpoints delete

Remove a data federation private endpoint. Requires Project Owner auth.

`atlas dataFederation privateEndpoints delete <endpointId> [--force] [--projectId ID] [-P profile]`

Output: `'<Name>' deleted`

</section>
<section>
<title>atlas dataFederation privateEndpoints describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-dataFederation-privateEndpoints-describe/</url>

# atlas dataFederation privateEndpoints describe  
Show details of a specified Data Federation private endpoint in the current or given Atlas project.

</section>
<section>
<title>atlas dataFederation privateEndpoints list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-dataFederation-privateEndpoints-list/</url>

# atlas dataFederation privateEndpoints list

Lists all data federation private endpoints in the current or specified project. Auth: user/API key with Project Read Only role.

</section>
<section>
<title>atlas dataFederation queryLimits</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-dataFederation-queryLimits/</url>

# atlas dataFederation queryLimits

High-level wrapper for managing Data Federation query limits.

Subcommands:  
• `create` – add a limit  
• `delete` – remove a limit  
• `describe` – show one limit  
• `list` – list all limits

</section>
<section>
<title>atlas dataFederation queryLimits create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-dataFederation-queryLimits-create/</url>

# atlas dataFederation queryLimits create

Create a Data Federation query limit (Project Owner auth).

```bash
atlas dataFederation queryLimits create <name> \
  --dataFederation <FDI_ID> \
  --value <int> \
  [--overrunPolicy <action>] \
  [--projectId <projId>] \
  [--output json|json-path|go-template|go-template-file] \
  [--profile <cfg_profile>]
```

Fields  
• `name` (string, req): limit ID  
• `--dataFederation` (string, req): Federated DB Instance ID  
• `--value` (int, req): limit value  
• `--overrunPolicy` (string): action on exceed  
• `--projectId` (string): override project  
• `--output` (string): formatting  
• `--profile` (string): config profile  

Success: `Data federation query limit <Name> created.`

Example
```bash
atlas dataFederation queryLimits create bytesProcessed.query \
  --value 1000 --dataFederation DataFederation1
```

</section>
<section>
<title>atlas dataFederation queryLimits delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-dataFederation-queryLimits-delete/</url>

# atlas dataFederation queryLimits delete

Delete a specified Data Federation query limit from a project (Project Owner role required).

```bash
atlas dataFederation queryLimits delete <name> --dataFederation <instance> [--force] [--projectId <id>] [-P <profile>]
```

Success output:  
`'<Name>' deleted`

</section>
<section>
<title>atlas dataFederation queryLimits describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-dataFederation-queryLimits-describe/</url>

# atlas dataFederation queryLimits describe  
Show a single data federation query limit. Requires Project Owner auth.  
Syntax:  
```bash
atlas dataFederation queryLimits describe <name> --dataFederation <instanceId> [--projectId <id>]
```

</section>
<section>
<title>atlas dataFederation queryLimits list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-dataFederation-queryLimits-list/</url>

# atlas dataFederation queryLimits list

Lists all query limits for a specified Federated Database Instance in the current or given project (Project Read Only access required).

</section>
<section>
<title>atlas dataFederation update</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-dataFederation-update/</url>

# atlas dataFederation update

Modify an Atlas data federation database’s config (region, AWS role / test bucket, or JSON file). Requires Project Owner privileges.

</section>
<section>
<title>atlas dbusers</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-dbusers/</url>

# atlas dbusers

Manage MongoDB database users in a project; roles apply to all clusters.

**Options**  
`-h, --help` Show help  

**Inherited**  
`-P, --profile <name>` Profile from config file  

**Subcommands (overview only)**  
- `atlas dbusers certs` Manage x509 certs for DB users  
- `atlas dbusers create` Create a DB user  
- `atlas dbusers delete` Delete a DB user  
- `atlas dbusers describe` Show details of a DB user  
- `atlas dbusers list` List project DB users  
- `atlas dbusers update` Modify a DB user

</section>
<section>
<title>atlas dbusers certs</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-dbusers-certs/</url>

# atlas dbusers certs

Manage Atlas-managed X.509 certificates for database users.  
Subcommands:  
• **create** – generate new certificate.  
• **list** – list unexpired certificates.

</section>
<section>
<title>atlas dbusers certs create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-dbusers-certs-create/</url>

# atlas dbusers certs create
Generates a new Atlas-managed X.509 certificate for a specified database user who authenticates via X.509. Not available when using self-managed CAs. Default validity is 3 months (configurable).

</section>
<section>
<title>atlas dbusers certs list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-dbusers-certs-list/</url>

# atlas dbusers certs list
Returns unexpired Atlas-managed X.509 certificates for the specified database user (Atlas CA, X.509 auth only).

</section>
<section>
<title>atlas dbusers create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-dbusers-create/</url>

# atlas dbusers create

Create a database user in a project.  
Default auth: SCRAM-SHA; override with --ldapType, --x509Type, --oidcType, or --awsIAMType (USER/ROLE etc.). Other flags let you set roles, scopes, password, deleteAfter, description, output, and projectId. Requires Project Owner role. Success message: “Database user '<Username>' successfully created.”

</section>
<section>
<title>atlas dbusers delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-dbusers-delete/</url>

# atlas dbusers delete

Delete a database user from a project (Project Owner auth required).  
Usage: `atlas dbusers delete <username> [--authDB <admin|$external>] [--force] [--projectId <id>]`.  
Returns: `DB user '<Name>' deleted`.

</section>
<section>
<title>atlas dbusers describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-dbusers-describe/</url>

# atlas dbusers describe

Get details of one database user.

```
atlas dbusers describe <username> \
  [--authDB admin|$external] [--projectId <id>] \
  [-o json|json-path|go-template|go-template-file] [-P <profile>]
```

username required.  
--authDB auth DB: admin (SCRAM, default) or $external (AWS-IAM, x.509, LDAP).  
--projectId override current project.  
-o output format.  
-P config profile.

Output:  
```
USERNAME   DATABASE
<user>     <authDB>
```

Examples  
SCRAM: `atlas dbusers describe myDbUser --authDB admin -o json`  
AWS IAM: `atlas dbusers describe arn:aws:iam::123:user/u --authDB \$external -o json`  
x.509: `atlas dbusers describe "CN=ellen...,DC=com" --authDB \$external -o json`

</section>
<section>
<title>atlas dbusers list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-dbusers-list/</url>

# atlas dbusers list  
List all database users in the current or specified project (requires Project Read Only role).

</section>
<section>
<title>atlas dbusers update</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-dbusers-update/</url>

# atlas dbusers update

Modify an existing Atlas DB user. Requires Project Owner credentials.

```bash
atlas dbusers update <username> [options]
```

Argument  
• `<username>` – DB username to change.

Key options  
• `--authDB <name>` – Auth DB: `$external` (AWS IAM/x509/LDAP) or `admin` (SCRAM).  
• `--password <pwd>` – New password.  
• `--role <role[@db[.coll]]>`… – Replace roles.  
• `--scope <cluster,…>` – Replace allowed clusters.  
• `--x509Type {NONE|MANAGED|CUSTOMER}` – X.509 auth method.  
• `--desc <txt>` – User description.  
• `--projectId <id>` – Override current project.  
• `-o, --output {json|json-path|go-template|go-template-file}`  
• `-P, --profile <name>` – Config profile.  
• `-h` – Help.

Output  
`Successfully updated database user '<Username>'.`

Examples
```bash
# Change roles
atlas dbusers update myUser --role readWriteAnyDatabase --projectId 5e2211c17a3e5a48f5497de3

# Change scopes
atlas dbusers update myUser --scope resourceName:resourceType --projectId 5e2211c17a3e5a48f5497de3
```

</section>
<section>
<title>atlas deployments</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-deployments/</url>

# atlas deployments

Manage local or Atlas deployments.

## Options
- `-h, --help` Show command help  
- `-P, --profile <name>` Use specified profile (see Atlas CLI config docs)

## Subcommands (overview)
- `connect` Connect to running deployment (start first if paused)  
- `delete` Remove deployment  
- `list` List all deployments  
- `logs` Retrieve deployment logs  
- `pause` Pause deployment  
- `search` Manage search features  
- `setup` Create local deployment  
- `start` Start deployment

</section>
<section>
<title>atlas deployments connect</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-deployments-connect/</url>

# atlas deployments connect
Connect to a local or Atlas deployment (start it first if paused).

</section>
<section>
<title>atlas deployments delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-deployments-delete/</url>

# atlas deployments delete

Delete an Atlas or Local deployment (removes snapshots/volumes). Requires Project Owner auth. Prompts unless `--force`.

```bash
atlas deployments delete [deploymentName] --type ATLAS|LOCAL [--force] [--projectId ID] [-w|--watch] [--watchTimeout N] [-P profile]
```

args  
• deploymentName (optional)

flags  
• --type ATLAS|LOCAL deployment kind  
• --force no prompt  
• --projectId ID override project  
• -w/--watch block until done  
• --watchTimeout N sec  
• -P/--profile name  
• -h/--help

Output: `Deployment '<Name>' deleted`

```bash
atlas deployments delete myDeployment --type ATLAS
atlas deployments delete myDeployment --type ATLAS --force
atlas deployments delete myDeployment --type LOCAL --force
```

</section>
<section>
<title>atlas deployments list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-deployments-list/</url>

# atlas deployments list

Lists all deployments in a project.  
Key flags: `--projectId`, `--profile`.  
Output columns: `NAME`, `TYPE`, `MDB VER`, `STATE`.

</section>
<section>
<title>atlas deployments logs</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-deployments-logs/</url>

# atlas deployments logs  
Download deployment log files (e.g., mongodb.gz, audit) for Atlas or LOCAL deployments; supports time-range and host filtering.

</section>
<section>
<title>atlas deployments pause</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-deployments-pause/</url>

# atlas deployments pause

Suspend an Atlas or LOCAL deployment.  
`atlas deployments pause <deploymentName> [options]`

</section>
<section>
<title>atlas deployments search</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-deployments-search/</url>

# atlas deployments search

Manage search for cloud & local deployments.

**Options**  
- `-h, --help`  Show help.  

**Inherited**  
- `-P, --profile <name>`  Use config profile.

**Related**  
- `atlas deployments search indexes` – manage search indexes.

</section>
<section>
<title>atlas deployments search indexes</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-deployments-search-indexes/</url>

# atlas deployments search indexes  
Manage cloud/local search indexes for a deployment (create, delete, describe, list).

</section>
<section>
<title>atlas deployments search indexes create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-deployments-search-indexes-create/</url>

# atlas deployments search indexes create

Create an Atlas Search / Vector Search index on a deployment.

```
atlas deployments search indexes create [indexName] \
  [--file <config.json> | --db <db> --collection <coll>] \
  [--deploymentName <name>] [flags]
```

</section>
<section>
<title>atlas deployments search indexes delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-deployments-search-indexes-delete/</url>

# atlas deployments search indexes delete  
Delete a specified search index from a deployment.

</section>
<section>
<title>atlas deployments search indexes describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-deployments-search-indexes-describe/</url>

# atlas deployments search indexes describe  
Describe a search index for a specified deployment.

</section>
<section>
<title>atlas deployments search indexes list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-deployments-search-indexes-list/</url>

# atlas deployments search indexes list  
List all Atlas Search indexes for a deployment.

</section>
<section>
<title>atlas deployments setup</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-deployments-setup/</url>

# atlas deployments setup

Create Atlas or LOCAL deployment.

```bash
atlas deployments setup [deploymentName] [options]
```

Arguments  
• deploymentName [string] – optional name.

Options  
• --accessListIp strings – add specific IPs (excl. --currentIp)  
• --bindIpAll – bind on 0.0.0.0 instead of 127.0.0.1  
• --connectWith compass|mongosh|skip (excl. --skipMongosh)  
• --currentIp – add caller IP (excl. --accessListIp)  
• --enableTerminationProtection – block deletes  
• --force – skip prompts, use defaults  
• --initdb string – host folder to init LOCAL deployment  
• --mdbVersion string – MongoDB major version  
• --password string / --username string – DB credentials  
• --port int – server listen port  
• --projectId string – override project  
• --provider AWS|AZURE|GCP  
• -r, --region string – cloud region  
• --skipSampleData – don’t load sample data  
• --tag key=value – list of tags  
• --tier string – cluster tier (default M0)  
• --type ATLAS|LOCAL  
• -h, --help – show help

Inherited  
• -P, --profile string – config profile name.

</section>
<section>
<title>atlas deployments start</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-deployments-start/</url>

# atlas deployments start

Start a stopped ATLAS or LOCAL deployment.  
`atlas deployments start <deploymentName> [--projectId <id>]`

</section>
<section>
<title>atlas events</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-events/</url>

# atlas events

Manage organization or project events.

```
-h, --help            Show help
-P, --profile string  Use named configuration profile
```

Related  
- `atlas events organizations` – org events  
- `atlas events projects` – project events

</section>
<section>
<title>atlas events organizations</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-events-organizations/</url>

# atlas events organizations

List organization events.  
Subcommand: `atlas events organizations list` – retrieves events for a specified organization.

</section>
<section>
<title>atlas events organizations list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-events-organizations-list/</url>

# atlas events organizations list
Lists events in an organization. Key flags:  
• `--orgId` override profile org.  
• `--minDate/--maxDate` ISO-8601 UTC range.  
• `--type` (eventTypeName enum).  
• Pagination: `--limit` (≤500, default 100), `--page`, `--omitCount`.  
• Output: `-o json|json-path|go-template|go-template-file`.  
• `-P/--profile` choose saved connection.

</section>
<section>
<title>atlas events projects</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-events-projects/</url>

# atlas events projects
Group for project event operations.  
Subcommands:  
• `atlas events projects list` — list all events for a project.

</section>
<section>
<title>atlas events projects list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-events-projects-list/</url>

# atlas events projects list  
List events for a project; supports pagination, date range, event type, output format, and project/profile selectors.

</section>
<section>
<title>atlas federatedAuthentication</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-federatedAuthentication/</url>

# atlas federatedAuthentication

Manage Atlas Federated Authentication.

**Options**  
`-h, --help` Show help  
`-P, --profile <name>` Use specified config profile  

Related: `atlas federatedAuthentication federationSettings` – manage federation settings.

</section>
<section>
<title>atlas federatedAuthentication federationSettings</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-federatedAuthentication-federationSettings/</url>

# atlas federatedAuthentication federationSettings

Manage Atlas Federated Authentication Federation Settings.

Subcommands  
• connectedOrgConfigs – manage connected org configs  
• describe – show federation settings details  
• identityProvider – manage identity providers

</section>
<section>
<title>atlas federatedAuthentication federationSettings connectedOrgConfigs</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-federatedAuthentication-federationSettings-connectedOrgConfigs/</url>

# atlas federatedAuthentication federationSettings connectedOrgConfigs

Manage Federated Authentication “connected org” configs.

Subcommands:  
• connect – link IdP to org  
• delete – remove config  
• describe – show config  
• disconnect – unlink IdP from org  
• list – list configs  
• update – modify config

</section>
<section>
<title>atlas federatedAuthentication federationSettings connectedOrgConfigs connect</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-federatedAuthentication-federationSettings-connectedOrgConfigs-connect/</url>

# atlas federatedAuthentication federationSettings connectedOrgConfigs connect
Links an Identity Provider (OIDC/SAML) to an Atlas Organization using the specified federationSettingsId and identityProviderId.

</section>
<section>
<title>atlas federatedAuthentication federationSettings connectedOrgConfigs delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-federatedAuthentication-federationSettings-connectedOrgConfigs-delete/</url>

# atlas federatedAuthentication federationSettings connectedOrgConfigs delete

Remove a connected organization configuration from specified federation settings.

</section>
<section>
<title>atlas federatedAuthentication federationSettings connectedOrgConfigs describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-federatedAuthentication-federationSettings-connectedOrgConfigs-describe/</url>

# atlas federatedAuthentication federationSettings connectedOrgConfigs describe
Return details of a connected organization configuration within specified federation settings.

</section>
<section>
<title>atlas federatedAuthentication federationSettings connectedOrgConfigs disconnect</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-federatedAuthentication-federationSettings-connectedOrgConfigs-disconnect/</url>

# atlas federatedAuthentication federationSettings connectedOrgConfigs disconnect

Detach an organization from a linked Identity Provider within federation settings.

</section>
<section>
<title>atlas federatedAuthentication federationSettings connectedOrgConfigs list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-federatedAuthentication-federationSettings-connectedOrgConfigs-list/</url>

# atlas federatedAuthentication federationSettings connectedOrgConfigs list

Lists connected organization configurations for a specified Federation Settings ID.

</section>
<section>
<title>atlas federatedAuthentication federationSettings connectedOrgConfigs update</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-federatedAuthentication-federationSettings-connectedOrgConfigs-update/</url>

# atlas federatedAuthentication federationSettings connectedOrgConfigs update

Update a single organization’s connected configuration within specified federation settings.

</section>
<section>
<title>atlas federatedAuthentication federationSettings describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-federatedAuthentication-federationSettings-describe/</url>

# atlas federatedAuthentication federationSettings describe
Fetch Federation Settings for an organization. Requires user/API key with Organization Owner role.

</section>
<section>
<title>atlas federatedAuthentication federationSettings identityProvider</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-federatedAuthentication-federationSettings-identityProvider/</url>

# atlas federatedAuthentication federationSettings identityProvider

Manage federated authentication identity providers.

Subcommands:  
• create – add an IdP  
• delete – remove an IdP  
• describe – show IdP details  
• list – list IdPs  
• revokeJwk – revoke IdP JWK  
• update – modify IdP

</section>
<section>
<title>atlas federatedAuthentication federationSettings identityProvider create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-federatedAuthentication-federationSettings-identityProvider-create/</url>

# atlas federatedAuthentication federationSettings identityProvider create
Create Federated Authentication identity providers.  
Subcommand: `atlas federatedAuthentication federationSettings identityProvider create oidc` – create OIDC provider.

</section>
<section>
<title>atlas federatedAuthentication federationSettings identityProvider create oidc</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-federatedAuthentication-federationSettings-identityProvider-create-oidc/</url>

# atlas federatedAuthentication federationSettings identityProvider create oidc

Create an OIDC identity provider.

</section>
<section>
<title>atlas federatedAuthentication federationSettings identityProvider delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-federatedAuthentication-federationSettings-identityProvider-delete/</url>

# atlas federatedAuthentication federationSettings identityProvider delete

Delete an identity provider from your federation settings. Requires `identityProviderId`, `--federationSettingsId`, Org Owner auth; supports `--force` and standard output/profile flags.

</section>
<section>
<title>atlas federatedAuthentication federationSettings identityProvider describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-federatedAuthentication-federationSettings-identityProvider-describe/</url>

# atlas federatedAuthentication federationSettings identityProvider describe
Describe an identity provider under specified federation settings.  
Usage:  
```bash
atlas federatedAuthentication federationSettings identityProvider describe <identityProviderId> --federationSettingsId <federationSettingsId>
```  
Requires Org Owner-level auth. Outputs columns: ID, DISPLAY NAME, ISSUER URI, CLIENT ID, IDP TYPE.

</section>
<section>
<title>atlas federatedAuthentication federationSettings identityProvider list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-federatedAuthentication-federationSettings-identityProvider-list/</url>

# atlas federatedAuthentication federationSettings identityProvider list

List identity providers registered in specified federation settings. Requires Org Owner auth and `--federationSettingsId`. Supports optional type/protocol filters and pagination. Returns columns: ID, DISPLAY NAME, ISSUER URI, CLIENT ID, IDP TYPE.

</section>
<section>
<title>atlas federatedAuthentication federationSettings identityProvider revokeJwk</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-federatedAuthentication-federationSettings-identityProvider-revokeJwk/</url>

# atlas federatedAuthentication federationSettings identityProvider revokeJwk  
Revokes a JWK from the specified identity provider within federation settings (Org Owner auth required).

</section>
<section>
<title>atlas federatedAuthentication federationSettings identityProvider update</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-federatedAuthentication-federationSettings-identityProvider-update/</url>

# atlas federatedAuthentication federationSettings identityProvider update

Updates federated auth identity providers.  
Subcommand: `oidc` – update an OIDC provider.

</section>
<section>
<title>atlas federatedAuthentication federationSettings identityProvider update oidc</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-federatedAuthentication-federationSettings-identityProvider-update-oidc/</url>

# atlas federatedAuthentication federationSettings identityProvider update oidc

Update an existing OIDC identity provider in the given federation settings.

</section>
<section>
<title>atlas integrations</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-integrations/</url>

# atlas integrations

Configure third-party integrations for an Atlas project.

```bash
atlas integrations [--profile <name>] [-h]
```

Options:  
`-h, --help` Show help.  
Inherited: `-P, --profile <string>` Config profile.

Subcommands: create | delete | describe | list

</section>
<section>
<title>atlas integrations create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-integrations-create/</url>

# atlas integrations create

Create/update project integrations.

Subcommands: `DATADOG`, `OPS_GENIE`, `PAGER_DUTY`, `VICTOR_OPS`, `WEBHOOK`.

</section>
<section>
<title>atlas integrations create DATADOG</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-integrations-create-DATADOG/</url>

# atlas integrations create DATADOG
Create/modify Datadog integration for an Atlas project (M10+ clusters). Requires Project Owner or Org Owner auth. Sends Atlas metrics to Datadog.

</section>
<section>
<title>atlas integrations create OPS_GENIE</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-integrations-create-OPS_GENIE/</url>

# atlas integrations create OPS_GENIE  
Create or update an Opsgenie integration for a project. Requires Org/Project Owner auth.

</section>
<section>
<title>atlas integrations create PAGER_DUTY</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-integrations-create-PAGER_DUTY/</url>

# atlas integrations create PAGER_DUTY
Create / update a project’s PagerDuty integration. Requires Org Owner or Project Owner auth and `--serviceKey`.

</section>
<section>
<title>atlas integrations create VICTOR_OPS</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-integrations-create-VICTOR_OPS/</url>

# atlas integrations create VICTOR_OPS

Create or update a Splunk On-Call (VictorOps) integration for an Atlas project. Requires Org/Project Owner privileges and authentication with a user or Project Owner API key.

</section>
<section>
<title>atlas integrations create WEBHOOK</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-integrations-create-WEBHOOK/</url>

# atlas integrations create WEBHOOK

Create or update a project webhook integration (Org/Project Owner credentials required).

</section>
<section>
<title>atlas integrations delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-integrations-delete/</url>

# atlas integrations delete

Delete a 3rd-party integration from a project. Requires Project Owner.

```bash
atlas integrations delete <integrationType> [--force] [--projectId <id>] [-P <profile>]
```

integrationType: PAGER_DUTY | MICROSOFT_TEAMS | SLACK | DATADOG | NEW_RELIC | OPS_GENIE | VICTOR_OPS | WEBHOOK | PROMETHEUS

Options  
--force skip confirmation  
--projectId override project  
-P profile to use  

Output  
Integration '<Name>' deleted  

Example  
```bash
atlas integrations delete DATADOG --projectId 5e2211c17a3e5a48f5497de3
```

</section>
<section>
<title>atlas integrations describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-integrations-describe/</url>

# atlas integrations describe
Show details of a project’s third-party integration (e.g., DATADOG, SLACK, PAGER_DUTY). Requires Project Owner auth.

</section>
<section>
<title>atlas integrations list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-integrations-list/</url>

# atlas integrations list
List all active third-party integrations for the current or specified Atlas project (requires Project Owner auth).

</section>
<section>
<title>atlas kubernetes</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-kubernetes/</url>

# atlas kubernetes

Manage Atlas Kubernetes resources.

Options  
`-h, --help` Show help  
`-P, --profile <name>` Config profile to use  

Sub-commands  
• `atlas kubernetes config` – Manage K8s configs  
• `atlas kubernetes operator` – Manage Atlas K8s Operator

</section>
<section>
<title>atlas kubernetes config</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-kubernetes-config/</url>

# atlas kubernetes config

Manage K8s config resources for Atlas.

```
atlas kubernetes config [apply|generate] [options]
```

Subcommands  
- apply Generate + kubectl-apply resources for Atlas K8s Operator  
- generate Generate resources only  

Options  
```
-h, --help           Show help
-P, --profile <str>  Use named profile
```

</section>
<section>
<title>atlas kubernetes config apply</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-kubernetes-config-apply/</url>

# atlas kubernetes config apply

Generate Kubernetes manifests for Atlas projects, deployments, and users, then `kubectl apply` them so they’re managed by Atlas Kubernetes Operator.  
Flags let you choose project/org, specific cluster names, target namespace, operator version, kube config/context, and CLI profile.

</section>
<section>
<title>atlas kubernetes config generate</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-kubernetes-config-generate/</url>

# atlas kubernetes config generate

Exports Atlas resources (Project, Deployments/Clusters, DatabaseUsers, DataFederations, optional Secrets) as Kubernetes manifests for the Atlas Kubernetes Operator (default v2.7.0). Flags let you filter by cluster/data-federation name, set target namespace, include secrets, use external IDs, pick org/project IDs or profile.

</section>
<section>
<title>atlas kubernetes operator</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-kubernetes-operator/</url>

# atlas kubernetes operator

Manage the Atlas Kubernetes Operator.  
Subcommands:  
• `atlas kubernetes operator install` – install the Operator in a cluster.

</section>
<section>
<title>atlas kubernetes operator install</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-kubernetes-operator-install/</url>

# atlas kubernetes operator install

Installs the Atlas Kubernetes Operator in an existing cluster.

Key behavior  
• Generates an Atlas Admin API key, stores it as a Kubernetes secret; scoped to project if `--projectName` is set, otherwise to the org.  
• Can import current Atlas resources for Operator management (`--import`).  
• Supports Atlas for Government (`--atlasGov`).  
• Optional selection of operator version, kubeconfig/context, target & watch namespaces, org/project IDs.  
• Deletion-protection flags toggle cleanup safeguards for resources or sub-resources.  
• Inherits global `--profile`.

Syntax  
`atlas kubernetes operator install [options]`

</section>
<section>
<title>atlas liveMigrations</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-liveMigrations/</url>

# atlas liveMigrations

Manage organization-level Atlas Live Migrations.

Options  
`-h, --help` Show help.

Inherited  
`-P, --profile <name>` Use config profile.

Related  
- `atlas liveMigrations create` – create push migration.  
- `atlas liveMigrations cutover` – start/confirm cutover.  
- `atlas liveMigrations describe` – show job.  
- `atlas liveMigrations link` – manage link-token.  
- `atlas liveMigrations validation` – manage validation job.

</section>
<section>
<title>atlas liveMigrations create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-liveMigrations-create/</url>

# atlas liveMigrations create

Start a push live migration that moves data from a Cloud/Ops Manager cluster to an Atlas destination cluster. (For scripted migrations, use `mongomirror`.)

</section>
<section>
<title>atlas liveMigrations cutover</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-liveMigrations-cutover/</url>

# atlas liveMigrations cutover

Starts the cutover phase for a push live migration (`--liveMigrationId`). Once complete, the source → Atlas sync stops, finalizing migration. Returns: “Cutover process successfully started.” For scripted migrations, prefer `mongomirror`.

</section>
<section>
<title>atlas liveMigrations describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-liveMigrations-describe/</url>

# atlas liveMigrations describe  
Return details for a push live migration job.

</section>
<section>
<title>atlas liveMigrations link</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-liveMigrations-link/</url>

# atlas liveMigrations link
Manage organization link-tokens for push live migrations. Related:  
• `atlas liveMigrations link create` – create token  
• `atlas liveMigrations link delete` – delete token

</section>
<section>
<title>atlas liveMigrations link create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-liveMigrations-link-create/</url>

# atlas liveMigrations link create  
Generate a link-token for push live migrations (use `mongomirror` for scripted migrations).

</section>
<section>
<title>atlas liveMigrations link delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-liveMigrations-link-delete/</url>

# atlas liveMigrations link delete  
Deletes a specified live migration link-token.

</section>
<section>
<title>atlas liveMigrations validation</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-liveMigrations-validation/</url>

# atlas liveMigrations validation  
Manage Live Migration validation jobs.  
Subcommands:  
- `create` – start a push live migration validation.  
- `describe` – show a validation job.

</section>
<section>
<title>atlas liveMigrations validation create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-liveMigrations-validation-create/</url>

# atlas liveMigrations validation create  
Create a validation request for a push live migration from Cloud/Ops Manager to Atlas. Use mongomirror for script-based migrations.

</section>
<section>
<title>atlas liveMigrations validation describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-liveMigrations-validation-describe/</url>

# atlas liveMigrations validation describe

Fetches one live migration validation job, returning its ID, project IDs, and status.

</section>
<section>
<title>atlas logs</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-logs/</url>

# atlas logs

Download MongoDB host logs for a project.

**Options**
- `-h, --help` Show help  
- `-P, --profile <name>` Config profile (inherited)

**Subcommand (overview)**
- `atlas logs download` Download a compressed file of logs.

```bash
# basic usage
atlas logs download --hostname HOST [--profile PROF]
```

</section>
<section>
<title>atlas logs download</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-logs-download/</url>

# atlas logs download

Fetch `.gz` MongoDB/mongos/mongosqld/audit logs from a host (`atlas logs download <hostname> <log.gz> [opts]`). Requires user/API key with Project Data Access Read/Write. Example:  
```bash
atlas logs download atlas-123abc-shard-00-00.111xx.mongodb.net mongodb.gz --projectId 5e2211c17a3e5a48f5497de3
```

</section>
<section>
<title>atlas maintenanceWindows</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-maintenanceWindows/</url>

# atlas maintenanceWindows

Manage Atlas project maintenance window.

**Options**  
`-h, --help` – Show help.

**Inherited**  
`-P, --profile string` – Use named config profile.

**Subcommands**  
`clear` – Remove window.  
`defer` – Delay one week.  
`describe` – Show details.  
`update` – Create/modify window.

</section>
<section>
<title>atlas maintenanceWindows clear</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-maintenanceWindows-clear/</url>

# atlas maintenanceWindows clear

Clears the project’s current maintenance window. Requires Project Owner credentials. Syntax:  
```bash
atlas maintenanceWindows clear
```

</section>
<section>
<title>atlas maintenanceWindows defer</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-maintenanceWindows-defer/</url>

# atlas maintenanceWindows defer

Defers the project’s next maintenance window by 1 week. Requires Project Owner-level user or API key.

</section>
<section>
<title>atlas maintenanceWindows describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-maintenanceWindows-describe/</url>

# atlas maintenanceWindows describe
Show maintenance window details for the current or specified project. Requires Project Read Only access.  
Syntax: `atlas maintenanceWindows describe [options]`  
Returns: `DAY OF THE WEEK | HOUR OF DAY | START ASAP`

</section>
<section>
<title>atlas maintenanceWindows update</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-maintenanceWindows-update/</url>

# atlas maintenanceWindows update

Update a project's maintenance window (schedule or immediate start). Requires authenticated Project Owner/API key.

</section>
<section>
<title>atlas metrics</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-metrics/</url>

# atlas metrics
Get MongoDB process metrics.

**Options**
- `-h, --help` Show help

**Inherited**
- `-P, --profile <name>` Use config profile

**Related**
- `atlas metrics databases` DB metrics  
- `atlas metrics disks` Disk metrics  
- `atlas metrics processes` Host measurements

</section>
<section>
<title>atlas metrics databases</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-metrics-databases/</url>

# atlas metrics databases

List databases or their metrics for a given host.

Subcommands:  
• describe — measurements for a database  
• list — databases on the host

</section>
<section>
<title>atlas metrics databases describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-metrics-databases-describe/</url>

# atlas metrics databases describe

Return database‐level metrics for a given host.

```bash
atlas metrics databases describe <host:port> <dbName> \
  --granularity <ISO8601> [--start <ISO8601> --end <ISO8601> | --period <ISO8601>] \
  [options]
```

Arguments  
• host:port – target MongoDB process (req)  
• dbName   – database to query (req)

Key options  
• --granularity PT10S|PT1M|PT5M|PT1H|P1D (req)  
• --start / --end – ISO date range (excl. --period)  
• --period        – ISO duration back from now (excl. --start/--end)  
• --type          – measurement names (DATABASE_DATA_SIZE, etc.)  
• --limit 1-500, --page N  
• --output json|json-path|go-template(|-file)  
• --projectId ID, -P/--profile name, -h/--help

Example  
```bash
atlas metrics databases describe atlas-lnmtkm-shard-00-00.ajlj3.mongodb.net:27017 testDB \
  --granularity PT1M --period P1DT12H -o json
```

</section>
<section>
<title>atlas metrics databases list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-metrics-databases-list/</url>

# atlas metrics databases list

List databases on the specified `hostname:port` for your project.

Syntax: `atlas metrics databases list <hostname:port> [--projectId <id> ...]`

Requires Project Read Only access; supports standard paging/output flags.

</section>
<section>
<title>atlas metrics disks</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-metrics-disks/</url>

# atlas metrics disks
List available disks or their metrics for a specified host.  
Subcommands: `describe` (return measurements), `list` (return all disks/partitions).

</section>
<section>
<title>atlas metrics disks describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-metrics-disks-describe/</url>

# atlas metrics disks describe
Returns MongoDB disk/partition metrics for the specified `<hostname:port> <diskName>`.

</section>
<section>
<title>atlas metrics disks list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-metrics-disks-list/</url>

# atlas metrics disks list

Lists all disks/partitions on a given MongoDB host (`hostname:port`) within a project. Requires Project Read Only user/API key. Basic usage:  
```bash
atlas metrics disks list <hostname:port>
```

</section>
<section>
<title>atlas metrics processes</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-metrics-processes/</url>

# atlas metrics processes

`atlas metrics processes <hostname:port>` — Return monitoring measurements for a specified MongoDB host. Requires Project Read Only access. Obtain `hostname:port` via `atlas processes list`.

</section>
<section>
<title>atlas networking</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-networking/</url>

# atlas networking

Manage VPC peering for an Atlas project.

**Options**
- `-h, --help` Show help.
- `-P, --profile <name>` Use profile from config.

**Subcommands (overview)**
- `atlas networking containers` Manage peering containers.
- `atlas networking peering` Manage peering connections.

</section>
<section>
<title>atlas networking containers</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-networking-containers/</url>

# atlas networking containers

Manage network peering containers for a project (create/list/delete before clusters exist).

Subcommands  
• delete – remove a container (no clusters must exist)  
• list – list all containers

</section>
<section>
<title>atlas networking containers delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-networking-containers-delete/</url>

# atlas networking containers delete  
Delete a network peering container (`atlas networking containers delete <containerId>`) before any clusters exist; Project Owner role required.

</section>
<section>
<title>atlas networking containers list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-networking-containers-list/</url>

# atlas networking containers list

List all network peering containers for a project (requires Project Read Only access).

```bash
atlas networking containers list \
  [--limit <1-500>] [--page <n>] [--omitCount] \
  [--provider AWS|AZURE|GCP] [--projectId <hex>] \
  [-o json|json-path|go-template|go-template-file] \
  [-P <profile>] [-h]
```

Options:  
• --limit (default 100), --page (default 1)  
• --omitCount – exclude totalCount in JSON  
• --provider – filter by cloud provider  
• --projectId – override config/env project  
• -o – output format; -P – config profile; -h – help  

Example
```bash
atlas networking containers list \
  --projectId 5e2211c17a3e5a48f5497de3 -o json
```

</section>
<section>
<title>atlas networking peering</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-networking-peering/</url>

# atlas networking peering

Manage project VPC/VNet peering connections.

Options  
`-h, --help` Show help  
Inherited: `-P, --profile <name>` Atlas CLI profile.

Subcommands (overview only)  
• `create` – initiate AWS/Azure/GCP peering  
• `delete` – remove a peering connection  
• `list` – list all peerings  
• `watch` – wait until a peering becomes AVAILABLE

</section>
<section>
<title>atlas networking peering create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-networking-peering-create/</url>

# atlas networking peering create
Create a network peering connection between an Atlas VPC and AWS, Azure, or GCP. Subcommands: `aws`, `azure`, `gcp`.

</section>
<section>
<title>atlas networking peering create aws</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-networking-peering-create-aws/</url>

# atlas networking peering create aws

Creates a peering connection between your AWS VPC and the Atlas VPC (creates an Atlas VPC if none exists). Requires Project Owner authentication. On success: `Network peering connection '<Id>' created.`

</section>
<section>
<title>atlas networking peering create azure</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-networking-peering-create-azure/</url>

# atlas networking peering create azure
Create or reuse an Atlas VPC and peer it with an Azure VNet. Requires Project Owner auth and Azure directory/subscription/VNet/region info. See prerequisites: https://www.mongodb.com/docs/atlas/reference/api/vpc-create-peering-connection/#prerequisites

</section>
<section>
<title>atlas networking peering create gcp</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-networking-peering-create-gcp/</url>

# atlas networking peering create gcp

Create a VPC peering connection between your Atlas project and a Google Cloud VPC (Atlas auto-creates its VPC if absent; supply atlasCidrBlock when needed). Requires Project Owner role.

</section>
<section>
<title>atlas networking peering delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-networking-peering-delete/</url>

# atlas networking peering delete

Delete a specified network peering connection (`peerId`) from the current or `--projectId` project. Requires Project Owner privileges.

</section>
<section>
<title>atlas networking peering list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-networking-peering-list/</url>

# atlas networking peering list

Retrieve all network-peering connection details for the current or specified project (Project Read Only access required).

</section>
<section>
<title>atlas networking peering watch</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-networking-peering-watch/</url>

# atlas networking peering watch

Polls a specified network peering connection until it reaches the AVAILABLE state, then prints “Network peering changes completed.” Interrupt with `CTRL-C`. Requires authentication with Project Read Only permissions.

</section>
<section>
<title>atlas organizations</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-organizations/</url>

# atlas organizations

Manage MongoDB Atlas organizations.

```
atlas organizations [subcommand] [flags]
```

Flags  
`-h, --help`  Show help  
`-P, --profile <name>`  Use config profile

Subcommands  
- apiKeys Org API key ops  
- create Create org  
- delete Delete org  
- describe Org details  
- invitations Invitation ops  
- list List orgs  
- users Manage org users

</section>
<section>
<title>atlas organizations apiKeys</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-organizations-apiKeys/</url>

# atlas organizations apiKeys
Manage organization API keys.

Subcommands:
- accessLists – Manage IP access list  
- assign – Edit roles/description  
- create – New API key  
- delete – Remove API key  
- describe – Show API key details  
- list – List all API keys

</section>
<section>
<title>atlas organizations apiKeys accessLists</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-organizations-apiKeys-accessLists/</url>

# atlas organizations apiKeys accessLists
Manage Organization API Key IP access lists.

Subcommands  
• create – add IP/CIDR/DNS entry  
• delete – remove entry  
• list – list all entries  

Global option: `--profile <name>` selects saved connection profile.

</section>
<section>
<title>atlas organizations apiKeys accessLists create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-organizations-apiKeys-accessLists-create/</url>

# atlas organizations apiKeys accessLists create

Add CIDR/IP entries (or caller’s IP) to an Org API-Key access list. Requires Read Write role, `--apiKey <24-hex>`, one of `--cidr`, `--ip`, or `--currentIp`; `--cidr` and `--ip` are mutually exclusive. Outputs “Created new access list entry(s).”

</section>
<section>
<title>atlas organizations apiKeys accessLists delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-organizations-apiKeys-accessLists-delete/</url>

# atlas organizations apiKeys accessLists delete
Delete an IP/CIDR from an API Key’s access list.  
Usage: `atlas organizations apiKeys accessLists delete <entry> [options]`  
Success output: `Access list entry '<Name>' deleted`

</section>
<section>
<title>atlas organizations apiKeys accessLists list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-organizations-apiKeys-accessLists-list/</url>

# atlas organizations apiKeys accessLists list

List IP access list entries for a specific Org API key.

```
atlas organizations apiKeys accessLists list <apiKeyID> \
  [--limit N --page N --omitCount --orgId ID -o json|json-path|go-template] \
  [-P profile]
```

• Requires Org-level auth (Organization Member).  
• apiKeyID = 24-char ID.  
• Pagination: default 100, max 500.

Example  
```bash
atlas organizations apiKeys accessLists list 5f24084d8dbffa3ad3f21234 \
  --orgId 5a1b39eec902201990f12345 -o json
```

</section>
<section>
<title>atlas organizations apiKeys assign</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-organizations-apiKeys-assign/</url>

# atlas organizations apiKeys assign

Modify an organization API key’s roles or description (overwrites existing roles). Requires authentication with Organization User Admin privileges. Returns: `API Key '<Id>' successfully updated.`

</section>
<section>
<title>atlas organizations apiKeys create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-organizations-apiKeys-create/</url>

# atlas organizations apiKeys create
Create an organization API key (private key shown once). Requires Organization User Admin authentication.

</section>
<section>
<title>atlas organizations apiKeys delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-organizations-apiKeys-delete/</url>

# atlas organizations apiKeys delete

Delete an org-level API key.  
`atlas organizations apiKeys delete <24-digit ID> [--orgId <OrgID>] [--force]`  
Requires auth with Organization User Admin.  
Returns: `API Key '<Name>' deleted`.

</section>
<section>
<title>atlas organizations apiKeys describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-organizations-apiKeys-describe/</url>

# atlas organizations apiKeys describe  
Shows metadata for a single organization API key.

</section>
<section>
<title>atlas organizations apiKeys list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-organizations-apiKeys-list/</url>

# atlas organizations apiKeys list

Lists every API key in an organization. Requires authentication with a user or API key that has the Organization Member role. Supports optional organization selection, pagination, compact JSON, and various output formats.

</section>
<section>
<title>atlas organizations create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-organizations-create/</url>

# atlas organizations create

Create a new Atlas organization.

Usage  
```bash
atlas organizations create <name> [options]
```

Notes  
• Cross-org billing must be enabled on the org owning the API keys; the new org is billed there.  
• With API-key auth, you must also supply key description, roles, and an initial org owner (`--ownerId`).  
• Optional: link to existing federation settings (`--federationSettingsId`).

</section>
<section>
<title>atlas organizations delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-organizations-delete/</url>

# atlas organizations delete  
Delete organization by 24-digit `<ID>`. Org must have no active projects. Requires Org Owner role. Optional `--force` skips confirmation.

</section>
<section>
<title>atlas organizations describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-organizations-describe/</url>

# atlas organizations describe

Return details of an organization (requires authenticated Org Member).

```bash
atlas organizations describe <ORG_ID> [--output json|json-path|go-template|go-template-file] [-P profile]
```

Args  
• `ORG_ID` (24-char string, required)

Example  
```bash
atlas organizations describe 5e2211c17a3e5a48f5497de3 -o json
```

Output:  
```
ID     NAME
<Id>   <Name>
```

</section>
<section>
<title>atlas organizations invitations</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-organizations-invitations/</url>

# atlas organizations invitations

Manage invitations for a MongoDB organization: create, list, describe, update, delete.  
Inherited flag: `--profile` (select config profile).

Subcommands  
- delete ‒ remove a pending invite  
- describe ‒ show invite details  
- invite ‒ send invite  
- list ‒ list pending invites  
- update ‒ edit pending invite

</section>
<section>
<title>atlas organizations invitations delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-organizations-invitations-delete/</url>

# atlas organizations invitations delete
Delete a pending organization invitation. Usage:  
```bash
atlas organizations invitations delete <invitationId>
``` 
Requires Organization User Admin privileges.

</section>
<section>
<title>atlas organizations invitations describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-organizations-invitations-describe/</url>

# atlas organizations invitations describe

Fetch a pending organization invitation by `invitationId`. Requires authenticated user/API key with Organization User Admin role.

</section>
<section>
<title>atlas organizations invitations invite</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-organizations-invitations-invite/</url>

# atlas organizations invitations invite

Add a user (by email) to an organization. Requires Organization User Admin authentication. Optional flags: `--role | --teamId | --file` (mutually exclusive) and `--orgId`. Success message: `User '<Username>' invited.`

</section>
<section>
<title>atlas organizations invitations list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-organizations-invitations-list/</url>

# atlas organizations invitations list  
Returns all pending invitations for an organization. Requires Organization User Admin privileges. Syntax:  
```bash
atlas organizations invitations list
```

</section>
<section>
<title>atlas organizations invitations update</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-organizations-invitations-update/</url>

# atlas organizations invitations update

Modify a pending organization invitation (identified by ID or email). Requires authenticated user/API key with **ORG_OWNER** role.

</section>
<section>
<title>atlas organizations list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-organizations-list/</url>

# atlas organizations list  
Return all organizations (user/API key Org Member). Supports pagination, name filter, includeDeleted (Ops Manager only), omitCount, and output formatting.

</section>
<section>
<title>atlas organizations users</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-organizations-users/</url>

# atlas organizations users
Manage Atlas organization users.

Options:  
`-h, --help` Show help  
`-P, --profile <name>` Use specified config profile  

Related: `atlas organizations users list` – list all users in an organization.

</section>
<section>
<title>atlas organizations users list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-organizations-users-list/</url>

# atlas organizations users list

List all users in an org (requires Org Member auth).

```bash
atlas organizations users list \
  [--orgId ID] [--limit 1-500] [--page N] [--omitCount] \
  [-o json|json-path|go-template|go-template-file] \
  [-P profile] [--help]
```

Default: limit = 100, page = 1.

Output: table or JSON (totalCount omitted with --omitCount).

Example
```bash
atlas organizations users list --orgId 5e2211c17a3e5a48f5497de3 -o json
```

</section>
<section>
<title>atlas performanceAdvisor</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-performanceAdvisor/</url>

# atlas performanceAdvisor

Analyze slow queries and receive optimization suggestions.

**Options**

| Flag | Type | Description |
|------|------|-------------|
| `-h, --help` |  | Show help |

**Inherited**

| Flag | Type | Description |
|------|------|-------------|
| `-P, --profile` | string | Select config profile |

**Subcommands (overview only)**

- `namespaces` – list slow-query namespaces  
- `slowOperationThreshold` – enable/disable slow-op threshold mgmt  
- `slowQueryLogs` – fetch slow-query logs for a host  
- `suggestedIndexes` – list recommended indexes

</section>
<section>
<title>atlas performanceAdvisor namespaces</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-performanceAdvisor-namespaces/</url>

# atlas performanceAdvisor namespaces

High-level: returns namespaces of collections with slow queries (`atlas performanceAdvisor namespaces list`).

</section>
<section>
<title>atlas performanceAdvisor namespaces list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-performanceAdvisor-namespaces-list/</url>

# atlas performanceAdvisor namespaces list
List up to 20 `{db}.{collection}` namespaces with slow queries on a specified host, over last 24 h or `since/duration` window. Requires Project Read Only access.

</section>
<section>
<title>atlas performanceAdvisor slowOperationThreshold</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-performanceAdvisor-slowOperationThreshold/</url>

# atlas performanceAdvisor slowOperationThreshold
Manage cluster slow-operation threshold: enable or disable.

</section>
<section>
<title>atlas performanceAdvisor slowOperationThreshold disable</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-performanceAdvisor-slowOperationThreshold-disable/</url>

# atlas performanceAdvisor slowOperationThreshold disable  
Disables custom slow-operation threshold for a project; ops >100 ms become “slow”. Requires Project Owner credentials.

</section>
<section>
<title>atlas performanceAdvisor slowOperationThreshold enable</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-performanceAdvisor-slowOperationThreshold-enable/</url>

# atlas performanceAdvisor slowOperationThreshold enable  
Activates app-managed slow operation threshold for a project (Project Owner/API Key). Uses cluster’s avg exec time to flag slow queries; on by default for M10+ dedicated clusters.

</section>
<section>
<title>atlas performanceAdvisor slowQueryLogs</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-performanceAdvisor-slowQueryLogs/</url>

# atlas performanceAdvisor slowQueryLogs

Retrieve slow query log lines for a specified host. Subcommand: `atlas performanceAdvisor slowQueryLogs list` – list identified slow query logs.

</section>
<section>
<title>atlas performanceAdvisor slowQueryLogs list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-performanceAdvisor-slowQueryLogs-list/</url>

# atlas performanceAdvisor slowQueryLogs list  
List slow-query log lines flagged by Performance Advisor/Query Profiler (default: last 24 h).

</section>
<section>
<title>atlas performanceAdvisor suggestedIndexes</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-performanceAdvisor-suggestedIndexes/</url>

# atlas performanceAdvisor suggestedIndexes

Return suggested indexes for collections experiencing slow queries.  
Subcommand: `list` – list suggested indexes.

</section>
<section>
<title>atlas performanceAdvisor suggestedIndexes list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-performanceAdvisor-suggestedIndexes-list/</url>

# atlas performanceAdvisor suggestedIndexes list  
Displays Performance Advisor–generated index recommendations for collections with slow queries on the specified process. Requires authenticated user (Project Read Only role).

</section>
<section>
<title>atlas plugin</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-plugin/</url>

# atlas plugin

Manage Atlas CLI plugins.

Options  
`-h, --help` Show help  
`-P, --profile <name>` Use config profile

Subcommands  
`install` Install plugin from GitHub repo  
`list`   Show installed plugins  
`uninstall` Remove plugin  
`update` Update plugin

</section>
<section>
<title>atlas plugin install</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-plugin-install/</url>

# atlas plugin install

Install an Atlas CLI plugin from any public GitHub repo.

Format  
```
atlas plugin install [<owner>/<repo>|<url>[@<ver>]] [-P <profile>]
```
• `@<ver>` pins a release; omit for latest.  
• `-P` use alternate CLI profile.

Examples  
```bash
# latest
atlas plugin install mongodb/atlas-cli-plugin-example
atlas plugin install https://github.com/mongodb/atlas-cli-plugin-example

# specific version
atlas plugin install mongodb/atlas-cli-plugin-example@1.0.4
atlas plugin install https://github.com/mongodb/atlas-cli-plugin-example@v1.2.3
```

</section>
<section>
<title>atlas plugin list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-plugin-list/</url>

# atlas plugin list
Lists installed Atlas CLI plugins.

</section>
<section>
<title>atlas plugin uninstall</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-plugin-uninstall/</url>

# atlas plugin uninstall

Remove an Atlas CLI plugin.

```
atlas plugin uninstall [plugin] [flags]
```

Arguments  
- `plugin` (string, optional): `<org>/<repo>` or plugin name.

Flags  
- `-P, --profile` string: config profile.  
- `-h, --help`

Examples  
```sh
atlas plugin uninstall mongodb/atlas-cli-plugin-example
atlas plugin uninstall atlas-cli-plugin-example
```

</section>
<section>
<title>atlas plugin update</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-plugin-update/</url>

# atlas plugin update

Update one or all Atlas CLI plugins.

```bash
atlas plugin update [<github-owner>/<repo>|<plugin-name>] [--all] [-P <profile>]
```

Arguments  
• plugin (str, optional) – target plugin ID or name.  

Options  
• --all – update every installed plugin.  
• -P, --profile str – use specified config profile.  
• -h, --help – show help.

Examples
```bash
atlas plugin update mongodb/atlas-cli-plugin-example
atlas plugin update atlas-cli-plugin-example
atlas plugin update --all
```

</section>
<section>
<title>atlas privateEndpoints</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints/</url>

# atlas privateEndpoints

Manage Atlas Private Endpoints.

Options:  
`-h/--help` Show help

Global option:  
`-P/--profile <name>` Use saved CLI profile

Subcommands (overview only):  
- `atlas privateEndpoints aws` – AWS Private Endpoints  
- `atlas privateEndpoints azure` – Azure Private Endpoints  
- `atlas privateEndpoints gcp` – GCP Private Endpoints  
- `atlas privateEndpoints regionalModes` – Regionalized PE settings

</section>
<section>
<title>atlas privateEndpoints aws</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-aws/</url>

# atlas privateEndpoints aws

Manage AWS Private Endpoints.

• Subcommands:  
`create` – create PE, `delete` – remove PE, `describe` – show PE, `interfaces` – manage PE interfaces, `list` – list PEs, `watch` – wait for PE availability.  

Global flag: `-P, --profile <name>` use saved CLI profile.

</section>
<section>
<title>atlas privateEndpoints aws create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-aws-create/</url>

# atlas privateEndpoints aws create  
Create an AWS Private Endpoint for an Atlas project (Project Owner role required).

</section>
<section>
<title>atlas privateEndpoints aws delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-aws-delete/</url>

# atlas privateEndpoints aws delete

Delete an AWS private endpoint (Project Owner/API key).

```bash
atlas privateEndpoints aws delete <privateEndpointId> \
  [--force] [--projectId <projId>] [-P <profile>]
```

privateEndpointId: 24-char ID.  
--force skips confirmation.

Output  
`Private endpoint '<Name>' deleted`

Example
```bash
atlas privateEndpoints aws delete 5f4fc14da2b47835a58c63a2 --projectId 5e2211c17a3e5a48f5497de3
```

</section>
<section>
<title>atlas privateEndpoints aws describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-aws-describe/</url>

# atlas privateEndpoints aws describe  
Display details of a specific AWS private endpoint in an Atlas project (Project Read Only permission required).

</section>
<section>
<title>atlas privateEndpoints aws interfaces</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-aws-interfaces/</url>

# atlas privateEndpoints aws interfaces
Manage AWS private endpoint interfaces (create, delete, describe) for Atlas projects.

</section>
<section>
<title>atlas privateEndpoints aws interfaces create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-aws-interfaces-create/</url>

# atlas privateEndpoints aws interfaces create
Create an AWS interface endpoint (`privateEndpointId`) under an existing Atlas AWS private endpoint service (`endpointServiceId`). Requires Project Owner privileges. Returns confirmation message.

</section>
<section>
<title>atlas privateEndpoints aws interfaces delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-aws-interfaces-delete/</url>

# atlas privateEndpoints aws interfaces delete  
Delete an AWS private endpoint interface/service from a project (Project Owner auth).

</section>
<section>
<title>atlas privateEndpoints aws interfaces describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-aws-interfaces-describe/</url>

# atlas privateEndpoints aws interfaces describe
Returns details of an AWS private endpoint interface for a project (Project Read Only required).

</section>
<section>
<title>atlas privateEndpoints aws list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-aws-list/</url>

# atlas privateEndpoints aws list  
Retrieve all AWS private endpoints in a project (requires Project Read Only access).

</section>
<section>
<title>atlas privateEndpoints aws watch</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-aws-watch/</url>

# atlas privateEndpoints aws watch

Polls an AWS private endpoint (`<privateEndpointId>`) until it reaches AVAILABLE or FAILED, then prints completion message. Blocks terminal (Ctrl-C to stop). Requires Project Read Only access. Syntax:  
`atlas privateEndpoints aws watch <privateEndpointId> [--projectId] [-P/--profile]`

</section>
<section>
<title>atlas privateEndpoints azure</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-azure/</url>

# atlas privateEndpoints azure

Manage Azure Private Endpoints.

Subcommands:
- create – create endpoint  
- delete – remove endpoint  
- describe – show details  
- interfaces – manage endpoint interfaces  
- list – list endpoints  
- watch – wait until available

</section>
<section>
<title>atlas privateEndpoints azure create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-azure-create/</url>

# atlas privateEndpoints azure create  
Create an Azure private endpoint for a project.

</section>
<section>
<title>atlas privateEndpoints azure delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-azure-delete/</url>

# atlas privateEndpoints azure delete  
Delete an Azure private endpoint from the current or `--projectId` project (requires Project Owner privileges).

</section>
<section>
<title>atlas privateEndpoints azure describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-azure-describe/</url>

# atlas privateEndpoints azure describe  
Return details of an Azure private endpoint in a project.  

```
atlas privateEndpoints azure describe <privateEndpointId> [--projectId <projectId>] [global options]
```

Requires Project Read Only privileges. Output fields: ID, ENDPOINT SERVICE, STATUS, ERROR.

</section>
<section>
<title>atlas privateEndpoints azure interfaces</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-azure-interfaces/</url>

# atlas privateEndpoints azure interfaces

Manage Azure Private Endpoint interfaces in Atlas.

Subcommands  
- create – add interface  
- delete – remove interface & service  
- describe – show interface details

</section>
<section>
<title>atlas privateEndpoints azure interfaces create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-azure-interfaces-create/</url>

# atlas privateEndpoints azure interfaces create

Create an interface endpoint for an Azure private endpoint in Atlas (Project Owner auth).

</section>
<section>
<title>atlas privateEndpoints azure interfaces delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-azure-interfaces-delete/</url>

# atlas privateEndpoints azure interfaces delete
Deletes an Azure private endpoint interface (Project Owner role or API key required).

</section>
<section>
<title>atlas privateEndpoints azure interfaces describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-azure-interfaces-describe/</url>

# atlas privateEndpoints azure interfaces describe  
Returns details of an Azure private endpoint interface for the project (Project Read Only permission required).

</section>
<section>
<title>atlas privateEndpoints azure list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-azure-list/</url>

# atlas privateEndpoints azure list  
Lists all Azure private endpoints for the current or specified project (requires Project Read Only role).

</section>
<section>
<title>atlas privateEndpoints azure watch</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-azure-watch/</url>

# atlas privateEndpoints azure watch  
Polls the specified Azure private endpoint until it reaches AVAILABLE or FAILED, then outputs completion message; interrupt with CTRL-C. Requires Project Read Only access.

</section>
<section>
<title>atlas privateEndpoints gcp</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-gcp/</url>

# atlas privateEndpoints gcp

Manage GCP private endpoints.  
Subcommands: create, delete, describe, interfaces, list, watch.

</section>
<section>
<title>atlas privateEndpoints gcp create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-gcp-create/</url>

# atlas privateEndpoints gcp create

Creates a GCP private endpoint in the specified region for your Atlas project (Project Owner role required).

</section>
<section>
<title>atlas privateEndpoints gcp delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-gcp-delete/</url>

# atlas privateEndpoints gcp delete  
Delete a specified GCP private endpoint from an Atlas project (Project Owner auth required).

</section>
<section>
<title>atlas privateEndpoints gcp describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-gcp-describe/</url>

# atlas privateEndpoints gcp describe  
Show one GCP private endpoint by ID for the current or `--projectId` project. Needs Project Read Only access. Syntax:  
```bash
atlas privateEndpoints gcp describe <privateEndpointId> [-o json|...] [-P profile]
```

</section>
<section>
<title>atlas privateEndpoints gcp interfaces</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-gcp-interfaces/</url>

# atlas privateEndpoints gcp interfaces
Manage Atlas GCP private endpoint interfaces.  
Subcommands:  
- create  
- delete  
- describe

</section>
<section>
<title>atlas privateEndpoints gcp interfaces create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-gcp-interfaces-create/</url>

# atlas privateEndpoints gcp interfaces create
Create a GCP private endpoint interface in Atlas (Project Owner role required).

Syntax:  
```bash
atlas privateEndpoints gcp interfaces create <endpointGroupId>
```

Result:  
`Interface endpoint '<EndpointGroupName>' created.`

</section>
<section>
<title>atlas privateEndpoints gcp interfaces delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-gcp-interfaces-delete/</url>

# atlas privateEndpoints gcp interfaces delete  
Delete a GCP private endpoint interface in a project (Project Owner auth).  
Usage:  
```bash
atlas privateEndpoints gcp interfaces delete <interfaceId> --endpointServiceId <PE-id> [--projectId] [--force]
```

</section>
<section>
<title>atlas privateEndpoints gcp interfaces describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-gcp-interfaces-describe/</url>

# atlas privateEndpoints gcp interfaces describe  
Show one GCP private endpoint interface in a project (auth: Project Read Only).

</section>
<section>
<title>atlas privateEndpoints gcp list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-gcp-list/</url>

# atlas privateEndpoints gcp list
List GCP private endpoints for a project (requires Project Read Only role).

</section>
<section>
<title>atlas privateEndpoints gcp watch</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-gcp-watch/</url>

# atlas privateEndpoints gcp watch  
Periodically polls a given GCP private endpoint until its state is AVAILABLE or FAILED, then prints “GCP Private endpoint changes completed.” Blocks terminal unless interrupted (Ctrl-C). Requires authentication with Project Read Only access.

</section>
<section>
<title>atlas privateEndpoints regionalModes</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-regionalModes/</url>

# atlas privateEndpoints regionalModes

Manage the project’s regionalized private endpoint setting.

Subcommands  
- `atlas privateEndpoints regionalModes describe` — view current setting  
- `atlas privateEndpoints regionalModes enable` — enable it  
- `atlas privateEndpoints regionalModes disable` — disable it

</section>
<section>
<title>atlas privateEndpoints regionalModes describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-regionalModes-describe/</url>

# atlas privateEndpoints regionalModes describe

Get whether regionalized private endpoints are enabled for a project (ENABLED/DISABLED). Requires Project Read Only role or equivalent authentication.

</section>
<section>
<title>atlas privateEndpoints regionalModes disable</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-regionalModes-disable/</url>

# atlas privateEndpoints regionalModes disable
Disable project-level “regionalized private endpoint” mode (multi-PE per region) across all CSPs. Requires Project Owner authentication.

</section>
<section>
<title>atlas privateEndpoints regionalModes enable</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-privateEndpoints-regionalModes-enable/</url>

# atlas privateEndpoints regionalModes enable

Enable regionalized private endpoints for a project (multi-resource per region, all CSPs). Requires Project Owner auth.  

Usage: `atlas privateEndpoints regionalModes enable [--projectId <id>] [-o json]` → `Regionalized private endpoint setting enabled.`

</section>
<section>
<title>atlas processes</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-processes/</url>

# atlas processes

Manage MongoDB processes in a project.

Options  
`-h, --help` Show help.

Inherited  
`-P, --profile <string>` Profile name (see doc).

Related  
`atlas processes describe` Show one process.  
`atlas processes list` List all processes.

</section>
<section>
<title>atlas processes describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-processes-describe/</url>

# atlas processes describe

Describe a single Atlas MongoDB process.

## Syntax
```bash
atlas processes describe <hostname:port> \
  [--projectId <id>] \
  [-o json|json-path|go-template|go-template-file] \
  [-P <profile>]
```

## Parameters
- `hostname:port` (req) – target process.
- `--projectId` – override default project.
- `-o, --output` – choose format; `json` shows all fields.
- `-P, --profile` – config profile.
- `-h, --help` – show help.

## Output (table)
```
ID   REPLICA SET NAME   SHARD NAME   VERSION
```

## Example
```bash
atlas processes describe atlas-lnmtkm-shard-00-00.ajlj3.mongodb.net:27017 -o json
```

</section>
<section>
<title>atlas processes list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-processes-list/</url>

# atlas processes list
List all MongoDB processes in a project. Requires authenticated user or API key with Project Read Only. Syntax: `atlas processes list`.

</section>
<section>
<title>atlas projects</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-projects/</url>

# atlas projects

Manage MongoDB Atlas projects (create, list, update, delete, settings, access).

## Options
| Flag | Description |
|------|-------------|
| `-h, --help` | Show help. |

### Inherited
| Flag | Type | Description |
|------|------|-------------|
| `-P, --profile` | string | Use named profile from config. |

## Related Commands (overview)
* `atlas projects apiKeys` – project API Key ops.  
* `atlas projects create` – create project in org.  
* `atlas projects delete` – delete project.  
* `atlas projects describe` – show project details.  
* `atlas projects list` – list projects.  
* `atlas projects settings` – project settings ops.  
* `atlas projects teams` – team management.  
* `atlas projects update` – update project.  
* `atlas projects users` – project user management.

</section>
<section>
<title>atlas projects apiKeys</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-projects-apiKeys/</url>

# atlas projects apiKeys

Manage organization API keys for a project.  
Subcommands: assign, create, delete, list.

</section>
<section>
<title>atlas projects apiKeys assign</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-projects-apiKeys-assign/</url>

# atlas projects apiKeys assign

Assign an organization API key to a project and set its project-level roles (overwrites existing roles).  
Usage:  
```bash
atlas projects apiKeys assign <APIKeyID> --role <role[,role]> [--projectId <ProjectID>] [...]
```

</section>
<section>
<title>atlas projects apiKeys create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-projects-apiKeys-create/</url>

# atlas projects apiKeys create

Create an organization API key, assign to a project, returns public & private keys once. Requires Project User Admin.

</section>
<section>
<title>atlas projects apiKeys delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-projects-apiKeys-delete/</url>

# atlas projects apiKeys delete  
Remove an org-level API key from a project (key stays in org).  
Usage: `atlas projects apiKeys delete <APIKeyID> [--force] [--projectId <projID>]`.  
Needs Project User Admin rights; success message: `API Key '<Name>' deleted`.  
Re-assign with `atlas projects apiKeys assign`.

</section>
<section>
<title>atlas projects apiKeys list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-projects-apiKeys-list/</url>

# atlas projects apiKeys list  
Return all org API keys linked to a project. Requires Project User Admin.

</section>
<section>
<title>atlas projects create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-projects-create/</url>

# atlas projects create

Create a new Atlas project under an organization.

```bash
atlas projects create <projectName> [options]
```

Argument  
• projectName (string, required) – project label.

Key options  
• --govCloudRegionsOnly ­– restrict to AWS GovCloud.  
• --orgId <id> – override org ID.  
• --ownerId <userId> – assign initial Project Owner (defaults to oldest Org Owner).  
• --tag key=value – add tags.  
• --withoutDefaultAlertSettings – skip default alerts.  
• -o|--output json|json-path|go-template(|-file).  
• -h|--help.  

Inherited  
• -P|--profile <name> – config profile.

Output  
`Project '<Id>' created.`

Example  
```bash
atlas projects create my-project --orgId 5e2211c17a3e5a48f5497de3 -o json
```

</section>
<section>
<title>atlas projects delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-projects-delete/</url>

# atlas projects delete

Delete an Atlas project.

```bash
atlas projects delete <PROJECT_ID> [--force] [-P profile]
```

• <PROJECT_ID>: required 24-char project ID  
• --force: skip confirmation  
• -P: config profile

Auth: user or API key with Project Owner.

Success: `Project '<Name>' deleted`

Example:
```bash
atlas projects delete 5e2211c17a3e5a48f5497de3
```

</section>
<section>
<title>atlas projects describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-projects-describe/</url>

# atlas projects describe
Show details of a project by its 24-digit ID. Requires Project Read Only access.

</section>
<section>
<title>atlas projects list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-projects-list/</url>

# atlas projects list
Lists all Atlas projects. Requires authenticated user or API key with Project Data Access Read/Write. Supports org scoping, pagination, and multiple output formats.

</section>
<section>
<title>atlas projects settings</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-projects-settings/</url>

# atlas projects settings

Manage project settings.  
Subcommands:  
• `atlas projects settings describe` – view settings.  
• `atlas projects settings update` – change settings.

</section>
<section>
<title>atlas projects settings describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-projects-settings-describe/</url>

# atlas projects settings describe

Display a project’s feature flags (DB stats collection, Data Explorer, Performance/Schema advisors, Realtime panel).  
Usage: `atlas projects settings describe [--projectId <id>]`.  
Returns a table of enabled/disabled states.

</section>
<section>
<title>atlas projects settings update</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-projects-settings-update/</url>

# atlas projects settings update

Updates project-level feature flags (Collect Database Specific Statistics, Data Explorer, Performance Advisor, Real-Time Performance Panel, Schema Advisor).

</section>
<section>
<title>atlas projects teams</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-projects-teams/</url>

# atlas projects teams
Manage teams within a project.  
Subcommands: add, delete, list, update.

</section>
<section>
<title>atlas projects teams add</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-projects-teams-add/</url>

# atlas projects teams add

Add a team (24-digit `teamId`) to a project. Requires Project Owner auth.  
Usage: `atlas projects teams add <teamId> --role <ROLE> [--projectId <projId>] [--output <fmt>]`.  
Roles: GROUP_CLUSTER_MANAGER, GROUP_DATA_ACCESS_ADMIN, GROUP_DATA_ACCESS_READ_ONLY, GROUP_DATA_ACCESS_READ_WRITE, GROUP_OWNER, GROUP_READ_ONLY.

</section>
<section>
<title>atlas projects teams delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-projects-teams-delete/</url>

# atlas projects teams delete

Delete a team from a project (user/API key with Project User Admin). Team object persists in org.

```
atlas projects teams delete <teamId> [--projectId <projId>] [--force] [-P <profile>] [-h]
```

Arguments  
• teamId (req) – 24-hex team ID.

Options  
• --projectId – override project.  
• --force – no confirmation.  
• -P/--profile – config profile.  
• -h/--help – help.

Output example  
```
Team '<Name>' deleted
```

Example  
```bash
atlas projects teams delete 5dd58c647a3e5a6c5bce46c7 --projectId 5e2211c17a3e5a48f5497de3
```

</section>
<section>
<title>atlas projects teams list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-projects-teams-list/</url>

# atlas projects teams list  
Lists all teams in a project. Requires user/API key with Project Read Only role.

</section>
<section>
<title>atlas projects teams update</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-projects-teams-update/</url>

# atlas projects teams update

Update project roles for a team.  
Requires Project User Admin auth.  
Syntax: `atlas projects teams update <teamId> --role <ROLE> [--projectId <projId>]`  
ROLE one of: GROUP_CLUSTER_MANAGER, GROUP_DATA_ACCESS_ADMIN, GROUP_DATA_ACCESS_READ_ONLY, GROUP_DATA_ACCESS_READ_WRITE, GROUP_OWNER, GROUP_READ_ONLY.

</section>
<section>
<title>atlas projects update</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-projects-update/</url>

# atlas projects update

Modifies an Atlas project (Project Owner required).  
Usage: `atlas projects update <ID> --file <config.json> [--output <fmt>]`.

</section>
<section>
<title>atlas projects users</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-projects-users/</url>

# atlas projects users

Manage project users.

Subcommands:  
• `atlas projects users delete` – remove a user  
• `atlas projects users list` – list all users

</section>
<section>
<title>atlas projects users delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-projects-users-delete/</url>

# atlas projects users delete
Remove a specified user (24-digit ID) from an Atlas project; user record persists in the organization. Requires Project User Admin role.

</section>
<section>
<title>atlas projects users list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-projects-users-list/</url>

# atlas projects users list  
List all users in a project (requires Project Read Only or above).

</section>
<section>
<title>atlas security</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-security/</url>

# atlas security

Configure project security.

**Options**  
- `-h, --help` Show help.

**Inherited**  
- `-P, --profile <name>` Use named CLI profile.

**Related**  
- `atlas security customerCerts` Manage customer X.509 certs  
- `atlas security ldap` LDAP operations

</section>
<section>
<title>atlas security customerCerts</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-security-customerCerts/</url>

# atlas security customerCerts

Manage project customer-managed X.509 certificates.  
Subcommands:  
• create – save CA config  
• describe – show current config  
• disable – clear config & disable self-managed X.509

</section>
<section>
<title>atlas security customerCerts create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-security-customerCerts-create/</url>

# atlas security customerCerts create

Save a customer-managed X.509 configuration to a project (requires Project Owner auth; causes rolling restart).

</section>
<section>
<title>atlas security customerCerts describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-security-customerCerts-describe/</url>

# atlas security customerCerts describe
Return current customer-managed X.509 configuration for a project (Project Owner auth required).

</section>
<section>
<title>atlas security customerCerts disable</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-security-customerCerts-disable/</url>

# atlas security customerCerts disable  
Disable and clear customer-managed X.509 settings for a project; causes rolling restart. Requires Project Owner auth.

</section>
<section>
<title>atlas security ldap</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-security-ldap/</url>

# atlas security ldap

Manage project LDAP settings.

Subcommands (overview):  
• delete – Remove config  
• get – Show config  
• save – Store config  
• verify – Validate config

Options:  
`-h, --help` show help  
`-P, --profile <name>` use saved profile

</section>
<section>
<title>atlas security ldap delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-security-ldap-delete/</url>

# atlas security ldap delete

Delete the project’s LDAP `userToDNMapping` configuration. Requires Project Owner.

</section>
<section>
<title>atlas security ldap get</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-security-ldap-get/</url>

# atlas security ldap get  
Fetch current LDAP settings for a project (Project Owner auth required).

</section>
<section>
<title>atlas security ldap save</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-security-ldap-save/</url>

# atlas security ldap save

Persist an LDAP configuration for the current project. Requires Project Owner permissions.

</section>
<section>
<title>atlas security ldap verify</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-security-ldap-verify/</url>

# atlas security ldap verify  
Initiate LDAP configuration verification for a project; Project Owner privileges required.

</section>
<section>
<title>atlas security ldap verify status</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-security-ldap-verify-status/</url>

# atlas security ldap verify status

Get the status of a given LDAP configuration verification request (requires Project Owner auth).  

```
atlas security ldap verify status <requestId> [--projectId] [--output json|json-path|go-template|go-template-file]
```

Returns:  
```
REQUEST ID   PROJECT ID   STATUS
```  

Related: `atlas security ldap verify status watch` – wait until request completes.

</section>
<section>
<title>atlas security ldap verify status watch</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-security-ldap-verify-status-watch/</url>

# atlas security ldap verify status watch

Polls an LDAP verification request (`<requestId>`) until it reaches **SUCCESS** or **FAILED**, then prints "LDAP Configuration request completed." Supports `--projectId` and global `--profile`. Requires Project Owner auth. Stop with Ctrl-C.

</section>
<section>
<title>atlas setup</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-setup/</url>

# atlas setup

Interactive command to register/login, create default config/profile, build a free M0 cluster, add IP access, and open a connection (Compass or mongosh).

`atlas setup [options]`

Key options  
- Cluster: `--clusterName <str>` (default random), `--tier <str>` (M0+), `--mdbVersion <ver>`, `--enableTerminationProtection`, `--skipSampleData`  
- Cloud: `--provider {AWS|AZURE|GCP}`, `--region <str>`  
- Access: `--accessListIp <ip,...>` | `--currentIp`  
- Connect: `--connectWith {compass|mongosh|skip}` (`--noBrowser`, `--force` skip prompts)  
- Auth: `--username <str>`, `--password <str>`  
- Project: `--projectId <hex>`  
- Misc: `--tag k=v`, `--gov` (GovCloud)  

Global: `-P, --profile <name>` choose saved CLI profile.

Example  
```sh
atlas setup --clusterName Test --provider GCP --username dbuserTest
```

</section>
<section>
<title>atlas streams</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-streams/</url>

# atlas streams

Manage Atlas Stream Processing deployments/configs: create, edit, delete streams and modify connection registry.

Options  
- `-h, --help` Show help.

Inherited  
- `-P, --profile string` Use named profile.

Related (2+ levels deep, overview only)  
- `atlas streams connections` Manage stream connections.  
- `atlas streams instances` Manage stream instances.

</section>
<section>
<title>atlas streams connections</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-streams-connections/</url>

# atlas streams connections

Manage Atlas Stream Processing connections (create, list, describe, update, delete).  
Global flags: `-P, --profile <name>` choose CLI profile; `-h, --help` show help.

Subcommands:  
- `atlas streams connections create` – create connection.  
- `atlas streams connections delete` – delete connection.  
- `atlas streams connections describe` – view connection.  
- `atlas streams connections list` – list connections.  
- `atlas streams connections update` – edit connection.

</section>
<section>
<title>atlas streams connections create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-streams-connections-create/</url>

# atlas streams connections create

Create a connection for an Atlas Stream Processing instance (Project Owner auth).  
Usage:  
```bash
atlas streams connections create [connectionName] --instance <instanceName> --file <config.json> [--projectId <id>] [global opts]
```  
Success: `Connection <Name> created.`

</section>
<section>
<title>atlas streams connections delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-streams-connections-delete/</url>

# atlas streams connections delete

Delete a Stream Processing connection.  
Needs Project Owner/API key; ensure related processes stopped.  
Prompts for confirmation unless `--force`.

```
atlas streams connections delete <connectionName> --instance <instanceName> [--force] [--projectId <id>] [-P <profile>]
```

Success ➜ `Atlas Stream Processing connection '<Name>' deleted`.

</section>
<section>
<title>atlas streams connections describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-streams-connections-describe/</url>

# atlas streams connections describe

Show details for an Atlas Stream Processing connection within a specified instance.  
Usage: `atlas streams connections describe <streamConnectionName> --instance <instanceName> [--projectId <id>]`  
Requires Project Owner-level user/API key.

</section>
<section>
<title>atlas streams connections list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-streams-connections-list/</url>

# atlas streams connections list  
List all Stream Processing connections in an Atlas instance. Requires authenticated user/API key with Project Read Only. Use `--instance <name>` to target the instance.

</section>
<section>
<title>atlas streams connections update</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-streams-connections-update/</url>

# atlas streams connections update

Modify an existing connection in an Atlas Stream Processing instance (Project Owner or API Key required).

</section>
<section>
<title>atlas streams instances</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-streams-instances/</url>

# atlas streams instances

Manage Atlas Stream Processing instances in a project: create, list, describe, update, delete, and download logs. Supports `-P/--profile` to select a saved CLI profile.

</section>
<section>
<title>atlas streams instances create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-streams-instances-create/</url>

# atlas streams instances create

Create an Atlas Stream Processing instance.

```bash
atlas streams instances create <name> \
  --provider AWS|AZURE --region <region> \
  [--tier SP30] [--projectId <id>] [-o json]
```

Requirements  
• Auth as Project Owner.  
• `<name>` immutable; ASCII letters, numbers, hyphens.  

Key options  
• --provider (AWS default)  
• --region (VIRGINIA_USA, eastus, …)  
• --tier (default SP30)  
• --projectId (override profile/env)  
• -o/--output (json, json-path, go-template*)  
• -P/--profile (use saved CLI profile)  

Output  
```
Atlas Streams Processor Instance '<Name>' successfully created.
```

Example  
```bash
atlas streams instances create myProcessor \
  --projectId 5e2211c17a3e5a48f5497de3 \
  --provider AWS --region VIRGINIA_USA --tier SP30
```

</section>
<section>
<title>atlas streams instances delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-streams-instances-delete/</url>

# atlas streams instances delete

Delete an Atlas Stream Processing instance (stopped beforehand). Requires Project Owner auth. `--force` skips confirmation.

</section>
<section>
<title>atlas streams instances describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-streams-instances-describe/</url>

# atlas streams instances describe

Return details of an Atlas Streams processor instance in the selected project (requires Project Read Only access).

```
atlas streams instances describe <name> [--output <fmt>] [--projectId <hex>] [--profile <cfg>]
```

• `<name>` – processor name  
• `--output` json|json-path|go-template|go-template-file (json shows all fields)  

Example  
```
atlas streams instances describe myProcessor --output json
```

</section>
<section>
<title>atlas streams instances download</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-streams-instances-download/</url>

# atlas streams instances download

Download `.gz` log archive for a specified Stream Processing tenant (`tenantName`). Requires Project Data Access Read/Write privileges.

</section>
<section>
<title>atlas streams instances list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-streams-instances-list/</url>

# atlas streams instances list

List all Stream Processing instances in a project (Project Read Only access required).

</section>
<section>
<title>atlas streams instances update</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-streams-instances-update/</url>

# atlas streams instances update

Update an existing Atlas Stream Processing instance.  
Requires: Project Owner auth and all instance processes stopped.  
Input: instance name plus provider (AWS | AZURE, default AWS) and region (e.g., VIRGINIA_USA, eastus).  
Output: “Atlas Streams Processor Instance '<Name>' successfully updated.”

</section>
<section>
<title>atlas teams</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-teams/</url>

# atlas teams

Manage teams in an Atlas organization.

**Options**  
`-h, --help` Show help.

**Inherited**  
`-P, --profile <string>` Select CLI config profile.

**Subcommands**  
- `create` Create a team.  
- `delete` Delete a team.  
- `describe` Show team details.  
- `list` List all teams.  
- `rename` Rename a team.  
- `users` Manage team users.

</section>
<section>
<title>atlas teams create</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-teams-create/</url>

# atlas teams create

Create a team in an organization (Org Owner auth required).

```
atlas teams create <name> --username <u1,u2> [--orgId <id>] [-o <fmt>] [-P <profile>]
```

name (req) – team label  
--username (req) – comma-list of org users  
--orgId – override org  
-o/--output json|json-path|go-template|go-template-file  
-P/--profile – config profile  

Success: `Team '<Name>' created.`

Example:
```bash
atlas teams create myTeam --username user1@example.com,user2@example.com --orgId 5e123... -o json
```

</section>
<section>
<title>atlas teams delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-teams-delete/</url>

# atlas teams delete

Delete a team from an org (requires Org User Admin).

```bash
atlas teams delete <teamId> [--orgId <id>] [--force] [-P|--profile <name>]
```

• teamId (required): 24-digit ID  
• --orgId: override org in config/env  
• --force: skip confirmation  
• -P/--profile: config profile  
• -h/--help  

Output:  
`Team '<Name>' deleted`

Example:  
```bash
atlas teams delete 5e44445ef10fab20b49c0f31 --orgId 5e1234c17a3e5a48f5497de3
```

</section>
<section>
<title>atlas teams describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-teams-describe/</url>

# atlas teams describe

Show a team’s details (ID, Name) in an organization. Requires authenticated Org Member. Provide team ID or name. Output supports table/JSON.

</section>
<section>
<title>atlas teams list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-teams-list/</url>

# atlas teams list  
List all teams in an organization (auth: Org Member/API key). Supports pagination, compact/standard JSON output, omit count, orgId override, profile selection.

</section>
<section>
<title>atlas teams rename</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-teams-rename/</url>

# atlas teams rename

Rename a team (Org Owner required).

```
atlas teams rename <newName> --teamId <24-hex> [--orgId <OrgID>] [-o json]
```

Success: `Team '<Name>' updated.`

</section>
<section>
<title>atlas teams users</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-teams-users/</url>

# atlas teams users

Manage Atlas team members.  

Subcommands: `add`, `delete`, `list`.

</section>
<section>
<title>atlas teams users add</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-teams-users-add/</url>

# atlas teams users add  
Add one or more org users (existing or invited, 24-digit IDs) to a team using `--teamId` (and optional `--orgId`). Requires Org User Admin auth; success message: “User(s) added to the team.”

</section>
<section>
<title>atlas teams users delete</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-teams-users-delete/</url>

# atlas teams users delete

Remove a user from a team (Org User Admin required).

```bash
atlas teams users delete <userId> --teamId <teamId> \
  [--orgId <orgId>] [--force] [-P profile]
```

Args  
• userId (required) – 24-hex user ID

Opts  
• --teamId (required) – 24-hex team ID  
• --orgId – override org  
• --force – skip confirm  
• -P/--profile – config profile  
• -h/--help

Output: `User '<Name>' deleted from the team`

Example:
```bash
atlas teams users delete 5dd58c647a3e5a6c5bce46c7 \
  --teamId 5f6a5c6c713184005d72fe6e \
  --orgId 5e1234c17a3e5a48f5497de3
```

</section>
<section>
<title>atlas teams users list</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-teams-users-list/</url>

# atlas teams users list

Lists all users in a specified team. Requires Org Member–level user or API key authentication.

</section>
<section>
<title>atlas users</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-users/</url>

# atlas users

Manage Atlas users.

Options  
`-h, --help` Show help  
`-P, --profile <string>` Use specified config profile

Subcommands  
`atlas users describe` Get user details  
`atlas users invite` Create user and send invites

</section>
<section>
<title>atlas users describe</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-users-describe/</url>

# atlas users describe  
Return a single Atlas user’s details by `--id <24-digitID>` or `--username <email>`. Requires any authenticated user/API key.

</section>
<section>
<title>atlas users invite</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/command/atlas-users-invite/</url>

# atlas users invite

Create and invite an Atlas application user (not a DB user) to orgs/projects.  
Syntax: `atlas users invite [options]`

Required options  
* `--country` ISO-3166-1 alpha-2  
* `--email` user email  
* `--firstName`  
* `--lastName`  
* `--username` email (login)

Optional  
* `--mobile` phone  
* `--password`  
* `--orgRole` `orgID:ROLE` (ORG_OWNER, ORG_MEMBER, ORG_GROUP_CREATOR, ORG_BILLING_ADMIN, ORG_READ_ONLY)  
* `--projectRole` `projectID:ROLE` (GROUP_CLUSTER_MANAGER, GROUP_DATA_ACCESS_ADMIN, GROUP_DATA_ACCESS_READ_ONLY, GROUP_DATA_ACCESS_READ_WRITE, GROUP_OWNER, GROUP_READ_ONLY)  
* `-o/--output` json | json-path | go-template | go-template-file  
* `-P/--profile` cfg profile  
* `-h/--help`

Output  
```
The user '<Username>' has been invited.
Invited users do not have access to the project until they accept the invitation.
```

Examples  
```bash
# Org invite with ORG_OWNER
atlas users invite --email user@example.com --username user@example.com \
  --orgRole 5dd56c847a3e5a1f363d424d:ORG_OWNER \
  --firstName Example --lastName User --country US -o json
```

```bash
# Project invite with GROUP_READ_ONLY
atlas users invite --email user@example.com --username user@example.com \
  --projectRole 5f71e5255afec75a3d0f96dc:GROUP_READ_ONLY \
  --firstName Example --lastName User --country US -o json
```

</section>
<section>
<title>Automate Processes with the Atlas CLI</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/atlas-cli-automate/</url>

# Automate Processes with the Atlas CLI

**Resources**
- **Atlas CLI Environment Variables** – define once, reuse across scripts.  
- **Customize Atlas CLI Output** – Go templates or JSON paths for predictable script output.

**Best Practices**
1. **Use Atlas private keys**: avoids 12-h login expiry.  
2. **Script to fixed CLI version**: avoid auto-upgrades; check release notes before manual upgrade.  
3. **Redirect stderr** to prevent errors/deprecation msgs from breaking parsers:  
   ```bash
   myScript.sh 2>error.txt
   ```  
4. **Maintain scripts**: monitor changelog/stderr for deprecations and update promptly.

</section>
<section>
<title>Atlas CLI Environment Variables</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/atlas-cli-env-variables/</url>

# Atlas CLI Environment Variables

Precedence: CLI flag (e.g. `--projectId`) > env var > config profile.  
Use **either** MongoDB CLI or Atlas CLI env vars, not both.

| Variable | Purpose/Values |
|---|---|
| `DO_NOT_TRACK` | `1` disables telemetry (alt: `MONGODB_ATLAS_TELEMETRY_ENABLED=false`). |
| `MONGODB_ATLAS_PUBLIC_API_KEY` / `MONGODB_ATLAS_PRIVATE_API_KEY` | Public/Private API keys. |
| `MONGODB_ATLAS_ORG_ID` | Default `--orgId`. |
| `MONGODB_ATLAS_PROJECT_ID` | Default `--projectId`. |
| `MONGODB_ATLAS_OUTPUT` | Output: *empty*=human, `json`, `json-path`, `go-template`. |
| `MONGODB_ATLAS_MONGOSH_PATH` | Absolute path to `mongosh`. |
| `MONGODB_ATLAS_SKIP_UPDATE_CHECK` | `yes` skips version check. |
| `MONGODB_ATLAS_ACCESS_TOKEN` | 12 h OAuth access token. |
| `MONGODB_ATLAS_REFRESH_TOKEN` | OAuth refresh token. |
| `MONGODB_ATLAS_TELEMETRY_ENABLED` | `false` disables telemetry (alt: `DO_NOT_TRACK`). |
| `HTTP_PROXY` / `HTTPS_PROXY` | Proxy URL. `HTTPS_PROXY` overrides for HTTPS. Examples: ```sh HTTP_PROXY=my.proxy                 # no auth HTTP_PROXY=user:pass@my.proxy     HTTP_PROXY=socks5://my.proxy ``` |
| `NO_PROXY` | Comma-list hosts that bypass proxy. |



</section>
<section>
<title>Customize the Atlas CLI Output</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/custom-output-cli/</url>

# Customize Atlas CLI Output

Use `--output/-o` with Go templates or JSONPath to filter/format command results.

## Go Templates
```
-o go-template="{{<tmpl>}}"
-o go-template-file="<file>"
```
Examples  
```sh
atlas projects ls --orgId <org> -o go-template="Count: {{.TotalCount}}"
# → Count: 2

atlas clusters describe getStarted -o go-template="{{.SrvAddress}}"
# → mongodb+srv://getstarted.example.mongodb.net

# template.tmpl:  Projects: {{range .Results}}{{.ID}} {{end}}
atlas projects ls --orgId <org> -o go-template-file=template.tmpl
# → Projects: <id1> <id2>
```

## JSONPath
```
-o json-path='$<expr>'
```
`$` = root JSON; supports standard JSONPath operators.

Examples  
```sh
atlas organizations apikeys list -o json-path='$[0].desc'
# → owner_key

atlas organizations apikeys list -o json-path='$[? @.id=="<id>"].desc'
# → member_key

atlas privateendpoints aws describe <peId> -o json-path='$.status'
# → WAITING_FOR_USER
```

(Commands ≥2 sublevels omitted per guidelines.)

</section>
<section>
<title>Configure Telemetry</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/telemetry/</url>

# Configure Telemetry

• Telemetry on by default; shared with mongosh when co-installed.  
• Collects only non-PII: CLI version, install source, OS/version, auth method (not creds), command + preset args, execution time, errors.  
• Excludes PII, free-text values, API keys, login creds.  

Disable  
```sh
atlas config set telemetry_enabled false      # or env: MONGODB_ATLAS_TELEMETRY_ENABLE=false
# or in config file: telemetry_enabled = false
```  

Enable (default)  
```sh
atlas config set telemetry_enabled true       # or env=true / remove line in config
```

</section>
<section>
<title>Manage Atlas from the Atlas CLI</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/atlas-cli-tutorials/</url>

# Manage Atlas via CLI

Basics: see “Install/Update the Atlas CLI” and “Connect from the Atlas CLI”. Full command ref: “Atlas CLI Commands”.

Tutorials  
- **Get Started with Atlas** – `atlas setup` walks you through account + first cluster.  
- **Create & Configure Cluster** – `atlas quickstart` builds first cluster; requires existing org.  
- **Manage Local/Cloud Deployments** – `atlas deployments` tutorials.  
- **Test Automations** – create ephemeral project/cluster.  
- **Run with Docker** – execute Atlas CLI commands in Docker.

</section>
<section>
<title>Get Started with Atlas</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/atlas-cli-getting-started/</url>

# Get Started with Atlas

`atlas setup` automates first-time Atlas use:

1. Sign-up / log-in  
2. CLI auth via browser code  
3. Create free `M0` cluster  
4. Load sample data  
5. Whitelist your IP  
6. Create DB user  
7. Show `mongosh` connection string  

Prereq: install Atlas CLI.

```sh
atlas setup
```
• Opens browser → sign-up or log-in  
• Paste CLI verification code → Confirm Authorization  

If multiple orgs/projects, select defaults.  
Prompt: “Set up your first free database…?” → Y creates:

- Cluster: `Cluster<n>` (M0, AWS us-east-1)  
- DB user: `Cluster<n>` / `abcdef12345`  
- Sample data loaded  
- IP allow list: your current IP  

CLI shows credentials & “Creating your cluster…”.

Next: use connection string in `mongosh` or app; view status with `atlas clusters`.

</section>
<section>
<title>Create and Configure an Atlas Cluster</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/atlas-cli-quickstart/</url>

# Create & Configure an Atlas Cluster

`atlas setup` automates: cluster creation (M0), sample data load, IP access rule, DB user, and connection string.

Prereqs: Atlas org, Atlas CLI installed & authenticated.

## Modes

### Default (non-prompt)

Creates free shared cluster with defaults; `--force` skips prompts.

```sh
atlas setup --force
# → outputs user/pass, cluster name, URI
```

Defaults: AWS US_EAST_1, tier M0, 0.5 GB, autogenerated user/pass, sample data Y, open shell N.

### Interactive

```sh
atlas setup
# accept/override prompted values
```

### Non-interactive

Specify all options:

```sh
atlas setup \
  --clusterName getStarted \
  --provider AWS --region US_EAST_1 \
  --username testUser --password changeMe \
  --accessListIp 192.0.2.15 \
  --skipSampleData --force
```

Creates M0 (3-node, 2 GB, MongoDB 5.0).

## Next Steps

Use printed connection string with `mongosh` or in apps.  
Check status via Atlas UI or `atlas clusters` commands.

</section>
<section>
<title>Create an Atlas Cluster Using a Configuration File</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/atlas-cli-create-cluster-from-config-file/</url>

# Create Atlas Cluster via Config File

Prereqs: Atlas CLI, existing cluster, profile w/ org & project IDs.

Workflow  
1. Export source cluster config  
```sh
atlas clusters describe <cluster> --output json > myCluster.json
```  
2. (Opt) Edit `myCluster.json`. See Cluster Configuration File docs for fields.  
3. Create new cluster from file  
```sh
atlas clusters create <new-cluster> -f myCluster.json
```  
4. Watch status  
```sh
atlas clusters watch <new-cluster>
```  

`describe` saves full JSON spec (clusterType, replicationSpecs, autoScaling, etc.). `create -f` consumes same format, enabling easy cloning.

</section>
<section>
<title>Manage Local and Cloud Deployments from the Atlas CLI</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/atlas-cli-local-cloud/</url>

# Atlas CLI – `deployments` Overview

`atlas deployments` lets you manage Atlas clusters locally (created via CLI only) and in the cloud, plus Atlas Search / Vector Search indexes.

Key abilities:
- Create, list, pause/start, delete, connect to deployments.
- Return connection strings or launch `mongosh`/Compass.
- Manage Atlas Search & Vector Search indexes.

Scope:
- Local deployments: only `atlas deployments` sub-commands.
- Cloud deployments: all Atlas CLI commands.

Deep-nested sub-commands (≥2 levels deep) omitted here.  

Tutorials:
1. Create local deployment (single-node replica set).
2. Create local deployment with Docker.
3. Use `search indexes create` for Atlas Search & Vector Search.

</section>
<section>
<title>Create a Local Atlas Deployment</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/atlas-cli-deploy-local/</url>

# Create a Local Atlas Deployment

## Requirements
OS: macOS 13+, RHEL/CentOS 8–9, Ubuntu 22/24, Debian 11/12, Amazon Linux 2023, Win 10/11 (x64/ARM except Win).  
HW: ≥2 cores, 2 GB free RAM.  
Deps: Atlas CLI, Docker (v4.31+ Desktop or Engine 27+ / Podman 5+), optional mongosh 2+, Compass 1.39.4+.  
Account: `atlas setup`.

## Create Deployment
Interactive default  
```sh
atlas deployments setup            # prompts, defaults
atlas deployments setup --initdb ./scripts  # seed data
```

Interactive custom (name/port/version)  
```sh
atlas deployments setup
# choose: local, custom
# enter name, MongoDB ver (6.0/7.0), port
```

Non-interactive  
```sh
atlas deployments setup myLocalRs --type local --force \
  --initdb ./scripts
```
Result: connection string `mongodb://localhost:<port>/?directConnection=true`.

## Manage Deployment
```sh
atlas deployments list                # show LOCAL / ATLAS
atlas deployments connect             # choose deployment & method
atlas deployments pause|start         # pause or resume
atlas deployments logs                # tail logs
atlas deployments delete              # remove (confirm with y)
```
Load sample data  
```sh
curl -O https://atlas-education.s3.amazonaws.com/sampledata.archive
mongorestore --archive=sampledata.archive --port <port>
```

## Migrate Local → Cloud
```sh
atlas deployments setup --type atlas        # cloud cluster
atlas deployments setup --type local        # source
docker exec -u root -it <local> sh -c \
  "mkdir -p /data/dump && chown -R mongod:mongod /data/dump && \
   mongodump --archive=/data/dump/dump.archive"
docker cp <local>:/data/dump/dump.archive .
atlas deployments connect --type atlas --connectWith connectionString
mongorestore --uri "<cloud URI>" --archive=./dump.archive
```

## Upgrade Local Version
Create new local, dump old, restore: identical workflow to migration; delete old deployment when done.

## Atlas Search / Vector Search
Create index:  
```sh
atlas deployments search indexes create --type local
```
Vector Search requires MongoDB 7.0.5+. Recreate deployment if older.

## Docs
More actions: `atlas deployments`.  
Troubleshooting: “Troubleshoot Local Atlas Deployment Issues”.

</section>
<section>
<title>Create a Local Atlas Deployment with Docker</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/atlas-cli-deploy-docker/</url>

# Local Atlas Deployment with Docker

Pull image:
```sh
docker pull mongodb/mongodb-atlas-local:latest
```

Run:
```sh
# no auth
docker run -p 27017:27017 mongodb/mongodb-atlas-local
# with auth
docker run -e MONGODB_INITDB_ROOT_USERNAME=user -e MONGODB_INITDB_ROOT_PASSWORD=pass \
  -p 27017:27017 mongodb/mongodb-atlas-local
```

Automated wait & connect:
```sh
CID=$(docker run --rm -d -P mongodb/mongodb-atlas-local)
until [ "$(docker inspect -f '{{.State.Health.Status}}' $CID)" = healthy ]; do sleep 1; done
PORT=$(docker inspect -f '{{(index (index .NetworkSettings.Ports "27017/tcp") 0).HostPort}}' $CID)
mongosh "mongodb://127.0.0.1:$PORT/test?directConnection=true"
```

Connect:
```sh
mongosh "mongodb://localhost:27017/?directConnection=true"
mongosh "mongodb://user:pass@localhost:27017/?directConnection=true"
```

# Docker Compose

`docker-compose.yaml`:
```yaml
services:
  mongodb:
    image: mongodb/mongodb-atlas-local
    environment:
      - MONGODB_INITDB_ROOT_USERNAME=user
      - MONGODB_INITDB_ROOT_PASSWORD=pass
    ports: ["27018:27017"]
```
Run/stop:
```sh
docker-compose up [-d]
docker-compose down -v
```

Persist data:
```yaml
    volumes:
      - data:/data/db
      - config:/data/configdb
volumes:
  data:
  config:
```

# SBOM & Signature

```sh
brew install syft && syft mongodb/mongodb-atlas-local
brew install cosign
curl -O https://cosign.mongodb.com/mongodb-atlas-local.pem
COSIGN_REPOSITORY="docker.io/mongodb/signatures" cosign verify --private-infrastructure \
  --key mongodb-atlas-local.pem mongodb/mongodb-atlas-local
```

# GitHub Actions

```yaml
services:
  mongodb:
    image: mongodb/mongodb-atlas-local
    ports: [27017:27017]
steps:
  - run: |
      curl -o mongosh.deb https://downloads.mongodb.com/compass/mongodb-mongosh_2.2.1_amd64.deb
      sudo dpkg -i mongosh.deb
      mongosh 'mongodb://localhost/?directConnection=true' --eval 'show dbs'
```

# Convert mongo → atlas-local

Remove custom `command`, rely on built-in healthcheck:
```yaml
# before
image: mongo:8.0
command: ["./entrypoint.sh"]

# after
image: mongodb/mongodb-atlas-local:8.0
environment:
  - MONGODB_INITDB_ROOT_USERNAME=user
  - MONGODB_INITDB_ROOT_PASSWORD=pass
volumes:
  - data:/data/db
  - config:/data/configdb
```

</section>
<section>
<title>Use Atlas Search with an Atlas Deployment</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/atlas-cli-deploy-fts/</url>

# Atlas Search & Vector Search Quickstart

## Prereqs
- Atlas CLI, mongosh ≥ 2.0, (opt.) Compass ≥ 1.39.4, MongoDB Database Tools, Docker (Desktop ≥ 4.31 / Engine ≥ 27, Podman ≥ 5 on RHEL).
- Create local deployment:  
  ```sh
  atlas deployments setup   # MongoDB 7.0.5+ if using Vector Search
  ```
- Load sample dataset:  
  ```sh
  curl -O https://atlas-education.s3.amazonaws.com/sampledata.archive
  mongorestore --archive=sampledata.archive --port=<PORT>
  ```

## Limits
- No concurrent search
- ≤ 1024 boolean clauses

## Key CLI Actions (high-level only)
- `atlas deployments search indexes create` – create Search / Vector Search index  
- `atlas deployments connect` – connect (prompts for deployment & shell)

## Create Search Index & Query
Create any basic index (name, db, collection) with the command above. Connect, then:

```js
use sample_mflix
db.movies.aggregate([
  {$search: {index: "searchIndex", text:{query:"baseball", path:"plot"}}},
  {$limit:5},
  {$project:{_id:0,title:1,plot:1}}
])
```

## Vector Search

indexDef-vector.json
```json
{
  "name": "vectorSearchIndex",
  "type": "vectorSearch",
  "collectionName": "embedded_movies",
  "database": "sample_mflix",
  "fields": [{
    "type": "vector",
    "path": "plot_embedding",
    "numDimensions": 1536,
    "similarity": "euclidean"
  }]
}
```

Create index, connect, then:

```js
use sample_mflix
db.embedded_movies.aggregate([
  {
    $vectorSearch: {
      index: "vectorSearchIndex",
      path: "plot_embedding",
      queryVector: [/* 1536-dim vector */],
      numCandidates: 150,
      limit: 10
    }
  },
  {$project:{_id:0,plot:1,title:1,score:{$meta:"vectorSearchScore"}}}
])
```

See `atlas deployments` docs for all supported actions.

</section>
<section>
<title>Test Automations with Ephemeral Projects and Clusters</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/atlas-cli-ephemeral-cluster/</url>

# Test Automations with Ephemeral Projects and Clusters

Prereqs: Atlas user, org ID (`atlas organizations list`), Atlas CLI installed & logged in.

## 1 Create
```sh
# your user ID
atlas users describe --username <EMAIL>

# project
atlas projects create myEphemeralProject --orgId <ORG-ID> --ownerId <USER-ID>
# note returned <PROJECT-ID>

# M10 cluster + DB user
atlas setup --clusterName myEphemeralCluster --provider AWS --region US_EAST_1 \
  --tier M10 --username myEphemeralUser --password <PWD> --currentIp \
  --skipSampleData --projectId <PROJECT-ID> --force
```

## 2 Test
(run your automation scripts against the cluster)

## 3 Delete
```sh
atlas clusters delete myEphemeralCluster --projectId <PROJECT-ID> --force
# after cluster is gone
atlas projects delete <PROJECT-ID> --force   # retry if CANNOT_CLOSE_GROUP_ACTIVE_ATLAS_CLUSTERS
```

Verify removal with `atlas projects list`.

</section>
<section>
<title>Run Atlas CLI Commands with Docker</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/atlas-cli-docker/</url>

# Run Atlas CLI Commands with Docker

Prereqs: Docker installed, `docker pull mongodb/atlas`; optional `atlas.env` containing Atlas CLI vars (API keys).

## Interactive mode
```bash
# Shell without env file
docker run --rm -it mongodb/atlas bash

# Shell with env file
docker run --env-file atlas.env --rm -it mongodb/atlas bash

# Inside container
atlas auth login      # if no env file
atlas --help          # any Atlas CLI cmd
```

## Detached daemon
```bash
docker run -d --name mongodb/atlas mongodb/atlas          # start

# Shell into running container
docker exec --env-file atlas.env --rm -it mongodb/atlas bash

# Run Atlas CLI cmd from host
docker exec --env-file ./atlas.env --rm mongodb/atlas atlas --help
```

GitHub API access required for Atlas CLI.

</section>
<section>
<title>Reference</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/reference/</url>

# JSON Config Files

Pass a `.json` file with `--file <config.json>` to any Atlas CLI command supporting it.

</section>
<section>
<title>JSON (Javascript Object Notation)</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/reference/json/</url>

# JSON Config Files in Atlas CLI

Use `--file <path>.json` to feed Admin-API request bodies directly into Atlas CLI commands.

Example  
```json
{
  "backupEnabled": true,
  "labels": [{"key":"<myKey>","value":"<myValue>"}]
}
```
```sh
atlas clusters update myCluster --file example.json
```

Accepted wherever the command maps to an Admin API “Create/Update” endpoint, e.g.:

- atlas clusters create|update|upgrade  
- atlas backups schedule update  
- atlas clusters search indexes create|update  
- atlas clusters search nodes create|update  
- atlas dataFederation create  
- atlas alerts settings create|update  
- atlas clusters indexes create  
- atlas projects update  
- atlas federatedAuthentication federationSettings connectedOrgConfigs update

Refer to the corresponding API schema for valid fields.  

Config file guides: Cluster, Backup Schedule, Search Index, Search Nodes, Data Federation, Alert, Rolling Index, Project, Federated Authentication.

</section>
<section>
<title>Cluster Configuration File</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/reference/json/cluster-config-file/</url>

# Cluster Configuration File

Use a JSON config passed with `--file` to `atlas clusters create|update|upgrade`.

• Settings: same fields as Admin API request bodies  
  – Create: “Create One Cluster from One Project”  
  – Update: “Modify One Cluster from One Project”  
  – Upgrade: “Upgrade One Shared-tier Cluster”

Workflow:  
1. In Admin API docs, expand & copy the sample request for the desired endpoint.  
2. Edit values, save as `<name>.json`.  
3. Run the relevant CLI command with `--file <path>`.

Commands (overview only):  
- `atlas clusters create` – create cluster from config file.  
- `atlas clusters update` – update cluster from config file.  
- `atlas clusters upgrade` – upgrade shared-tier cluster from config file.

</section>
<section>
<title>Cloud Backup Schedule Configuration File</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/reference/json/cloud-backup-schedule-config-file/</url>

# Cloud Backup Schedule Configuration File

JSON file lets `atlas backups schedule update` modify a cluster’s Cloud Backup plan.  
Settings: any fields defined in Admin API “Update Cloud Backup Schedule for One Cluster” request body.

Quick workflow:  
1. In Admin API docs, open “Update Cloud Backup Schedule for One Cluster” → Request samples → Expand all → Copy.  
2. Edit values, save as `.json`.  
3. Run `atlas backups schedule update` pointing to the file.

</section>
<section>
<title>Cloud Backup Compliance Policy Configuration File</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/reference/json/cloud-backup-compliance-policy-config-file/</url>

# Cloud Backup Compliance Policy Config

Use a `.json` config file with `atlas backups compliancePolicy setup` to update a cloud backup compliance policy.

• Allowed keys: any field in Atlas Admin API “Update the Backup Compliance Policy” → Request Body Schema.  
• File creation: copy API sample (Request samples → Expand all → Copy), edit values, save as `.json`.  
• Apply: run `atlas backups compliancePolicy setup` with `--file <path>`.

</section>
<section>
<title>Atlas Data Federation Configuration File</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/reference/json/data-federation-config-file/</url>

# Atlas Data Federation Configuration File

Use a `.json` config with `atlas dataFederation create` to build a Federated Database Instance (FDI).

• Settings: any fields in Admin API endpoint “Create One Federated Database Instance in One Project” request body.

Workflow  
1. In Atlas Admin API docs, expand & copy the sample request for the above endpoint.  
2. Edit values as needed, save as `*.json`.  
3. Run:  
```bash
atlas dataFederation create --file <path/to/config.json>
```

</section>
<section>
<title>Atlas Search Index Configuration File</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/reference/json/search-index-config-file/</url>

# Atlas Search Index Configuration

Use a `.json` config file with Atlas CLI to create/update Search indexes.

Supported keys: any fields in the Admin API schemas:  
• Create One Atlas Search Index (create)  
• Update One Atlas Search Index (update)

## Workflow

1. In Atlas Admin API docs, open “Create/Update One Atlas Search Index”.  
2. Expand and copy the request sample JSON.  
3. Edit values as needed; save as `index.json`.

## CLI Commands

High-level (3+ levels deep, overview only):

- `atlas clusters search indexes create --file index.json`  
  Create index from config.

- `atlas clusters search indexes update --file index.json`  
  Update existing index from config.

</section>
<section>
<title>Search Nodes Configuration File</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/reference/json/search-nodes-config-file/</url>

# Search Nodes Config

* Use `.json` files with `atlas clusters search nodes create|update --file <path>`.
* File may include any fields defined in the Admin API “Create/Update Search Nodes” request schema.
* Create file: copy API sample, edit values, save as `.json`.
* Commands (high-level):  
  * `atlas clusters search nodes create` – create nodes from config.  
  * `atlas clusters search nodes update` – update nodes from config.

</section>
<section>
<title>Online Archive Configuration File</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/reference/json/file-options-online-archive/</url>

# Online Archive Config Files

Use `.json` files with `atlas clusters onlineArchives create|update --file <path>` to supply any fields accepted by the Admin API “Create/Update One Online Archive” schemas. Workflow: copy API sample, edit values, save, run command.

</section>
<section>
<title>Alert Configuration File</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/reference/json/alert-config-file/</url>

# Alert Configuration File

Use a `.json` file matching the Admin API "Create/Update One Alert Configuration in One Project" request schema.

- Create: copy API create sample → edit → save →  
  ```bash
  atlas alerts settings create --file <path>
  ```
- Update: copy API update sample → edit → save →  
  ```bash
  atlas alerts settings update --file <path>
  ```

</section>
<section>
<title>Rolling Index Configuration File</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/reference/json/rolling-index-config-file/</url>

# Rolling Index Configuration File

Use a `.json` file with settings from “Create One Rolling Index” schema (supports unique, sparse, partial).  
Steps:  
1. In API docs, copy the sample request (Expand all → Copy).  
2. Edit values, save as `.json`.  
3. Run:  
```bash
atlas clusters indexes create --file <path>
```

</section>
<section>
<title>Project Configuration File</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/reference/json/project-config-file/</url>

# Project Configuration File

Use a JSON file with `atlas projects update --file <path>` to set any fields allowed in the Admin API “Update One Project” request body.  
Create file: copy the API’s sample request (Expand all → Copy), edit values, save as `.json`, then run the CLI command.

</section>
<section>
<title>Federated Authentication Configuration File</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/reference/json/connected-org-config-file/</url>

# Federated Authentication Configuration File

Use `.json` with `atlas federatedAuthentication federationSettings connectedOrgConfigs update` to modify orgs linked to a federation.

• File content: any fields accepted by Admin API “Update One Org Config Connected to One Federation” request body.  
• Create file: copy sample request (Admin API → Request samples → Expand all → Copy), edit values, save as `.json`.  
• Apply:  
```bash
atlas federatedAuthentication federationSettings connectedOrgConfigs update --file <path>
```

</section>
<section>
<title>Troubleshoot Errors</title>
<url>https://mongodb.com/docs/atlas/cli/v1.38/troubleshooting/</url>

# Atlas CLI – Troubleshooting Cheat-Sheet

## Local Deployment
- CLI uses Docker (`atlas deployments …`).  
  • Mac/Win: Docker Desktop ≥ 4.31 • Linux: Docker Engine ≥ 27.0  
- Slow/unstable after many local deployments ⇒ add RAM (Docker Desktop settings).  
- Reset Docker env:  
  ```sh
  docker stop $(docker ps -aq) && docker system prune -a
  ```

## Plugin Install/Update
Needs GitHub API reachability.

## Diagnostics
```sh
atlas deployments diagnostics <deployment> --output json > out.json
```

## Common Errors & Fixes
| Error | Cause / Resolution |
|-------|--------------------|
| `missing credentials` | Run `atlas config init` (API keys) or `atlas auth login`; use `--profile` if needed. |
| `atlas: command not found` | Add binary dir to `$PATH`, move it into one, or invoke with full path. |
| `400 TENANT_ATTRIBUTE_READ_ONLY` | `--backup` unsupported on clusters < M10. |
| `401 Unauthorized` (resource) | Wrong project/API keys or config file not found. |
| `401 Unauthorized` (action) | User/API key lacks required role; grant via Org/Project UI or API. |
| `401` lacks `Organization Project Creator` | Grant `Organization Project Creator` at org level. |
| `403 Forbidden IP <ip>` | Add caller IP to project/API-key access list (Access Manager → API Keys → Edit → Add Access List Entry). |
| `404 Not Found group-id` | Project (group) ID invalid—verify in Project → Settings. |
| Alert Config Not Deleted | ID invalid/unreachable. |
| `podman not found` (inside `mongodb/atlas` container ≥ 1.26) | Use Docker instead. Clean residual containers:  
  ```sh
  podman ps -a
  podman container rm -f -v <id>
  brew uninstall podman   # macOS Homebrew
  ``` |
| Blank home dir vars (`HOMEDRIVE`, `HOMEPATH`, `USERPROFILE`) | CLI can’t read home directory; set vars or fix permissions. |

## Misc
- CLI home-dir access issues cause blank output.

</section>
</guide>