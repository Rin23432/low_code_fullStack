const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const mockList = require("./mock/index");

const app = new Koa();
const router = new Router();

// 添加body解析中间件
app.use(bodyParser());

async function getRes(fn, ctx) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const res = fn(ctx);
      resolve(res);
    }, 1000);
  });
}

mockList.forEach((item) => {
  const { url, method, response } = item;
  router[method](url, async (ctx) => {
    try {
      const res = await getRes(response, ctx);
      ctx.body = res;
    } catch (error) {
      console.error(`Error handling ${method} ${url}:`, error);
      ctx.status = 500;
      ctx.body = { error: "Internal server error" };
    }
  });
});

app.use(router.routes());
app.use(router.allowedMethods());

// 添加错误处理
app.on("error", (err, ctx) => {
  console.error("Server error:", err);
});

console.log("MOCK服务启动在端口 3001");
app.listen(3001);
