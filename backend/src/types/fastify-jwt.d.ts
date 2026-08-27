import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      sub: string;
      email: string;
      role: "OPERATOR" | "ADMIN";
      lojaId?: string | null;
    };
    user: {
      sub: string;
      email: string;
      role: "OPERATOR" | "ADMIN";
      lojaId?: string | null;
    };
  }
}
