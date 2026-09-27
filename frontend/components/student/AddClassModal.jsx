"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { apiGetClasses } from "@/Api/public/classApi";
import { apiApplyForAdditionalClass } from "@/Api/student/admissionApi";
import { apiVerifyPayment } from "@/Api/public/paymentApi";
import { toast } from "react-toastify";

function rupees(paise) {
  return `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;
}

export default function AddClassModal({ profile, onClose, onEnrolled }) {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [feePlanId, setFeePlanId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiGetClasses().then((res) => {
      if (Array.isArray(res)) setClasses(res);
    });
  }, []);

  const selectedClass = classes.find((c) => c.id === classId);
  const alreadyEnrolledIds = new Set((profile?.enrolledClasses || []).map((c) => c.id));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!classId || !batchId || !feePlanId) return;

    if (typeof window === "undefined" || !window.Razorpay) {
      toast.error("Payment is still loading, please try again in a moment.");
      return;
    }

    setSubmitting(true);
    const result = await apiApplyForAdditionalClass({ classId, batchId, feePlanId });
    if (!result) {
      setSubmitting(false);
      return;
    }

    const { razorpayOrder, razorpayKey } = result;
    const rzp = new window.Razorpay({
      key: razorpayKey,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      order_id: razorpayOrder.id,
      name: `Synchrocity Music School — ${selectedClass?.name || "Admission"} Fee`,
      prefill: {
        name: profile?.studentName,
        email: profile?.email,
        contact: profile?.phone,
      },
      handler: async (response) => {
        const verifyResult = await apiVerifyPayment(response);
        if (verifyResult) {
          toast.success("You're enrolled! Welcome to the class.");
          onEnrolled();
        }
        setSubmitting(false);
      },
      modal: {
        ondismiss: () => setSubmitting(false),
      },
    });
    rzp.open();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-gray-900">Join Another Class</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-gray-700">Class</span>
            <select
              required
              value={classId}
              onChange={(e) => {
                setClassId(e.target.value);
                setBatchId("");
                setFeePlanId("");
              }}
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#E11D48] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20"
            >
              <option value="">Select a class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id} disabled={alreadyEnrolledIds.has(c.id)}>
                  {c.name}
                  {alreadyEnrolledIds.has(c.id) ? " (already enrolled)" : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-gray-700">Batch</span>
            <select
              required
              disabled={!classId}
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#E11D48] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">{classId ? "Select a batch" : "Select a class first"}</option>
              {(selectedClass?.batches || []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} — {b.schedule}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-gray-700">Fee Plan</span>
            <select
              required
              disabled={!classId}
              value={feePlanId}
              onChange={(e) => setFeePlanId(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#E11D48] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">{classId ? "Select a fee plan" : "Select a class first"}</option>
              {(selectedClass?.feePlans || []).map((fp) => (
                <option key={fp.id} value={fp.id}>
                  {fp.name} — {rupees(fp.amount)}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !classId || !batchId || !feePlanId}
              className="flex-1 rounded-full bg-[#E11D48] py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#D81B60] disabled:opacity-60"
            >
              {submitting ? "Processing…" : "Continue to Payment"}
            </button>
          </div>
        </form>
      </div>

      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </div>
  );
}
