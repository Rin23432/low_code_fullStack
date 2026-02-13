const Mock = require("mockjs");
const Random = Mock.Random;

function getQuestionList(opt = {}) {
  const { len = 10, isDeleted = false, isStarred = false } = opt;
  const list = [];
  for (let i = 0; i < len; i++) {
    list.push({
      _id: Random.id(),
      title: Random.ctitle(),
      isPublished: Random.boolean(),
      isStarred,
      answerCount: Random.ctitle(),
      createAt: Random.datetime(),
      isDeleted,
    });
  }
  return list;
}

module.exports = getQuestionList;
