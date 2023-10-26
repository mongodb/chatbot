import { makePersistedHttpRequestFunctionDefinition } from "./makePersistedHttpRequestFunctionDefinition";

const sampleMetadata = {
  api: "atlas-admin-api",
  method: "patch",
  path: "/api/atlas/v2/federationSettings/{federationSettingsId}/connectedOrgConfigs/{orgId}",
  baseUrl: "https://cloud.mongodb.com",
  description:
    "Updates one connected organization configuration from the specified federation. To use this resource, the requesting API Key must have the Organization Owner role. \n\n**Note** If the organization configuration has no associated identity provider, you can't use this resource to update role mappings or post authorization role grants.  \n\n**Note**: The domainRestrictionEnabled field defaults to false if not provided in the request. \n\n**Note**: If the identityProviderId field is not provided, you will disconnect the organization and the identity provider.",
  operationId: "updateConnectedOrgConfig",
  parameters: [
    {
      description:
        "Unique 24-hexadecimal digit string that identifies your federation.",
      in: "path",
      name: "federationSettingsId",
      required: true,
      schema: {
        type: "string",
        example: "55fa922fb343282757d9554e",
        maxLength: { $numberInt: "24" },
        minLength: { $numberInt: "24" },
        pattern: "^([a-f0-9]{24})$",
      },
    },
    {
      description:
        "Flag that indicates whether Application wraps the response in an `envelope` JSON object. Some API clients cannot access the HTTP response headers or status code. To remediate this, set envelope=true in the query. Endpoints that return a list of results use the results object as an envelope. Application adds the status parameter to the response body.",
      in: "query",
      name: "envelope",
      required: false,
      schema: { type: "boolean", default: false, example: false },
    },
    {
      description:
        "Unique 24-hexadecimal digit string that identifies the connected organization configuration to update.",
      in: "path",
      name: "orgId",
      required: true,
      schema: {
        type: "string",
        example: "32b6e34b3d91647abb20e7b8",
        maxLength: { $numberInt: "24" },
        minLength: { $numberInt: "24" },
        pattern: "^([a-f0-9]{24})$",
      },
    },
  ],
  requestBody: {
    content: {
      "application/vnd.atlas.2023-01-01+json": {
        schema: {
          type: "object",
          properties: {
            dataAccessIdentityProviderIds: {
              type: "array",
              description:
                "The collection of unique ids of the identity providers for org's data access.",
              items: {
                type: "string",
                description:
                  "Unique 24-hexadecimal digit string that identifies the id of the identity provider for org's data access.",
                example: "32b6e34b3d91647abb20e7b8",
                maxLength: { $numberInt: "24" },
                minLength: { $numberInt: "24" },
                pattern: "^([a-f0-9]{24})$",
              },
              uniqueItems: true,
            },
            domainAllowList: {
              type: "array",
              description:
                "Approved domains that restrict users who can join the organization based on their email address.",
              items: { type: "string" },
              uniqueItems: true,
            },
            domainRestrictionEnabled: {
              type: "boolean",
              description:
                "Value that indicates whether domain restriction is enabled for this connected org.",
            },
            identityProviderId: {
              type: "string",
              description:
                "Unique 20-hexadecimal digit string that identifies the identity provider that this connected org config is associated with.",
              maxLength: { $numberInt: "20" },
              minLength: { $numberInt: "20" },
              pattern: "^([a-f0-9]{20})$",
            },
            orgId: {
              type: "string",
              description:
                "Unique 24-hexadecimal digit string that identifies the connected organization configuration.",
              example: "32b6e34b3d91647abb20e7b8",
              maxLength: { $numberInt: "24" },
              minLength: { $numberInt: "24" },
              pattern: "^([a-f0-9]{24})$",
              readOnly: true,
            },
            postAuthRoleGrants: {
              type: "array",
              description:
                "Atlas roles that are granted to a user in this organization after authenticating.",
              items: {
                type: "string",
                description: "Organization role the user has in Atlas.",
                enum: [
                  "GLOBAL_AUTOMATION_ADMIN",
                  "GLOBAL_BACKUP_ADMIN",
                  "GLOBAL_METERING_USER",
                  "GLOBAL_METRICS_INTERNAL_USER",
                  "GLOBAL_MONITORING_ADMIN",
                  "GLOBAL_OWNER",
                  "GLOBAL_READ_ONLY",
                  "GLOBAL_USER_ADMIN",
                  "GLOBAL_USER_READ_ONLY",
                  "GLOBAL_ACCOUNT_SUSPENSION_ADMIN",
                  "GLOBAL_BILLING_ADMIN",
                  "GLOBAL_BILLING_READ_ONLY",
                  "GLOBAL_LEGAL_ADMIN",
                  "GLOBAL_FEATURE_FLAG_ADMIN",
                  "GLOBAL_APP_SETTING_ADMIN",
                  "GLOBAL_ATLAS_TSE",
                  "GLOBAL_ATLAS_OPERATOR",
                  "GLOBAL_ATLAS_MONGODB_ROLLOUT_ADMIN",
                  "GLOBAL_ATLAS_ADMIN",
                  "GLOBAL_STITCH_ADMIN",
                  "GLOBAL_CHARTS_ADMIN",
                  "GLOBAL_EVENT_ADMIN",
                  "GLOBAL_PARTNER_ADMIN",
                  "GLOBAL_EXPERIMENT_ASSIGNMENT_ADMIN",
                  "GLOBAL_STITCH_INTERNAL_ADMIN",
                  "GLOBAL_BAAS_FEATURE_ADMIN",
                  "GLOBAL_BAAS_SUPPORT",
                  "GLOBAL_SECURITY_ADMIN",
                  "GLOBAL_QUERY_ENGINE_INTERNAL_ADMIN",
                  "GLOBAL_PROACTIVE_SUPPORT_ADMIN",
                  "GLOBAL_INFRASTRUCTURE_INTERNAL_ADMIN",
                  "GLOBAL_SALESFORCE_ADMIN",
                  "GLOBAL_SALESFORCE_READ_ONLY",
                  "GLOBAL_APP_SERVICES_CLUSTER_DEBUG_DATA_ACCESS",
                  "ORG_MEMBER",
                  "ORG_READ_ONLY",
                  "ORG_BILLING_ADMIN",
                  "ORG_GROUP_CREATOR",
                  "ORG_OWNER",
                  "ORG_BILLING_READ_ONLY",
                  "ORG_TEAM_MEMBERS_ADMIN",
                  "GROUP_AUTOMATION_ADMIN",
                  "GROUP_BACKUP_ADMIN",
                  "GROUP_MONITORING_ADMIN",
                  "GROUP_OWNER",
                  "GROUP_READ_ONLY",
                  "GROUP_USER_ADMIN",
                  "GROUP_BILLING_ADMIN",
                  "GROUP_DATA_ACCESS_ADMIN",
                  "GROUP_DATA_ACCESS_READ_ONLY",
                  "GROUP_DATA_ACCESS_READ_WRITE",
                  "GROUP_CHARTS_ADMIN",
                  "GROUP_CLUSTER_MANAGER",
                  "GROUP_SEARCH_INDEX_EDITOR",
                ],
              },
              uniqueItems: true,
            },
            roleMappings: {
              type: "array",
              description:
                "Role mappings that are configured in this organization.",
              items: {
                type: "object",
                description:
                  "Mapping settings that link one IdP and MongoDB Cloud.",
                properties: {
                  externalGroupName: {
                    type: "string",
                    description:
                      "Unique human-readable label that identifies the identity provider group to which this role mapping applies.",
                    maxLength: { $numberInt: "200" },
                    minLength: { $numberInt: "1" },
                  },
                  id: {
                    type: "string",
                    description:
                      "Unique 24-hexadecimal digit string that identifies this role mapping.",
                    example: "32b6e34b3d91647abb20e7b8",
                    maxLength: { $numberInt: "24" },
                    minLength: { $numberInt: "24" },
                    pattern: "^([a-f0-9]{24})$",
                    readOnly: true,
                  },
                  roleAssignments: {
                    type: "array",
                    description:
                      "Atlas roles and the unique identifiers of the groups and organizations associated with each role.",
                    items: {
                      type: "object",
                      properties: {
                        groupId: {
                          type: "string",
                          description:
                            "Unique 24-hexadecimal digit string that identifies the project to which this role belongs. You can set a value for this parameter or **orgId** but not both in the same request.",
                          example: "32b6e34b3d91647abb20e7b8",
                          maxLength: { $numberInt: "24" },
                          minLength: { $numberInt: "24" },
                          pattern: "^([a-f0-9]{24})$",
                        },
                        orgId: {
                          type: "string",
                          description:
                            "Unique 24-hexadecimal digit string that identifies the organization to which this role belongs. You can set a value for this parameter or **groupId** but not both in the same request.",
                          example: "32b6e34b3d91647abb20e7b8",
                          maxLength: { $numberInt: "24" },
                          minLength: { $numberInt: "24" },
                          pattern: "^([a-f0-9]{24})$",
                        },
                        role: {
                          type: "string",
                          description:
                            "Human-readable label that identifies the collection of privileges that MongoDB Cloud grants a specific API key, MongoDB Cloud user, or MongoDB Cloud team. These roles include organization- and project-level roles.\n\nOrganization Roles\n\n* ORG_OWNER\n* ORG_MEMBER\n* ORG_GROUP_CREATOR\n* ORG_BILLING_ADMIN\n* ORG_READ_ONLY\n\nProject Roles\n\n* GROUP_CLUSTER_MANAGER\n* GROUP_DATA_ACCESS_ADMIN\n* GROUP_DATA_ACCESS_READ_ONLY\n* GROUP_DATA_ACCESS_READ_WRITE\n* GROUP_OWNER\n* GROUP_READ_ONLY\n* GROUP_SEARCH_INDEX_EDITOR\n\n",
                          enum: [
                            "ORG_OWNER",
                            "ORG_MEMBER",
                            "ORG_GROUP_CREATOR",
                            "ORG_BILLING_ADMIN",
                            "ORG_READ_ONLY",
                            "GROUP_CLUSTER_MANAGER",
                            "GROUP_DATA_ACCESS_ADMIN",
                            "GROUP_DATA_ACCESS_READ_ONLY",
                            "GROUP_DATA_ACCESS_READ_WRITE",
                            "GROUP_OWNER",
                            "GROUP_READ_ONLY",
                            "GROUP_SEARCH_INDEX_EDITOR",
                          ],
                        },
                      },
                    },
                    uniqueItems: true,
                  },
                },
                required: ["externalGroupName"],
                title: "Federated Authentication Role Mapping",
              },
              uniqueItems: true,
            },
            userConflicts: {
              type: "array",
              description:
                "List that contains the users who have an email address that doesn't match any domain on the allowed list.",
              items: {
                type: "object",
                description:
                  "MongoDB Cloud user linked to this federated authentication.",
                properties: {
                  emailAddress: {
                    type: "string",
                    format: "email",
                    description:
                      "Email address of the MongoDB Cloud user linked to the federated organization.",
                  },
                  federationSettingsId: {
                    type: "string",
                    description:
                      "Unique 24-hexadecimal digit string that identifies the federation to which this MongoDB Cloud user belongs.",
                    example: "32b6e34b3d91647abb20e7b8",
                    maxLength: { $numberInt: "24" },
                    minLength: { $numberInt: "24" },
                    pattern: "^([a-f0-9]{24})$",
                  },
                  firstName: {
                    type: "string",
                    description:
                      "First or given name that belongs to the MongoDB Cloud user.",
                  },
                  lastName: {
                    type: "string",
                    description:
                      "Last name, family name, or surname that belongs to the MongoDB Cloud user.",
                  },
                  userId: {
                    type: "string",
                    description:
                      "Unique 24-hexadecimal digit string that identifies this user.",
                    maxLength: { $numberInt: "24" },
                    minLength: { $numberInt: "24" },
                    pattern: "^([a-f0-9]{24})$",
                    readOnly: true,
                  },
                },
                required: [
                  "emailAddress",
                  "federationSettingsId",
                  "firstName",
                  "lastName",
                ],
                title: "Federated User",
              },
            },
          },
          required: ["domainRestrictionEnabled", "identityProviderId", "orgId"],
        },
      },
    },
    description:
      "The connected organization configuration that you want to update.",
    required: true,
  },
  responses: {
    "200": {
      content: {
        "application/vnd.atlas.2023-01-01+json": {
          schema:
            "$.requestBody.content.application/vnd.atlas.2023-01-01+json.schema",
          "x-xgen-version": "2023-01-01",
        },
      },
      description: "OK",
    },
    "400": {
      content: {
        "application/json": {
          example: {
            detail:
              "(This is just an example, the exception may not be related to this endpoint) No provider AWS exists.",
            error: { $numberInt: "400" },
            errorCode: "INVALID_PROVIDER",
            parameters: ["AWS"],
            reason: "Bad Request",
          },
          schema: {
            type: "object",
            properties: {
              detail: {
                type: "string",
                description:
                  "Describes the specific conditions or reasons that cause each type of error.",
              },
              error: {
                type: "integer",
                format: "int32",
                description: "HTTP status code returned with this error.",
                maximum: { $numberInt: "599" },
                minimum: { $numberInt: "200" },
              },
              errorCode: {
                type: "string",
                description: "Application error code returned with this error.",
                example: "TOO_MANY_GROUP_NOTIFICATIONS",
              },
              parameters: {
                type: "array",
                description:
                  "Parameter uses to give more information about the error.",
              },
              reason: {
                type: "string",
                description:
                  "Application error message returned with this error.",
                example:
                  "At most one group notification can be specified for an alert configuration.",
              },
            },
          },
        },
      },
      description: "Bad Request.",
    },
    "401": {
      content: {
        "application/json": {
          example: {
            detail:
              "(This is just an example, the exception may not be related to this endpoint)",
            error: { $numberInt: "401" },
            errorCode: "NOT_ORG_GROUP_CREATOR",
            parameters: ["EXAMPLE"],
            reason: "Unauthorized",
          },
          schema: "$.responses[400].content.application/json.schema",
        },
      },
      description: "Unauthorized.",
    },
    "404": {
      content: {
        "application/json": {
          example: {
            detail:
              "(This is just an example, the exception may not be related to this endpoint) Cannot find resource AWS",
            error: { $numberInt: "404" },
            errorCode: "RESOURCE_NOT_FOUND",
            parameters: ["AWS"],
            reason: "Not Found",
          },
          schema: "$.responses[401].content.application/json.schema",
        },
      },
      description: "Not Found.",
    },
    "500": {
      content: {
        "application/json": {
          example: {
            detail:
              "(This is just an example, the exception may not be related to this endpoint)",
            error: { $numberInt: "500" },
            errorCode: "UNEXPECTED_ERROR",
            parameters: ["EXAMPLE"],
            reason: "Internal Server Error",
          },
          schema: "$.responses[401].content.application/json.schema",
        },
      },
      description: "Internal Server Error.",
    },
  },
  security: [{ DigestAuth: [] }],
  summary: "Update One Org Config Connected to One Federation",
  tags: ["Federated Authentication"],
};

describe("makePersistedHttpRequestFunctionDefinition", () => {
  it("validates metadata", () => {
    expect(() => {
      makePersistedHttpRequestFunctionDefinition({
        embedding: [],
        sourceName: "",
        text: "",
        tokenCount: 0,
        updated: new Date(),
        url: "",
        chunkAlgoHash: "",
        metadata: sampleMetadata,
      });
    }).not.toThrow();
  });
});
