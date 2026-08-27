import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { DispositivoService } from "@/services/dispositivo-service.js";

const registerTokenBodySchema = z.object({
  token: z.string().min(1, "O push token é obrigatório"),
});

const tokenParamSchema = z.object({
  token: z.string().min(1, "O push token é obrigatório"),
});

export class DispositivoController {
  constructor(private dispositivoService = new DispositivoService()) {}

  register = async (request: FastifyRequest, reply: FastifyReply) => {
    const { token } = registerTokenBodySchema.parse(request.body);
    const resultado = await this.dispositivoService.registerToken(token);

    return reply.status(200).send(resultado);
  };

  remove = async (request: FastifyRequest, reply: FastifyReply) => {
    const { token } = tokenParamSchema.parse(request.params);
    const resultado = await this.dispositivoService.removeToken(token);

    return reply.status(200).send(resultado);
  };

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const tokens = await this.dispositivoService.listTokens();

    return reply.status(200).send({ tokens });
  };
}
