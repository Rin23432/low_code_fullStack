import { get } from "@/services/ajax";
import { get_m } from "@/services/ajax._m";
export async function getQuestionById(id: string) {
  const url = `/api/question/${id}`;
  const data = await get(url);
  return data;
}

export async function getQuestionByIdm(id: string) {
  const url = `/api/question/${id}`;
  const data = await get_m(url);
  return data;
}
