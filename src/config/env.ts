import {
  API_URL,
} from '@env';

console.log('Environment Variables:', {
  API_URL,
});

export const ENV = {
  API_URL,
} as const;

// TypeScript 타입 정의
export type ENV_TYPE = typeof ENV; 