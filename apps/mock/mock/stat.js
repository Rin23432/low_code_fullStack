const Mock = require("mockjs");
const getStatList = require("./data/getStatList.js");

const Random = Mock.Random;

module.exports = [
  {
    url: "/api/stat/:questionId",
    method: "get",
    response() {
      return {
        errno: 0,
        data: {
          total: 100,
          list: getStatList(15),
        },
      };
    },
  },
  {
    url: "/api/stat/:questionId/:componentId",
    method: "get",
    response() {
      return {
        errno: 0,
        data: {
          stat: [
            { name: "选项一", count: 20 },
            { name: "选项二", count: 10 },
            { name: "选项三", count: 25 },
          ],
        },
      };
    },
  },
];
