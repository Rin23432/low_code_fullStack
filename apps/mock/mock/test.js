const Mock = require("mockjs");

module.exports = [
  {
    url: "/api/test",
    method: "get",
    response: () => {
      return {
        errno: 0,
        data: {
          name: "张三",
          age: 18,
        },
      };
    },
  },
];
