import ReactMarkdown from "react-markdown";
import Code, { Language } from "@leafygreen-ui/code";
import type { Language as SupportedLanguageValue } from "@leafygreen-ui/code";
import { Body, H1, H2, H3, Overline, InlineCode, Link } from "@leafygreen-ui/typography";

type ReactMarkdownProps = Parameters<typeof ReactMarkdown>[0];
type ReactMarkdownComponentsMap = ReactMarkdownProps["components"];

const componentsMap = {
  a: ({ children, href }) => {
    return <Link href={href}>{children}</Link>;
  },
  code: ({ inline, children, className }) => {
    const codeString = children.join("\n");
    if (inline) {
      return <InlineCode>{codeString}</InlineCode>;
    }
    let language = className?.match(/language-(.+)/)?.[1] ?? "none";
    const supportedLanguages = Object.values(Language);
    if (!supportedLanguages.includes(language as Language)) {
      console.warn(
        `Unknown code language: ${language}. Using the default language of "none" instead.`
      );
      language = "none";
    }
    return (
      <Code language={language as SupportedLanguageValue}>{codeString}</Code>
    );
  },
  h1: (props) => {
    const text = props.children.join(" - ");
    return <H1>{text}</H1>;
  },
  h2: (props) => {
    const text = props.children.join(" - ");
    return <H2>{text}</H2>;
  },
  h3: (props) => {
    const text = props.children.join(" - ");
    return <H3>{text}</H3>;
  },
  h4: (props) => {
    const text = props.children.join(" - ");
    return <Overline>{text}</Overline>;
  },
  p: ({ children, ...props }) => {
    return <Body {...props}>{children}</Body>;
  },
  ol: ({ children, ...props }) => {
    return <Body as="ol" {...props}>{children}</Body>;
  },
  ul: ({ children, ...props }) => {
    return <Body as="ul" {...props}>{children}</Body>;
  },
} satisfies ReactMarkdownComponentsMap;

type LGMarkdownProps = {
  children: string;
};

export default function LGMarkdown(props: LGMarkdownProps) {
  return <ReactMarkdown children={props.children} components={componentsMap} />;
}
