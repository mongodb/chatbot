import { useLinkData } from "./useLinkData";
import { addQueryParams } from "./utils";
import { Body, Link } from "@leafygreen-ui/typography";

export function MongoDbLegalDisclosureText() {
  const { tck } = useLinkData();
  const TermsOfUse = () => (
    <Link
      hideExternalIcon
      href={addQueryParams("https://www.mongodb.com/legal/terms-of-use", {
        tck,
      })}
    >
      Terms of Use
    </Link>
  );
  const AcceptableUsePolicy = () => (
    <Link
      hideExternalIcon
      href={addQueryParams(
        "https://www.mongodb.com/legal/acceptable-use-policy",
        { tck }
      )}
    >
      Acceptable Use Policy
    </Link>
  );

  return (
    <>
      This is a generative AI chatbot. By interacting with it, you agree to
      MongoDB's <TermsOfUse /> and <AcceptableUsePolicy />.
    </>
  );
}

export function MongoDbDataUsagePolicyText() {
  const { tck } = useLinkData();
  const DataUsagePolicy = () => (
    <Link
      hideExternalIcon
      href={addQueryParams(
        "https://www.mongodb.com/docs/ai-chatbot-data-usage/",
        { tck }
      )}
    >
      Data Usage Policy
    </Link>
  );
  return (
    <>
      To learn more about how we use your data, please see our{" "}
      <DataUsagePolicy />.
    </>
  );
}

export function MongoDbLegalDisclosure() {
  return (
    <Body>
      <MongoDbLegalDisclosureText />
      <br />
      <MongoDbDataUsagePolicyText />
    </Body>
  );
}
