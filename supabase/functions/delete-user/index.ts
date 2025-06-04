// delete-user.ts
// 이 파일을 변경했을 경우 아래 명령어를 통해 supabase에 배포해야 적용됩니다.
// npx supabase functions deploy delete-user --no-verify-jwt
// 또, 이 파일의 console.log는 대시보드에서 확인 가능합니다.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

console.log("Delete User Function Initialized");
// CORS 헤더 설정 (모든 출처 허용 예시 - 프로덕션에서는 더 제한적으로 설정)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
serve(async (req)=>{
  // CORS preflight 요청 처리 (OPTIONS 메서드 확인)
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  // Ensure it's a POST request (or adjust if needed)
  if (req.method !== 'POST') {
    console.log(`Unsupported method: ${req.method}`);
    return new Response(JSON.stringify({
      error: 'Method Not Allowed'
    }), {
      status: 405,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
  try {
    console.log('Processing POST request for user deletion');
    
    // Check if environment variables are loaded
    if (!Deno.env.get('SUPABASE_URL') || !Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
      throw new Error('Server configuration error.'); // Don't expose details to the client
    }

    // Supabase 클라이언트 생성 (Admin API 사용을 위해 서비스 역할 키 필요)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // 요청 헤더에서 사용자 인증 토큰(JWT) 가져오기
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      // Return 401 for missing/bad auth
      return new Response(JSON.stringify({
        error: 'Missing or invalid authorization token'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const jwt = authHeader.replace('Bearer ', '');
    console.log('Authorization header found, attempting to validate JWT.');
    // JWT를 사용하여 사용자 정보 가져오기 (인증 확인)
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt);
    if (userError) {
      console.error('Error getting user from JWT:', userError.message);
      // Handle specific errors if needed (e.g., expired token)
      return new Response(JSON.stringify({
        error: 'Invalid token or user not found'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    if (!user) {
      console.error('No user found for the provided JWT.');
      return new Response(JSON.stringify({
        error: 'User not found'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // 인증된 사용자 ID 가져오기
    const userId = user.id;
    console.log(`Authenticated user ID: ${userId}. Proceeding with account deletion.`);

    try {
      // 1. 먼저 사용자의 인증 정보 삭제
      const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (deleteAuthError) {
        console.error(`Error deleting auth user ${userId}:`, deleteAuthError.message);
        throw deleteAuthError;
      }

      // 2. 사용자 삭제 후 관련 데이터 처리 (CASCADE나 SET NULL이 자동으로 적용됨)
      console.log(`Successfully deleted auth user: ${userId}. Related data will be handled by database constraints.`);
      
      return new Response(JSON.stringify({
        message: 'User account deleted successfully'
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error during user deletion:', error.message);
      return new Response(JSON.stringify({
        error: 'Failed to delete user account'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    // Catch unexpected errors (e.g., network issues, config errors caught above)
    console.error('Unexpected error in delete-user function:', error.message, error.stack);
    // 에러 응답 반환
    return new Response(JSON.stringify({
      error: 'Internal Server Error'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}); 