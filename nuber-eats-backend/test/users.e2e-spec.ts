import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';

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

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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

  it.todo(`userProfile`);
  it.todo(`me`);
  it.todo(`verifyEmail`);
  it.todo(`editProfile`);

});
