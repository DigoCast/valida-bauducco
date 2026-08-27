import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { app } from "@/app.js";
import { prisma } from "@/lib/prisma.js";
import { dayjs } from "@/lib/dayjs.js";

describe("E2E - Fluxo Completo da API ValidaBauducco (5 Marcos de Validade)", () => {
  let authToken = "";
  let produtoId = "";
  let lote3DiasId = "";

  beforeAll(async () => {
    await app.ready();
    // Limpa dados de teste prévios se existirem
    await prisma.lote.deleteMany();
    await prisma.produto.deleteMany();
    await prisma.usuario.deleteMany({ where: { email: "teste.e2e@bauducco.com.br" } });
  });

  afterAll(async () => {
    await app.close();
  });

  it("1. Deve registrar um novo usuário com sucesso", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: {
        nome: "Gerente Teste E2E",
        email: "teste.e2e@bauducco.com.br",
        senha: "senhaSegura123",
        role: "ADMIN",
      },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.user.email).toBe("teste.e2e@bauducco.com.br");
    expect(body.token).toBeDefined();
    authToken = body.token;
  });

  it("2. Deve realizar login com o usuário criado", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: {
        email: "teste.e2e@bauducco.com.br",
        senha: "senhaSegura123",
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.token).toBeDefined();
    authToken = body.token;
  });

  it("3. Deve obter os dados do usuário autenticado (/api/auth/me)", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/auth/me",
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.user.nome).toBe("Gerente Teste E2E");
  });

  it("4. Deve cadastrar um produto por código de barras (EAN)", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/produtos",
      headers: {
        authorization: `Bearer ${authToken}`,
      },
      payload: {
        codigoBarras: "7891000100101",
        nome: "Panettone Bauducco Frutas 500g",
        categoria: "Panettones",
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.produto.id).toBeDefined();
    expect(body.produto.codigoBarras).toBe("7891000100101");
    produtoId = body.produto.id;
  });

  it("5. Deve cadastrar 5 lotes correspondentes aos 5 marcos de validade", async () => {
    // Marco 1: 3 Dias (vence em 2 dias)
    const data3Dias = dayjs().add(2, "day").format("YYYY-MM-DD");
    const resp1 = await app.inject({
      method: "POST",
      url: "/api/lotes",
      headers: { authorization: `Bearer ${authToken}` },
      payload: {
        produtoId,
        numeroLote: "LOTE-3DIAS-01",
        dataValidade: data3Dias,
        quantidade: 10,
      },
    });
    expect(resp1.statusCode).toBe(201);
    expect(resp1.json().lote.marco).toBe("3_DIAS");
    expect(resp1.json().lote.urgencia).toBe("CRITICO");
    lote3DiasId = resp1.json().lote.id;

    // Marco 2: 10 Dias (vence em 8 dias)
    const data10Dias = dayjs().add(8, "day").format("YYYY-MM-DD");
    const resp2 = await app.inject({
      method: "POST",
      url: "/api/lotes",
      headers: { authorization: `Bearer ${authToken}` },
      payload: {
        produtoId,
        numeroLote: "LOTE-10DIAS-02",
        dataValidade: data10Dias,
        quantidade: 15,
      },
    });
    expect(resp2.statusCode).toBe(201);
    expect(resp2.json().lote.marco).toBe("10_DIAS");
    expect(resp2.json().lote.urgencia).toBe("ALERTA_10D");

    // Marco 3: 20 Dias (vence em 18 dias)
    const data20Dias = dayjs().add(18, "day").format("YYYY-MM-DD");
    const resp3 = await app.inject({
      method: "POST",
      url: "/api/lotes",
      headers: { authorization: `Bearer ${authToken}` },
      payload: {
        produtoId,
        numeroLote: "LOTE-20DIAS-03",
        dataValidade: data20Dias,
        quantidade: 20,
      },
    });
    expect(resp3.statusCode).toBe(201);
    expect(resp3.json().lote.marco).toBe("20_DIAS");
    expect(resp3.json().lote.urgencia).toBe("ALERTA_20D");

    // Marco 4: 1 Mês (vence em 28 dias)
    const data1Mes = dayjs().add(28, "day").format("YYYY-MM-DD");
    const resp4 = await app.inject({
      method: "POST",
      url: "/api/lotes",
      headers: { authorization: `Bearer ${authToken}` },
      payload: {
        produtoId,
        numeroLote: "LOTE-1MES-04",
        dataValidade: data1Mes,
        quantidade: 25,
      },
    });
    expect(resp4.statusCode).toBe(201);
    expect(resp4.json().lote.marco).toBe("1_MES");
    expect(resp4.json().lote.urgencia).toBe("ALERTA_1M");

    // Marco 5: 2 Meses (vence em 55 dias)
    const data2Meses = dayjs().add(55, "day").format("YYYY-MM-DD");
    const resp5 = await app.inject({
      method: "POST",
      url: "/api/lotes",
      headers: { authorization: `Bearer ${authToken}` },
      payload: {
        produtoId,
        numeroLote: "LOTE-2MESES-05",
        dataValidade: data2Meses,
        quantidade: 30,
      },
    });
    expect(resp5.statusCode).toBe(201);
    expect(resp5.json().lote.marco).toBe("2_MESES");
    expect(resp5.json().lote.urgencia).toBe("ALERTA_2M");
  });

  it("6. Deve retornar o dashboard consolidado com os 5 marcos de validade", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/lotes/dashboard",
      headers: { authorization: `Bearer ${authToken}` },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.metricas.totalCriticos3Dias).toBe(1);
    expect(body.metricas.totalAlerta10Dias).toBe(1);
    expect(body.metricas.totalAlerta20Dias).toBe(1);
    expect(body.metricas.totalAlerta1Mes).toBe(1);
    expect(body.metricas.totalAlerta2Meses).toBe(1);
    expect(body.metricas.totalLotesAtivos).toBe(5);
    expect(body.metricas.totalQuantidadeItens).toBe(100);
    expect(body.lotes).toHaveLength(5);
  });

  it("7. Deve dar baixa no lote crítico (3 dias) marcando como vendido", async () => {
    const response = await app.inject({
      method: "PATCH",
      url: `/api/lotes/${lote3DiasId}/baixa`,
      headers: { authorization: `Bearer ${authToken}` },
      payload: {
        status: "vendido",
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.lote.status).toBe("vendido");

    // Verifica que o dashboard agora tem 0 críticos de 3 dias e 4 lotes ativos
    const dashResp = await app.inject({
      method: "GET",
      url: "/api/lotes/dashboard",
      headers: { authorization: `Bearer ${authToken}` },
    });

    expect(dashResp.json().metricas.totalCriticos3Dias).toBe(0);
    expect(dashResp.json().metricas.totalLotesAtivos).toBe(4);
  });

  it("8. Deve registrar um token de dispositivo para push notification", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/dispositivos/token",
      headers: { authorization: `Bearer ${authToken}` },
      payload: {
        token: "ExponentPushToken[SampleTestToken1234567890]",
      },
    });

    expect(response.statusCode).toBe(200);
  });

  it("9. Deve executar o trigger manual do job de alerta com resumo por marcos", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/jobs/trigger-alerta-validade",
      headers: { authorization: `Bearer ${authToken}` },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.resultado.executadoEm).toBeDefined();
    expect(body.resultado.resumoMarcos).toBeDefined();
  });
});
