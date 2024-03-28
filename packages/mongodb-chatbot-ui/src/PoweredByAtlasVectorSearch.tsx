import { Body, Link } from "@leafygreen-ui/typography";
import { useLinkData } from "./useLinkData";
import { addQueryParams } from "./utils";

export type PoweredByAtlasVectorSearchProps = {
  className?: string;
  linkStyle?: "learnMore" | "text";
};

export function PoweredByAtlasVectorSearch({
  className,
  linkStyle = "learnMore",
}: PoweredByAtlasVectorSearchProps) {
  const { tck } = useLinkData();
  const url = "https://www.mongodb.com/products/platform/atlas-vector-search";
  const VectorSearchLink = (props: { children: string }) => (
    <Link href={addQueryParams(url, { tck })} hideExternalIcon>
      {props.children}
    </Link>
  );

  const Text = () => {
    switch (linkStyle) {
      case "learnMore":
        return (
          <>
            Powered by Atlas Vector Search.{" "}
            <VectorSearchLink>Learn More.</VectorSearchLink>
          </>
        );
      case "text":
        return (
          <>
            Powered by <VectorSearchLink>Atlas Vector Search</VectorSearchLink>
          </>
        );
    }
  };

  return (
    <Body className={className}>
      <Text />
    </Body>
  );
}
