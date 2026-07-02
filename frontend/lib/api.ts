const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface ApiError {
  status: number;
  error_code: string;
  message: string;
  details?: any;
  request_id?: string;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const session_id = typeof window !== "undefined" ? localStorage.getItem("session_id") : null;

  // Set default headers
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Construct URL with session_id query param for guest cart tracking if no token exists
  let url = `${API_BASE_URL}${path}`;
  if (!token && session_id) {
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}session_id=${session_id}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: "An unexpected server error occurred." };
    }
    
    const apiErr: ApiError = {
      status: response.status,
      error_code: errorData.error_code || "UNKNOWN_ERROR",
      message: errorData.message || "An unexpected error occurred.",
      details: errorData.details,
      request_id: errorData.request_id,
    };
    throw apiErr;
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

// Ensure guest session_id exists for cart tracking
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let sessionId = localStorage.getItem("session_id");
  if (!sessionId) {
    sessionId = `sess_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    localStorage.setItem("session_id", sessionId);
  }
  return sessionId;
}
