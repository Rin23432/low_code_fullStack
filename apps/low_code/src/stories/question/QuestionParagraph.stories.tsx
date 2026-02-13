import React from 'react';
// 1. 替换为框架专用包并使用新类型
import { Meta, StoryObj } from '@storybook/react-webpack5';

import Component from '../../components/QuestionComponents/QuestionParagraph/Component';

// 2. 使用 Meta 替代 ComponentMeta
export default {
  title: 'Question/QuestionParagraph',
  component: Component,
} as Meta<typeof Component>;

// 3. 使用 StoryObj 替代 ComponentStory
const Template: StoryObj<typeof Component> = {
  render: (args) => <Component {...args} />,
};

// 4. 调整故事定义方式并修复笔误
export const Default = { ...Template };
Default.args = {};

export const SetProps = { ...Template };
// 修复笔误：将 Default.args 改为 SetProps.args
SetProps.args = {
  text: 'hello',
  isCenter: true,
};

export const BreakLine = { ...Template };
BreakLine.args = {
  text: 'hello\nhello\nhello',
};
