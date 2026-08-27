import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { AppError } from "./app-error.js";
import { Prisma } from "@prisma/client";
import { env } from "@/config/env.js";

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // 1. Erros de validação do Zod
  if (error instanceof ZodError) {
    const formattedErrors = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return reply.status(400).send({
      statusCode: 400,
      error: "Erro de Validação",
      message: "Dados de entrada inválidos",
      issues: formattedErrors,
    });
  }

  // 2. Erros de domínio da aplicação
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.name || "AppError",
      message: error.message,
    });
  }

  // 3. Erros conhecidos do Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = (error.meta?.target as string[])?.join(", ") || "campo";
      return reply.status(409).send({
        statusCode: 409,
        error: "Conflito",
        message: `Já existe um registro com este ${target}.`,
      });
    }

    if (error.code === "P2025") {
      return reply.status(404).send({
        statusCode: 404,
        error: "Não Encontrado",
        message: "Registro solicitado não foi encontrado no banco de dados.",
      });
    }

    if (error.code === "P2003") {
      return reply.status(400).send({
        statusCode: 400,
        error: "Registro Relacionado Inválido",
        message: "O ID de relacionamento informado (ex: lojaId ou produtoId) não existe.",
      });
    }
  }

  // 4. Erros de autenticação do Fastify JWT
  if (error.statusCode === 401 || error.message.includes("jwt")) {
    return reply.status(401).send({
      statusCode: 401,
      error: "Não Autorizado",
      message: error.message || "Token de autenticação inválido ou ausente.",
    });
  }

  // 5. Erro interno não tratado (500)
  if (env.NODE_ENV !== "production") {
    console.error("❌ Erro não tratado:", error);
  }

  return reply.status(500).send({
    statusCode: 500,
    error: "Erro Interno do Servidor",
    message: "Ocorreu um erro inesperado no servidor.",
  });
}
