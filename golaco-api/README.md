# Desafio Extensão Starter

Projeto da semana de Desafio Extensão Starter com Angular e NodeJs ~ 29/08 à 16/09/2022

## Definições do back-end para o projeto

Criar uma API que possua

- Express
- Typescript
- MongoDB (Atlas) ou MySQL
- ao menos 2 CRUDs
- Segurança
- Swagger  

___

## Golaço API

Neste projeto está a solução aplicada pela dupla [Luis Carlos Zancanela] e [Vinicius Santos Silva] para cumprimento das etapas do projeto acima especificado.

## Configuration

O projeto foi feito utilizando as tecnologias:

- Editor [Visual Studio Code]
- [Node.js] v16.12.0
- [NPM] 8.15.1
- Framework [Nest.js]
- ORM [Prisma]
- [TypeScript]
- [Jest]
- [MySQL]
- [Swagger Editor] _(API First)_
- Dependências adicionais do projeto:
  - `@prisma/client` para export a estrutura do banco de dados para o código e poder utilizá-la;
  - `@nestjs/passport`, `@nestjs/jwt`, `passport`, `passport-jwt` e `passport-local` para configuração de autenticação;
  - `bcrypt` para criptografia de senha do usuário;
  - `class-transformer` e `class-validator` para validação de entrada de dados nos requests DTOs;
  - `@nestjs/swagger` para expor documentação swagger;
  - `js-yaml` para carregar arquivo com extensão `.yaml` no projeto e importar no módulo de swagger;
  - `@compodoc/compodoc` para gerar documentação do sistema;

### Tasks executadas

- Criação do banco de dados `database/golaco_db.sql` utilizando com auxílio do MySQL Workbench do [MySQL Community];
- Criado procedures e triggers diretamente no banco de dados para auditoria e atualização de saldo do valor que a pessoa possui no sistema;
- Utilização do ORM [Prisma] para comunicação com banco de dados;
- Criação do recurso para Pessoas com CRUD, respectivos endpoints e criação automática de usuário para quando uma nova pessoa é adicionada;
- Criação do recurso para Usuários com CRUD e respectivos endpoints;
- Criação do recurso para Transferências com criação de transferências, depósitos e retiradas e respectivos endpoints;
- Criação do recurso para Times com CRUD e respectivos endpoints;
- Criação do recurso para Partidas/Disputas com CRUD, respectivos endpoints e especificidades:
  - Ao atualizar uma partida/disputa que estava com o status 'created' para o 'closed', o sistema irá realizar o cálculo e pagamento das apostas no time vencedor, marcando estas apostas como 'win' e para as apostas no time perdedor o status ficará 'lose';
  - Para as apostas que foram atualizadas com o status de 'win' o sistema já faz o cálculo do valor a ser pago conforme definido no atributo 'odds' e já aciona a transferência de quantia para a pessoa que apostou;
  - Ao tentar atualizar uma partida/disputa que já está com status de 'closed' o sistema irá lançar uma `DataViolationException`;
  - Ao tentar excluir partida que possui aposta realizada, o sistema o sistema irá lançar uma `DataViolationException`;
- Criação do recurso para Apostas com CRUD e respectivos endpoints, exceto atualização, quando uma aposta é realizada, o sistema automaticamente cria a transação de pagamento da aposta;
- Para as listas retornadas nos endpoints foi configurado paginação para filtro e retorno;
- Os controllers foram mapeados com versionamento da URL, no caso a versão 1, ficando com padrão: 'localhost:3000/v1/recurso';
- Para auxiliar em testes da API, foi criado coleção do postman com arquivo localizado em `docs/Golaço API.postman_collection.json`;
- Documentação da API através de swagger criado pelo [Swagger Editor] e adicionado ao projeto, carregando o swagger usando o arquivo .yaml exportado, localizado em `src/resources/openapi.yaml`;
- Validação dos atributos dos requests DTOs para retornar BadRequest em caso de algum atributo não for validado;
- Criação de exceptions personalizadas, no arquivo `src/exceptions.ts`, para personalizar e padronizar as respostas de erro do sistema;
- Em `src/person/dtos.request=person.dto.ts` foi aplicada validação personalizada para CPF ou CNPJ conforme tipo de pessoa, para isso foi criada a classe 'ValidateCpfCnpj' em `src/utils/validateCpfCnpj.ts`;
- CORS já está implementado para permitir que possam ser realizadas operações via browser, integrando com projeto front-end;
- Autenticação gerando token JWT para ser utilizado no acesso aos endpoints do sistema, configurado globalmente;
- Autorização por perfil, USER ou ADMIN, utilizando anotação personalizada `@Roles` e com lançamento de erro `ForbiddenException` (arquivo `src/exceptions.ts`);
- Alguns endpoints estão autorizados para perfil USER, mas somente para o próprio usuário, como o visualizar o cadastro de pessoa;
- Ao gravar recurso no banco de dados, o sistema pega o usuário logado para salvar para auditoria;

## Visuals

Diagrama UML feito com [Draw.io]:  
![Diagrama UML](docs/uml-diagram.drawio.png?raw=true "Diagrama UML")  

Diagrama EER feito com MySQL Workbench do [MySQL Community]:  
![Diagrama EER](docs/EER_golaco_db.png?raw=true "Diagrama EER")  

Banner personalizado, arte feita com ajuda do site [ASCII-Art]:  
![Banner Personalizado](docs/custom-start-banner.png?raw=true "Banner Personalizado")  

## Installation

Baixar o projeto ou clonar o repositório e:

- Aconselhável instalar a CLI do NestJS para evitar problemas com chamadas de comandos:

  ```shell
  npm i -g @nestjs/cli
  ```

- No MySQL Workbench, executar o script do arquivo `database/golaco_db.sql` que irá criar o banco, tabelas, procedures, triggers e popular banco com dados básicos;

- Utilizando o terminal (PowerShell, bash ou similar), basta executar na pasta do projeto os comandos abaixo:

  ```shell
  npm install
  npx prisma generate
  ```

- Utilizar o arquivo `.env.sample` para configurar variáveis de ambiente e depois salvar como `.env`, seguem abaixo as variáveis de ambiente do projeto:
  - PORT: Porta que o sistema utilizará, a porta padrão é 3000;
  - DATABASE_URL: Contém a url de conexão com o banco, já está no padrão do MySQL, para outros bancos verificar com o provedor do banco a url para conexão;
  - JWT_SECRET_KEY: Chave para assinatura do token;
  - JWT_EXPIRATION_TIME: Tempo de expiração do token;
  - JWT_ISSUER: Emissor do token;

## Tests

Os testes foram feitos utilizando o [Jest].
Utilizando o terminal (PowerShell, bash ou similar), executar na pasta do projeto o comando abaixo:

```shell
npm test
```

Para relatório de coverage, executar na pasta do projeto o comando abaixo e verificar o resultado em `src/coverage/lcov-report/index.html`:

```shell
npm run test:conv
```

## Documentation

Para documentação foi utilizado o [Compodoc] que gera a documentação geral do sistema. Para gerar e visualizar a documentação, na pasta deste projeto execute o comando abaixo:

```shell
npx @compodoc/compodoc -p tsconfig.json -s
```

Após executado, a documentação estará disponível através do link http://localhost:8080

## Usage

Para iniciar o projeto utilizando o terminal (PowerShell, bash ou similar), basta executar na pasta do projeto o comando abaixo:

```shell
npm start
```

Após carregar, a aplicação estará disponível em `localhost:3000`  
A documentação da API com Swagger estará disponível em [localhost:3000/api](http://localhost:3000/api)  
Arquivo para postman está em `docs/Golaço API.postman_collection.json`

Usuários e senhas já existentes para serem usados em testes do projeto:
| Username          | Password | Perfil | Pessoa Vinculada |
| --------          | -------- | ------ | ------           |
| golaco@golaco.bet | 1234     | ADMIN  | ID  1            |
| maria@dominio.com | 1234     | USER   | ID  2            |
| jose@dominio.com  | 1234     | USER   | ID  3            |
  
## Support and Contributing

Para dúvidas, sugestões, feedbacks ou correção de bugs: abrir Issue ou Merge Request.

## Roadmap

Aqui estão listadas sugestões para futuras atualizações:

- Implementar uma maneira de permitir a atualização de disputa/partida que já se encontra com status de 'closed';
- Melhorar mensagens de retorno de erros para quando se tenta excluir algum recurso;
- Confirmar a necessidade para CRUD de transações e criar se necessário;
- Criar testes para coverage máximo.

## Authors and acknowledgment

Desafio proposto por Clécio e Michel, Programa Start da GFT.  
Feito por [Luis Carlos Zancanela] e [Vinicius Santos Silva]

## Project status

Doing

## Tutorial de Recursos personalizados

### Inserir recurso estático no projeto NestJS

1- criar a pasta `src/resources` para guardar recursos estáticos, como o banner e arquivo yaml que são utilizados nos tutoriais "Aplicar Load Banner ao projeto NestJS" e "Inserir o Swagger do Swagger Editor no projeto NestJS" respectivamente.  
2- no arquivo `nest-cli.json` adicionar o seguinte bloco:

```json
"compilerOptions": {
  "assets": [
      "resources/*"
  ]
```

Após estes dois passos, tudo o que estiver na pasta `resources/*` irá ser copiado para a pasta de produção do sistema que é utilizada quando é iniciado ou exportado.

### Aplicar Load Banner ao projeto NestJS

1- Criar um arquivo `banner.txt` e salvar na pasta `src/resources`, é importante lembrar que para o arquivo ser carregado corretamente, é necessário ter realizado os passos de como "Inserir recurso estático no projeto NestJS" disponível em tutorial anterior.  
2- No arquivo `src/app.service.ts`, adicionar os imports:

```javascript
import { readFileSync } from 'fs';
import { join } from 'path';
```

3- Implementar `OnApplicationBootstrap`, pacote '@nestjs/common' na classe `AppService`, a declaração da classe ficará parecido com:

```javascript
export class AppService implements OnApplicationBootstrap {
```

4- Inserir o bloco de código na sua classe `AppService`:

```javascript
onApplicationBootstrap() {
  const color = '\x1b[33m';
  let banner = '';
  try {
    banner = readFileSync(join(__dirname, 'resources', 'banner.txt'), 'utf8');
  } catch (error) {
    logger.error(error);
  }
  if (banner) console.log(color, banner.toString());
}
```

Para evitar de possível erro de leitura do arquivo atrapalhar o carregamento, o bloco de código já possui o try/catch e utiliza o `Looger` do NestJS para deixar erro no padrão do framework, se preferir ou estiver com problemas com o logger, pode substituir o `logger.error()` por `console.error()`.  
Sugestões de site para artes ASCII para ajudar a montar seu `banner.txt`: [Text to ASCII] e [ASCII-Art].

### Inserir o Swagger do Swagger Editor no projeto NestJS

1- Após criar seu swagger no site [Swagger Editor], basta exportar ele como arquivo YAML e salvar na pasta `src/resources` com o nome de `openapi.yaml`, é importante lembrar que para o arquivo ser carregado corretamente, é necessário ter realizado os passos de como "Inserir recurso estático no projeto NestJS" disponível em tutorial anterior.  
![Save Swagger as YAML](docs/swagger/save_as_yaml.PNG?raw=true "Save Swagger as YAML")  

2- Instalar o pacote de swagger do próprio NestJS:

```shell
npm install --save @nestjs/swagger
```

3- Instalar o pacote js-yaml e respectivos types:

```shell
npm i --save js-yaml
npm i --save-dev @types/js-yaml
```

4- No início arquivo `src/main.ts` fazer os imports nodos módulos necessários:

```javascript
import { readFileSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';
```

5- No arquivo `src/main.ts`, após a declaração do `app` o seguinte bloco de código:

```javascript
const openApiYaml: OpenAPIObject = yaml.load(
  readFileSync(join(__dirname, 'resources', 'openapi.yaml'), 'utf8'),
) as OpenAPIObject;
SwaggerModule.setup('api', app, openApiYaml);
```

Após estes passos, o swagger já ficará disponível no projeto.  

> Escolhe um trabalho de que gostes e não terás que trabalhar nem um dia na tua vida. _- Confúcio_

[Visual Studio Code]: https://code.visualstudio.com/
[Node.js]: https://nodejs.org/en/
[NPM]: https://www.npmjs.com/
[Nest.js]: https://nestjs.com/
[Prisma]: https://www.prisma.io/
[TypeScript]: https://www.typescriptlang.org/
[Jest]: https://jestjs.io/pt-BR/
[Swagger Editor]: https://editor.swagger.io/
[MySQL]: https://www.mysql.com/
[Compodoc]: https://compodoc.app/guides/usage.html

[MySQL Community]: https://www.mysql.com/products/community/
[Draw.io]: https://app.diagrams.net/
[ASCII-Art]: https://ascii-art.botecodigital.dev.br/
[Text to ASCII]: http://www.patorjk.com/software/taag/#p=display&f=Graffiti&t=Type%20Something%20

[Luis Carlos Zancanela]: https://github.com/didifive
[Vinicius Santos Silva]: https://github.com
