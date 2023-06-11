import type { Meta, StoryObj } from "@storybook/react";

import { MessageRating } from "../Message";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Example/MessageRating",
  component: MessageRating,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof MessageRating>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const NoRating: Story = {
  args: {
    messageId: "NoRating",
  },
};

export const PositiveRating: Story = {
  args: {
    messageId: "PositiveRating",
    value: true,
  },
};

export const NegativeRating: Story = {
  args: {
    messageId: "NegativeRating",
    value: false,
  },
};
