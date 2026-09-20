"use client";

import { useState, useEffect } from "react";
import { useAdmission } from "@/context/AdmissionContext";
import { submitAdmission } from "@/lib/api";

const STEPS = [
  { id: 1, labelLine1: "Class", labelLine2: "Selection" },
  { id: 2, labelLine1: "Batch & Timing", labelLine2: "Selection" },
  { id: 3, labelLine1: "Student", labelLine2: "Details" },
  { id: 4, labelLine1: "Parent", labelLine2: "Details" },
  { id: 5, labelLine1: "Contact", labelLine2: "Details" },
  { id: 6, labelLine1: "Payment", labelLine2: "Review" },
];

const AVAILABLE_CLASSES = [
  "Vocals",
  "Guitar",
  "Piano",
  "Tabla",
  "Violin",
  "Drums",
];

const BATCH_TIMINGS = [
  { id: "b1", name: "Weekday Morning", schedule: "Mon, Wed, Fri · 09:00 AM – 10:30 AM" },
  { id: "b2", name: "Weekday Evening", schedule: "Mon, Wed, Fri · 04:30 PM – 06:00 PM" },
  { id: "b3", name: "Weekend Morning", schedule: "Saturday & Sunday · 10:00 AM – 12:00 PM" },
  { id: "b4", name: "Weekend Evening", schedule: "Saturday & Sunday · 04:00 PM – 06:00 PM" },
];

export default function AdmissionModal() {
  const { isOpen, initialData, closeAdmission } = useAdmission();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [showAllClasses, setShowAllClasses] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState("b2");
  const [studentDetails, setStudentDetails] = useState({
    fullName: "",
    dob: "",
    gender: "Female",
    experienceLevel: "Beginner",
  });
  const [guardianDetails, setGuardianDetails] = useState({
    guardianName: "",
    relationship: "Mother",
    occupation: "",
    emergencyPhone: "",
  });
  const [contactDetails, setContactDetails] = useState({
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [autoCloseCountdown, setAutoCloseCountdown] = useState(3);

  // Sync initialData whenever modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData?.selectedClass) {
        const cls = initialData.selectedClass;
        const matched = AVAILABLE_CLASSES.find(
          (c) => c.toLowerCase() === cls.toLowerCase()
        );
        if (matched) {
          setSelectedClasses([matched]);
          setShowAllClasses(false);
        } else {
          setSelectedClasses(["Vocals"]);
          setShowAllClasses(true);
        }
      } else {
        setSelectedClasses(["Vocals"]);
        setShowAllClasses(true);
      }
    }
  }, [isOpen, initialData]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && status !== "submitting") {
        handleModalClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, status]);

  // Auto-close countdown when successfully submitted
  useEffect(() => {
    if (!isSubmitted) return;

    setAutoCloseCountdown(3);
    const interval = setInterval(() => {
      setAutoCloseCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleModalClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSubmitted]);

  // Reset form and close
  const handleModalClose = () => {
    closeAdmission();
    // Delay resetting state until fade-out completes
    setTimeout(() => {
      setCurrentStep(1);
      setIsSubmitted(false);
      setStatus("idle");
    }, 300);
  };

  const toggleClass = (className) => {
    setSelectedClasses((prev) =>
      prev.includes(className)
        ? prev.filter((item) => item !== className)
        : [...prev, className]
    );
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      const payload = {
        selectedClasses,
        selectedBatch,
        studentDetails,
        guardianDetails,
        contactDetails,
        submittedAt: new Date().toISOString(),
      };

      await submitAdmission(payload);
      setStatus("success");
      setIsSubmitted(true);
    } catch {
      setStatus("error");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admission-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && status !== "submitting") {
          handleModalClose();
        }
      }}
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#FFF7F9] shadow-2xl border border-pink-100 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* ── Top Header with Title and Close Button ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-pink-100 bg-white shrink-0">
          <div>
            <h2 id="admission-modal-title" className="font-serif text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              Admission Form
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Take the first step towards your musical journey.
            </p>
          </div>

          <button
            type="button"
            onClick={handleModalClose}
            aria-label="Close Admission Popup"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-pink-100 hover:text-[#E11D48] transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Step Progress Indicator ── */}
        {!isSubmitted && (
          <div className="bg-white/80 px-6 py-3.5 border-b border-pink-100/60 shrink-0">
            <div className="relative flex items-center justify-between max-w-2xl mx-auto">
              {/* Progress Line */}
              <div className="absolute top-[16px] left-[8%] right-[8%] h-[2px] bg-gray-200 -translate-y-1/2 z-0">
                <div
                  className="h-full bg-[#E11D48] transition-all duration-300"
                  style={{
                    width: `${((currentStep - 1) / 5) * 100}%`,
                  }}
                />
              </div>

              {STEPS.map((step) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;

                return (
                  <div
                    key={step.id}
                    onClick={() => {
                      if (step.id < currentStep) setCurrentStep(step.id);
                    }}
                    className={`flex flex-col items-center relative z-10 ${
                      step.id < currentStep ? "cursor-pointer" : "cursor-default"
                    }`}
                  >
                    <div
                      className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-xs font-bold transition-all bg-white ${
                        isActive
                          ? "!bg-[#E11D48] text-white shadow-xs ring-2 ring-pink-200"
                          : isCompleted
                          ? "!bg-[#E11D48] text-white"
                          : "border border-gray-300 text-gray-400"
                      }`}
                    >
                      {isCompleted ? "✓" : step.id}
                    </div>
                    <span
                      className={`hidden sm:block mt-1 text-[10px] leading-tight text-center ${
                        isActive
                          ? "font-bold text-[#E11D48]"
                          : isCompleted
                          ? "font-semibold text-gray-700"
                          : "text-gray-400"
                      }`}
                    >
                      {step.labelLine1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Main Modal Body (Scrollable) ── */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 md:p-8">
          {/* SUCCESS STATE */}
          {isSubmitted ? (
            <div className="py-10 text-center max-w-md mx-auto animate-in fade-in zoom-in duration-300">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#FDEBF5] text-[#E11D48] ring-8 ring-pink-50">
                <svg className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
                Admission Application Received!
              </h3>
              <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
                Thank you for taking the first step. Our admissions team will contact you shortly to confirm your batch timing.
              </p>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-pink-100/70 px-4 py-1.5 text-xs font-semibold text-[#E11D48]">
                <span>Popup closing automatically in {autoCloseCountdown}s...</span>
              </div>

              <div className="mt-7">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="rounded-xl bg-[#E11D48] px-8 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#D81B60]"
                >
                  Close Now
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form Column */}
              <div className="lg:col-span-7">
                {/* STEP 1: CLASS SELECTION */}
                {currentStep === 1 && (
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                      Class Selection
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-gray-600 mb-5">
                      {initialData?.selectedClass && !showAllClasses
                        ? "Selected class for your admission"
                        : "Select the class(es) you want to join"}
                    </p>

                    {/* If opened from a specific session and user hasn't expanded to all classes */}
                    {initialData?.selectedClass && !showAllClasses ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-[#E11D48] bg-pink-50/50 shadow-xs">
                          <div className="flex items-center gap-3.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E11D48] text-white">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <div>
                              <span className="text-base font-bold text-gray-900">
                                {selectedClasses[0] || initialData.selectedClass}
                              </span>
                              <span className="block text-xs text-[#E11D48] font-semibold">
                                Auto-selected from {selectedClasses[0] || initialData.selectedClass} session
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setShowAllClasses(true)}
                            className="text-xs font-semibold text-gray-600 hover:text-[#E11D48] underline decoration-pink-300 transition-colors"
                          >
                            + Change or add more
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          {AVAILABLE_CLASSES.map((cls) => {
                            const isChecked = selectedClasses.includes(cls);
                            return (
                              <label
                                key={cls}
                                onClick={() => toggleClass(cls)}
                                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                                  isChecked
                                    ? "bg-white border-[#E11D48] shadow-xs ring-1 ring-[#E11D48]"
                                    : "bg-white/70 border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <div
                                  className={`flex h-4 w-4 items-center justify-center rounded transition-all ${
                                    isChecked
                                      ? "bg-[#E11D48] text-white"
                                      : "border border-gray-300 bg-white"
                                  }`}
                                >
                                  {isChecked && (
                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                                <span className="text-sm font-medium text-gray-800">
                                  {cls}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                        {initialData?.selectedClass && (
                          <div className="text-right pt-1">
                            <button
                              type="button"
                              onClick={() => setShowAllClasses(false)}
                              className="text-xs font-medium text-gray-500 hover:text-[#E11D48]"
                            >
                              &larr; Show only selected session
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-8 flex justify-end">
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={selectedClasses.length === 0}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#E11D48] px-7 py-3 text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#D81B60] disabled:opacity-50"
                      >
                        <span>Next Step</span>
                        <span>&rarr;</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: BATCH & TIMING SELECTION */}
                {currentStep === 2 && (
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                      Batch &amp; Timing Selection
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-gray-600 mb-5">
                      Choose schedule for {selectedClasses.join(", ")}
                    </p>

                    <div className="space-y-3">
                      {BATCH_TIMINGS.map((b) => {
                        const isSelected = selectedBatch === b.id;
                        return (
                          <div
                            key={b.id}
                            onClick={() => setSelectedBatch(b.id)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? "bg-white border-[#E11D48] shadow-xs ring-1 ring-[#E11D48]"
                                : "bg-white/70 border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-gray-900">
                                {b.name}
                              </span>
                              <div
                                className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                  isSelected
                                    ? "border-[#E11D48] bg-[#E11D48]"
                                    : "border-gray-300"
                                }`}
                              >
                                {isSelected && (
                                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                )}
                              </div>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              {b.schedule}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-8 flex justify-between">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#E11D48] px-7 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#D81B60]"
                      >
                        <span>Next Step</span>
                        <span>&rarr;</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: STUDENT DETAILS */}
                {currentStep === 3 && (
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                      Student Details
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-gray-600 mb-5">
                      Tell us about the prospective student
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Aarav Sharma"
                          value={studentDetails.fullName}
                          onChange={(e) =>
                            setStudentDetails({ ...studentDetails, fullName: e.target.value })
                          }
                          className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#E11D48]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Date of Birth *
                          </label>
                          <input
                            type="date"
                            required
                            value={studentDetails.dob}
                            onChange={(e) =>
                              setStudentDetails({ ...studentDetails, dob: e.target.value })
                            }
                            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#E11D48]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Gender
                          </label>
                          <select
                            value={studentDetails.gender}
                            onChange={(e) =>
                              setStudentDetails({ ...studentDetails, gender: e.target.value })
                            }
                            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#E11D48]"
                          >
                            <option value="Female">Female</option>
                            <option value="Male">Male</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Prior Experience Level
                        </label>
                        <select
                          value={studentDetails.experienceLevel}
                          onChange={(e) =>
                            setStudentDetails({ ...studentDetails, experienceLevel: e.target.value })
                          }
                          className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#E11D48]"
                        >
                          <option value="Beginner">Beginner (No prior experience)</option>
                          <option value="Intermediate">Intermediate (1-2 years experience)</option>
                          <option value="Advanced">Advanced (3+ years experience)</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-between">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={!studentDetails.fullName}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#E11D48] px-7 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#D81B60] disabled:opacity-50"
                      >
                        <span>Next Step</span>
                        <span>&rarr;</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: PARENT/GUARDIAN DETAILS */}
                {currentStep === 4 && (
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                      Parent / Guardian Details
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-gray-600 mb-5">
                      Required for emergency contact &amp; updates
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Guardian Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Priya Sharma"
                          value={guardianDetails.guardianName}
                          onChange={(e) =>
                            setGuardianDetails({ ...guardianDetails, guardianName: e.target.value })
                          }
                          className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#E11D48]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Relationship
                          </label>
                          <select
                            value={guardianDetails.relationship}
                            onChange={(e) =>
                              setGuardianDetails({ ...guardianDetails, relationship: e.target.value })
                            }
                            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#E11D48]"
                          >
                            <option value="Mother">Mother</option>
                            <option value="Father">Father</option>
                            <option value="Guardian">Guardian</option>
                            <option value="Self">Self (Adult Student)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Emergency Phone *
                          </label>
                          <input
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={guardianDetails.emergencyPhone}
                            onChange={(e) =>
                              setGuardianDetails({ ...guardianDetails, emergencyPhone: e.target.value })
                            }
                            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#E11D48]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Occupation
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Software Engineer / Doctor"
                          value={guardianDetails.occupation}
                          onChange={(e) =>
                            setGuardianDetails({ ...guardianDetails, occupation: e.target.value })
                          }
                          className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#E11D48]"
                        />
                      </div>
                    </div>

                    <div className="mt-8 flex justify-between">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={!guardianDetails.guardianName}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#E11D48] px-7 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#D81B60] disabled:opacity-50"
                      >
                        <span>Next Step</span>
                        <span>&rarr;</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 5: CONTACT & ADDRESS */}
                {currentStep === 5 && (
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                      Contact &amp; Address
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-gray-600 mb-5">
                      Where should we send confirmation &amp; schedule?
                    </p>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="aarav@gmail.com"
                            value={contactDetails.email}
                            onChange={(e) =>
                              setContactDetails({ ...contactDetails, email: e.target.value })
                            }
                            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#E11D48]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="+91 98765 43210"
                            value={contactDetails.phone}
                            onChange={(e) =>
                              setContactDetails({ ...contactDetails, phone: e.target.value })
                            }
                            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#E11D48]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Street Address
                        </label>
                        <input
                          type="text"
                          placeholder="House No, Apartment, Street"
                          value={contactDetails.address}
                          onChange={(e) =>
                            setContactDetails({ ...contactDetails, address: e.target.value })
                          }
                          className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#E11D48]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            placeholder="New Delhi"
                            value={contactDetails.city}
                            onChange={(e) =>
                              setContactDetails({ ...contactDetails, city: e.target.value })
                            }
                            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#E11D48]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Pincode
                          </label>
                          <input
                            type="text"
                            placeholder="110016"
                            value={contactDetails.pincode}
                            onChange={(e) =>
                              setContactDetails({ ...contactDetails, pincode: e.target.value })
                            }
                            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#E11D48]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-between">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={!contactDetails.email || !contactDetails.phone}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#E11D48] px-7 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#D81B60] disabled:opacity-50"
                      >
                        <span>Review &amp; Pay</span>
                        <span>&rarr;</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 6: APPLICATION SUMMARY & PAYMENT */}
                {currentStep === 6 && (
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                      Summary &amp; Submit
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-gray-600 mb-5">
                      Review your details before completing admission
                    </p>

                    <div className="rounded-2xl bg-white border border-pink-100 p-4 space-y-3 shadow-xs">
                      <div className="flex justify-between items-center pb-2.5 border-b border-gray-100">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Classes
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-gray-900">
                          {selectedClasses.join(", ")}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pb-2.5 border-b border-gray-100">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Schedule
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-gray-800">
                          {BATCH_TIMINGS.find((b) => b.id === selectedBatch)?.name}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pb-2.5 border-b border-gray-100">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Student Name
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-gray-800">
                          {studentDetails.fullName || "—"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pb-2.5 border-b border-gray-100">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Registration Fee
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-gray-800">₹500</span>
                      </div>

                      <div className="flex justify-between items-center pt-1 text-sm sm:text-base font-bold text-gray-900">
                        <span>Total Payable</span>
                        <span className="text-[#E11D48]">
                          ₹{selectedClasses.length * 2000 + 500}
                        </span>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-between">
                      <button
                        type="button"
                        onClick={handleBack}
                        disabled={status === "submitting"}
                        className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={status === "submitting"}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#E11D48] px-8 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#D81B60] disabled:opacity-60"
                      >
                        {status === "submitting" ? (
                          <span>Processing...</span>
                        ) : (
                          <>
                            <span>Complete Admission</span>
                            <span>&rarr;</span>
                          </>
                        )}
                      </button>
                    </div>

                    {status === "error" && (
                      <p className="mt-3 text-center text-xs text-rose-500">
                        Something went wrong. Please try again.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Microphone Artwork Illustration Card */}
              <div className="hidden lg:flex lg:col-span-5 justify-center">
                <div className="relative w-full rounded-2xl overflow-hidden shadow-xs border border-pink-100">
                  <img
                    src="/images/admission/microphone-card.png"
                    alt="Harmony Music School Admission"
                    className="w-full h-auto object-cover block select-none pointer-events-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

