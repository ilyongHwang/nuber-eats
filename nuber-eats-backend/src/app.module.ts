import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { JwtModule } from './jwt/jwt.module';
import { /*jwtMiddleware, */ JwtMiddleware } from './jwt/jwt.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod').required(),
        DB_HOST: Joi.string().valid(),
        DB_PORT: Joi.string().valid(),
        DB_USERNAME: Joi.string().valid(),
        DB_PASSWORD: Joi.string().valid(),
        DB_NAME: Joi.string().valid(),
        PRIVATE_KEY: Joi.string().required(),
      })
    }),
    RestaurantsModule, // forroot: root module을 정이ㅡ
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV !== 'prod', // type orm이 DB에 연결할때,데이터베이스르 ㄹ너의 모듈의 현재 상태로 마이그레이션한다는 뜻 ,
      logging: process.env.NODE_ENV !== 'prod', // console.log 로 출력
      entities: [Restaurant, User],
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true, // join(process.cwd(), 'src/schema.gql'),
    }),
    UsersModule,
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  // 2. Function Middleware
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({
      path: '/graphql',
      method: RequestMethod.ALL,
    })
  }

  // 1. Class Middleware
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(JwtMiddleware).forRoutes({
  //     path: "/graphql", // path: "*"
  //     method: RequestMethod.POST, // RequestMethod.All
  //   })

  // .exclude({ path:"/api", method: ... })
}
