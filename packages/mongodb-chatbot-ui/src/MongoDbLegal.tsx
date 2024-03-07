import { useLinkData } from "./useLinkData";
import { addQueryParams } from "./utils";
import { Body, Link } from "@leafygreen-ui/typography";

export function MongoDbLegalDisclosure() {
  const { tck } = useLinkData();

  const AtlasVectorSearch = () => (
    <Link
      hideExternalIcon
      href={addQueryParams(
        "https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/",
        {
          tck,
        }
      )}
    >
      Atlas Vector Search
    </Link>
  );
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
    <Body>
      This is a generative AI chatbot powered by <AtlasVectorSearch />.
      By interacting with it, you agree to MongoDB's <TermsOfUse /> and <AcceptableUsePolicy />.
    </Body>
  );
}
