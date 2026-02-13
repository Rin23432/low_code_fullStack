// BFF 层测试脚本
// 使用方法: node test-bff.js

const BASE_URL = "http://localhost:3000";

async function testBFF() {
  console.log("🚀 开始测试 BFF 层...\n");

  try {
    // 测试问题列表 API
    console.log("📋 测试问题列表 API...");
    const questionListResponse = await fetch(`${BASE_URL}/api/question/list`);
    const questionListData = await questionListResponse.json();
    console.log("✅ 问题列表:", questionListData);
    console.log("");

    // 测试问题详情 API
    console.log("📝 测试问题详情 API...");
    const questionDetailResponse = await fetch(`${BASE_URL}/api/question/1`);
    const questionDetailData = await questionDetailResponse.json();
    console.log("✅ 问题详情:", questionDetailData);
    console.log("");

    // 测试答案提交 API
    console.log("📤 测试答案提交 API...");
    const answerData = {
      questionId: "1",
      c1: "test answer",
      c2: "满意",
    };

    const answerResponse = await fetch(`${BASE_URL}/api/answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(answerData),
    });

    console.log("✅ 答案提交状态:", answerResponse.status);
    console.log(
      "✅ 答案提交响应头:",
      Object.fromEntries(answerResponse.headers.entries())
    );
    console.log("");

    console.log("🎉 所有 BFF 层测试完成！");
  } catch (error) {
    console.error("❌ 测试失败:", error.message);
  }
}

// 检查服务器是否运行
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/hello`);
    if (response.ok) {
      console.log("✅ 服务器运行正常");
      return true;
    }
  } catch (error) {
    console.log("❌ 服务器未运行，请先启动项目: npm run dev");
    return false;
  }
  return false;
}

// 主函数
async function main() {
  console.log("🔍 检查服务器状态...");
  const serverRunning = await checkServer();

  if (serverRunning) {
    await testBFF();
  } else {
    console.log("\n💡 请按以下步骤操作:");
    console.log("1. 确保在 low_code_c 目录下");
    console.log("2. 运行 npm run dev 启动开发服务器");
    console.log("3. 在另一个终端运行 node test-bff.js");
  }
}

// 运行测试
main();
