import {
    GoogleGenAI,
    createUserContent,
    createPartFromUri,
  } from "@google/genai";
  const apiKey = process.env.AI_API_KEY;
  import * as fs from "node:fs";

const ai = new GoogleGenAI({ apiKey: apiKey });

export async function getAIResponse(contents: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: contents,
  });
  return response.text;
}


 export async function getAIResponseWithImage(imageUri: string) {
  try {
    const myfile = await ai.files.upload({
      file: imageUri,
      config: { mimeType: "image/jpeg" },
    });
  const prompt = `
  이 사진에 있는 식물(또는 꽃)의 정보를 알려줘.
이름(name)과 설명(description)을 포함해서 아래와 같은 JSON 형식으로 응답해줘.
설명에는 주요 특징, 자생지, 관리 방법 등을 간략히 정리해줘.
{
  "name": "식물 이름",
  "description": "이 식물의 특징, 자생지, 관리법 등을 요약한 설명"
}
  아래는 예시 응답이야
  {
  "name": "해바라기",
  "description": "해바라기는 북아메리카 원산의 한해살이 식물로, 태양을 따라 움직이는 특성이 있습니다. 햇빛을 좋아하며 배수가 잘되는 토양에서 잘 자랍니다. 여름철에 큰 노란 꽃을 피우며 관상용으로 널리 재배됩니다."
}


  `;
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: createUserContent([
        createPartFromUri(myfile.uri as string, myfile.mimeType as string),
        prompt,
      ]),
    });
    const fileName = myfile.name;
    await ai.files.delete({ name: fileName as string });
    console.log("response", response,response.text);
    return response.text;
  } catch (error) {
    console.error("Error in getAIResponseWithImage:", error);
    throw error; // 오류를 다시 던져서 호출자에게 알리거나, 적절한 오류 처리를 할 수 있습니다.
  }
}