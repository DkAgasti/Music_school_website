export default function Modal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <button onClick={onClose} className="float-right text-gray-500 hover:text-gray-800">
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
