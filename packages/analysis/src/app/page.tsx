import { useEffect } from "react";
import { MongoClient, Db } from "mongodb";
import { MyResponsiveBump } from "./Bump";
import { assertEnvVars } from "mongodb-rag-core";

import Image from "next/image";

import "dotenv/config";

const { MONGODB_CONNECTION_URI } = assertEnvVars({
  MONGODB_CONNECTION_URI: "",
});

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div style={{ height: 800, width: 800 }}>
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          {MONGODB_CONNECTION_URI}
        </p>
        <MyResponsiveBump
          data={[
            {
              id: "Serie 1",
              data: [
                {
                  x: 2000,
                  y: 3,
                },
                {
                  x: 2001,
                  y: 11,
                },
                {
                  x: 2002,
                  y: 7,
                },
                {
                  x: 2003,
                  y: 3,
                },
                {
                  x: 2004,
                  y: 3,
                },
              ],
            },
            {
              id: "Serie 2",
              data: [
                {
                  x: 2000,
                  y: 9,
                },
                {
                  x: 2001,
                  y: 7,
                },
                {
                  x: 2002,
                  y: 5,
                },
                {
                  x: 2003,
                  y: 1,
                },
                {
                  x: 2004,
                  y: 6,
                },
              ],
            },
            {
              id: "Serie 3",
              data: [
                {
                  x: 2000,
                  y: 11,
                },
                {
                  x: 2001,
                  y: 10,
                },
                {
                  x: 2002,
                  y: 2,
                },
                {
                  x: 2003,
                  y: 12,
                },
                {
                  x: 2004,
                  y: 9,
                },
              ],
            },
            {
              id: "Serie 4",
              data: [
                {
                  x: 2000,
                  y: 5,
                },
                {
                  x: 2001,
                  y: 6,
                },
                {
                  x: 2002,
                  y: 3,
                },
                {
                  x: 2003,
                  y: 9,
                },
                {
                  x: 2004,
                  y: 1,
                },
              ],
            },
            {
              id: "Serie 5",
              data: [
                {
                  x: 2000,
                  y: 12,
                },
                {
                  x: 2001,
                  y: 12,
                },
                {
                  x: 2002,
                  y: 9,
                },
                {
                  x: 2003,
                  y: 5,
                },
                {
                  x: 2004,
                  y: 5,
                },
              ],
            },
            {
              id: "Serie 6",
              data: [
                {
                  x: 2000,
                  y: 1,
                },
                {
                  x: 2001,
                  y: 3,
                },
                {
                  x: 2002,
                  y: 11,
                },
                {
                  x: 2003,
                  y: 6,
                },
                {
                  x: 2004,
                  y: 10,
                },
              ],
            },
            {
              id: "Serie 7",
              data: [
                {
                  x: 2000,
                  y: 4,
                },
                {
                  x: 2001,
                  y: 4,
                },
                {
                  x: 2002,
                  y: 10,
                },
                {
                  x: 2003,
                  y: 2,
                },
                {
                  x: 2004,
                  y: 2,
                },
              ],
            },
            {
              id: "Serie 8",
              data: [
                {
                  x: 2000,
                  y: 10,
                },
                {
                  x: 2001,
                  y: 9,
                },
                {
                  x: 2002,
                  y: 12,
                },
                {
                  x: 2003,
                  y: 11,
                },
                {
                  x: 2004,
                  y: 8,
                },
              ],
            },
            {
              id: "Serie 9",
              data: [
                {
                  x: 2000,
                  y: 2,
                },
                {
                  x: 2001,
                  y: 8,
                },
                {
                  x: 2002,
                  y: 6,
                },
                {
                  x: 2003,
                  y: 10,
                },
                {
                  x: 2004,
                  y: 11,
                },
              ],
            },
            {
              id: "Serie 10",
              data: [
                {
                  x: 2000,
                  y: 8,
                },
                {
                  x: 2001,
                  y: 1,
                },
                {
                  x: 2002,
                  y: 8,
                },
                {
                  x: 2003,
                  y: 7,
                },
                {
                  x: 2004,
                  y: 12,
                },
              ],
            },
            {
              id: "Serie 11",
              data: [
                {
                  x: 2000,
                  y: 7,
                },
                {
                  x: 2001,
                  y: 5,
                },
                {
                  x: 2002,
                  y: 4,
                },
                {
                  x: 2003,
                  y: 4,
                },
                {
                  x: 2004,
                  y: 4,
                },
              ],
            },
            {
              id: "Serie 12",
              data: [
                {
                  x: 2000,
                  y: 6,
                },
                {
                  x: 2001,
                  y: 2,
                },
                {
                  x: 2002,
                  y: 1,
                },
                {
                  x: 2003,
                  y: 8,
                },
                {
                  x: 2004,
                  y: 7,
                },
              ],
            },
          ]}
        />
      </div>
    </main>
  );
}
