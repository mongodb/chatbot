import { wrapTraced } from "mongodb-rag-core/braintrust";
import { makeGenerateChildrenWithOpenAi } from "../../generateChildren";
import {
  DatabaseInfoNode,
  DatabaseUserNode,
  DatabaseUserSchema,
} from "./nodeTypes";
import { openAiClient } from "../../../openAi";

export const generateDatabaseUsers = wrapTraced(
  makeGenerateChildrenWithOpenAi<DatabaseInfoNode, DatabaseUserNode>({
    openAiClient,
    childType: "database_user",
    makePromptMessages: async (parent, numChildren) => [
      {
        role: "system",
        content: `You are an experienced database administrator and organizational psychologist who specializes in modeling realistic user personas for enterprise systems. Given the database context, create diverse users who might interact with this database in ANY form.

<interaction-types>
Users can interact with the database in many ways:
- Direct database queries (developers, engineers, data scientists)
- Through internal business applications (employees, managers, analysts)
- Through consumer-facing applications (end users, customers, enthusiasts)
- Through analytical tools (business analysts, researchers, executives)
- Through third-party integrations (partners, vendors, external systems)
</interaction-types>

<user-diversity>
Create a diverse mix of users that reflects real-world usage:
- Industry professionals specific to the database domain (e.g., for e-commerce: store managers, inventory specialists, suppliers)
- End consumers/enthusiasts (e.g., for e-commerce: online shoppers, bargain hunters, frequent buyers)
- Business/operational roles (managers, analysts, support staff)
- Technical roles (developers, data engineers, system administrators)
- External stakeholders (partners, vendors, researchers)
- Academic/educational users (students, teachers, researchers)

<naming-diversity>
- Use names from diverse cultural backgrounds
- Include a mix of traditional and modern names
- Ensure gender balance across all role types
- Avoid stereotypical name-role associations
</naming-diversity>

</user-diversity>

<balance-guidelines>
- Aim for roughly 30% domain-specific professionals
- 30% end users/consumers
- 20% business/analytical roles
- 20% technical/development roles
- Include users from different regions, age groups, and backgrounds
- Consider both frequent power users and occasional casual users
</balance-guidelines>

<additional-guidelines>
- Vary the experience levels (entry-level to senior/expert)
- Include some users with specific constraints or special needs
- Mix internal company users with external users
- Include users from different time zones if relevant
- Consider users with different access patterns (daily, weekly, seasonal)
- Add users who might misuse or stress the system (within ethical bounds)
- Include users from smaller/niche segments, not just mainstream
</additional-guidelines>

<examples>

Some examples of users types for different types of databases:

<ecommerce>
For an e-commerce database, users might include:
- Store managers, inventory specialists, suppliers, merchandisers (domain professionals)
- Online shoppers, bargain hunters, gift buyers, wholesale customers (consumers)
- Sales analysts, customer service reps, marketing managers (business roles)
- E-commerce developers, data engineers, API integrators (technical roles)
</ecommerce>

<healthcare>
For a healthcare database, users might include:
- Doctors, nurses, pharmacists, lab technicians (domain professionals)
- Patients, caregivers, health-conscious individuals seeking medical info (consumers)
- Hospital administrators, insurance analysts, compliance officers (business roles)
- Health IT specialists, medical data scientists, EMR developers (technical roles)
</healthcare>

<financial>
For a financial services database, users might include:
- Investment advisors, loan officers, branch managers, auditors (domain professionals)
- Bank customers, investors, loan applicants, small business owners (consumers)
- Risk analysts, fraud investigators, regulatory compliance managers (business roles)
- FinTech developers, blockchain engineers, payment system integrators (technical roles)
</financial>

</examples>

Focus on creating realistic personas that represent the full spectrum of database interactions. Each user should have a clear reason for accessing the database data.

Generate exactly ${numChildren} user(s).`,
      },
      {
        role: "user",
        content: `Generate users for database with the following info:
${JSON.stringify(parent.data, null, 2)}`,
      },
    ],
    response: {
      schema: DatabaseUserSchema,
      name: "generate_database_users",
      description: "Generate a list of realistic database users",
    },
  }),
  {
    name: "generateDatabaseUsers",
  }
);
