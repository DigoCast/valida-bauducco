import { prisma } from "@/lib/prisma.js";
import { Prisma, Role, Usuario } from "@prisma/client";

export class UserRepository {
  async findByEmail(email: string): Promise<Usuario | null> {
    return prisma.usuario.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<Usuario | null> {
    return prisma.usuario.findUnique({
      where: { id },
      include: {
        loja: true,
      },
    });
  }

  async create(data: {
    nome: string;
    email: string;
    senhaHash: string;
    role?: Role;
    lojaId?: string | null;
  }): Promise<Usuario> {
    return prisma.usuario.create({
      data: {
        nome: data.nome,
        email: data.email,
        senhaHash: data.senhaHash,
        role: data.role || "OPERATOR",
        lojaId: data.lojaId,
      },
    });
  }
}
