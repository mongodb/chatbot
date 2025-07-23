# Generate MongoDB Databases

This directory contains the logic for generating MongoDB databases.

The generation pipeline should use the following flow:

1. create a business + its use case
  - maybe we help out by providing sector or something in prompt
  - can get inspiration from https://www.mongodb.com/solutions/customer-case-studies or other docs. doing napkin math i see ~300 case studies
2. Generate schema + indexes
   - prompt includes condensed version of schema design docs to push for best practices
3. Generate zod types to validate collection document schemas
   - want to have this to guarantee consistency of any documents we input
4. have AI write script to input data into schema
   - i think this is the hardest part
   - i think using the Claude Code TypeScript SDK (https://docs.anthropic.com/en/docs/claude-code/sdk#typescript) could be promising here