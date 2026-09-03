import { describe, expect, it, vi, beforeEach } from "vitest";
import { AuthService } from "@/services/auth-service.js";
import { UserRepository } from "@/repositories/user-repository.js";
import { ConflictError, NotFoundError, UnauthorizedError } from "@/errors/app-error.js";
import bcryptjs from "bcryptjs";

describe("AuthService (Serviço de Autenticação)", () => {
  let userRepository: UserRepository;
  let authService: AuthService;

  beforeEach(() => {
    userRepository = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
    } as unknown as UserRepository;

    authService = new AuthService(userRepository);
  });

  it("deve cadastrar um novo usuário com senha hasheada", async () => {
    vi.spyOn(userRepository, "findByEmail").mockResolvedValue(null);
    vi.spyOn(userRepository, "create").mockImplementation(async (data) => ({
      id: "user-uuid-1",
      nome: data.nome,
      email: data.email,
      senhaHash: data.senhaHash,
      role: data.role || "OPERATOR",
      lojaId: data.lojaId || null,
      criadoEm: new Date(),
    }));

    const result = await authService.register({
      nome: "Gerente Loja",
      email: "loja@validacb.com.br",
      senha: "password123",
    });

    expect(result.id).toBe("user-uuid-1");
    expect(result.nome).toBe("Gerente Loja");
    expect(result.email).toBe("loja@validacb.com.br");
    expect((result as any).senhaHash).toBeUndefined();
  });

  it("não deve permitir cadastrar dois usuários com o mesmo e-mail", async () => {
    vi.spyOn(userRepository, "findByEmail").mockResolvedValue({
      id: "user-uuid-1",
      nome: "Gerente Loja",
      email: "loja@validacb.com.br",
      senhaHash: "hash",
      role: "OPERATOR",
      lojaId: null,
      criadoEm: new Date(),
    });

    await expect(
      authService.register({
        nome: "Outro Gerente",
        email: "loja@validacb.com.br",
        senha: "password123",
      })
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("deve realizar login com sucesso se e-mail e senha estiverem corretos", async () => {
    const password = "correct-password";
    const senhaHash = await bcryptjs.hash(password, 8);

    vi.spyOn(userRepository, "findByEmail").mockResolvedValue({
      id: "user-uuid-1",
      nome: "Gerente Loja",
      email: "loja@validacb.com.br",
      senhaHash,
      role: "OPERATOR",
      lojaId: null,
      criadoEm: new Date(),
    });

    const user = await authService.login({
      email: "loja@validacb.com.br",
      senha: password,
    });

    expect(user.id).toBe("user-uuid-1");
    expect(user.email).toBe("loja@validacb.com.br");
  });

  it("deve lançar erro Unauthorized se a senha estiver incorreta", async () => {
    const senhaHash = await bcryptjs.hash("correct-password", 8);

    vi.spyOn(userRepository, "findByEmail").mockResolvedValue({
      id: "user-uuid-1",
      nome: "Gerente Loja",
      email: "loja@validacb.com.br",
      senhaHash,
      role: "OPERATOR",
      lojaId: null,
      criadoEm: new Date(),
    });

    await expect(
      authService.login({
        email: "loja@validacb.com.br",
        senha: "wrong-password",
      })
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("deve lançar erro Unauthorized se o e-mail não existir", async () => {
    vi.spyOn(userRepository, "findByEmail").mockResolvedValue(null);

    await expect(
      authService.login({
        email: "inexistente@validacb.com.br",
        senha: "password",
      })
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
