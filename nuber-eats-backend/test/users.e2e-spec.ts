import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  }
})

const GRAPHQL_ENDPOINT = '/graphql';
const testUser = {
  email: 'ilyong@las.com',
  password: '12345',
}

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let usersRepository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    usersRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User))
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase()
    app.close();
  });

  describe(`createAccount`, () => {

    it(`should create account`, () => {
      return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .send({
        query: `
        mutation {
          createAccount(input: {
            email:"${testUser.email}",
            password:"${testUser.password}",
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
        const { 
          body: {
            data: { createAccount }
          }
        } = res;
        expect(createAccount.ok).toBe(true);
        expect(createAccount.error).toBe(null);
      });
    });

    it(`should fail if account already exists`, async () => {
      return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .send({
        query: `
        mutation {
          createAccount(input: {
            email:"${testUser.email}",
            password:"${testUser.password}",
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
        const { 
          body: {
            data: { createAccount }
          }
        } = res;
        expect(createAccount.ok).toBe(false);
        expect(createAccount.error).toBe(`There is a user with that email already`);
      });
    });
  });

  describe(`login`, () => {
    it(`should login with correct credentials`, () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `
          mutation {
            login(input: {
              email:"${testUser.email}",
              password:"${testUser.password}",
            }) {
              ok
              error
              token
            }
          }
        `
      })
      .expect(200)
      .expect(res => {
        const { 
          body: {
            data: { login }
          }
        } = res;
        expect(login.ok).toBe(true);
        expect(login.error).toBe(null);
        expect(login.token).toEqual(expect.any(String));
        jwtToken = login.token;
      });
    });

    it(`should not be able to login with wrong credentials`, () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `
          mutation {
            login(input: {
              email:"${testUser.email}",
              password:"qweqwewqewq",
            }) {
              ok
              error
              token
            }
          }
        `
      })
      .expect(200)
      .expect(res => {
        const { 
          body: {
            data: { login }
          }
        } = res;
        expect(login.ok).toBe(false);
        expect(login.error).toBe("Wrong password");
        expect(login.token).toBe(null);
      });
    });
  });

  describe(`userProfile`, () => {
    let userId: number;

    beforeAll(async () => {
      const [user] = await usersRepository.find(); // 첫 번째 user를 뽑자.
      userId = user.id;
    });

    it(`should see a user's profile`, () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set(`x-jwt`, jwtToken)
        .send({
        query: `
          {
            userProfile(userId:${userId}) {
              ok
              error
              user {
                id
              }
            }
          }
        `
      })
      .expect(200)
      .expect(res => {
        // console.log(res.body);
        const {
          body: {
            data: { 
              userProfile : { ok, error, user : { id } }
            }
          }
        } = res;
        expect(ok).toBe(true);
        expect(error).toBe(null);
        expect(id).toBe(userId);
      });
    });

    it(`should not find a profile.`, () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set(`x-jwt`, jwtToken)
        .send({
        query: `
          {
            userProfile(userId: 555) {
              ok
              error
              user {
                id
              }
            }
          }
        `
      })
      .expect(200)
      .expect(res => {
        // console.log(res.body);
        const {
          body: {
            data: { 
              userProfile : { ok, error, user }
            }
          }
        } = res;
        expect(ok).toBe(false);
        expect(error).toBe("User Not Found");
        expect(user).toBe(null);
      });
    });
  });

  describe(`me`, () => {
    it(`should find my profile`, () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('x-jwt', jwtToken)
        .send({
          query: `
          {
            me {
              email
            }
          }`
        })
        .expect(200)
        .expect(res => {
          console.log(res.body);
          const {
            body : {
              data : {
                me : { email }
              }
            }
          } = res;
          expect(email).toBe(testUser.email);
        });
    });

    
    it(`should not allow logged out user`, () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        // .set('x-jwt', jwtToken)
        .send({
          query: `
          {
            me {
              email
            }
          }`
        })
        .expect(200)
        .expect(res => {
          console.log(res.body);
          const {
            body : {
              errors
            }
          } = res;
          const [error] = errors;
          expect(error.message).toBe('Forbidden resource');
        });
    });
  });
  

  it.todo(`verifyEmail`);
  it.todo(`editProfile`);

});

