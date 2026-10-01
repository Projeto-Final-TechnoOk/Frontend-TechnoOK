# Frontend

###### Design e identidade visual baseados no projeto Fink - https://github.com/fink-finance/fink-frontend

Frontend da aplicação, responsável pela interface utilizada pelos usuários para acompanhar e administrar os dados de telemetria.

O projeto foi desenvolvido em **Angular** e funciona como uma aplicação SPA (Single Page Application).

## Responsabilidades

O frontend concentra:

- autenticação e sessão do usuário;
- criação do primeiro administrador no primeiro acesso;
- Dashboard;
- visualização e navegação entre imóveis, medidores e leituras;
- criação de imóveis, medidores e leituras;
- criação de usuários por administradores;
- filtros, paginação e gráficos;
- componentes visuais reutilizáveis.

Em produção, o Angular **não mantém um servidor de desenvolvimento rodando**. O projeto é compilado em arquivos estáticos e servido pelo Nginx.

## Tecnologias

- Angular 22
- TypeScript
- Angular Signals
- Angular Router
- HttpClient
- Functional Guards
- HTTP Interceptors
- ApexCharts
- Docker
- Docker Compose

## Estrutura

Pastas geradas, como `node_modules` e `dist`, não são exibidas.

```text
frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── botao/
│   │   │   ├── card/
│   │   │   ├── formulario/
│   │   │   ├── grafico-barras/
│   │   │   ├── grafico-linha/
│   │   │   ├── input-texto/
│   │   │   ├── multi-botoes/
│   │   │   ├── navbar/
│   │   │   ├── popup-delecao/
│   │   │   ├── popup-detalhes/
│   │   │   ├── select/
│   │   │   ├── seta/
│   │   │   ├── tabela/
│   │   │   └── tag/
│   │   ├── enums/
│   │   │   ├── medidores/
│   │   │   └── usuarios/
│   │   ├── guards/
│   │   │   └── auth.guard.ts
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts
│   │   ├── layouts/
│   │   │   ├── app-layout/
│   │   │   └── auth-layout/
│   │   ├── models/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── imoveis/
│   │   │   ├── leituras/
│   │   │   ├── medidores/
│   │   │   └── usuarios/
│   │   ├── pages/
│   │   │   ├── dashboard/
│   │   │   ├── imoveis/
│   │   │   ├── imovel/
│   │   │   ├── leituras/
│   │   │   ├── login/
│   │   │   ├── medidor/
│   │   │   └── medidores/
│   │   ├── services/
│   │   │   ├── auth.ts
│   │   │   ├── dashboard.ts
│   │   │   ├── imoveis.ts
│   │   │   ├── leituras.ts
│   │   │   ├── medidores.ts
│   │   │   └── usuarios.ts
│   │   ├── app.config.ts
│   │   ├── app.html
│   │   ├── app.routes.ts
│   │   └── app.ts
│   ├── enviroments/
│   │   └── enviroment.ts
│   ├── main.ts
│   ├── styles.css
│   └── index.html
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── angular.json
├── package.json
└── package-lock.json
```

## Funcionamento em produção

O frontend é compilado e enviado para um volume Docker compartilhado:

```text
Código Angular
     ↓
npm run build
     ↓
dist/frontend/browser
     ↓
technook-frontend-dist-prod
     ↓
Nginx
     ↓
Browser
```

Não existe um container Angular permanente em produção.

## Comunicação com a API

O frontend utiliza:

```ts
apiUrl: '/api';
```

Exemplo:

```text
POST /api/auth/login
```

O Nginx recebe a chamada e encaminha ao backend:

```text
Browser
   ↓
/api/auth/login
   ↓
Nginx
   ↓
backend:3000/auth/login
   ↓
NestJS
```

Assim, o navegador não acessa diretamente a porta `3000`.

## Autenticação

### Login

O frontend envia e-mail e senha para o backend. Quando o login é válido, recebe o JWT e os dados do usuário e salva a sessão no `localStorage`.

### Interceptor

O interceptor adiciona automaticamente o token nas chamadas da API:

```http
Authorization: Bearer <token>
```

Também trata respostas `401`, limpando a sessão e redirecionando para `/login`.

### Guard

O `authGuard` controla a navegação nas rotas protegidas, como:

```text
/dashboard
/imoveis
/medidores
/leituras
```

> O guard controla a navegação no frontend. A validação de segurança continua sendo responsabilidade do backend.

## Primeiro acesso

Ao abrir a página de login, o frontend consulta:

```http
GET /usuarios/primeiro-admin/disponivel
```

Se ainda não existir usuário, a tela permite criar o primeiro administrador:

```http
POST /usuarios/primeiro-admin
```

Depois da criação, o frontend realiza automaticamente o login, salva a sessão e redireciona para:

```text
/dashboard
```

Quando já existe usuário cadastrado, essa opção deixa de ser exibida.

## Roteamento

Ao acessar a raiz:

```text
/
```

o frontend decide o destino com base na sessão:

```text
token existe?
├── sim → /dashboard
└── não → /login
```

O Nginx utiliza fallback para `index.html`, permitindo atualizar diretamente rotas Angular sem quebrar a SPA.

## Docker em produção

O Compose do frontend possui o job temporário:

```text
frontend-build
```

Ele:

1. executa o build Angular;
2. gera `dist/frontend/browser`;
3. limpa o conteúdo anterior do volume;
4. copia o novo build para `technook-frontend-dist-prod`;
5. encerra.

Quando executado com `--rm`, o container temporário é removido automaticamente.

## Primeira execução

### 1. Prepare os recursos compartilhados

No projeto `infra`:

```bash
sudo ./docker-setup/setup.sh
```

Esse script cria, entre outros recursos:

```text
technook-frontend-dist-prod
```

### 2. Gere o frontend

Na pasta `frontend`:

```bash
sudo docker compose run --rm --build frontend-build
```

Esse comando reconstrói a imagem, executa o build, copia os arquivos para o volume e remove o container temporário ao finalizar.

### 3. Suba o Nginx

Depois que o backend estiver disponível, na pasta `infra`:

```bash
sudo docker compose up -d nginx
```

A aplicação ficará disponível em:

```text
http://localhost
```

## Execuções seguintes

Após alterar o frontend:

```bash
sudo docker compose run --rm --build frontend-build
```

Não é necessário reiniciar o Nginx, pois ele já utiliza o mesmo volume compartilhado.

Se o frontend não mudou, não é necessário executar o job novamente.

## Saída do build

```text
dist/frontend/browser
```

Exemplo:

```text
index.html
main-XXXXXXXX.js
styles-XXXXXXXX.css
assets/
```

## Endereços principais

Aplicação:

```text
http://localhost
```

Login:

```text
http://localhost/login
```

Swagger:

```text
http://localhost/docs
```

## Comandos úteis

Reconstruir e publicar o frontend:

```bash
sudo docker compose run --rm --build frontend-build
```

Executar novamente uma imagem já construída:

```bash
sudo docker compose run --rm frontend-build
```
