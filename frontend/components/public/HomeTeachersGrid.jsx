"use client";

import { useState } from "react";
import TeacherCard from "@/components/public/TeacherCard";
import TeacherProfileModal from "@/components/public/TeacherProfileModal";

export default function HomeTeachersGrid({ teachers }) {
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4">
        {teachers.map((teacher) => (
          <TeacherCard key={teacher.id} teacher={teacher} onSelect={setSelectedTeacher} />
        ))}
      </div>

      <TeacherProfileModal
        teacher={selectedTeacher}
        onClose={() => setSelectedTeacher(null)}
      />
    </>
  );
}
