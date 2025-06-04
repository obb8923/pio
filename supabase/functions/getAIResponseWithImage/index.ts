// getAIResponseWithImage.ts
// 이 파일을 변경했을 경우 아래 명령어를 통해 supabase에 배포해야 적용됩니다.
// npx supabase functions deploy getAIResponseWithImage --no-verify-jwt
// 또, 이 파일의 console.log는 대시보드에서 확인 가능합니다.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { GoogleGenAI } from "npm:@google/genai";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const ai = new GoogleGenAI({ apiKey: Deno.env.get("GOOGLE_AI_API_KEY") ?? ""});

serve(async (req) => {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*"); // 모든 출처 허용 (테스트용)
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS"); // 허용된 메서드 지정
  headers.set("Access-Control-Allow-Headers", "authorization, x-client-info, apikey, content-type"); // 허용된 헤더 지정
  headers.set("Content-Type", "application/json"); // 응답 형식 지정

  if (req.method === "OPTIONS")  return new Response(null, { status: 204, headers });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405, headers });

  try {
    const { imageBase64 } = await req.json(); 
    if (!imageBase64) return new Response(JSON.stringify({ error: "imageBase64 is required" }), { status: 400, headers });
    const contents = [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64,
        },
      },
      { text: `
        이 사진에 있는 식물(또는 꽃)의 정보를 알려줘.
        이름(name)과 설명(description)을 포함해서 아래와 같은 JSON 형식으로 응답해줘.
        설명은 간단한 설명,학명, 과,속,종, 추가 설명 순서로 작성해줘 
        아래 예시와 같은 형식으로 응답해줘
{
  "code": "success",
  "name": "해바라기",
  "description": "해바라기는 밝은 노란색 꽃잎과 큰 꽃머리가 특징인 한해살이 식물입니다. 학명은 Helianthus annuus이며, 국화과(Asteraceae)에 속하는 해바라기속(Helianthus)의 아누우스종(annuus)입니다. 씨앗은 식용 및 기름 생산에 널리 사용되고, 햇빛을 따라 움직이는 특성이 있습니다."
}
만약 식물 사진이 아니라면,  아래와 같은 형식으로 응답해줘
{
  "code": "not_plant",
  "error": "식물 사진이 아닙니다. 다시 시도해주세요."
}
이미지 처리에 문제가 있다면, 아래와 같은 형식으로 응답해줘
{
  "code": "error",
  "error": "이미지 처리에 문제가 있습니다. 다시 시도해주세요."
} 
` },
    ];
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: contents,
    });
    console.log("response.text", response.text);
    
    try {
      // 마크다운 코드 블록에서 JSON 부분을 추출
      const markdownMatch = response.text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      let jsonText;
      
      if (markdownMatch && markdownMatch[1]) {
        // 마크다운 블록 안의 내용만 추출
        jsonText = markdownMatch[1].trim();
      } else {
        // 마크다운 블록이 없다면 전체 텍스트 사용
        jsonText = response.text.trim();
      }

      // JSON 파싱
      const responseData = JSON.parse(jsonText);
      
      // 응답 형식 검증
      if (!responseData.code || !["success", "error", "not_plant"].includes(responseData.code)) {
        return new Response(
          JSON.stringify({
            code: "error",
            error: "식물을 인식하는데 문제가 발생했습니다. 다시 시도해주세요."
          }),
          { headers }
        );
      }

      // 성공 케이스 검증
      if (responseData.code === "success") {
        if (!responseData.name || !responseData.description) {
          return new Response(
            JSON.stringify({
              code: "error",
              error: "식물 정보를 가져오는데 실패했습니다. 다시 시도해주세요."
            }),
            { headers }
          );
        }
      }

      // 에러 케이스 검증
      if ((responseData.code === "error" || responseData.code === "not_plant") && !responseData.error) {
        return new Response(
          JSON.stringify({
            code: "error",
            error: "식물을 인식하는데 문제가 발생했습니다. 다시 시도해주세요."
          }),
          { headers }
        );
      }

      return new Response(JSON.stringify(responseData), { headers });
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.error("Original response text:", response.text);
      return new Response(
        JSON.stringify({
          code: "error",
          error: "식물을 인식하는데 문제가 발생했습니다. 다시 시도해주세요."
        }),
        { headers }
      );
    }
  } catch (error: any) {
    console.error("Error in Supabase function (base64 input):");
    console.error("Error message:", error.message);
    if (error.stack) {
      console.error("Error stack:", error.stack);
    }
    if (error.response && error.response.data) {
      console.error("Google API Error Data:", JSON.stringify(error.response.data, null, 2));
    }
    return new Response(
      JSON.stringify({
        code: "error",
        error: "식물을 인식하는데 문제가 발생했습니다. 다시 시도해주세요."
      }),
      { status: 500, headers }
    );
  }
});
