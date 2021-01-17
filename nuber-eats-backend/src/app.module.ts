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
import { Verification } from './users/entities/verification.entity';
import { MailModule } from './mail/mail.module';
import { Category } from './restaurants/entities/cetegory.entity';
import { AuthModule } from './auth/auth.module';
import { Dish } from './restaurants/entities/dish.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod', 'test').required(),
        DB_HOST: Joi.string().valid(),
        DB_PORT: Joi.string().valid(),
        DB_USERNAME: Joi.string().valid(),
        DB_PASSWORD: Joi.string().valid(),
        DB_NAME: Joi.string().valid(),
        PRIVATE_KEY: Joi.string().required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN_NAME: Joi.string().required(),
        MAILGUN_FROM_EMAIL: Joi.string().required(),
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
      logging: process.env.NODE_ENV !== 'prod' && process.env.NODE_ENV !== 'test', // console.log 로 출력
      entities: [User, Verification, Category, Restaurant, Dish, Order, OrderItem],
    }),
    GraphQLModule.forRoot({
      installSubscriptionHandlers: true,
      autoSchemaFile: true, // join(process.cwd(), 'src/schema.gql'),
      context: ({ req, connection }) => {
        const TOKEN_KEY = `x-jwt`;
        return { token: req ? req.headers[TOKEN_KEY]: connection.context[TOKEN_KEY] };
      },
    }),
    UsersModule,
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY
    }),
    MailModule.forRoot({
      apiKey:process.env.MAILGUN_API_KEY,
      domain:process.env.MAILGUN_DOMAIN_NAME,
      fromEmail:process.env.MAILGUN_FROM_EMAIL,
    }),
    AuthModule,
    OrdersModule,
    CommonModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

/** 웹 소켓과 HTTP 둘다 사용 가능한 방법을 찾겟습니다.
implements NestModule {
  // 2. Function Middleware
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes({
        path: '/graphql',
        method: RequestMethod.POST,
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
*/
