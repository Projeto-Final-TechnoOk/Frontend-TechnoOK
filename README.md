# TechnoOK — Frontend

Frontend da aplicação **TechnoOK / Fink**, responsável pela interface utilizada pelos usuários para acompanhar e administrar os dados de telemetria.

O projeto foi desenvolvido em **Angular** e funciona como uma aplicação SPA.

## O que este projeto faz

O frontend concentra:

- login;
- criação do primeiro administrador no primeiro acesso;
- login automático após a criação do primeiro administrador;
- armazenamento da sessão e do JWT;
- envio automático do token nas requisições;
- logout e tratamento de sessão expirada;
- Dashboard;
- visualização de imóveis;
- visualização de medidores;
- visualização e criação de leituras;
- criação de usuários por administradores;
- paginação e filtros;
- gráficos de consumo;
- comparação de medidores;
- componentes visuais reutilizáveis;
- navegação entre páginas.

Em produção, o Angular **não mantém um servidor de desenvolvimento rodando**. O projeto é compilado em arquivos estáticos e esses arquivos são servidos pelo Nginx.

## Tecnologias principais

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
- Nginx, na camada de infraestrutura

## Estrutura principal de pastas

Pastas geradas, como `node_modules` e `dist`, não são exibidas.

```text
frontend/
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
│   │   │   ├── popup-delecao/
│   │   │   ├── popup-detalhes/
│   │   │   ├── select/
│   │   │   └── tabela/
│   │   ├── guards/
│   │   │   └── auth.guard.ts
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts
│   │   ├── layouts/
│   │   │   ├── app-layout/
│   │   │   ├── auth-layout/
│   │   │   └── navbar/
│   │   ├── models/
│   │   │   ├── auth/
│   │   │   ├── imoveis/
│   │   │   ├── leituras/
│   │   │   ├── medidores/
│   │   │   └── usuarios/
│   │   ├── pages/
│   │   │   ├── dashboard/
│   │   │   ├── login/
│   │   │   ├── imovel/
│   │   │   ├── imoveis/
│   │   │   ├── medidor/
│   │   │   ├── medidores/
│   │   │   └── leituras/
│   │   ├── services/
│   │   │   ├── auth
│   │   │   ├── dashboard
│   │   │   ├── imoveis
│   │   │   ├── leituras
│   │   │   ├── medidores
│   │   │   └── usuarios
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── enviroments/
│   │   └── enviroment.ts
│   ├── styles.css
│   └── index.html
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── angular.json
├── package.json
└── package-lock.json
```

## Como funciona em produção

O fluxo do frontend é:

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

O Angular é executado no navegador a partir do JavaScript gerado pelo build.

Não existe um container Angular permanente em produção.

## Comunicação com a API

O frontend utiliza:

```ts
apiUrl: '/api'
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

Assim, o navegador não precisa conhecer diretamente a porta `3000`.

## Autenticação

### Login

O frontend envia e-mail e senha para o backend. Quando a autenticação é válida, recebe o JWT e os dados do usuário e salva a sessão no `localStorage`.

### Interceptor

O interceptor adiciona automaticamente:

```http
Authorization: Bearer <token>
```

nas chamadas destinadas à API.

Também trata respostas `401`, limpando a sessão e redirecionando o usuário para `/login`.

### Guard

O `authGuard` controla a navegação nas rotas protegidas.

Exemplos:

```text
/dashboard
/imoveis
/medidores
/leituras
```

> O guard melhora a navegação e a experiência do usuário. A segurança efetiva da API continua sendo garantida pelo backend.

## Primeiro acesso

Ao abrir a página de login, o frontend consulta:

```http
GET /usuarios/primeiro-admin/disponivel
```

Se não existir nenhum usuário, a tela apresenta a opção de criar o primeiro administrador.

A criação utiliza:

```http
POST /usuarios/primeiro-admin
```

Depois de criar o administrador, o frontend realiza automaticamente o login com as mesmas credenciais, salva o JWT e redireciona para:

```text
/dashboard
```

Quando já existe usuário, a opção de primeiro acesso deixa de ser exibida.

## Roteamento

Ao acessar:

```text
/
```

o frontend direciona com base na existência da sessão:

```text
token existe?
├── sim → /dashboard
└── não → /login
```

O Nginx possui fallback para `index.html`, permitindo atualizar diretamente rotas Angular, como:

```text
/medidores/<id>
/imoveis/<id>
```

## Docker em produção

O Compose do frontend possui um job temporário:

```text
frontend-build
```

Esse job:

1. cria um container temporário;
2. executa `npm run build`;
3. gera `dist/frontend/browser`;
4. limpa o conteúdo anterior do volume;
5. copia o novo build para `technook-frontend-dist-prod`;
6. encerra;
7. é removido automaticamente com `--rm`.

## Primeira execução

### 1. Prepare os recursos compartilhados

No projeto `infra`:

```bash
sudo ./docker-setup/setup.sh
```

Esse script cria o volume externo:

```text
technook-frontend-dist-prod
```

### 2. Gere o frontend

Na pasta `frontend`:

```bash
sudo docker compose run --rm --build frontend-build
```

Esse único comando reconstrói a imagem, cria o container temporário, executa o build, copia o resultado para o volume e remove o container ao terminar.

O container finalizar após o build é o comportamento esperado.

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

Depois de alterar o frontend:

```bash
sudo docker compose run --rm --build frontend-build
```

Não é necessário reiniciar o Nginx, pois ele já monta o mesmo volume compartilhado.

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

```bash
# Reconstruir, executar e remover o container temporário
sudo docker compose run --rm --build frontend-build

# Executar uma imagem já construída
sudo docker compose run --rm frontend-build
```
