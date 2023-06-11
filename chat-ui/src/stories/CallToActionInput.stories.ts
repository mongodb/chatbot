import type { Meta, StoryObj } from "@storybook/react";

import CallToActionInput from "../CallToActionInput";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Example/CallToActionInput",
  component: CallToActionInput,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof CallToActionInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const ShowModalCTA: Story = {
  args: {
    showModal: true,
  },
};

export const NoModalCTA: Story = {
  args: {
    showModal: false,
  },
};
