import type { Meta, StoryObj } from "@storybook/react";

import { Message } from "../Message";
import { createMessage } from "../createMessage";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Example/Message",
  component: Message,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof Message>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const UserMessage: Story = {
  args: {
    message: createMessage(
      "user",
      "How do you import or migrate data into MongoDB Atlas?"
    ),
  },
};

export const AssistantMessage: Story = {
  args: {
    message: createMessage(
      "assistant",
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged."
    ),
  },
};
