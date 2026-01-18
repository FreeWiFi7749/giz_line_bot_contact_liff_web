"use client";

import { useState, useEffect } from "react";
import { initializeLiff, getIdToken, getProfile, closeWindow, isInClient } from "@/lib/liff";
import { submitInquiry } from "@/lib/api";

const CATEGORIES = [
  { value: "general", label: "一般的なお問い合わせ" },
  { value: "support", label: "サポート" },
  { value: "bug", label: "不具合報告" },
  { value: "suggestion", label: "ご提案" },
];

type FormState = "loading" | "form" | "submitting" | "success" | "error";

export default function InquiryForm() {
  const [formState, setFormState] = useState<FormState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [idToken, setIdToken] = useState<string | null>(null);
  const [isLiffClient, setIsLiffClient] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        await initializeLiff();
        setIsLiffClient(isInClient());
        
        const token = getIdToken();
        setIdToken(token);

        const profile = await getProfile();
        if (profile) {
          setName(profile.displayName);
        }

        setFormState("form");
      } catch (error) {
        console.error("LIFF initialization failed:", error);
        setFormState("form");
      }
    }

    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMessage("すべての項目を入力してください");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("有効なメールアドレスを入力してください");
      return;
    }

    setFormState("submitting");
    setErrorMessage("");

    try {
      await submitInquiry({
        name: name.trim(),
        email: email.trim(),
        category,
        message: message.trim(),
        idToken,
      });
      setFormState("success");
    } catch (error) {
      setFormState("error");
      setErrorMessage(error instanceof Error ? error.message : "送信に失敗しました");
    }
  };

  const handleClose = () => {
    closeWindow();
  };

  if (formState === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (formState === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-800">送信完了</h2>
          <p className="mb-6 text-gray-600">
            お問い合わせを受け付けました。<br />
            確認メールをお送りしましたのでご確認ください。
          </p>
          {isLiffClient && (
            <button
              onClick={handleClose}
              className="w-full rounded-lg bg-green-500 px-4 py-3 font-medium text-white transition-colors hover:bg-green-600"
            >
              閉じる
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">お問い合わせ</h1>
          <p className="mt-2 text-sm text-gray-600">
            以下のフォームからお問い合わせください
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-lg">
          {(formState === "error" || errorMessage) && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {errorMessage || "エラーが発生しました。もう一度お試しください。"}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
              お名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="山田 太郎"
              disabled={formState === "submitting"}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="example@email.com"
              disabled={formState === "submitting"}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="category" className="mb-1 block text-sm font-medium text-gray-700">
              お問い合わせ種別 <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              disabled={formState === "submitting"}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-700">
              お問い合わせ内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="お問い合わせ内容をご記入ください"
              disabled={formState === "submitting"}
            />
          </div>

          <button
            type="submit"
            disabled={formState === "submitting"}
            className="w-full rounded-lg bg-green-500 px-4 py-3 font-medium text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {formState === "submitting" ? (
              <span className="flex items-center justify-center">
                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>
                送信中...
              </span>
            ) : (
              "送信する"
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-500">
          お問い合わせ内容は、ご入力いただいたメールアドレスにも送信されます。
        </p>
      </div>
    </div>
  );
}
