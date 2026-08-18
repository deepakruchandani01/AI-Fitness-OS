"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { FoodLogger } from "./FoodLogger";
import { FoodList } from "./FoodList";
import { Empty } from "@/components/ui/card";
import type { FoodLog } from "@/types/database";

export function FoodPageClient({ userId, date, items }: { userId: string; date: string; items: FoodLog[] }) {
  const params = useSearchParams(); const router = useRouter();
  const [open, setOpen] = useState(params.get("log") === "1");
  const close = () => { setOpen(false); if (params.get("log")) router.replace("/food"); };
  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary w-full py-3.5 text-[15px] sm:w-auto"><Camera size={18} /> Log food with a photo</button>
      <div className="card mt-6 p-5 sm:p-6">
        {items.length ? <FoodList items={items} /> : <Empty title="Your food log is empty." body="Photograph your next meal — the AI drafts the entry, you confirm." cta={<button onClick={() => setOpen(true)} className="btn-secondary">Log your first meal</button>} />}
      </div>
      <FoodLogger userId={userId} date={date} open={open} onClose={close} />
    </>
  );
}
