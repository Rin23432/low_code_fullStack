import React from 'react';
// 导入框架专用包和新版类型
import { Meta, StoryObj } from '@storybook/react-webpack5';

import Component from '../../components/QuestionComponents/QuestionRadio/Component';

// 使用 Meta 类型替代 ComponentMeta
export default {
  title: 'Question/QuestionRadio',
  component: Component,
} as Meta<typeof Component>;

// 使用 StoryObj 类型替代 ComponentStory
const Template: StoryObj<typeof Component> = {
  render: (args) => <Component {...args} />,
};

// 调整故事定义方式
export const Default = { ...Template };
Default.args = {};

export const SetProps = { ...Template };
SetProps.args = {
  title: 'hello',
  options: [
    { value: 'v1', text: 't1' },
    { value: 'v2', text: 't2' },
    { value: 'v3', text: 't3' },
  ],
  value: 'v1',
  isVertical: true,
};
