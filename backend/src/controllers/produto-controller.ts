import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { ProdutoService } from "@/services/produto-service.js";

const upsertProdutoBodySchema = z.object({
  codigoBarras: z.string().min(1, "O código de barras é obrigatório"),
  nome: z.string().min(1, "O nome do produto é obrigatório"),
  categoria: z.string().nullable().optional(),
  lojaId: z
    .string()
    .uuid("lojaId deve ser um UUID válido")
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
});

const updateProdutoBodySchema = z.object({
  nome: z.string().min(1).optional(),
  categoria: z.string().nullable().optional(),
  codigoBarras: z.string().min(1).optional(),
});

const barcodeParamSchema = z.object({
  ean: z.string().min(1, "O código EAN é obrigatório"),
});

const idParamSchema = z.object({
  id: z.string().uuid("ID do produto deve ser um UUID válido"),
});

const listQuerySchema = z.object({
  search: z.string().optional(),
});

export class ProdutoController {
  constructor(private produtoService = new ProdutoService()) {}

  upsert = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = upsertProdutoBodySchema.parse(request.body);
    const produto = await this.produtoService.upsert(data);

    return reply.status(200).send({
      message: "Produto salvo com sucesso",
      produto,
    });
  };

  getByBarcode = async (request: FastifyRequest, reply: FastifyReply) => {
    const { ean } = barcodeParamSchema.parse(request.params);
    const produto = await this.produtoService.getByBarcode(ean);

    return reply.status(200).send({ produto });
  };

  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(request.params);
    const produto = await this.produtoService.getById(id);

    return reply.status(200).send({ produto });
  };

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const { search } = listQuerySchema.parse(request.query);
    const produtos = await this.produtoService.list(search);

    return reply.status(200).send({ produtos });
  };

  update = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(request.params);
    const data = updateProdutoBodySchema.parse(request.body);
    const produto = await this.produtoService.update(id, data);

    return reply.status(200).send({
      message: "Produto atualizado com sucesso",
      produto,
    });
  };

  delete = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(request.params);
    await this.produtoService.delete(id);

    return reply.status(200).send({
      message: "Produto excluído com sucesso",
    });
  };
}
