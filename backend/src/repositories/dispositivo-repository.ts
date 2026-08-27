import { prisma } from "@/lib/prisma.js";
import { DispositivoToken } from "@prisma/client";

export class DispositivoRepository {
  async upsert(token: string): Promise<DispositivoToken> {
    return prisma.dispositivoToken.upsert({
      where: { token },
      update: {},
      create: { token },
    });
  }

  async findAll(): Promise<DispositivoToken[]> {
    return prisma.dispositivoToken.findMany();
  }

  async delete(token: string): Promise<DispositivoToken> {
    return prisma.dispositivoToken.delete({
      where: { token },
    });
  }
}
