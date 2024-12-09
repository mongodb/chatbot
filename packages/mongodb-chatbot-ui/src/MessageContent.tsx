import { css } from "@emotion/css";
import { Body, Link } from "@leafygreen-ui/typography";
import {
  type MessageProps as LGMessageProps,
  MessageContent as LGMessageContent,
  type MessageContentProps,
} from "@lg-chat/message";
import { headingStyle, disableSetextHeadings } from "./markdownHeadingStyle";

const chatbotMarkdownProps = {
  // @ts-expect-error @lg-chat/lg-markdown is using an older version of unified. The types are not compatible but the plugins work. https://jira.mongodb.org/browse/LG-4310
  remarkPlugins: [headingStyle, disableSetextHeadings],
  className: css`
    // This includes a hacky fix for weird white-space issues in LG Chat.
    display: flex;
    flex-direction: column;

    & li {
      white-space: normal;
      margin-top: -1rem;
      & ol li, & ul li {
        margin-top: 0.5rem;
      }
    }

    & ol, & ul {
      overflow-wrap: anywhere;
    }

    & h1, & h2, & h3 {
      & +ol, & +ul {
        margin-top: 0;
      }
    }

    & p+h1, & p+h2, & p+h3 {
      margin-top: 1rem;
    }
  `,
  components: {
    a: ({ children, href }) => {
      return (
        <Link hideExternalIcon href={href}>
          {children}
        </Link>
      );
    },
    p: ({ children, ...props }) => {
      return <Body {...props}>{children}</Body>;
    },
    ol: ({ children, ordered, ...props }) => {
      return (
        <Body as="ol" {...props}>
          {children}
        </Body>
      );
    },
    ul: ({ children, ordered, ...props }) => {
      return (
        <Body as="ul" {...props}>
          {children}
        </Body>
      );
    },
    li: ({ children, ordered, node, ...props }) => {
      return (
        <Body as="li" {...props}>
          {children}
        </Body>
      );
    },
  },
} satisfies LGMessageProps["markdownProps"];

export function MessageContent({
  markdownProps: userMarkdownProps,
  ...props
}: MessageContentProps) {
  return (
    <LGMessageContent
      {...props}
      // @ts-expect-error @lg-chat/lg-markdown is using an older version of unified. The types are not compatible but the plugins work. https://jira.mongodb.org/browse/LG-4310
      markdownProps={{
        ...chatbotMarkdownProps,
        ...userMarkdownProps,
      }}
    />
  );
}
