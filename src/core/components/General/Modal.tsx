"use client";

import { Fragment } from "react";
import { CloseIcon } from "@/shared/svgs";

const Modal = ({ isModalOpen, setIsModalOpen }) => {
  if (!isModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-2 bg-neutral-focus bg-opacity-50"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl h-full md:h-auto overflow-visible transform text-left align-middle shadow-xl transition-all rounded-xl bg-base-100 p-6 md:p-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">I&apos;m a modal</h2>
          <button
            title="Close modal"
            className="btn btn-square btn-ghost btn-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <CloseIcon />
          </button>
        </div>

        <section>And here is my content</section>
      </div>
    </div>
  );
};

export default Modal;
