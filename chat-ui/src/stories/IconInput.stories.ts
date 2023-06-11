import type { Meta, StoryObj } from "@storybook/react";

import IconInput from "../IconInput";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Example/IconInput",
  component: IconInput,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof IconInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const WizardInput: Story = {
  args: {
    glyph: "Wizard",
    "aria-label": "MongoDB AI Chatbot Message Input",
    "aria-labelledby": "SomeLabel",
    placeholder: "Ask MongoDB AI a Question",
  },
};

export const MessageInput: Story = {
  args: {
    glyph: "SMS",
    "aria-label": "MongoDB AI Chatbot Message Input",
    "aria-labelledby": "SomeLabel",
    placeholder: "Ask MongoDB AI a Question",
  },
};
