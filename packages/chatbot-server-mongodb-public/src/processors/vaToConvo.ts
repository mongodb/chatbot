import path from "path";
import fs from "fs";
import yaml from "yaml";
import { loadVerifiedAnswersAsConversations } from "../eval/loadVerifiedAnswersAsConversations";
function main() {
  const repoRoot = path.resolve(__dirname, "..", "..", "..", "..");
  const verifiedAnswersConversationsYaml = fs.readFileSync(
    path.resolve(repoRoot, "verified-answers.yaml"),
    "utf8"
  );
  const verifiedAnswersConversations = loadVerifiedAnswersAsConversations(
    verifiedAnswersConversationsYaml
  );

  fs.writeFileSync(
    path.resolve(repoRoot, "verified-answers-conversations.yaml"),
    yaml.stringify(
      verifiedAnswersConversations.map((c) => {
        c.messages = c.messages.slice(0, 1);
        c.expectedLinks =
          c.expectedLinks?.map((l) => {
            const url = new URL(l);
            url.search = "";
            return url.toString();
          }) ?? [];
        return c;
      })
    )
  );
}
main();
