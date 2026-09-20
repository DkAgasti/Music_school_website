"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isStudentAuthenticated } from "@/lib/studentAuth";

export default function StudentGuard({ children }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isStudentAuthenticated()) {
      router.replace("/student-login");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) return null;

  return children;
}
