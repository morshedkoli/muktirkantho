"use client";

import { useState } from "react";

type CopyLinkButtonProps = {
  url: string;
};

export function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      className="rounded border border-[var(--np-border)] bg-[var(--np-background)] px-3 py-2 text-[var(--np-text-secondary)] hover:border-[var(--np-primary)] hover:text-[var(--np-primary)]"
      aria-live="polite"
    >
      {copied ? "Link Copied" : "Copy Link"}
    </button>
  );
}
