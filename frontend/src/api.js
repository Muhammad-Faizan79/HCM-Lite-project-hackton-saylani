const BASE ='http://localhost:5000/api';
// const BASE ='https://hcm-lite-project-hackton-saylani.vercel.app/api';
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

// const BASE = 'https://backend-muhammad-faizan79s-projects.vercel.app/api';

// export function getToken() {
//   return localStorage.getItem('hcm_token');
// }

// export async function api(path, options = {}) {
//   const headers = { ...(options.headers || {}) };

//   const hasBody = options.body !== undefined && options.body !== null;

//   if (hasBody && !headers['Content-Type']) {
//     headers['Content-Type'] = 'application/json';
//   }

//   if (options.auth !== false && getToken()) {
//     headers.Authorization = `Bearer ${getToken()}`;
//   }

//   const { auth, ...fetchOptions } = options;

//   const res = await fetch(`${BASE}${path}`, {
//     ...fetchOptions,
//     headers
//   });

//   const data = await res.json().catch(() => ({}));

//   if (!res.ok) {
//     throw new Error(data.message || `Request failed (${res.status})`);
//   }

//   return data;
// }

// export function saveSession(data) {
//   localStorage.setItem('hcm_token', data.token);
//   localStorage.setItem('hcm_user', JSON.stringify(data.user));
// }

// export function currentUser() {
//   try {
//     return JSON.parse(localStorage.getItem('hcm_user') || 'null');
//   } catch {
//     return null;
//   }
// }

// export function clearSession() {
//   localStorage.removeItem('hcm_token');
//   localStorage.removeItem('hcm_user');
// }
