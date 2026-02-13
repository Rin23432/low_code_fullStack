import React from 'react';
import { Meta, StoryObj } from '@storybook/react-webpack5'; // 导入正确的类型

import Component from '../../components/QuestionComponents/QuestionInfo/Component';

// 元数据定义
export default {
  title: 'Question/QuestionInfo',
  component: Component,
} as Meta<typeof Component>;

// 模板定义（使用 StoryObj 类型）
const Template: StoryObj<typeof Component> = {
  render: (args) => <Component {...args} />,
};

// 故事案例
export const Default = { ...Template };
Default.args = {};

export const SetProps = { ...Template };
SetProps.args = {
  title: 'hello',
  desc: 'world',
};

export const DescBreakLine = { ...Template };
DescBreakLine.args = {
  title: 'hello',
  desc: 'world\nworld\nworld', // 换行测试
};
