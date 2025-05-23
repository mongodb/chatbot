import xml2js from "xml2js";

export type InitialWebSource = {
  /**
   The name of the web source.
   */
  name: string;

  /**
   An array of URLs associated with the web source.
   */
  urls: string[];

  /**
   An optional array of directory URLs associated with the web source.
   All URLs in the directory are part of the web source.
   */
  directoryUrls?: string[];

  /**
   Optional additional metadata determined by the web source.
   */
  staticMetadata?: Record<string, string | string[]>;
};

export const initialWebSources: InitialWebSource[] = [
  {
    name: "company",
    urls: [
      "https://www.mongodb.com/company",
      "https://www.mongodb.com/company/careers",
      "https://www.mongodb.com/company/leadership-principles",
      "https://www.mongodb.com/company/our-story",
      "https://www.mongodb.com/company/values",
    ],
    staticMetadata: {
      type: "Company",
    },
  },
  {
    name: "services",
    urls: [
      "https://www.mongodb.com/services/consulting",
      "https://www.mongodb.com/services/consulting/ai-accelerator",
      "https://www.mongodb.com/services/consulting/ai-applications-program",
      "https://www.mongodb.com/services/consulting/flex-consulting",
      "https://www.mongodb.com/services/consulting/major-version-upgrade",
      "https://www.mongodb.com/services/consulting/relational-migration-methodology",
      "https://www.mongodb.com/services/training",
    ],
    staticMetadata: {
      type: "Services",
    },
  },
  {
    name: "products",
    urls: [
      "https://www.mongodb.com/products",
      "https://www.mongodb.com/products/capabilities/security",
      "https://www.mongodb.com/products/capabilities/security/encryption",
      "https://www.mongodb.com/products/integrations/hashicorp-terraform",
      "https://www.mongodb.com/products/integrations/kubernetes/atlas-kubernetes-operator",
      "https://www.mongodb.com/products/platform/atlas-charts",
      "https://www.mongodb.com/products/platform/atlas-cloud-providers/aws",
      "https://www.mongodb.com/products/platform/atlas-cloud-providers/azure",
      "https://www.mongodb.com/products/platform/atlas-cloud-providers/google-cloud",
      "https://www.mongodb.com/products/platform/atlas-database",
      "https://www.mongodb.com/products/platform/atlas-for-government",
      "https://www.mongodb.com/products/platform/atlas-online-archive",
      "https://www.mongodb.com/products/platform/atlas-search",
      "https://www.mongodb.com/products/platform/atlas-stream-processing",
      "https://www.mongodb.com/products/platform/atlas-vector-search",
      "https://www.mongodb.com/products/platform/atlas-vector-search/features",
      "https://www.mongodb.com/products/platform/atlas-vector-search/getting-started",
      "https://www.mongodb.com/products/platform/cloud-backup",
      "https://www.mongodb.com/products/platform/trust",
      "https://www.mongodb.com/products/self-managed/community-edition",
      "https://www.mongodb.com/products/self-managed/enterprise-advanced",
      "https://www.mongodb.com/products/tools",
      "https://www.mongodb.com/products/tools/atlas-cli",
      "https://www.mongodb.com/products/tools/compass",
      "https://www.mongodb.com/products/tools/intellij",
      "https://www.mongodb.com/products/tools/relational-migrator",
      "https://www.mongodb.com/products/tools/vs-code",
      "https://www.mongodb.com/products/updates/version-release",
    ],
    staticMetadata: {
      type: "Products",
    },
  },
  {
    name: "solutions",
    directoryUrls: [
      "https://www.mongodb.com/solutions/customer-case-studies",
      "https://www.mongodb.com/solutions/solutions-library",
    ],
    urls: [
      "https://www.mongodb.com/solutions/developer-data-platform",
      "https://www.mongodb.com/solutions/industries",
      "https://www.mongodb.com/solutions/industries/financial-services",
      "https://www.mongodb.com/solutions/industries/healthcare",
      "https://www.mongodb.com/solutions/industries/insurance",
      "https://www.mongodb.com/solutions/industries/manufacturing",
      "https://www.mongodb.com/solutions/industries/media-and-entertainment",
      "https://www.mongodb.com/solutions/industries/public-sector",
      "https://www.mongodb.com/solutions/industries/retail",
      "https://www.mongodb.com/solutions/industries/telecommunications",
      "https://www.mongodb.com/solutions/startups",
      "https://www.mongodb.com/solutions/use-cases",
      "https://www.mongodb.com/solutions/use-cases/artificial-intelligence",
      "https://www.mongodb.com/solutions/use-cases/gaming",
      "https://www.mongodb.com/solutions/use-cases/payments",
      "https://www.mongodb.com/solutions/use-cases/serverless",
    ],
    staticMetadata: {
      type: "Solutions",
    },
  },
  {
    name: "resources",
    urls: [
      "https://www.mongodb.com/resources/basics/ai-hallucinations",
      "https://www.mongodb.com/resources/basics/ai-in-finance",
      "https://www.mongodb.com/resources/basics/ai-stack",
      "https://www.mongodb.com/resources/basics/ann-search",
      "https://www.mongodb.com/resources/basics/artificial-intelligence/ai-agents",
      "https://www.mongodb.com/resources/basics/artificial-intelligence/ai-stack/",
      "https://www.mongodb.com/resources/basics/artificial-intelligence/generative-ai-use-cases",
      "https://www.mongodb.com/resources/basics/artificial-intelligence/machine-learning-healthcare",
      "https://www.mongodb.com/resources/basics/artificial-intelligence/retrieval-augmented-generation",
      "https://www.mongodb.com/resources/basics/cloud-explained/business-intelligence-bi-tools",
      "https://www.mongodb.com/resources/basics/cloud-explained/iaas-infrastructure-as-a-service",
      "https://www.mongodb.com/resources/basics/cloud-explained/iot-architecture/",
      "https://www.mongodb.com/resources/basics/cognitive-search",
      "https://www.mongodb.com/resources/basics/data-engineering/",
      "https://www.mongodb.com/resources/basics/databases/acid-transactions/",
      "https://www.mongodb.com/resources/basics/databases/cloud-databases/cloud-migration",
      "https://www.mongodb.com/resources/basics/databases/cloud-databases/free-cloud-database",
      "https://www.mongodb.com/resources/basics/databases/cloud-databases/free-cloud-database/",
      "https://www.mongodb.com/resources/basics/databases/database-hosting/",
      "https://www.mongodb.com/resources/basics/databases/in-memory-database/",
      "https://www.mongodb.com/resources/basics/databases/key-value-database/",
      "https://www.mongodb.com/resources/basics/databases/middleware",
      "https://www.mongodb.com/resources/basics/databases/nosql-explained/",
      "https://www.mongodb.com/resources/basics/databases/nosql-explained/nosql-vs-sql/",
      "https://www.mongodb.com/resources/basics/databases/what-is-an-object-oriented-database/",
      "https://www.mongodb.com/resources/basics/disaster-recovery",
      "https://www.mongodb.com/resources/basics/foundation-models",
      "https://www.mongodb.com/resources/basics/full-stack-development/",
      "https://www.mongodb.com/resources/basics/fuzzy-match/",
      "https://www.mongodb.com/resources/basics/hierarchical-navigable-small-world",
      "https://www.mongodb.com/resources/basics/implementing-an-operational-data-layer",
      "https://www.mongodb.com/resources/basics/json-and-bson/",
      "https://www.mongodb.com/resources/basics/langchain",
      "https://www.mongodb.com/resources/basics/named-entity-recognition",
      "https://www.mongodb.com/resources/basics/observability",
      "https://www.mongodb.com/resources/basics/predictive-ai",
      "https://www.mongodb.com/resources/basics/prompt-engineering",
      "https://www.mongodb.com/resources/basics/quantum-machine-learning",
      "https://www.mongodb.com/resources/basics/real-time-payments",
      "https://www.mongodb.com/resources/basics/reinforcement-learning",
      "https://www.mongodb.com/resources/basics/role-based-access-control",
      "https://www.mongodb.com/resources/basics/self-supervised-learning",
      "https://www.mongodb.com/resources/basics/system-of-insight",
      "https://www.mongodb.com/resources/basics/unified-modeling-language",
      "https://www.mongodb.com/resources/basics/unstructured-data/tools",
      "https://www.mongodb.com/resources/basics/vector-embeddings",
      "https://www.mongodb.com/resources/basics/vector-index",
      "https://www.mongodb.com/resources/basics/vector-search",
      "https://www.mongodb.com/resources/basics/vector-stores/",
      "https://www.mongodb.com/resources/basics/what-is-stream-processing",
      "https://www.mongodb.com/resources/compare/mongodb-atlas-search-vs-elastic-elasticsearch",
      "https://www.mongodb.com/resources/compare/mongodb-oracle",
      "https://www.mongodb.com/resources/compare/mongodb-postgresql",
      "https://www.mongodb.com/resources/compare/mongodb-postgresql/dsl-migrating-postgres-to-mongodb",
      "https://www.mongodb.com/resources/products/capabilities/stored-procedures",
      "https://www.mongodb.com/resources/products/compatibilities/kubernetes",
      "https://www.mongodb.com/resources/products/fundamentals/why-use-mongodb",
      "https://www.mongodb.com/resources/solutions/use-cases/energy-modernization-with-mongodb",
      "https://www.mongodb.com/resources/solutions/use-cases/generative-ai-predictive-maintenance-applications",
      "https://www.mongodb.com/resources/solutions/use-cases/mysql-to-mongodb",
    ],
    staticMetadata: {
      type: "Resources",
    },
  },
  {
    name: "comparisons",
    urls: [
      "https://www.mongodb.com/resources/compare/advantages-of-mongodb",
      "https://www.mongodb.com/resources/compare/cassandra-vs-mongodb",
      "https://www.mongodb.com/resources/compare/compare-documentdb-cosmosdb",
      "https://www.mongodb.com/resources/compare/couchbase-vs-mongodb",
      "https://www.mongodb.com/resources/compare/mongodb-oracle",
      "https://www.mongodb.com/resources/compare/mongodb-postgresql",
    ],
    staticMetadata: {
      type: "Comparisons",
    },
  },
  {
    name: "blog",
    urls: [
      "https://www.mongodb.com/blog/post/3-ways-mongodb-ea-azure-arc-certification-serves-customers",
      "https://www.mongodb.com/blog/post/7-new-resource-policies-strengthen-atlas-security",
      "https://www.mongodb.com/blog/post/a-new-way-to-query-introducing-atlas-search-playground",
      "https://www.mongodb.com/blog/post/accelerating-mongodb-migration-to-azure-microsoft-migration-factory",
      "https://www.mongodb.com/blog/post/accelerating-sybase-to-mongodb-modernization-peerai",
      "https://www.mongodb.com/blog/post/advancing-encryption-in-mongodb-atlas",
      "https://www.mongodb.com/blog/post/advancing-integration-between-drupal-mongodb",
      "https://www.mongodb.com/blog/post/agnostiq-mongodb-high-performance-computing-for-all",
      "https://www.mongodb.com/blog/post/ahamove-rides-vietnams-ecommerce-boom-ai-on-mongodb",
      "https://www.mongodb.com/blog/post/ai-agents-hybrid-search-indexing-with-langchain-mongodb",
      "https://www.mongodb.com/blog/post/ai-applications-program-partner-spotlight-cohere-leading-ai-foundation-models-enterprise",
      "https://www.mongodb.com/blog/post/ai-driven-noise-analysis-for-automotive-diagnostics",
      "https://www.mongodb.com/blog/post/ai-powered-call-centers-new-era-of-customer-service",
      "https://www.mongodb.com/blog/post/ai-powered-java-applications-with-mongodb-langchain4j",
      "https://www.mongodb.com/blog/post/ai-powered-media-personalization-mongodb-vector-search",
      "https://www.mongodb.com/blog/post/ai-powered-retail-with-together-ai-mongodb",
      "https://www.mongodb.com/blog/post/announcing-2025-mongodb-phd-fellowship-recipients",
      "https://www.mongodb.com/blog/post/announcing-direct-query-support-for-mongodb-atlas-connector-power-bi",
      "https://www.mongodb.com/blog/post/announcing-hybrid-search-support-for-llama-index",
      "https://www.mongodb.com/blog/post/announcing-mongodb-mcp-server",
      "https://www.mongodb.com/blog/post/announcing-mongodb-server-8-0-platform-support-improvements",
      "https://www.mongodb.com/blog/post/anti-money-laundering-fraud-prevention-mongodb-vector-search-openai",
      "https://www.mongodb.com/blog/post/assessing-business-loan-risks-mongodb-generative-ai",
      "https://www.mongodb.com/blog/post/atlas-edge-server-now-in-public-preview",
      "https://www.mongodb.com/blog/post/atlas-search-nodes-now-with-multi-region-availability",
      "https://www.mongodb.com/blog/post/atlas-stream-processing-adds-aws-regions-vpc-peering-more",
      "https://www.mongodb.com/blog/post/atlas-stream-processing-cost-effective-way-integrate-kafka-mongodb",
      "https://www.mongodb.com/blog/post/atlas-stream-processing-now-generally-available",
      "https://www.mongodb.com/blog/post/atlas-stream-processing-now-supports-azure-and-azure-private-link",
      "https://www.mongodb.com/blog/post/automate-network-management-using-gen-ai-ops-mongodb",
      "https://www.mongodb.com/blog/post/away-from-keyboard-kyle-lai-software-engineer-2",
      "https://www.mongodb.com/blog/post/aws-names-mongodb-asean-global-software-partner-of-year",
      "https://www.mongodb.com/blog/post/baic-group-powers-internet-of-vehicles-with-mongodb",
      "https://www.mongodb.com/blog/post/better-digital-banking-experiences-with-ai-mongodb",
      "https://www.mongodb.com/blog/post/binary-quantization-rescoring-96-less-memory-faster-search",
      "https://www.mongodb.com/blog/post/boosting-customer-lifetime-value-agmeta-mongodb",
      "https://www.mongodb.com/blog/post/bringing-gen-ai-into-real-world-with-ramblr-mongodb",
      "https://www.mongodb.com/blog/post/building-gen-ai-applications-using-iguazio-mongodb",
      "https://www.mongodb.com/blog/post/building-gen-ai-mongodb-ai-partners-february-2025",
      "https://www.mongodb.com/blog/post/building-gen-ai-mongodb-ai-partners-may-2024",
      "https://www.mongodb.com/blog/post/building-gen-ai-powered-predictive-maintenance-mongodb",
      "https://www.mongodb.com/blog/post/building-modern-applications-faster-new-capabilities-mongodb-local-nyc-2024",
      "https://www.mongodb.com/blog/post/building-the-next-big-thing-together-partner-awards-2024",
      "https://www.mongodb.com/blog/post/building-unified-data-platform-for-gen-ai",
      "https://www.mongodb.com/blog/post/built-mongodb-atlas-helps-team-gpt-launch-two-weeks",
      "https://www.mongodb.com/blog/post/built-mongodb-buzzy-makes-ai-application-development-more-accessible",
      "https://www.mongodb.com/blog/post/built-mongodb-kraken-coding-revolutionizes-clinical-decision-support",
      "https://www.mongodb.com/blog/post/busting-top-myths-about-mongodb-vs-relational-databases",
      "https://www.mongodb.com/blog/post/checkpointers-native-parent-child-retrievers-with-langchain-mongodb",
      "https://www.mongodb.com/blog/post/commerce-scale-zepto-reduces-latency-by-40-percent-mongodb",
      "https://www.mongodb.com/blog/post/converged-ai-application-datastore-for-insurance",
      "https://www.mongodb.com/blog/post/ctf-life-leverages-mongodb-atlas-deliver-customer-centric-service",
      "https://www.mongodb.com/blog/post/culture/reimagining-legacy-systems-with-ai-why-were-building-future",
      "https://www.mongodb.com/blog/post/customer-service-expert-wati-io-scales-up-on-mongodb",
      "https://www.mongodb.com/blog/post/debunking-mongodb-myths-enterprise-use-cases",
      "https://www.mongodb.com/blog/post/debunking-mongodb-myths-security-scale-performance",
      "https://www.mongodb.com/blog/post/ditto-mongodb-connector-seamlessly-sync-edge-and-cloud-data",
      "https://www.mongodb.com/blog/post/driving-retail-loyalty-with-mongodb-cognigy",
      "https://www.mongodb.com/blog/post/dual-journey-healthcare-interoperability-modernization",
      "https://www.mongodb.com/blog/post/dynamic-workloads-predictable-costs-mongodb-atlas-flex-tier",
      "https://www.mongodb.com/blog/post/elevate-your-java-applications-mongodb-spring-ai",
      "https://www.mongodb.com/blog/post/elevate-your-python-ai-projects-mongodb-haystack",
      "https://www.mongodb.com/blog/post/elevating-database-performance-introducing-query-insights-mongodb-atlas",
      "https://www.mongodb.com/blog/post/embracing-open-finance-innovation-with-mongodb",
      "https://www.mongodb.com/blog/post/empower-financial-services-developers-with-document-model",
      "https://www.mongodb.com/blog/post/empower-innovation-in-insurance-mongodb-informatica",
      "https://www.mongodb.com/blog/post/empowering-aspiring-developers-africa-mongodb-mytechdev-partnership",
      "https://www.mongodb.com/blog/post/engineering/rethinking-information-retrieval-mongodb-with-voyage-ai",
      "https://www.mongodb.com/blog/post/enhancing-mongodb-atlas-go-sdk-with-automated-code-generation",
      "https://www.mongodb.com/blog/post/enhancing-retail-retrieval-augmented-generation-rag",
      "https://www.mongodb.com/blog/post/exact-nearest-neighbor-vector-search-for-precise-retrieval",
      "https://www.mongodb.com/blog/post/exploring-new-security-billing-customization-features-in-atlas-charts",
      "https://www.mongodb.com/blog/post/find-hidden-insights-vector-databases-semantic-clustering",
      "https://www.mongodb.com/blog/post/firebase-mongodb-atlas-powerful-combo-for-rapid-app-development",
      "https://www.mongodb.com/blog/post/from-chaos-to-control-real-time-data-analytics-for-airlines",
      "https://www.mongodb.com/blog/post/goodnotes-finds-marketplace-success-using-mongodb-atlas",
      "https://www.mongodb.com/blog/post/grab-drives-50-percent-efficiencies-mongodb-atlas",
      "https://www.mongodb.com/blog/post/graphrag-mongodb-atlas-integrating-knowledge-graphs-with-llms",
      "https://www.mongodb.com/blog/post/hasura-powerful-access-control-on-mongodb-data",
      "https://www.mongodb.com/blog/post/health-tech-startup-aktivo-labs-scales-up-with-mongodb-atlas",
      "https://www.mongodb.com/blog/post/how-cognistxs-squary-ai-is-redefining-information-access",
      "https://www.mongodb.com/blog/post/how-mongodb-scales-copilot-ai-humanized-sales-interactions",
      "https://www.mongodb.com/blog/post/how-neurodiversity-shines-at-mongodb",
      "https://www.mongodb.com/blog/post/how-nfsa-is-using-mongodb-atlas-ai-make-aussie-culture-accessible",
      "https://www.mongodb.com/blog/post/improving-mongodb-queries-by-simplifying-boolean-expressions",
      "https://www.mongodb.com/blog/post/improving-omnichannel-ordering-bopis-delivery-with-mongodb",
      "https://www.mongodb.com/blog/post/innovating-with-mongodb-customer-successes-march-2025",
      "https://www.mongodb.com/blog/post/innovation/agentic-workflows-insurance-claim-processing",
      "https://www.mongodb.com/blog/post/innovation/capgemini-mongodb-smarter-ai-data-for-business",
      "https://www.mongodb.com/blog/post/innovation/how-mongodb-google-cloud-power-future-of-in-car-assistants",
      "https://www.mongodb.com/blog/post/innovation/multi-agentic-systems-in-industry-xmpro-mongodb-atlas",
      "https://www.mongodb.com/blog/post/innovation/orderonline-ai-improves-conversion-rate-by-56-percent-mongodb",
      "https://www.mongodb.com/blog/post/innovation/reimagining-investment-portfolio-management-with-agentic-ai",
      "https://www.mongodb.com/blog/post/innovation/ubuy-scales-ecommerce-globally-unlocks-ai-with-mongodb",
      "https://www.mongodb.com/blog/post/innovation/vpbank-builds-openapi-platform-with-mongodb",
      "https://www.mongodb.com/blog/post/inside-mongodbs-early-access-programs",
      "https://www.mongodb.com/blog/post/intellect-ai-unleashes-ai-at-scale-with-mongodb",
      "https://www.mongodb.com/blog/post/introducing-ai-powered-natural-language-mode-atlas-charts",
      "https://www.mongodb.com/blog/post/introducing-database-digest-building-foundations-for-success",
      "https://www.mongodb.com/blog/post/introducing-mongodb-atlas-service-accounts-via-oauth-2-0",
      "https://www.mongodb.com/blog/post/introducing-multi-kubernetes-cluster-deployment-support",
      "https://www.mongodb.com/blog/post/introducing-new-mongodb-application-delivery-certification",
      "https://www.mongodb.com/blog/post/introducing-new-navigation-for-mongodb-atlas-cloud-manager",
      "https://www.mongodb.com/blog/post/introducing-two-mongodb-generative-ai-learning-badges",
      "https://www.mongodb.com/blog/post/leveraging-an-operational-data-layer-for-telco-success",
      "https://www.mongodb.com/blog/post/leveraging-big-query-json-for-optimized-mongodb-dataflow-pipelines",
      "https://www.mongodb.com/blog/post/leveraging-database-observability-mongodb-real-life-use-case",
      "https://www.mongodb.com/blog/post/magicpin-builds-indias-largest-hyperlocal-retail-platform-on-mongodb",
      "https://www.mongodb.com/blog/post/managing-data-corruption-in-the-cloud",
      "https://www.mongodb.com/blog/post/meeting-uks-telecommunications-security-act-mongodb",
      "https://www.mongodb.com/blog/post/microservices-realizing-benefits-without-complexity",
      "https://www.mongodb.com/blog/post/modernize-on-prem-mongodb-google-cloud-migration-center",
      "https://www.mongodb.com/blog/post/modernizing-telecom-legacy-applications-mongodb",
      "https://www.mongodb.com/blog/post/modernizing-telecom-legacy-applications-mongodb",
      "https://www.mongodb.com/blog/post/mongodb-8-0-eating-our-own-dog-food",
      "https://www.mongodb.com/blog/post/mongodb-8-0-improving-performance-avoiding-regressions",
      "https://www.mongodb.com/blog/post/mongodb-8-0-raising-the-bar",
      "https://www.mongodb.com/blog/post/mongodb-ai-applications-program-delivering-customer-value",
      "https://www.mongodb.com/blog/post/mongodb-ai-applications-program-maap-is-now-available",
      "https://www.mongodb.com/blog/post/mongodb-atlas-expands-cloud-availability-to-mexico",
      "https://www.mongodb.com/blog/post/mongodb-atlas-government-supports-gcp-assured-workloads",
      "https://www.mongodb.com/blog/post/mongodb-atlas-integration-ably-unlocks-real-time-capabilities",
      "https://www.mongodb.com/blog/post/mongodb-atlas-introduces-enhanced-cost-optimization-tools",
      "https://www.mongodb.com/blog/post/mongodb-atlas-power-sync-future-offline-first-enterprise-apps",
      "https://www.mongodb.com/blog/post/mongodb-database-observability-integrating-with-monitoring-tools",
      "https://www.mongodb.com/blog/post/mongodb-django-backend-now-available-public-preview",
      "https://www.mongodb.com/blog/post/mongodb-dkatalis-bank-jago-empowering-over-500-engineers",
      "https://www.mongodb.com/blog/post/mongodb-empowers-isvs-to-drive-saas-innovation-india",
      "https://www.mongodb.com/blog/post/mongodb-enables-ai-powered-legal-searches-qura",
      "https://www.mongodb.com/blog/post/mongodb-gateway-to-open-finance-financial-data-access",
      "https://www.mongodb.com/blog/post/mongodb-helps-asian-retailers-scale-innovate-at-speed",
      "https://www.mongodb.com/blog/post/mongodb-introduces-workload-identity-federation-database-access",
      "https://www.mongodb.com/blog/post/mongodb-leader-in-forrester-wave-translytical-data-platforms",
      "https://www.mongodb.com/blog/post/mongodb-local-london-2024-better-applications-faster",
      "https://www.mongodb.com/blog/post/mongodb-microsoft-team-up-enhance-copilot-in-vs-code",
      "https://www.mongodb.com/blog/post/mongodb-named-leader-2024-gartner-magic-quadrant-cloud-database-management-system",
      "https://www.mongodb.com/blog/post/mongodb-powering-digital-natives",
      "https://www.mongodb.com/blog/post/mongodb-powers-mdaqs-anti-money-laundering-compliance-platform",
      "https://www.mongodb.com/blog/post/mongodb-provider-entity-framework-core-now-generally-available",
      "https://www.mongodb.com/blog/post/mongodb-sales-recognized-as-top-20-org-professional-development-repvue",
      "https://www.mongodb.com/blog/post/multi-agent-collaboration-for-manufacturing-operations-optimization",
      "https://www.mongodb.com/blog/post/new-atlas-administrator-learning-path-and-certification",
      "https://www.mongodb.com/blog/post/new-course-building-ai-applications-mongodb-on-aws",
      "https://www.mongodb.com/blog/post/next-generation-mobility-solutions-agentic-ai-mongodb-atlas",
      "https://www.mongodb.com/blog/post/nokia-corteca-scales-wifi-connectivity-millions-devices-mongodb-atlas",
      "https://www.mongodb.com/blog/post/origami-machine-learning-architecture-for-document-model",
      "https://www.mongodb.com/blog/post/pathfinder-labs-tames-data-chaos-unleashes-ai-mongodb",
      "https://www.mongodb.com/blog/post/payments-modernization-role-of-operational-data-layer",
      "https://www.mongodb.com/blog/post/product-release-announcements/introducing-automated-risk-analysis-in-relational-migrator",
      "https://www.mongodb.com/blog/post/product-release-announcements/mongodb-8-0-rbac-now-available-on-digitalocean",
      "https://www.mongodb.com/blog/post/redefining-database-ai-why-mongodb-acquired-voyage-ai",
      "https://www.mongodb.com/blog/post/reintroducing-versioned-mongodb-atlas-administration-api",
      "https://www.mongodb.com/blog/post/retail-insights-mongodb-shoptalk-fall",
      "https://www.mongodb.com/blog/post/retool-state-of-ai-report-mongodb-vector-search-most-loved-vector-database",
      "https://www.mongodb.com/blog/post/revolutionizing-sales-with-ai-glyphic-ais-journey-mongodb",
      "https://www.mongodb.com/blog/post/saving-energy-smarter-mongodb-cedalo-for-smart-meter-systems",
      "https://www.mongodb.com/blog/post/secure-by-default-mandatory-mfa-in-mongodb-atlas",
      "https://www.mongodb.com/blog/post/secure-scale-your-data-with-mongodb-atlas-on-azure-and-gcp",
      "https://www.mongodb.com/blog/post/securing-digital-transformation-with-mongodb-regdata",
      "https://www.mongodb.com/blog/post/simplify-security-at-scale-resource-policies-mongodb-atlas",
      "https://www.mongodb.com/blog/post/smarter-care-mongodb-microsoft",
      "https://www.mongodb.com/blog/post/sonyliv-improves-cms-performance-by-98-percent-on-atlas",
      "https://www.mongodb.com/blog/post/spinning-up-innovation-how-mongodb-driving-new-solutions-qsstudio",
      "https://www.mongodb.com/blog/post/stay-compliant-mongodbs-latest-certifications-iso9001-tisax-hds-tx-ramp",
      "https://www.mongodb.com/blog/post/strengthen-data-security-mongodb-queryable-encryption",
      "https://www.mongodb.com/blog/post/supercharge-ai-data-management-knowledge-graphs",
      "https://www.mongodb.com/blog/post/teach-learn-with-mongodb-professor-abdussalam-alawini",
      "https://www.mongodb.com/blog/post/teach-learn-with-mongodb-professor-chanda-raj-kumar",
      "https://www.mongodb.com/blog/post/technical/people-who-ship-building-centralized-ai-tooling",
      "https://www.mongodb.com/blog/post/technical/strategic-database-architecture-for-ai-unified-vs-split",
      "https://www.mongodb.com/blog/post/test-out-search-like-never-before-introducing-search-demo-builder",
      "https://www.mongodb.com/blog/post/thl-simplifies-architecture-with-mongodb-atlas-search",
      "https://www.mongodb.com/blog/post/top-4-reasons-to-use-mongodb-8-0",
      "https://www.mongodb.com/blog/post/top-ai-announcements-at-mongodb-local-nyc",
      "https://www.mongodb.com/blog/post/top-use-cases-for-text-vector-and-hybrid-search",
      "https://www.mongodb.com/blog/post/transforming-news-into-audio-experiences-mongodb-ai",
      "https://www.mongodb.com/blog/post/transforming-predictive-maintenance-ai-real-time-audio-based-diagnostics-atlas-vector-search",
      "https://www.mongodb.com/blog/post/unified-namespace-implementation-mongodb-and-maestrohub",
      "https://www.mongodb.com/blog/post/unlock-pdf-search-in-insurance-mongodb-superduperdb",
      "https://www.mongodb.com/blog/post/unlocking-bi-potential-with-data-genie-mongodb",
      "https://www.mongodb.com/blog/post/unlocking-literacy-ojjes-journey-with-mongodb",
      "https://www.mongodb.com/blog/post/unlocking-performance-insights-optimization-strategies",
      "https://www.mongodb.com/blog/post/unlocking-seamless-data-migrations-from-cosmos-db-mongodb-atlas-with-adiom",
      "https://www.mongodb.com/blog/post/using-agentic-rag-transform-retail-mongodb",
      "https://www.mongodb.com/blog/post/vector-quantization-scale-search-generative-ai-applications",
      "https://www.mongodb.com/blog/post/welcome-to-mongodb-local-nyc-2024",
      "https://www.mongodb.com/blog/post/whats-new-from-mongodb-at-google-cloud-next-2025",
      "https://www.mongodb.com/blog/post/whats-new-from-mongodb-at-microsoft-build-2024",
      "https://www.mongodb.com/blog/post/why-mongodb-is-perfect-fit-for-a-unified-namespace",
      "https://www.mongodb.com/blog/post/why-vector-quantization-matters-for-ai-workloads",
      "https://www.mongodb.com/blog/post/zee5-masterclass-in-migrating-microservices-atlas",
    ],
    staticMetadata: {
      type: "Blog",
    },
  },
  {
    name: "web-misc",
    urls: [
      "https://learn.mongodb.com",
      "https://support.mongodb.com",
      "https://www.mongodb.com",
      "https://www.mongodb.com/atlas",
      "https://www.mongodb.com/leadership",
      "https://www.mongodb.com/legal/acceptable-use-policy",
      "https://www.mongodb.com/legal/licensing/server-side-public-license",
      "https://www.mongodb.com/legal/privacy-policy",
      "https://www.mongodb.com/legal/terms-of-use",
      "https://www.mongodb.com/pricing",
      "https://www.mongodb.com/try/download/community",
      "https://www.mongodb.com/try/download/compass",
      "https://www.mongodb.com/why-use-mongodb",
    ],
  },
  {
    name: "university-skills",
    urls: [
      "https://learn.mongodb.com/skills",
      "https://learn.mongodb.com/courses/relational-to-document-model",
      "https://learn.mongodb.com/courses/schema-design-patterns-and-antipatterns",
      "https://learn.mongodb.com/courses/advanced-schema-patterns-and-antipatterns",
      "https://learn.mongodb.com/courses/schema-design-optimization",
    ],
    staticMetadata: {
      tags: ["Skills", "MongoDB University"],
    },
  },
];

export async function getUrlsFromSitemap(
  sitemapURL: string
): Promise<string[]> {
  const response = await fetch(sitemapURL);
  const sitemap = await response.text();
  const parser = new xml2js.Parser();
  const parsedXML = await parser.parseStringPromise(sitemap);
  return parsedXML.urlset.url.map((url: { loc: string[] }) => url.loc[0]);
}

export type WebSource = Pick<
  InitialWebSource,
  "name" | "staticMetadata" | "urls"
>;

type PrepareWebSourcesParams = {
  initialWebSources: InitialWebSource[];
  sitemapUrls: string[];
};

/**
 Processes initial web sources
 For web sources that have directories listed, all URLs within the directory are added to the web source urls list.
 The sitemapUrls are used to find the URLs in the directory.
 */
export const prepareWebSources = async ({
  initialWebSources,
  sitemapUrls,
}: PrepareWebSourcesParams): Promise<WebSource[]> => {
  const webSources: WebSource[] = [];
  for (const initialWebSource of initialWebSources) {
    const { name, staticMetadata } = initialWebSource;
    let urls = initialWebSource.urls || [];
    if (initialWebSource.directoryUrls?.length) {
      for (const directoryUrl of initialWebSource.directoryUrls) {
        urls = [
          ...urls,
          ...sitemapUrls.filter((url) => url.includes(directoryUrl)),
        ];
      }
    }
    webSources.push({
      name,
      staticMetadata,
      urls,
    });
  }
  return webSources;
};
