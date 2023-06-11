import type { Meta, StoryObj } from "@storybook/react";

import SuggestedPrompts from "../SuggestedPrompts";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Example/SuggestedPrompts",
  component: SuggestedPrompts,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof SuggestedPrompts>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const BasicSuggestedPrompts: Story = {
  args: {},
};
