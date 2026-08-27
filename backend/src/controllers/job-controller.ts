import { FastifyReply, FastifyRequest } from "fastify";
import { AlertaValidadeService } from "@/services/alerta-validade-service.js";

export class JobController {
  constructor(private alertaService = new AlertaValidadeService()) {}

  triggerAlertaValidade = async (request: FastifyRequest, reply: FastifyReply) => {
    const resultado = await this.alertaService.executarVarreduraEAlerta();

    return reply.status(200).send({
      message: "Varredura de validade e envio de alertas executados com sucesso.",
      resultado,
    });
  };
}
