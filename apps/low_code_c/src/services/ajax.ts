// BFF 层地址 - 前端直接调用 BFF，不直接调用后端
const BFF_HOST = ""; // 空字符串表示同域调用

export async function get(url: string) {
  const res = await fetch(`${BFF_HOST}${url}`);
  const data = res.json();
  return data;
}

export async function post(url: string, body: any) {
  const res = await fetch(`${BFF_HOST}${url}`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = res.json();
  return data;
}
