import React from 'react';
// 导入框架专用包和正确的类型
import { Meta, StoryObj } from '@storybook/react-webpack5';

import Component from '../../components/QuestionComponents/QuestionInput/Component';

// 使用 Meta 类型替代 ComponentMeta
export default {
  title: 'Question/QuestionInput',
  component: Component,
} as Meta<typeof Component>;

// 使用 StoryObj 类型替代 ComponentStory
const Template: StoryObj<typeof Component> = {
  render: (args) => <Component {...args} />,
};

// 调整故事案例的定义方式
export const Default = { ...Template };
Default.args = {};

export const SetProps = { ...Template };
SetProps.args = {
  title: 'Custom title',
  placeholder: 'Type here...',
};
