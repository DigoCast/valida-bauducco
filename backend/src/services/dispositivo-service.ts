import { Expo } from "expo-server-sdk";
import { DispositivoRepository } from "@/repositories/dispositivo-repository.js";
import { BadRequestError, NotFoundError } from "@/errors/app-error.js";

export class DispositivoService {
  constructor(private dispositivoRepository = new DispositivoRepository()) {}

  async registerToken(token: string) {
    if (!Expo.isExpoPushToken(token)) {
      throw new BadRequestError(`O token informado '${token}' não é um Expo Push Token válido.`);
    }

    const dispositivo = await this.dispositivoRepository.upsert(token);

    return {
      message: "Dispositivo registrado para receber notificações push.",
      dispositivo,
    };
  }

  async removeToken(token: string) {
    try {
      await this.dispositivoRepository.delete(token);
      return {
        message: "Token de dispositivo removido com sucesso.",
      };
    } catch {
      throw new NotFoundError("Token de dispositivo não encontrado.");
    }
  }

  async listTokens() {
    return this.dispositivoRepository.findAll();
  }
}
