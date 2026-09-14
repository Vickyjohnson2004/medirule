'use client';
import {useRouter} from 'next/navigation';
import {LogOut} from 'lucide-react';
export function LogoutButton(){const router=useRouter();const logout=async()=>{await fetch('/api/auth/logout',{method:'POST'});router.push('/');router.refresh()};return <button onClick={logout} className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"><LogOut size={16}/> Sign out</button>}
