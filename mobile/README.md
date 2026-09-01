# 📱 ValidaBauducco — Aplicativo Mobile (React Native + Expo)

> Aplicativo móvel construído com **React Native**, **Expo SDK 54** e **Expo Router**, proporcionando uma experiência ágil para operadores e gerentes de lojas da **Casa Bauducco** realizarem leituras de código de barras, cadastro de novos produtos, monitoramento visual de semáforo de validade e baixa de lotes.

---

## 🎨 Identidade Visual (Tema Casa Bauducco)

* **Dourado Nobre:** `#D48B06` (Botões de ação primária e destaques)
* **Marrom Café / Chocolate:** `#3D1E10` (Cabeçalho e superfícies nobres)
* **Off-white Suave:** `#F9F8F5` (Fundo geral da aplicação)
* **Cards:** Branco puro `#FFFFFF` com sombras suaves e bordas delimitadas
* **Semáforo dos 5 Marcos:**
  * 🔴 **Crítico (≤ 3d):** `#E53935` / Fundo `#FFEBEE`
  * 🟠 **Alerta 10 dias:** `#FB8C00` / Fundo `#FFF3E0`
  * 🟡 **Alerta 20 dias:** `#FBC02D` / Fundo `#FFFDE7`
  * 🔵 **Alerta 1 mês:** `#1E88E5` / Fundo `#E3F2FD`
  * 🟣 **Alerta 2 meses:** `#8E24AA` / Fundo `#F3E5F5`
  * 🟢 **Seguro (+2 meses):** `#43A047` / Fundo `#E8F5E9`

---

## 🚀 Funcionalidades e Telas do App

### 1. Autenticação & Sessão (`(auth)`)
* **Login ([app/(auth)/login.tsx](file:///C:/Users/diego/FATEC/valida-bauducco/mobile/app/(auth)/login.tsx)):** Acesso com e-mail corporativo e senha.
* **Cadastro ([app/(auth)/register.tsx](file:///C:/Users/diego/FATEC/valida-bauducco/mobile/app/(auth)/register.tsx)):** Criação de conta com perfil de Operador ou Gerente.
* **Persistência Segura:** Tokens e perfil armazenados via `expo-secure-store`.

### 2. Painel de Validades / Dashboard (`(tabs)/index.tsx`)
* **Carrossel dos 5 Marcos:** Contagem em tempo real de lotes em cada faixa de criticidade.
* **Filtros Interativos:** Tocar em qualquer cartão de métrica filtra a lista de lotes imediatamente.
* **Ações Rápidas no Card:**
  * **Baixa:** Abre modal para marcar como *Vendido* ou *Descartado*.
  * **Excluir (🗑️):** Confirmação nativa para exclusão definitiva do lote.
* **Pull-to-Refresh:** Puxe para baixo para atualizar dados a qualquer momento.

### 3. Scanner de Código de Barras Central (`(tabs)/scanner.tsx`)
* **Câmera em Tempo Real:** Leitura com `expo-camera` e suporte a lanterna (*torch*).
* **Feedback Tátil:** Vibração instantânea (*haptics*) ao reconhecer o código EAN.
* **Fluxo Inteligente:**
  * Se o produto **já existe**: Abre a tela de detalhes com seus lotes ativos.
  * Se o produto **não existe (404)**: Abre automaticamente o formulário de cadastro com o código de barras já preenchido.
* **Entrada Manual:** Modal com teclado numérico para digitação caso o código físico esteja danificado.

### 4. Estoque & Produtos (`(tabs)/produtos.tsx`)
* Catálogo completo com busca em tempo real por **Nome**, **Código EAN** ou **Categoria**.
* Resumo de quantidade de itens em estoque e contagem de lotes.

### 5. Detalhes do Produto & Novo Lote (`produto/[id].tsx` e `produto/novo.tsx`)
* Visualização detalhada do histórico de lotes.
* Modal para adição ágil de novos lotes com validação de data (`AAAA-MM-DD` ou `DD/MM/AAAA`).
* Atualizações otimistas na interface para resposta imediata.

### 6. Perfil do Operador (`(tabs)/perfil.tsx`)
* Dados da loja e do usuário autenticado.
* Botão de teste manual de disparo de notificação push.
* Encerramento seguro de sessão (*Logout*).

---

## 📱 Área Segura & Compatibilidade

O aplicativo utiliza `react-native-safe-area-context` para garantir que o cabeçalho e todos os botões respeitem o relógio, bateria, câmera frontal (*notch* / *punch hole*) em qualquer modelo de smartphone (Android ou iPhone).

---

## 🏃 Como Rodar o Aplicativo Mobile

1. Instale as dependências:
   ```bash
   cd mobile
   npm install
   ```

2. Inicie o bundler do Expo com túnel:
   ```bash
   npx expo start -c --tunnel
   ```

3. **No seu Celular Físico:**
   * Baixe o **Expo Go** na Play Store ou App Store.
   * Escaneie o QR Code exibido no terminal.

4. **No Emulador Android Studio:**
   * Pressione a tecla **`a`** no terminal.

---

## 📦 Como Gerar o APK Autônomo (EAS Build)

Para gerar o arquivo instalável `.apk` diretamente na nuvem do Expo:

1. **Instale e autentique no EAS CLI:**
   ```bash
   npx eas-cli login
   ```

2. **Configure a URL de Produção da API (opcional):**
   Crie o arquivo `mobile/.env` com a URL do seu backend hospedado:
   ```env
   EXPO_PUBLIC_API_URL=https://sua-api.onrender.com
   ```

3. **Dispare a compilação do APK na nuvem:**
   ```bash
   npx eas-cli build -p android --profile preview
   ```
   * O Expo compilará o aplicativo e fornecerá um **QR Code e Link Direto** para baixar e instalar o APK em qualquer celular Android.

