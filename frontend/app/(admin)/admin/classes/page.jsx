"use client";

import { useAdminList } from "@/lib/useAdminList";

export default function ClassesAdminPage() {
  const { loading } = useAdminList("/classes/batches/all");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          <p className="text-sm text-gray-500">Manage classes via the API — a create/edit form goes here.</p>
        )}
      </div>
    </div>
  );
}
