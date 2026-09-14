'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
const ThemeContext = createContext<{theme:Theme; toggle:()=>void}>({theme:'light',toggle:()=>{}});
export function ThemeProvider({children}:{children:React.ReactNode}) {
  const [theme,setTheme]=useState<Theme>('light');
  useEffect(()=>{ const saved=localStorage.getItem('medirule-theme') as Theme|null; const prefers=window.matchMedia('(prefers-color-scheme: dark)').matches; const next=saved??(prefers?'dark':'light'); setTheme(next); document.documentElement.classList.toggle('dark',next==='dark'); },[]);
  const toggle=()=>setTheme(t=>{const next=t==='light'?'dark':'light'; document.documentElement.classList.toggle('dark',next==='dark'); localStorage.setItem('medirule-theme',next); return next;});
  return <ThemeContext.Provider value={{theme,toggle}}>{children}</ThemeContext.Provider>;
}
export const useTheme=()=>useContext(ThemeContext);
