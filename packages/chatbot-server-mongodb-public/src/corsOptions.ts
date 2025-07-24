import { CorsOptions } from "cors";

export const makeCorsOptions = (
  isProduction: boolean,
  allowedOrigins: string[]
) =>
  ({
    origin: !isProduction
      ? (origin, callback) => {
          // Allow all localhost origins in non-production
          if (
            !origin ||
            origin.includes("localhost") ||
            origin.includes("127.0.0.1")
          ) {
            callback(null, true);
          } else if (allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        }
      : allowedOrigins,
    // Allow cookies from different origins to be sent to the server.
    credentials: true,
  } satisfies CorsOptions);
