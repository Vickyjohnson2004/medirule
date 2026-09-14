import {clearAuthCookies} from '@/lib/auth'; import {apiSuccess} from '@/lib/security'; export async function POST(){await clearAuthCookies();return apiSuccess({loggedOut:true});}
