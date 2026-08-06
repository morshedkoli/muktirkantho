"use client";

import { useTransition } from "react";
import { Loader2, RefreshCw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/admin/toast-provider";
import { retryShareAction, shareToFacebookAction } from "@/app/(admin)/admin/actions";

type Props =
  | { mode: "share"; postId: string; disabled?: boolean }
  | { mode: "retry"; shareId: string; disabled?: boolean };

/**
 * Runs a share (or retry) and reports the outcome.
 *
 * A share can fail for reasons the editor can act on — an expired token, a
 * rejected image — so the message from the server is shown verbatim rather than
 * flattened into "something went wrong". `useTransition` keeps the row
 * interactive-but-busy instead of swapping in a spinner that loses the context.
 */
export function ShareButton(props: Props) {
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();

  const run = () => {
    startTransition(async () => {
      const result =
        props.mode === "retry"
          ? await retryShareAction(props.shareId)
          : await shareToFacebookAction(props.postId);
      showToast(result.message ?? "", result.status === "success" ? "success" : "error");
    });
  };

  const Icon = props.mode === "retry" ? RefreshCw : Send;

  return (
    <Button
      type="button"
      size="sm"
      variant={props.mode === "retry" ? "outline" : "secondary"}
      onClick={run}
      disabled={pending || props.disabled}
      className="gap-1.5"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
      {props.mode === "retry" ? "আবার চেষ্টা" : "শেয়ার করুন"}
    </Button>
  );
}
