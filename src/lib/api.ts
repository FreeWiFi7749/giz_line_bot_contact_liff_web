export interface InquiryData {
  name: string;
  email: string;
  category: string;
  message: string;
  idToken: string | null;
  turnstileToken: string | null;
}

export interface ApiResponse {
  ok: boolean;
  message: string;
}

export async function submitInquiry(data: InquiryData): Promise<ApiResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error("API URL is not configured");
  }

  const response = await fetch(`${apiUrl}/api/inquiry`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "送信に失敗しました");
  }

  return response.json();
}
