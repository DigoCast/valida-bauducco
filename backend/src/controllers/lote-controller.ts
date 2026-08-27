import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { LoteService } from "@/services/lote-service.js";

const createLoteBodySchema = z.object({
  produtoId: z.string().uuid("ID do produto deve ser um UUID válido"),
  numeroLote: z.string().nullable().optional(),
  dataValidade: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "A data de validade deve estar no formato YYYY-MM-DD"),
  quantidade: z.number().int().min(1, "A quantidade deve ser de pelo menos 1 item").default(1),
});

const updateLoteBodySchema = z.object({
  numeroLote: z.string().nullable().optional(),
  dataValidade: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "A data de validade deve estar no formato YYYY-MM-DD")
    .optional(),
  quantidade: z.number().int().min(1).optional(),
  status: z.enum(["ativo", "vendido", "descartado"]).optional(),
});

const baixaLoteBodySchema = z.object({
  status: z.enum(["vendido", "descartado"], {
    errorMap: () => ({ message: "O status de baixa deve ser 'vendido' ou 'descartado'" }),
  }),
});

const idParamSchema = z.object({
  id: z.string().uuid("ID do lote deve ser um UUID válido"),
});

export class LoteController {
  constructor(private loteService = new LoteService()) {}

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = createLoteBodySchema.parse(request.body);
    const lote = await this.loteService.create(data);

    return reply.status(201).send({
      message: "Lote cadastrado com sucesso",
      lote,
    });
  };

  dashboard = async (request: FastifyRequest, reply: FastifyReply) => {
    const resultado = await this.loteService.getDashboard();
    return reply.status(200).send(resultado);
  };

  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(request.params);
    const lote = await this.loteService.getById(id);

    return reply.status(200).send({ lote });
  };

  update = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(request.params);
    const data = updateLoteBodySchema.parse(request.body);
    const lote = await this.loteService.update(id, data);

    return reply.status(200).send({
      message: "Lote atualizado com sucesso",
      lote,
    });
  };

  darBaixa = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(request.params);
    const { status } = baixaLoteBodySchema.parse(request.body);
    const resultado = await this.loteService.darBaixa(id, status);

    return reply.status(200).send(resultado);
  };

  delete = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(request.params);
    const resultado = await this.loteService.delete(id);

    return reply.status(200).send(resultado);
  };
}
