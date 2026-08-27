import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { AuthService } from "@/services/auth-service.js";

const registerBodySchema = z.object({
  nome: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("Formato de e-mail inválido"),
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  role: z.enum(["OPERATOR", "ADMIN"]).optional(),
  lojaId: z
    .string()
    .uuid("lojaId deve ser um UUID válido")
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
});

const loginBodySchema = z.object({
  email: z.string().email("Formato de e-mail inválido"),
  senha: z.string().min(1, "A senha é obrigatória"),
});

export class AuthController {
  constructor(private authService = new AuthService()) {}

  register = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = registerBodySchema.parse(request.body);
    const user = await this.authService.register(data);

    const token = await reply.jwtSign(
      {
        role: user.role,
        lojaId: user.lojaId,
      },
      {
        sign: {
          sub: user.id,
          expiresIn: "7d",
        },
      }
    );

    return reply.status(201).send({
      message: "Usuário registrado com sucesso",
      user,
      token,
    });
  };

  login = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = loginBodySchema.parse(request.body);
    const user = await this.authService.login(data);

    const token = await reply.jwtSign(
      {
        role: user.role,
        lojaId: user.lojaId,
      },
      {
        sign: {
          sub: user.id,
          expiresIn: "7d",
        },
      }
    );

    return reply.status(200).send({
      message: "Login realizado com sucesso",
      user,
      token,
    });
  };

  me = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user.sub;
    const user = await this.authService.getProfile(userId);

    return reply.status(200).send({
      user,
    });
  };
}
