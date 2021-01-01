# Nuber Eats

The Backend of Nuber Eats Clone

## 0. Setting

1. `nest new <project>`
2. `> gitignore` -> `node`
3. `grapql`은 미니 프로젝트로 설명할 것.

## 1. GraphQL

1. Apollo Server setup
   - `$ npm i @nestjs/graphql graphql-tools graphql apollo-server-express`
   - [x] appModule: `appService`, `appController` 제거
     - appModule 은 `main.ts`로 import되는 유일한 모듈
   - db, graphql 을 추가할 거야
2. our first resolver

   - graphQL은 Apollo Server를 기반으로 동작한다.
   - **정의**
     - `typeDefs` : document 혹은 너의 서버의 schema를 표현하는 것
     - `resolvers` : 쿼리를 처리하고 mutate 시키는 function
   - `code-first` vs `schema first`
     - `schema first`: GraphQL 파일을 작성할 건데, 기본적으로 얘들은 forRoot로 주어짐. 나는 이런 접근을 좋아하지 않아. 짜증남.
     - `code first` : TypeScript의 힘을 발휘 할 수 있도록 함. 널 위해 schema를 생성해준다.
   - resolvers랑 query를 만들기
     1. 일단 restaurants module 만들기
     2. 그다음 해당 폴더에 `restaurants.resolver.ts` 파일 만들기
     3. `@Resolver()` 데코레이터가 달린 RestaurantResolver 클레스 만들기
     4. `@Query(() => Boolean)`: Query에서 무엇을 return 할 것인지 알려줘야함
     5. `localhost:3000/graphql` 접속 하면 작동 확인 가능

   > prettier가 작동안되면?
   >
   > ```
   >  // settings.json
   >  "[typescript]": {
   >     "editor.defaultFormatter": "esbenp.prettier-vscode"
   >   },
   >   "[typescriptreact]": {
   >     "editor.defaultFormatter": "esbenp.prettier-vscode"
   >   },
   > ```
   >
   > 추가하면 됩니다.

3. ObjectType
   - Entity Modeling이랑 비슷하다.
4. Arguments
   - query를 살펴봅시다.
   - GraphQl에 Query를 줄때 Argument를 줄 수 있다. `@Args('찾을string') variable: Type`
5. InputTypes and ArgumentTypes
   - `inputTypes` : argument를 따로 주는게 아니라 `object`를 넘겨 줄 수 있다. === DTO 같다.
     ```ts
     @Args('createRestaurantInput') createRestaurantInput: createRestaurantDto,
     ```
   - `ArgumentTypes` : 밑의 field를 분리된 argument로써 정의할 수 있게 해준다.
     ```ts
     @Args() createRestaurantDto: CreateRestaurantDto,
     ```
6. Validating ArgsTypes
   - dto에 class validators를 사용할 수 있다.
   - Validator-Pipe를 설정해줍시다.
     ```ts
     // main.ts
     app.useGlobalPipes(new ValidationPipe());
     ```

## 2. Database Configuration
1. TypeORM and PostgreSQL
   - TypeORM 은 TypeScript를 사용하여 NestJS와 친근하다.
   - `$ npm i @nestjs/typeorm typeorm pg`
   - `pg`는 postgreSQL
2. TypeORM Setup
   ```ts
   // app.module.ts
   TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'qweasd123',
      database: 'nuber-eats',
      synchronize: true, // type orm이 DB에 연결할때,데이터베이스르 ㄹ너의 모듈의 현재 상태로 마이그레이션한다는 뜻 ,
      logging: true, // console.log 로 출력 
    }),
   ```
3. Introducing ConfigService
   -  NestJS 는 dotenv 대신 configuration module을 사용합니다.
   - dotenv의 최상위에서 실행됩니다. (dotenv 내부에서도 실행이 됩니다.)
   ```ts
   // app.module.ts
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
   ```
   - Command에 따라 환경변수 설정 변경
   - `npm i cross-env` : mac이든 windows든 상관 없이 환경 변수를 설정해줍니다.
   - `package.json` 변경
   - ```ts
     // config-module-options
     export interface ConfigModuleOptions {
          cache?: boolean;
          isGlobal?: boolean;
          ignoreEnvFile?: boolean;
          ignoreEnvVars?: boolean;
          envFilePath?: string | string[];
          encoding?: string;
          validate?: (config: Record<string, any>) => Record<string, any>;
          validationSchema?: any; // 원하는 모든 환경 변수의 유효성을 검사할 수 있음
          validationOptions?: Record<string, any>;
          load?: Array<ConfigFactory>;
          expandVariables?: boolean;
      }
     ```
4. Validating ConfigService
   - `joi`: 자바스크립트용 가장 강력한 스키마 설명 언어 이자, 데이터 유효성 검사 툴입니다.
   - 환경 변수의 유효성을 검사할 꺼입니다.
   - `npm i joi`
      - js로 된 module은 import하는 방식이 다름
      ```ts
      import * as Joi from 'joi';
      ```
   ```ts
    validationSchema: Joi.object({
      NODE_ENV: Joi.string().valid('dev', 'prod').required(),
      DB_HOST: Joi.string().valid(),
      DB_PORT: Joi.string().valid(),
      DB_USERNAME: Joi.string().valid(),
      DB_PASSWORD: Joi.string().valid(),
      DB_NAME: Joi.string().valid(),
    })
   ```