import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3333),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatória"),
  JWT_SECRET: z.string().min(10, "JWT_SECRET deve ter no mínimo 10 caracteres"),
  TZ: z.string().default("America/Sao_Paulo"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Variáveis de ambiente inválidas:", _env.error.format());
  throw new Error("Variáveis de ambiente inválidas.");
}

export const env = _env.data;
