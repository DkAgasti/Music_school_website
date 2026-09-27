"use client";

import { useState } from "react";
import Script from "next/script";
import { toast } from "react-toastify";
import { cloudinaryThumb } from "@/lib/cloudinary";
import { apiCreateFeePaymentOrder } from "@/Api/student/paymentsApi";
import { apiVerifyPayment } from "@/Api/public/paymentApi";

function rupees(rupeesAmount) {
  return `₹${Math.round(rupeesAmount).toLocaleString("en-IN")}`;
}

export default function ClassDetailsModal({ cls, feeInfo, profile, onClose, onPaid }) {
  const [paying, setPaying] = useState(false);

  const startedLabel = new Date(cls.startedDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  async function handlePayFees() {
    if (typeof window === "undefined" || !window.Razorpay) {
      toast.error("Payment is still loading, please try again in a moment.");
      return;
    }

    setPaying(true);
    const result = await apiCreateFeePaymentOrder(cls.enrollmentId);
    if (!result) {
      setPaying(false);
      return;
    }

    const { razorpayOrder, razorpayKey } = result;
    const rzp = new window.Razorpay({
      key: razorpayKey,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      order_id: razorpayOrder.id,
      name: `Synchrocity Music School — ${cls.name} Fee`,
      prefill: {
        name: profile?.studentName,
        email: profile?.email,
        contact: profile?.phone,
      },
      handler: async (response) => {
        const verifyResult = await apiVerifyPayment(response);
        if (verifyResult) {
          toast.success("Payment successful!");
          await onPaid();
        }
        setPaying(false);
      },
      modal: {
        ondismiss: () => setPaying(false),
      },
    });
    rzp.open();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-gray-900">{cls.name}</h2>
            <span className="mt-1 inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              {cls.status}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {cls.imageUrl && (
          <img
            src={cloudinaryThumb(cls.imageUrl, 600)}
            alt={cls.name}
            className="mt-4 h-40 w-full rounded-xl bg-gray-100 object-cover"
          />
        )}

        {cls.description && (
          <p className="mt-4 text-sm leading-relaxed text-gray-600">{cls.description}</p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl bg-gray-50 p-4">
          <div>
            <p className="text-xs text-gray-400">Batch</p>
            <p className="mt-0.5 text-sm font-semibold text-gray-900">{cls.batchName || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Schedule</p>
            <p className="mt-0.5 text-sm font-semibold text-gray-900">{cls.schedule || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Duration</p>
            <p className="mt-0.5 text-sm font-semibold text-gray-900">
              {cls.durationMonths ? `${cls.durationMonths} month${cls.durationMonths > 1 ? "s" : ""}` : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Enrolled Since</p>
            <p className="mt-0.5 text-sm font-semibold text-gray-900">{startedLabel}</p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3.5 rounded-xl border border-pink-100/70 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-[#D63E82] via-[#E66DA4] to-[#F298BE] text-white">
            {cls.teacherPhotoUrl ? (
              <img src={cls.teacherPhotoUrl} alt={cls.teacher} className="h-full w-full object-cover" />
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-400">Teacher</p>
            <p className="text-sm font-semibold text-gray-900">{cls.teacher}</p>
            {cls.teacherBio && <p className="mt-0.5 text-xs text-gray-500">{cls.teacherBio}</p>}
          </div>
        </div>

        {cls.syllabus && (
          <div className="mt-5">
            <p className="text-xs font-semibold text-gray-700">Syllabus</p>
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-gray-600">{cls.syllabus}</p>
          </div>
        )}

        {feeInfo?.feePlanAmountRupees != null && (
          <div className="mt-5 rounded-xl bg-[#FDF2F8] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">
                  {feeInfo.feePlanName ? `${feeInfo.feePlanName} Plan` : "Fee"}
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {rupees(feeInfo.feePlanAmountRupees)}
                </p>
              </div>
              <button
                type="button"
                onClick={handlePayFees}
                disabled={paying}
                className="rounded-full bg-[#E11D48] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#D81B60] disabled:opacity-60 cursor-pointer"
              >
                {paying ? "Processing…" : "Pay Fees"}
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-full bg-[#E11D48] py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#D81B60]"
        >
          Close
        </button>
      </div>

      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </div>
  );
}
