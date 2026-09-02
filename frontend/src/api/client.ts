export const API=import.meta.env.VITE_API_URL||"http://127.0.0.1:8000";
export type SessionUser={id:string;email:string;role:"FARMER"|"BUYER";profile_id?:string|null};
export const getUser=():SessionUser|null=>{try{return JSON.parse(localStorage.getItem("agrioptima_user")||"null")}catch{return null}};
export function saveSession(data:any){localStorage.setItem("agrioptima_access_token",data.access_token);localStorage.setItem("agrioptima_refresh_token",data.refresh_token);localStorage.setItem("agrioptima_user",JSON.stringify(data.user));window.dispatchEvent(new Event("agrioptima-auth-change"))}
export function signOut(){localStorage.removeItem("agrioptima_access_token");localStorage.removeItem("agrioptima_refresh_token");localStorage.removeItem("agrioptima_user");window.dispatchEvent(new Event("agrioptima-auth-change"))}
export async function apiFetch(path:string,init:RequestInit={}){const token=localStorage.getItem("agrioptima_access_token");const headers=new Headers(init.headers);if(token)headers.set("Authorization",`Bearer ${token}`);return fetch(path.startsWith("http")?path:`${API}${path}`,{...init,headers})}
