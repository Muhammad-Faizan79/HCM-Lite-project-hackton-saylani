const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export function getToken(){return localStorage.getItem('hcm_token')}
export async function api(path, options={}) {
 const headers={'Content-Type':'application/json',...(options.headers||{})};
 if(getToken())headers.Authorization=`Bearer ${getToken()}`;
 const res=await fetch(`${BASE}${path}`,{...options,headers});
 const data=await res.json().catch(()=>({}));
 if(!res.ok)throw new Error(data.message||'Request failed');
 return data;
}
export function saveSession(data){localStorage.setItem('hcm_token',data.token);localStorage.setItem('hcm_user',JSON.stringify(data.user))}
export function currentUser(){try{return JSON.parse(localStorage.getItem('hcm_user')||'null')}catch{return null}}
export function clearSession(){localStorage.removeItem('hcm_token');localStorage.removeItem('hcm_user')}
