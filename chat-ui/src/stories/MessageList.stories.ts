import type { Meta, StoryObj } from "@storybook/react";

import { MessageList } from "../MessageList";
import createMessage from "../createMessage";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Example/MessageList",
  component: MessageList,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof MessageList>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const BasicChat: Story = {
  args: {
    rateMessage(messageId, rating) {
      console.log("rateMessage", messageId, rating);
    },
    messages: [
      createMessage(
        "user",
        "How do you import or migrate data into MongoDB Atlas?"
      ),
      createMessage(
        "assistant",
        "hOw Do yOu IMporT Or MIGRATe DAta INto moNGodb aTLaS?\n\nThat's you. That's how you sound."
      ),
    ],
  },
};
