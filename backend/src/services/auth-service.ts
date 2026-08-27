import bcryptjs from "bcryptjs";
import { UserRepository } from "@/repositories/user-repository.js";
import { ConflictError, NotFoundError, UnauthorizedError } from "@/errors/app-error.js";
import { Role } from "@prisma/client";

interface RegisterDTO {
  nome: string;
  email: string;
  senha: string;
  role?: Role;
  lojaId?: string;
}

interface LoginDTO {
  email: string;
  senha: string;
}

export class AuthService {
  constructor(private userRepository = new UserRepository()) {}

  async register(data: RegisterDTO) {
    const existingUser = await this.userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new ConflictError("Já existe um usuário cadastrado com este e-mail.");
    }

    const senhaHash = await bcryptjs.hash(data.senha, 8);

    const user = await this.userRepository.create({
      nome: data.nome,
      email: data.email,
      senhaHash,
      role: data.role || "OPERATOR",
      lojaId: data.lojaId,
    });

    const { senhaHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(data: LoginDTO) {
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new UnauthorizedError("E-mail ou senha incorretos.");
    }

    const isPasswordValid = await bcryptjs.compare(data.senha, user.senhaHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError("E-mail ou senha incorretos.");
    }

    const { senhaHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("Usuário não encontrado.");
    }

    const { senhaHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
