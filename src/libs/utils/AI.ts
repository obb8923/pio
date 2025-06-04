import { supabase } from '../supabase/supabase';
import { SUPABASE_REF, SUPABASE_ANON_KEY } from '@env';
import * as RNFS from 'react-native-fs';

export interface AIResponse {
  code: "success" | "error" | "not_plant";
  name?: string;
  description?: string;
  error?: string;
}

export async function getAIResponseWithImage(imageUri: string): Promise<AIResponse | null> {
  try {
    let imageBase64: string | null = null;
    try {
      imageBase64 = await RNFS.readFile(imageUri, 'base64');
    } catch (e: any) {
      console.error("Error reading image file as base64 with RNFS:", e.message, e.stack);
      throw new Error(`Failed to read and encode image with RNFS: ${e.message}`);
    }

    if (!imageBase64) {
      throw new Error("Failed to convert image to base64 using RNFS.");
    }

    const url = `https://${SUPABASE_REF}.functions.supabase.co/getAIResponseWithImage`;

    let authorizationHeader = "";
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.warn("Error fetching Supabase session:", sessionError.message);
    }

    if (session?.access_token) {
      authorizationHeader = `Bearer ${session.access_token}`;
    } else if (SUPABASE_ANON_KEY) {
      authorizationHeader = `Bearer ${SUPABASE_ANON_KEY}`;
      console.warn("Using Supabase Anon Key for authorization as no active session found.");
    } else {
      throw new Error("Unable to retrieve user session token and SUPABASE_ANON_KEY is not defined.");
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorizationHeader
      },
      body: JSON.stringify({ imageBase64 })
    });

    if (!response.ok) {
      throw new Error(`Function invocation failed with status ${response.status}`);
    }

    const responseData = await response.json();
    return responseData as AIResponse;

  } catch (error: any) {
    console.error("getAIResponseWithImage error:", {
      message: error.message,
      status: error.status,
      details: error.details
    });
    return {
      code: "error",
      error: "이미지 처리 중 오류가 발생했습니다. 다시 시도해주세요."
    };
  }
}
