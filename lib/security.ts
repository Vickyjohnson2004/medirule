import { NextResponse } from 'next/server';
export function apiError(message: string, errorCode: string, status = 400) {
  return NextResponse.json({ success: false, message, errorCode }, { status });
}
export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}
export function safeEmail(email: string) {
  return email.trim().toLowerCase();
}
