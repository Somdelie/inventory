import crypto from "crypto";

export const generateApiKey = (): string => {
  const rand = crypto.randomBytes(22).toString("hex");
  return `sk_live_${rand}`;
};
