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
## 3. TypeORM and NestJS
1. Our First Entity
   - `Entity` : 데이터베이스에 저장되는 데이터의 형태를 보여주는 모델 
   - GraphQL에 있는 모든 것들을 지울 필요 가 없습니다.
   - decorator와 typescript 의 장점
   - `@ObjectType()` : 자동으로 스키마를 빌드하기 위해 사용하는 GraphQL Decorator
   - `@Entity()` : TypeORM이 DB에 정의된 entity를 저장하게 해준다.
   - TypeORM이 Entity가 어디에 저장되어있는지 알려주어야 합니다.
2. Data Mapper vs Active Record
   - Repsitory란
     - Active Record & Data Mapper
       - DB랑 상호작용할때 쓰는 패턴
       - Active Record(Ruby On Rails & Python Django)
         - 인간미 있다 (사용자가 읽기 쉬움)
         - Entiy를 `export class User extends BaseEntity {}` 해주어야한다.
         - 접근하기위해 User라는 객체로 부터 시작.
         - 쉽고 작은 어플리케이션에서 사용합니다.
       - Data Mapper(NestJS)
         - User에 접근하기 위해 Repository라는걸 사용한다.
         - `Repository`: Entity랑 상호작용하는걸 담당
         - 접근하기위해 UserRepository라는 객체로 부터 시작.
         - 유지관리하는걸 도와주고 대규모 앱에 어울림.
         - InJect()를 사용하여 Repository를 사용하기가 더 쉽고, Test에도 Inject하여 사용하기 용이하다.
2. Injecting the Repository
   ```ts
   // restaurants.service.ts
   constructor(
     @InjectRepository(Restaurant)
     private readonly restaurants: Repository<Restaurant>
   )
   getAll: Promise<Restaurant[]> {
     return this.restaurants.find();
   }
   
   // restaurants.module.ts
   imports: [TypeOrmModule.forfeature([Restaurant])],

   // app.module.ts
   TypeOrmModule.forRoot({
     ...
     entities: [Restaurant],
   })
   ```

3. Recap
   - TypeORM을 사용하여 DB에 model을 생성하고 자동으로 graphQL에 스키마를 작성할 수 있음
   - graphQL query를 사용할 수 있는 resolver도 사용할 수 있음.
     - 이는 service에 연결되고 이 service가 DB에 접근함.
4. CreateRestaurants
   - `save` / `create`

6. Mapped Types
   - Entity사 바뀔때마다 DTO를 바꾸기가 번거롭쥬?
   - Entity 파일을 Dto로도 사용할 수 있습니다.
   - Mapped Types는 base type을 바탕으로 다른 버전들을 만들 수 있음.
     1. PartialType()
        - base type, base class를 가져다가 export하고 이 모든 field가 required가 아닌 class를 만들어줌.
     2. PicType()
        - input type에서 몇 가지 property를 선택해 새로운 class 를 만들어줍니다.
     3. OmitType()
        - base class에서 class를 만드는데 몇몇 field를 제외하고 만드는 것.
     4. Intersection()
        - 두 input을 합쳐주는 역할 

7. Optinal Types and Columns
   ```ts
   // restaurants.entity.ts
   {
     ...

     @Field(type => Boolean, {
       defaultValue: true,
     }) // graphql field
     @Column({ default: true }) // typeorm field
     @IsBoolean() // validation field
     @IsOptional() // falidation field
     isVegan: boolean;
     
     ... 
   }
   ```

8. Update Restaurant part one
    - make mutation update
    - `update dto`
      - `updateInputType`을 정의하고 `UpdateDto`에 포함하여 선언
    - `update query`
      ```ts
      updateRestaurant({ id, data }: UpdateRestaurantDto) {
        return this.restaurants.update(id, { ...data })
      }
      ```
    - `resolver`
      ```ts
        @Mutation(returns => Boolean)
        async updateRestaurant(
          @Args('input') updateRestaurantDto: UpdateRestaurantDto
          /*
          @Args('id') id: number,
          @Args('data') data: UpdateRestaurantDto,
          */
        ): Promise<boolean> { 
          RestaurantResolver.logger.debug(updateRestaurantDto);
          try {
            await this.restaurantService.updateRestaurant(updateRestaurantDto);
            return true;
          } catch (err) {
            console.log(err);
            return false;
          }
        }
      ```
    - `graphQL`
      ```ts
      mutation {
        updateRestaurant(input: {
          id: 4,
          data: {
          address: "수정 주소"
            }
        })
      }
      ```

## 4. User C/R/U/D
1. TODO List
   ```md
   1. CRUD - `account` 를 만든다.
   2. password를 hash 하는 방법
   3. password를 검증하는 방법
   4. authentication / authorizaiton - guards, middelwares, metadata
   5. customize decorators
   6. testing - unit test / e2e testing
   ```
   1. User Model
      - [ ] id
      - [ ] createdAt
      - [ ] updatedAt

      - [ ] email
      - [ ] password
      - [ ] role(client|owner|delivery)

   2. User CRUD:

      - [ ] Create Account
      - [ ] Log In
      - [ ] See Profile
      - [ ] Edit Profile
      - [ ] Verify Email

2. GraphQL create mutation query
  ```graphql
  mutation {
    createAccount(input: {
      email: "1yongs_@naver.com",
      password: "1234",
      role: Client
    }) {
      ok
      error
    }
  }
  ```

3. TypeORM - listeners
   - 기본적으로 너의 entity에 무슨 일이 생길 때 이벤트가 발생되고 실행되는 함수
   - `@AfterLoad()`
   - `@BeforeInsert()` : typeORM이 entity 가 insert되기 전에 이함수를 불러줄 것 입니다.

4. Hashing Module : `bcrypt`
   - `npm i bcrypt`
   - `bcrypt.hash(password, saltOrRounds)` : saltOrRounds 는 관련 유튭 비디오를 니꼬가 만듬
     - rounds
  
## 5. User Authentication
0. TODO List
   1. [ ] 수작업으로 authentication module 만들기
1. Generating JWT
   1. install `jsonwebtoken`, `@types/jsonwebtoken --dev-only`
   2. module modify 
      1. add secret key 
   3. token generate
2. JWT and Modules
   1. JWT: json web token을 이용해서 우리만이 유효한 인증을 할 수 있게 하는 것이 중요, 내부에 담겨진 정보 자체가 아닌, 정보의 진위 여부가 중요하다는 것.
   2. Module 종류에는 두가지가 존재
      1. static module (`UserModule`)
      2. Dynamic Module 설정이 적용되는 모듈 (`~~Module.forRoot`)
3. JWT Module
   1. JWTModule에 static 함수를 만들기
      1. [] `static method(): DynamicModule { ... }`
      2. jwtModule에 `@Global()` decorator를 달아줌으로써 Global Module로 부착
   2. Global Module vs Non-Global Moudle
      1. `jwt.interfaces.ts` 파일 생성
      2. `jwt.constants.ts` 파일 생성
   3. Module Depedency injection
      ```ts
      // moudle.ts
      providers: [JwtService]

      // same as
      providers: [{
        provide: JwtService,
        useClass: JwtService,
      }]
      ```
      