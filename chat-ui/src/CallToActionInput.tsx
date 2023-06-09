import Badge from "@leafygreen-ui/badge";
import { Body, Link } from "@leafygreen-ui/typography";
import { IconInput } from "./IconInput";
import styles from "./CallToActionInput.module.css";

export default function CallToActionInput(props: object) {
  return (
    <div className={styles.cta_container}>
      <IconInput
        glyph="Wizard"
        aria-label="MongoDB AI Chatbot Message Input"
        aria-labelledby="TBD - FIXME"
        placeholder="Ask MongoDB AI a Question"
      />
      <div className={styles.cta_disclosure}>
        <Badge variant="blue">Experimental</Badge>
        <Body>
          By interacting with this chatbot, you agree to xyz. <Link href="#">Terms & Conditions</Link>
        </Body>
      </div>
    </div>
  );
}
