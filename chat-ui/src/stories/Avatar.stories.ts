import type { Meta, StoryObj } from "@storybook/react";

import { Avatar } from "../Message";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Example/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const UserAvatar: Story = {
  args: {
    role: "user",
  },
};

export const AssistantAvatar: Story = {
  args: {
    role: "assistant",
  },
};

// export const SystemAvatar: Story = {
//   args: {
//     role: "system",
//   },
// };
