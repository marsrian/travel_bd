
"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

export default function Newsletter({ language = "en" }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isBangla = language === "bn";

  function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim()) return;

    // Demo only: email is not stored or sent yet.
    setSubmitted(true);
    setEmail("");
  }

  return (
    <section className="bg-green-800 px-5 py-10 text-white">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-4">
          <Send
            size={38}
            className="shrink-0 text-green-200"
            aria-hidden="true"
          />

          <div>
            <h2 className="text-xl font-bold">
              {isBangla
                ? "বাংলাদেশ ভ্রমণের আপডেট পান"
                : "Stay Updated with Bangladesh Tourism"}
            </h2>

            <p className="mt-1 text-sm text-green-100">
              {isBangla
                ? "নতুন ভ্রমণ স্থান ও অনুষ্ঠানের খবর পেতে সাবস্ক্রাইব করুন।"
                : "Get the latest travel tips, events and new destinations in your inbox."}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex w-full rounded-full bg-white p-1 md:max-w-md"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setSubmitted(false);
            }}
            placeholder={
              isBangla
                ? "আপনার ইমেইল ঠিকানা লিখুন"
                : "Enter your email address"
            }
            aria-label={
              isBangla ? "ইমেইল ঠিকানা" : "Email address"
            }
            className="min-w-0 flex-1 rounded-full px-4 text-sm text-slate-800 outline-none"
          />

          <button
            type="submit"
            className="shrink-0 rounded-full bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700"
          >
            {isBangla ? "সাবস্ক্রাইব" : "Subscribe"}
          </button>
        </form>
      </div>

      {submitted && (
        <p
          role="status"
          className="mt-4 flex items-center justify-center gap-2 text-center text-sm text-green-100"
        >
          <CheckCircle2 size={16} />
          {isBangla
            ? "ধন্যবাদ! এটি একটি ডেমো সাবমিশন।"
            : "Thank you! This is a demo submission."}
        </p>
      )}
    </section>
  );
}
