const Mock = require("mockjs");
const Random = Mock.Random;

// 生成答题页组件数据
const generateQuestionComponents = () => {
  const componentTypes = [
    "title",
    "paragraph",
    "input",
    "textarea",
    "radio",
    "checkbox",
  ];
  const components = [];

  for (let i = 0; i < 8; i++) {
    const type = componentTypes[Random.integer(0, componentTypes.length - 1)];
    const component = {
      fe_id: Random.id(),
      type,
      title: Random.ctitle(5, 10),
      isHidden: false,
      isLocked: false,
      props: {},
    };

    // 根据组件类型设置不同的属性
    switch (type) {
      case "title":
        component.props.level = Random.integer(1, 3);
        component.props.text = Random.ctitle(10, 20);
        break;
      case "paragraph":
        component.props.text = Random.cparagraph(2, 4);
        break;
      case "input":
        component.props.placeholder = Random.csentence(5, 10);
        component.props.title = Random.ctitle(5, 10);
        break;
      case "textarea":
        component.props.placeholder = Random.csentence(10, 20);
        component.props.title = Random.ctitle(5, 10);
        break;
      case "radio":
        component.props.title = Random.ctitle(5, 10);
        component.props.options = Array.from(
          { length: Random.integer(3, 6) },
          (_, index) => ({
            value: `option${index + 1}`,
            text: Random.ctitle(3, 8),
          })
        );
        break;
      case "checkbox":
        component.props.title = Random.ctitle(5, 10);
        component.props.options = Array.from(
          { length: Random.integer(3, 6) },
          (_, index) => ({
            value: `option${index + 1}`,
            text: Random.ctitle(3, 8),
          })
        );
        break;
    }

    components.push(component);
  }

  return components;
};

// 生成问卷数据
const generateQuestionnaire = () => ({
  id: Random.id(),
  title: Random.ctitle(10, 20),
  desc: Random.cparagraph(1, 2),
  js: "",
  css: "",
  isPublished: true,
  componentList: generateQuestionComponents(),
  createTime: Random.datetime(),
  updateTime: Random.datetime(),
  answerCount: Random.integer(0, 1000),
  isStar: Random.boolean(),
  isDeleted: false,
});

module.exports = [
  // BFF 答题页数据接口
  {
    url: "/api/bff/question/:id",
    method: "get",
    response(ctx) {
      // 模拟网络延迟
      const delay = Random.integer(100, 500);

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            errno: 0,
            data: generateQuestionnaire(),
            meta: {
              requestId: Random.id(),
              timestamp: Date.now(),
              delay,
            },
          });
        }, delay);
      });
    },
  },

  // BFF 问卷列表接口
  {
    url: "/api/bff/question",
    method: "get",
    response(ctx) {
      const { url = "", query = {} } = ctx;
      const pageSize = parseInt(query.pageSize) || 10;
      const page = parseInt(query.page) || 1;

      const list = Array.from({ length: pageSize }, () =>
        generateQuestionnaire()
      );

      return {
        errno: 0,
        data: {
          list,
          total: 100,
          page,
          pageSize,
        },
        meta: {
          requestId: Random.id(),
          timestamp: Date.now(),
        },
      };
    },
  },

  // BFF 提交答案接口
  {
    url: "/api/bff/answer",
    method: "post",
    response(ctx) {
      const { body } = ctx.request;

      return {
        errno: 0,
        data: {
          id: Random.id(),
          questionId: body.questionId,
          submitTime: Date.now(),
        },
        meta: {
          requestId: Random.id(),
          timestamp: Date.now(),
        },
      };
    },
  },

  // BFF 统计数据接口
  {
    url: "/api/bff/stat/:id",
    method: "get",
    response(ctx) {
      const { id } = ctx.params;

      return {
        errno: 0,
        data: {
          questionId: id,
          totalAnswers: Random.integer(100, 5000),
          components: Array.from({ length: 8 }, (_, index) => ({
            fe_id: Random.id(),
            type: Random.pick([
              "title",
              "paragraph",
              "input",
              "textarea",
              "radio",
              "checkbox",
            ]),
            title: Random.ctitle(5, 10),
            answerCount: Random.integer(50, 500),
            options: Random.boolean()
              ? Array.from({ length: Random.integer(3, 6) }, (_, optIndex) => ({
                  value: `option${optIndex + 1}`,
                  text: Random.ctitle(3, 8),
                  count: Random.integer(10, 200),
                }))
              : [],
          })),
        },
        meta: {
          requestId: Random.id(),
          timestamp: Date.now(),
        },
      };
    },
  },
];
