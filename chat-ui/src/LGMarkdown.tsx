import ReactMarkdown from "react-markdown";
import Code, { Language } from "@leafygreen-ui/code";
import {
  Body,
  // Description,
  // Disclaimer,
  // Error,
  H1,
  H2,
  H3,
  InlineCode,
  // InlineKeyCode,
  // Label,
  // Link,
  // Overline,
  // StaticWidthText,
  // Subtitle,
} from "@leafygreen-ui/typography";

type LGMarkdownProps = {
  children: text;
}

export default function LGMarkdown(props: LGMarkdownProps) {
  return (
    <ReactMarkdown
      children={props.children}
      components={{
        code: ({ inline, children, className }) => {
          const codeString = children.join("\n");
          if(inline) {
            return (
              <InlineCode>
                {codeString}
              </InlineCode>
            )
          }
          let language = className?.match(/language-(.+)/)?.[1] ?? "none";
          const supportedLanguages = Object.values(Language);
          if (!supportedLanguages.includes(language as Language)) {
            console.warn(
              `Unknown code language: ${language}. Using the default language of "none" instead.`
            );
            language = "none";
          }
          return <Code language={language}>{codeString}</Code>;
        },
        h1: (props) => {
          console.log('propsz', props)
          const text = props.children.join(" - ")
          return (
            <H1>{text}</H1>
          )
        },
        h2: (props) => {
          console.log('propsz', props)
          const text = props.children.join(" - ")
          return (
            <H2>{text}</H2>
          )
        },
        h3: (props) => {
          console.log('propsz', props)
          const text = props.children.join(" - ")
          return (
            <H3>{text}</H3>
          )
        },
        p: ({ children, ...props }) => {
          return (
            <Body baseFontSize={16} {...props}>
              {children}
            </Body>
          );
        },
      }}
    />
  );
}
