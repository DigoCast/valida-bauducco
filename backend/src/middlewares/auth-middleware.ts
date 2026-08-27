import { FastifyReply, FastifyRequest } from "fastify";
import { UnauthorizedError } from "@/errors/app-error.js";

export async function verifyJwt(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    throw new UnauthorizedError("Token de autenticação inválido ou expirado");
  }
}
