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
4. Middlewares in NestJS 
   1. class
      `method(req: Request, res: Response, next: NextFunction) { ...; next();}`
   2. function
   3. bootstrap `use()`

6. JWT Middleware
   - dj..
   - 
7. GraphQL Context (Authentication part)
   1. decode된 token이 담긴 request는 HTTP request 같은건데 이걸 graphql resolver에 전달해줘야함
      1. graphql Module에 apollo server를 모든걸 가져왔다는걸 생각해내야함
      2. request context는 각 request에서 사용이 가능하다.
         1. context가 함수로 정의되면 매 request 발생.
         2. 이것은 req propety를 포함한 object를 Express로부터 받는다.
         3. context 데이터 바구니 같은거
8. AuthGuard
   1. guard 만들어서 `@UserGaurds()`에 넣어줌.

9. Recap
   1. header에 token을 보내
   2. token을 decrypt, verify하는 middleware를 거쳐 request object에 user를 추가 
   3. request object가 graphql context 안으로 들어가시고
   4. Guard가 graphql context를 찾아
   5. user가 있는지 없는지에 따라 true, false를 return 할껴
   6. 마지막에 guard에 의해 request가 authorize되면
   7. resolver에 decorator가 필요해, decorator는 graphql context에서 찾은 user와 같은 user를 찾으려고 할껴

## 6. Email Verification
verification을 다루는 아주 작은 프로젝트. 이를 통해 DB의 관계에 대해 설명

JWT 모듈과 같은 동적인 모듈 만드는 것을 연습해보자. 우리만의 이메일 모듈을 만들자.

- 6.1 Creating Verifications 
   - User가 Account를 생성했을때, Entity에 Verification을 추가했으면 좋겠어.
   - code : uuid를 사용해 `npm i uuid`

- 6.1 Verifying User
   - verification code를 사용해서 사용자의 verification을 찾을 꺼야.
   - verification module을 만들어도 좋아. 
   - resolver를 만들어주자.
   - relationShip을 불러올 것인지 아닌지 여부 결정하는 typeorm find options : `loadRelationIds`

   - `@Column({ select: false })`
   - `@OneToOne(type=>User, {onDelete: "CASCADE})` : user와 붙어있는 verification도 같이 삭제한다는 의미.

- 6.5  Mailgun Setup
   - `Mailgun`: 이메일을 보내는 최고의 서비스!
   - Sendgrid라는 서비스도 시도해봤는데, 불편하댕
   - 계정만들고 인증하자. 가짜핸드폰인증은 ㅋㅋ `receive-smss`에서 받을 수 있쏭
   - `sandbox domain` : 니가 이 도메인으로 메일을 보내는거야.
   - `API Keys`: Public Api Key
   - credit Card등록 안햇으면 `Authorized Recipients`에 등록된 5개의 계정에만 mailgun 서비스를 이용할 수 있어.

- 6.6 Mail Module Setup
   - NestJS에는 mailer module가 있어요. `@nestjs-modules/mailer`
   - 우린 직접 만들어 볼 꺼에오. `nest g mo mail`
   - `mail.module.ts` 랑 `app.module.ts`의 `MailModule.forRoot({...})` 처리

- 6.7 Mailgun API
   - 요즘은 `request` package가 deprecated 되고 `GOT`를 사용한답니다... `npm i got`
   - curl 형식으로 보내야하는데
      - `--user` 은 `Basic Authorization` headers임.
      - `api:APIKEY` 얘는 key:value 키쌍인데, `base64`로 보내야함.
      - `Buffer.from('api:YOUR_API_KEY').toString('base64')`
      - `-F`: form인데 우린 `form-data`을 설치해서 사용할꺼임.



- 6.8 Beautiful Emails
   - mailGun Template을 씁시다.
   - Sending > Templates > alert Template 선택
   - Email Template은 `handlebars` 뷰엔진을 씁니다...~~더럽고 추악한...~~


## 7 UNIT TESTING THE USER SERVICE
- 7.0 Setting Up Tests
   - 모든기능에 대해서 `unit test`후 서비스 후에 `end to end` 테스트 후 `intergrate test` 할 꺼얌.
   - NestJS가 준비한 자동 기능은 `npm run test`얌 (watch)
   - `users.service.spec.ts` 만들자.
      - `package.json`의 `"testRegex": ".spec.ts$",`이 spec.ts를 찾아서 검사해줌.
   - Step1
      - ```ts
        beforeAll(async () => {
            const module = await Test.createTestingModule({
                  providers: [UserService],
            }).compile();
        }
        ```
   - Step2
      - ```ts
         let service: UserService;

         beforeAll(async () => {
            const module = await Test.createTestingModule({
                  providers: [UserService],
            }).compile();
            service = module.get<UserService>(UserService); 
         });
        ```
   - Error!
      - `Cannot find module 'src/jwt/jwt.service' from 'users/users.service.ts'`
      - src 경로 를 찾지 못하고 있어.
   - **유닛테스트**의 포인트는 가능한 한 테스트들을 독립시키는 것.

- 7.1 Mocking
   - Error는 Jest가 우리 코드의 경로를 찾지 못해서 일어난 것이다.
   - **타입스크립트**를 쓰고 있기 때문에 `../../` 이런식으로 쓸 필요가 없다. 하지만 jest는 못 찾는다.
   - Solve
      - `package.json` 에서 jest가 파일을 찾는 방식을 수정한다.
      - ```ts
         "jest": {
            "moduleNameMapper": {
               "^src/(.*)$":"<rootDir>/$1"
            },
   - Error!
      - `Nest can't resolve dependencies of the UserService (?, VerificationRepository, JwtService, MailService). Please make sure that the argument UserRepository at index [0] is available in the RootTestModule context.`
      - UserSerivce는 repository가 필요한데, test module에서 repostiory를 제공하지 않아서 그래.
      - 하지만 TypeORM에서 Repository를 제공하지 않고, **Mock Repository**를 제공할꺼야
      - Mock: 가짜 함수얌. 가짜 함수의 실행, 가짜 클래스의 실행이야. 
         - 진짜 User Repository를 불러와서 실행하지 않아. 왜냐면 유닛 테스트니까. 
   - Solve
      - 1. provide UserRepository
         ```ts
         providers: [
            {
               provide: getRepositoryToken(User), 
               useValue: "", // 이건 속임수로 만드는 것이얌
            }, ... ]
         ```
      - 2. UserService에서 사용하는 userRepsitory의 method는 `fidnOne`, `save`, `create`밖에 없다.
         ```ts
         const mockRepository = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
         }
         ...

         useValue: mockRepository,
         
         ...
         ```
      - 3. Repository, Service를 Mocking 해서 하고 있송.
   - 이제 UserService를 정의하여 Test를 사용할 수 있어

- 7.2 Mocking part Two
   - 이제는 `createAccount` method를 Test할 꺼야
   - 실제 request값을 넣고 특정한 response를 기대하는건 E2E 에 가까움.
      - 많은 파트를 같이 필요로하는 테스트를 말하는거쥐
      - fidn User, mailService.send sdfsa... 많이 필요해.
   - 유닛테스트에서 하고 싶은건 코드의 각 줄에 문제가 없나 하는거 임.
   - 우리가 부르는 각 함수를 테스트하고 있어.
   - 햇갈릴껀데
      - 코드가 우리가 의도한 대로 작동하는 지 테스트하고 싶어.
      - 만약 코드가 의도한 대로 작동하고 있으면 내가 원하는 출력물이 나온다는건 맞아.
      - 하지만 이건 고립된 상태가 아니고, 유닛 테스트에서는 고립된 결과를 원한단 말이야.
      - 직접해봅시당 ^_^
   - 참고) TypeScript의 Partial 타입: 타입 T의 모든 요소를 optional 하게 만든다.
   - 참고) TypeScript의 Record 타입: 타입 T의 요소 K의 집합으로 타입을 만들어주는 T 이다.
      - ```ts
        let test: Partial<Record<"hello", number>>
        test.hello // 하면 타입이 number로 찍힌다.
        ```
   - `type MockRepository<T = any> = Partial<Record<keyof Repository<User>, jest.Mock>>;`
      - 이게 머냐고?
      1. `Partial` : 타입 T의 모든 요소를 optional하게 한다.
      2. `Record` : 타입 T의 모든 K의 집합으로 타입을 만들어준다.
      3. `keyof Repository<User>` : Repository<User>의 모든 method key를 불러온다.
      4. `jest.Mock` : 3번의 key들을 다 **가짜**로 만들어준다.
      5. `type MockRepository<T = any>` : 이를 type으로 정의해준다.

- 7.3 Writing Our First Test
   - User가 DB에 있으면 ok가 true고 아니면 false
   - TypeORM을 직접안넣고 어떻게하냐고? 
      - mock은 함수의 반환값을 속이기 때문에 가능하다.
   - 문제는 createAccount함수는 다른 것에도 의지하기 때문에 이 의지하는 모든 것을 가짜로 만들어야해.
   - 그러니 이러한 것들을 Mock 할꺼야.
   - ```ts
      describe('createAccount', () => {
         it('should fail if user exists', () => {
               // findOne이 실패하면 mockResolvedValue를 할 꺼야. (Promise를 사용하기 때문에)
               usersRepository.findOne.mockResolvedValue({
                  id: 1,
                  email: 'lalalalal',
               });
               const result = service.createAccount({
                  email:"",
                  password: "",
                  role: 0,
               });
               expect(result).toMatchObject({
                  ok: false,
                  error: `There is a user with that email already`,
               })
         })
      })
     ```
     
- #7.4 Recap 
   - 우리 코드에서 특정 부분의 리턴값을 속였어!
   - 우리의 코드가 어떻게 반응하기 보기위해서 했어.
   - 결과는 현실세계의 test가 아니라 그냥! 코드자체를 테스트하는거야. 미리 결과를 만들어놓고 이거대로 되는지 확인하는거야.
   - 겁나 햇갈리구만.
   - 지금은 `findOne`만 했고 나중에 `users.save()`를 속이고, `this.verications.save()`를 속이고 쭉 다 속일꺼임. 심지어 `try catch`도 속일꺼임. ㅋㅋ

- #7.5 createAccount Test part One
   - 나머지를 작업할 거고.
   - `npm run test:cov` 얘는 내 모든 코드의 테스트가 어디까지 커버(coverage)되고 있는지 보여준다.
      - 근데 `jest`가 모든 파일에 대해서 coverage를 보여주는데 나는 service만 coverage가 되고 있는것을 보고 시펑!
      - `package.json`
         ```json
         "jest" : {
            "coveragePathIgnorePatterns": [
               "node_modules",
               ".entity.ts",
               ".constants.ts"
            ]
         }
         ```
   - `expect(usersRepository.create).toHaveBeenCalledTimes(1);` : 이 함수가 단 한번 불릴거라고 기대하는 거야.
   - `expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);` : 이 함수가 createAccountArgs와 함께 불럴꺼라고~

- #7.6 createAccount Test part Two
   - creatAccount method를 모두 coverage 해보자.
   - `expect.any(String)`: 어떤 Type으로든 검사가 가능해용 

- #7.7 login Test part One
   - `it should fail on exception` 테스트 해야함.
   - 그리고 `login` method를 test 해보자.
      - `toHaveBeenCalledTimes(1)` 얘가 안먹히네.. 3번이나 호출?? 왜지..

- #7.8 login Test part Two
   - repository.findOne 이 1번만 되어야 하는데 4번 call 되는 문제를 겪었어.
   - 이 문제는 그 위에 describe에서 이미 불렀기 때문에, 우리 call 횟수가 증가한 거야.
      - 이 모든 테스트에서 기본적으로 동일한 mocks를 공유하기 때문이야.
      - module이 모두 test전에 만들어진거야. function 1,2,3,4번 call하면 이게 jest 메모리에 들어가 4번 call 한 것을 기억하는 거지.
      - beforeall 이 아니라 before Each 해야함
      - 이제 이 test 모듈이 각 test 전에 다시 만들어 진거라고 확신할 수 있음.
   - Unit test할 댄 before each, end-to-end는 before All 로 테스트.
   - 할 수 있는 return value는 다 mock 해야함.
   - return value에 대한 코드의 반응을 test하고 싶은거잖아. 실제로 있는 데이터가아니라. 코드 그 자체를!
   
- #7.9 findById Test
   - `findById` 빨리 해보자!
      - 그전에 `findOne`을 `findOneOrFail`으로 바꾼다.
      - `findOneOrFail`은 못 찾으면 error를 throw를 할 꺼야.

- #7.10 editProfile Test part One
   - 으ㅏㅏㅏㅏ 피곤해

- #7.11 editProfile Test part Two
   - email verification 했고, editProfile 밑 부분 하자.

- #7.12 verifyEmail Test
   - `verifyEmail` 부분하자.

- #7.13 Conclusions
   - code coverage -> `user.serivce.ts` coverage 100%
   - 우리가 만든 service 행을 모두 테스트했어.
   - 130행을 테스트하기 위해 300행을 했다.. 하지만 나쁜건 아니래.
   - service를 ts를 배웠습니다.
   - result를 mock해야하는 것을 배웠습니다.
   - 코드의 조건 하나하나 체크하기 ㅜ이해서 mock 하는 겁니다.
   - 실제 db에 user 에 create, update, 실제 email을 보낸다거니, sign 하는걸 아닙니다.
   - 우리는 그저 코드가 예상하는대로 흘러가길 원합니다.
   - 그러기 위해서 mock, fakeing 해야함.
   - 다시 한번 coverage를 살펴보면 mail.service와 jwt.service가 심각하게 구립니다.
   - mock! email같은 경우. test하기 어렵지 않겠어... 

## 8 UNIT TESTING JWT AND MAIL
- #8.0 JWT Service Test Setup
   - 우리가 만든 JWT 서비스와 메일 서비스를 테스트해봅시다.
   - 외부 라이브러리와 mocking 하는 방법!
      - `dependency`는 기본적으로 어떤 서비스가 동작하기 위해 무언가에 '의존'해야 한다는 뜻.
      - `CONFIG_OPTIONS at index [0] is not available` 그래서 CONFIG_OPTIONS를 제공해줘야해.
   - 우리는 sign(verify도 동일)이 호출된 횟수를 체크하고, 반환값을 mock하고, sign이 어떻게 호출된 건지 체크할 수 있어.
   - testKey를 constant로 바깥에 만들자.

- #8.1 JWT Sign TesT
   - json web token을 mocking 하자.
      - jwt를 실제 JWT package로부터 사용하지 않으려고 이런 작업을 해주는 거얌.
      - test하는 부분 바깥으로 가서, `jest.mock()`를 입력하자.
      1. 우리가 사용할 package이름을 넣고, `jest.mock('jsonwebtoken')`
      2. factory pattern을 사용하자.
      
- #8.2 JWT Verify Test
   - return 문자열 검사
   - Mail Service로 test setup.

- #8.3 sendVerificationEmail Test
   - spy function : 함수를 mock할 수 없을 때, spy를 쓰는거임.
      - 염탐하는 뜻. 
      - `service.sendEmail = jest.fn()` 이런식으로 안하 겟음.
         - 이건 service.sendEmail이 mock function이라고 하는 셈이 되어버림.
      - sendEmail을 test해야함.
      - `jest.spyOn(service, 'sendEmail')`
      - spy들의 implementation을 어떻게 가로채는지(intercept)에 대해 다음시간에 알아보도록 하자.

- #8.4 sendEmail Test
   - `FormData`는 mocking할 수 없어, 왜냐면 append는 new formData()를 실행해서 FormData를 만든 후에 실행할 수 있기 때문.
   - `forEach` spy는 어떻게합니까?

## 9 USER MODULE E2E
- #9.0 Setup part One
   - User 모듈 E2E 진행할 겁니다.
   - 6개의 resolver 에 대해서 test해볼 겁니다.
   - NestJS의 `test` 폴더 안에 end-to-end testing file을 가지고 있습니다.
   - 우리는 이 파일의 일므을 변경할꺼. -> user만 e2e할꺼라고 `users.e2e-spec.ts`로 바꿀껍니다.
   - 우리는 기본적으로 전체 application을 load해서, Resolver를 테스트할 수 있기를 원합니다.
   - `$ npm run test:e2e`
   - 그러면 `Cannot find module` 뜨는데 `test/jest-e2e.json`을 수정하면 됩니다.
      ```json
      "moduleNameMapper": {
         "^src/(.*)$":"<rootDir>/../src/$1"
      },
      ```
   - 다음 `joi` error 나오는데 JoiSchema를 수정해봅시다.
      ```ts
      // app.module.ts
      NODE_ENV: Joi.string().valid('dev', 'prod', 'test').required(),
      ```
      ```env
      # .env.test
      # copy all things in .env.dev

      # modify below this.
      DB_NAME=nuber-eats-test
      ```
   - 그리고 `beforeEach`->`beforeAll` 로 바꿉시다. 왜냐하면 각각의 test전에 module을 load하지 않고, 모든 test 전에 module을 load하고 싶거든요.
   - 그리고 `nuber-eats-test` database를 만들어 주세오.
   
- #9.1 Setup part Two 
   - `Warning! Jest did not exit one second after the jest run has completed.`
   - test가 다 끝나면, database를 싹 비울 거임.
      - `afterAll`에서 typeorm의 `getConnection().dropDatabase()`를 할꺼얌.

- #9.2 Testing createAccount part One
   ```ts
   describe(`createAccount`, () => {
    const EMAIL = 'ilyong@las.com';

    it(`should create account`, () => {
      return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .send({
        query: `
        mutation {
          createAccount(input: {
            email:"${EMAIL}",
            password:"12345",
            role:Owner
          }) {
            ok
            error
          }
        }
        `
      })
      .expect(200)
      .expect(res => {
        expect(res.body.data.createAccount.ok).toBe(true);
        expect(res.body.data.createAccount.error).toBe(null);
      });
    })
  });
   ```


- #9.3 Testing createAccount part Two
   - 근데 하다보면 에러뜬다.
      - `This usually means that there are asynchronous operations that weren't stopped in your tests. Consider running Jest with '--detectOpenHandles' to troubleshoot this issue.`
      - 일단 npm run test:e2e에 `--detectOpenHandles`를 달아서 뭐가 문제인지 알아보자.
      - 이게 대체 머선소리고?
         - 왜생기냐면, accountㅇ를 생성할 때마다, email을 보내기 때문에 생기는 에러.
         - jest가 코드의 어떤 부분이 open 상태였는지를 알려 줄꺼임.
      - resolver를 test할때 `got`를 안쓸꺼야! 어떻게? **mock!!!**
   - 참고로 `expect().toEqual()`에 비해 `expect().toBe()`은 더 정확해야해.

- #9.4 Testing login 
   - login을 테스트하기 전에 userID를 알아야 합니다.
   - 제일 밖에있는 describe clouser 안에 `jwtToken` 변수를 넣고, login에 성공하면 넣어줍시다.
   - 좀 쉽네... ㅎ

- #9.5 Testing userProfile
   - userProfile은 약간 까다롭습니다.
   - 로그인만 되어있다면 어떤 user의 프로파일을 참고할 수 있습니다.
      - userId를 어떻게 찾아올까요?
      - 우리가 database를 만들고 있으니까, 첫 유저는 항상 ID가 1이란 거지... 근데 uuid를 쓰는 경우는 ?ㅋㅋㅋ
      - module로부터 뭔가를 가져올 수 있어!! `usersRepository`

- #9.6 Testing me
   - me를 test합시다.
   - Error 발생!
      - `Cannot return null for non-nullable field User.email.`
      - `user.service`를 추적합시다.
         ```ts
            if (typeof decoded === "object" && decoded.hasOwnProperty('id')) {
            const { user, ok } = await this.userService.findById(decoded["id"]);
            if (ok)
               req['user'] = user;
         }
         ```
         이렇게 수정하자.

- #9.7 Testing editProfile
   - editProfile 그다지 많은 것을 테스트 않을 꺼야.
   - 그리고 editProfile은 보안이 매우 약해.
   - 내가 원하는 email로 마구 수정할 수 있고, 이미 사용중인 이메일로의 수정은 막아야 하지.
      - email을 수정하기 전에, 먼저 해당 email을 가지고 있는 유저가 있는지를 확인해야함.
   - 또! 에러가 나타나는데, user랑 verification entity는 `OneToOne`으로 연결되어있어.
      - 우리의 test는 verification이 하나랑 연결되어야하는데 있는채로 하나를 추가해버리는 꼴이 되어 버린거야.
      - 그래서, 프로필을 수정하려고 할 때에는 먼저 모든 verification들을 삭제하도록 해야 함.
      - `user.service.ts` 수정해야지.
   - `.then()`을 사용해서 바꾼 email이 맞는지 확인 할 수 도 있고, 새로운 `it()`을 만들어서 email을 확인 할 수 도 있다.

- #9.8 Testing verifyEmail 
   - verifyEmail은 email에 접근할 수 있는 권한(token을 취득할 수 있는 권한)을 요구한다. 
   - 그건 안하고, beforeAll에서 했던 userById를 한 것 처럼 비슷하게 할거야.
      - jest에 숙달하기 위함이야.
      
- #9.9 Conclusions
   - `baseTest`, `publicTest`, `privateTest` 3개를 만들어서 중복되는 코드를 줄였어.
   - 아 그리고 `return`은 해야지 계속 test가 가능해...
   - end-to-end, unit test를 모두 끝났어. user section이 끝낫어..
   - 다음 섹션부터는 날아다녀 restaurant CRUD 엄청 빨리 만들고, resolver도 만들고
   - 어어어 빠르다 빨라.

## 10 RESTAURANT CRUD
- Role Based Authentication과  authorization을 해보았습니다.
   -  를 참고하세오.
   - metadata와 global guard를 사용.
      - `APP_GUARD`는 nestjs가 전체적으로 적용시킬 겁니다.
      - `guard`는 reflector를 사용합니다.
         - reflector는 metadata를 get합니다.
            - metadata는 resolver의 extra data 입니다.
         - 그래서 `roles.decorator.ts` 는 metadata를 설정합니다.
            - 몇몇 resolver는 metadata를 가질꺼고, 이 중 몇개는 role이라는 key에 있을 겁니다.
            - 그래서 이 데코레이터는 `@SetMetadata()`라는 데코레이터를 반환합니다.
            - role을 전달 해줍니다.
         - decorator가 없으면 public 이라는 겁니다.

- TODO LIST 📋
   - Edit Restaurant
   - Delete Restaurant

   - See Categories
   - See Restaurants by Category (pagination)
   - See Restaurants (pagination)
   - See Restaurant

   - Create Dish
   - Edit Dish
   - Delete Dish

- 10.8 Edit Restaurant part Two
   - entity에서 `@RelationId` 는 id만 가져오고 object를 가져오지 않는다는 뜻입니다.
      - repository에선 `{ loadRelationIds: true }` 옵션을 줍니다.
      - db가 빨라집니다.

- 10.12 Categories part One
   - Computed Field, Dynamic Field를 써볼 거예오.
      - Dynamic Field는 db에 실제로 저장되지 않은 field 입니다.
      - Request가 있을 때마다 계산해서(computed) 보여주는 field 입니다.
   - 보통 Computed Field, Dynamic Field는 로그인된 사용자의 상태에 따라 계산되는 field 입니다.
      - 인스타그램에서 포스트에 좋아요를 누르고 다음에 방문하면 `isLike`에 true, false 값을 가진 field가 생깁니다.
      - 그리고 이건 실제로 db에 존재하는 field가 아니고 사용자의 상태에 따라 계산된 field 입니다.
      - `@ResolveField`는 매 request 마다 계산된 field를 만들어줍니다.
         - category에 해당하는 restaurant이 몇 개 인지 보여주는 field를 만드는 거입니다.

## 11. Order와 Dish는 귀찮아서 그냥 복붙합니다.

## 12. Order Subscriptions
- #12.0 Subscriptions part One
   - `subscriptions`은 resolver에서 **변경 사항이나 업데이트**를 수신 할 수 있게 해줘.
   - 작성방법은 mutation과 query를 만든 것 처럼 subscriptions을 만들 수 있습니다.
      - 규칙이 몇가지 잇습니다.
         1. 우리가 뭘 return하는지에 따라 정해집니다.
         2. 예를들어 GraphQL에게 string을 반환한다고 했지만, 실제적 함수는 string을 반환안해.. ??
         3. 대신에 asyncIterator라는 걸 return 할거얌
   - 설치
      - `$ npm i graphql-subscriptions`
      - real time 처리 할 수 있게 만들어 줌
      - 설치가 되면 `PubSub`이라는 인스턴스를 생성할 꺼얌.
         - `PubSub` : publish and subscirbe을 말하는데, app 내부에서 메시지를 교환할 수 있어.
         - 우리가 return 하는건 asyncIterator 이야. 지금 당장 이해할 수 없지만. subscription이 작동하기 위한 작업이야.
   - `asyncIterator()`
      - `trigger` 는 우리가 기다리는 이벤트를 말함.
   - 그래서 graphQL Playground에서 실행하면 `오류` 나는데
      - 지금 app은 HTTP 통신을 하고 있고, subscriptions는 WebSocket 통신이 필요해
      - 그래서 우리는 Web Socket을 활성화 해야해.
         ```ts
         // app.module.ts
         GraphQLModule.forRoot({
            installSubscriptionHandlers: true,
         ```
      - 이렇게하면 서버가 웹 소켓 기능을 가지게 됨.
   - 그리고 GraphMoudle.forRoot()에서 context를 설정해줬는데, 웹 소켓은 연결할 때 쿠키를 보내고 받고 그런게 없어. 수정해보즈아...

- #12.1 Subscriptions part Two
   - WS에는 HTTP의 `request`대신 `connection`이 있어 

- #12.2 Subscription Authentication part One 
   - 누가 gqlcontext를 가져올까.?
   - 일단 WS통신시 `connection`은 웹 소켓이 클라이언트와 서버간의 연결을 설정하고 할 때 발생함.
   - 정리
      - step1. jwt middleware를 제거한다.
      - step2. guard에 필요한 정보를 보냈어.
      - step3. guard에서는 모든 정보를 가지고 있어. ( jwtMiddleware가 그랬던 것 처럼.)
      - ```ts     
        context: ({ req, connection }) => {
        const TOKEN_KEY = `x-jwt`;
        return { token: req ? req.headers[TOKEN_KEY]: connection.context[TOKEN_KEY] };
        ```

- #12.4 PUB_SUB
   - 서버가 여러개인 경우, PubSub을 너의 서버가 아니고 다른 분리된 서버에 저장해야함.
   - `npm i graphql-redis-subscriptions` redisPubSub 쓰세오.
      - RedisClient로 PubSub을 만들고
      - cluster를 쓰면 많은 node를 사용할 수 있습니다.

- #12.5 Subscription Filter
   - `filter`를 쓰는 이유는 모든 update를 listen할 필요가 없기 때문! 필요한 update만 보면 되기때문

- #12.6 Subscription Resolve
   - `resolve`는 사용자가 받는 update 알림의 형태를 바꿔주는 역할을 하고 있습니다.
   - TODO LIST 📋
      - Orders Subscription:
         - Pending Orders (Owner) (t: createOrder)
         - Order Status (Customer, Delivery, Owner) (t: editOrder)
         - Pending Pickup Order (Delivery)
      - (t: trigger) (s: subscriptions)
      1. 유저가 order를 만들 때 `createOrder`라는 resolver를 사용하면 `newOrder`라는 event를 trigger함
      2. 이 때 restaurant owner가 `newOrder` event를 listening 함.
      3. Owner가 주문을 받아들이면 화면에 order status를 보여줄 꺼야. 그리고 order는 cooking이라는 상태를 가지고 있겟죵?
      4. owner가 우리가 여기에 만들어놓은 `editOrder` resolver를 사용해서 음식이 cooked되었다고 알리면, `orderUpdate` event를 trigger 할꺼임.
      5. `oderUpdate` event는 customer와 owner가 listening 하고 있을 껴.
      6. .... ㅠㅠㅠㅜㅠㅜㅠㅠㅠㅜㅜㅜ
   - 3개의 resolver를 만들어야해
      1. owner가 restuarnt에 들어오는 order를 listen하기 위함
      2. Customer, Delivery, Owner가 특정 id의 order가 update되는걸 보기위한 거
      3. delivery guy를 위한 pickUpOrder resolver얌