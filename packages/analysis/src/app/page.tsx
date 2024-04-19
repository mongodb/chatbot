"use client";
import { useEffect, useState } from "react";
import { FaqEntry } from "@/lib/FaqEntry";
import { MyResponsiveBump } from "./Bump";

import Image from "next/image";

type Series = {
  id: string;
  data: {
    x: string;
    y: number;
  }[];
};

export default function Home() {
  const [data, setData] = useState<Series[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/faq")
      .then((res) => res.json() as Promise<{ series: Series[] }>)
      .then(({ series }) => {
        setData(series);
        setLoading(false);
      });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div style={{ height: 800, width: 800 }}>
        {isLoading ? (
          <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
            Loading
          </p>
        ) : (
          <MyResponsiveBump data={data} />
        )}
      </div>
    </main>
  );
}
