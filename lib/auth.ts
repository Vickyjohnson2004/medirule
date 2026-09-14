import { SignJWT,jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import User from '@/models/User';
import { connectDB } from './db';
import type {Role} from '@/types';

const secret=()=>new TextEncoder().encode(process.env.JWT_ACCESS_SECRET||'development-access-secret-change-me-32-chars');
const refreshSecret=()=>new TextEncoder().encode(process.env.JWT_REFRESH_SECRET||'development-refresh-secret-change-me-32-chars');
export async function createTokens(user:{id:string;role:Role}){const access=await new SignJWT({role:user.role}).setProtectedHeader({alg:'HS256'}).setSubject(user.id).setIssuedAt().setExpirationTime('15m').sign(secret());const refresh=await new SignJWT({type:'refresh'}).setProtectedHeader({alg:'HS256'}).setSubject(user.id).setIssuedAt().setExpirationTime('7d').sign(refreshSecret());return {access,refresh};}
export async function setAuthCookies(user:{id:string;role:Role}){const {access,refresh}=await createTokens(user);const jar=await cookies();const base={httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax' as const,path:'/'};jar.set('medirule_access',access,{...base,maxAge:60*15});jar.set('medirule_refresh',refresh,{...base,maxAge:60*60*24*7});}
export async function clearAuthCookies(){const jar=await cookies();jar.delete('medirule_access');jar.delete('medirule_refresh');}
export async function getCurrentUser(){try{const token=(await cookies()).get('medirule_access')?.value;if(!token)return null;const {payload}=await jwtVerify(token,secret());if(!payload.sub)return null;await connectDB();return await User.findById(payload.sub).select('-passwordHash').lean();}catch{return null;}}
export async function requireUser(roles?:Role[]){const user=await getCurrentUser();if(!user)throw new Error('UNAUTHORIZED');if(roles&&!roles.includes(user.role))throw new Error('FORBIDDEN');return user;}
