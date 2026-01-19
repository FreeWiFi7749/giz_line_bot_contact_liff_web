"use client";

import { useState, useEffect, useRef } from "react";
import { initializeLiff, getIdToken, getProfile, closeWindow, isInClient } from "@/lib/liff";
import { submitInquiry } from "@/lib/api";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

const CATEGORIES = [
  { value: "general", label: "一般的なお問い合わせ" },
  { value: "support", label: "サポート" },
  { value: "bug", label: "不具合報告" },
  { value: "suggestion", label: "ご提案" },
];

type FormState = "loading" | "form" | "submitting" | "success" | "error" | "blocked";

export default function InquiryForm() {
  const [formState, setFormState] = useState<FormState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [idToken, setIdToken] = useState<string | null>(null);
  const [isLiffClient, setIsLiffClient] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  useEffect(() => {
    async function init() {
      try {
        await initializeLiff();
        const inClient = isInClient();
        setIsLiffClient(inClient);
        
        // Block access from outside LINE app (anti-spam)
        if (!inClient) {
          setFormState("blocked");
          return;
        }
        
        const token = getIdToken();
        setIdToken(token);

        const profile = await getProfile();
        if (profile) {
          setName(profile.displayName);
        }

        setFormState("form");
      } catch (error) {
        console.error("LIFF initialization failed:", error);
        // If LIFF init fails, block access (likely not in LINE)
        setFormState("blocked");
      }
    }

    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setErrorMessage("お名前を入力してください");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("メールアドレスを入力してください");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("正しい形式のメールアドレスを入力してください（例: example@email.com）");
      return;
    }

    if (!message.trim()) {
      setErrorMessage("お問い合わせ内容を入力してください");
      return;
    }

    if (message.trim().length < 10) {
      setErrorMessage("お問い合わせ内容は10文字以上で入力してください");
      return;
    }

    if (!turnstileToken) {
      setErrorMessage("認証を完了してください");
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleClose = () => {
    closeWindow();
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setCategory("general");
    setMessage("");
    setErrorMessage("");
    setTurnstileToken(null);
    turnstileRef.current?.reset();
  };

  const handleConfirmSubmit = () => {
    setShowConfirmDialog(false);
    doSubmit();
  };

  const doSubmit = async () => {
    setFormState("submitting");
    setErrorMessage("");

    try {
      await submitInquiry({
        name: name.trim(),
        email: email.trim(),
        category,
        message: message.trim(),
        idToken,
        turnstileToken,
      });
      setFormState("success");
    } catch (error) {
      setFormState("error");
      setErrorMessage(error instanceof Error ? error.message : "送信できませんでした。しばらくしてからもう一度お試しください。");
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    }
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

  if (formState === "blocked") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-800">アクセスできません</h2>
          <p className="text-gray-600">
            このフォームはLINEアプリからのみ<br />
            ご利用いただけます。
          </p>
          <p className="mt-4 text-sm text-gray-500">
            LINEアプリを開いて、<br />
            お問い合わせメニューからアクセスしてください。
          </p>
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
          <p className="mb-4 text-gray-600">
            お問い合わせを受け付けました。<br />
            確認メールをお送りしましたのでご確認ください。
          </p>
          <div className="mb-6 rounded-lg bg-yellow-50 p-3 text-left text-sm text-yellow-700">
            <p className="font-medium">メールが届かない場合</p>
            <ul className="mt-1 list-disc pl-4 text-xs">
              <li>迷惑メールフォルダをご確認ください</li>
              <li>メールアドレスに誤りがないかご確認ください</li>
            </ul>
          </div>
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
          <p className="mt-1 text-xs text-gray-500">
            通常2〜3営業日以内にご返信いたします
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-lg">
          {(formState === "error" || errorMessage) && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
              <div className="flex items-start">
                <svg className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{errorMessage || "エラーが発生しました。もう一度お試しください。"}</span>
              </div>
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
            <p className="mt-1 text-xs text-gray-500">確認メールをお送りします</p>
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
              placeholder="お問い合わせ内容をご記入ください（10文字以上）"
              disabled={formState === "submitting"}
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>10文字以上でご入力ください</span>
              <span className={message.trim().length < 10 ? "text-orange-500" : "text-green-600"}>
                {message.trim().length} / 10文字以上
              </span>
            </div>
          </div>

          {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
            <div className="mb-6 flex justify-center">
              <Turnstile
                ref={turnstileRef}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                onSuccess={(token) => setTurnstileToken(token)}
                onError={() => {
                  setTurnstileToken(null);
                  setErrorMessage("認証に失敗しました。ページを再読み込みしてください。");
                }}
                onExpire={() => setTurnstileToken(null)}
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={formState === "submitting"}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
            >
              リセット
            </button>
            <button
              type="submit"
              disabled={formState === "submitting" || Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileToken)}
              className="flex-[2] rounded-lg bg-green-500 px-4 py-3 font-medium text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-400"
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
          </div>
        </form>

        <p className="mt-4 text-center text-xs text-gray-500">
          お問い合わせ内容は、ご入力いただいたメールアドレスにも送信されます。
        </p>
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-gray-800">送信確認</h3>
            <p className="mb-2 text-sm text-gray-600">以下の内容で送信します。よろしいですか？</p>
            <div className="mb-4 rounded-lg bg-gray-50 p-3 text-sm">
              <p><span className="font-medium">お名前:</span> {name}</p>
              <p><span className="font-medium">メール:</span> {email}</p>
              <p><span className="font-medium">種別:</span> {CATEGORIES.find(c => c.value === category)?.label}</p>
              <p className="mt-2"><span className="font-medium">内容:</span></p>
              <p className="mt-1 whitespace-pre-wrap text-gray-700">{message.length > 100 ? message.substring(0, 100) + "..." : message}</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="flex-1 rounded-lg bg-green-500 px-4 py-2 font-medium text-white transition-colors hover:bg-green-600"
              >
                送信する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
