import React from 'react';
import { StoryObj, Meta } from '@storybook/react-webpack5';

import Component from '../../components/QuestionComponents/QuestionCheckbox/Component';

// 2. 使用 Meta 替代 ComponentMeta 类型
export default {
  title: 'Question/QuestionCheckbox',
  component: Component,
} as Meta<typeof Component>;

// 3. 使用 StoryObj 替代 ComponentStory 类型
const Template: StoryObj<typeof Component> = {
  render: (args) => <Component {...args} />,
};

// 4. 保持故事定义不变
export const Default = { ...Template };
Default.args = {};

export const SetProps = { ...Template };
SetProps.args = {
  title: 'hello',
  list: [
    { value: 'v1', text: 't1', checked: false },
    { value: 'v2', text: 't2', checked: true },
    { value: 'v3', text: 't3', checked: true },
  ],
  isVertical: true,
};
