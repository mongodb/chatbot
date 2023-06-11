import type { Meta, StoryObj } from "@storybook/react";

import Chat from "../Chat";
import { createMessage } from "../ConversationProvider";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Example/Chat",
  component: Chat,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof Chat>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const EmptyState: Story = {
  args: {
    messages: [],
  },
};

export const SimpleChat: Story = {
  args: {
    messages: [
      createMessage(
        "user",
        "How do you import or migrate data into MongoDB Atlas?"
      ),
      createMessage(
        "assistant",
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged."
      ),
    ],
  },
};

export const MultiMessageChat: Story = {
  args: {
    messages: [
      createMessage(
        "user",
        "How do you import or migrate data into MongoDB Atlas?"
      ),
      createMessage(
        "assistant",
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged."
      ),
      createMessage(
        "user",
        "Sure, that works in practice. But does it work in theory?"
      ),
      createMessage(
        "assistant",
        "As an AI assistant, I'm not sure I understand the question."
      ),
    ],
  },
};
