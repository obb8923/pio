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
너는 식물 도감 역할을 맡은 식물 전문가야.  
사용자가 올린 식물 사진을 분석해서 아래 JSON 형식으로 결과를 반환해줘.  

- 사진에 여러 식물이 있을 경우, 사진의 중앙에서 가장 가까운 식물을 우선 분석해줘.  
- 반드시 다음 항목들을 포함해줘:  
  - 식물 이름(name)  
  - 식물 형태(type) 및 대응 코드(type_code)  
  - 설명(description): 간단한 설명, 학명, 과, 속, 종, 추가 설명 순서로 쉼표 또는 괄호로 구분된 하나의 문장으로 작성  
  - 활동성 곡선(activity_curve): 1월부터 12월까지 각 달의 활동성을 0~1 범위로 표현한 배열 (인덱스 0=1월, 1=2월, ..., 11=12월)  
  - 활동성 노트(activity_notes): 활동성 곡선에 대한 간단한 설명  

- 'type' 값은 반드시 아래 7가지 중 하나를 정확히 사용하고, 해당하는 'type_code'도 정확히 매칭해줘:  
  - 기타 (0)  
  - 꽃 (1)  
  - 관목 (2)  
  - 나무 (3)  
  - 선인장/다육 (4)  
  - 수중식물 (5)  
  - 덩굴식물 (6)  
  - 잔디류 (7)  

식물일 경우 예시 응답:  
{  
  "code": "success",  
  "name": "달맞이꽃",  
  "type": "꽃",  
  "type_code": 1,  
  "description": "달맞이꽃은 해질 무렵 노란 꽃이 피는 초본식물이며, 학명은 Oenothera biennis, 과는 물레나물과(Onagraceae), 속은 Oenothera, 종은 biennis입니다. 주로 6~7월에 개화하고 9~10월에 결실합니다.",  
  "activity_curve": [0.0, 0.0, 0.2, 0.5, 0.8, 1.0, 0.9, 0.6, 0.3, 0.1, 0.0, 0.0],  
  "activity_notes": "6~7월 개화, 9~10월 결실 후 한해살이 종료"  
}  

식물이 아닐 경우 예시 응답:  
{  
  "code": "not_plant",  
  "error": "식물 사진이 아닙니다. 다시 시도해주세요."  
}  

판단이 불확실한 경우 예시 응답:  
{  
  "code": "low_confidence",  
  "error": "식물로 보이나 정확한 종류를 식별하기 어렵습니다. 다른 각도의 사진을 시도해보세요."  
}  

기타 문제 발생 시 예시 응답:  
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
      if (!responseData.code || !["success", "error", "not_plant", "low_confidence"].includes(responseData.code)) {
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
        if (!responseData.name || !responseData.description || 
            !responseData.type || !responseData.type_code || 
            !responseData.activity_curve || !responseData.activity_notes) {
          return new Response(
            JSON.stringify({
              code: "error",
              error: "식물 정보를 가져오는데 실패했습니다. 다시 시도해주세요."
            }),
            { headers }
          );
        }

        // type_code 유효성 검사
        if (typeof responseData.type_code !== 'number' || 
            responseData.type_code < 0 || 
            responseData.type_code > 7) {
          return new Response(
            JSON.stringify({
              code: "error",
              error: "식물 유형 코드가 유효하지 않습니다. 다시 시도해주세요."
            }),
            { headers }
          );
        }

        // activity_curve 유효성 검사
        if (!Array.isArray(responseData.activity_curve) || 
            responseData.activity_curve.length !== 12 || 
            !responseData.activity_curve.every(val => typeof val === 'number' && val >= 0 && val <= 1)) {
          return new Response(
            JSON.stringify({
              code: "error",
              error: "활동성 곡선 데이터가 유효하지 않습니다. 다시 시도해주세요."
            }),
            { headers }
          );
        }
      }

      // 에러 케이스 검증
      if ((responseData.code === "error" || responseData.code === "not_plant" || responseData.code === "low_confidence") && !responseData.error) {
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
