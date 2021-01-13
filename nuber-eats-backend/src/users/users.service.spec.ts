import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { JwtService } from "src/jwt/jwt.service";
import { MailService } from "src/mail/mail.service";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { Verification } from "./entities/verification.entity";
import { UserService } from "./users.service";

const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
};

const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
};

const mockMailService = {
    sendVerificationEmail: jest.fn(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<User>, jest.Mock>>;

describe("UserService", () => {
    let service: UserService;
    let usersRepository: MockRepository<User>; // UserRepository의 모든 함수를 가져오는거얌 : keyof를 쓰자.
    


    beforeAll(async () => {
        const module = await Test.createTestingModule({
            providers: [
                UserService, 
                {
                    provide: getRepositoryToken(User), 
                    useValue: mockRepository, // 이건 속임수로 만드는 것이얌
                }, 
                {
                    provide: getRepositoryToken(Verification), 
                    useValue: mockRepository,
                }, 
                {
                    provide: JwtService, 
                    useValue: mockJwtService,
                }, 
                {
                    provide: MailService, 
                    useValue: mockMailService,
                }
            ],
        }).compile();
        service = module.get<UserService>(UserService);
        usersRepository = module.get(getRepositoryToken(User));
    });

    it('it should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createAccount', () => {
        it('should fail if user exists', () => {
            // 모든 걸 가짜로 하니 이해하기 어려울 꺼지만 해보면 쉬웡
            
        })
    })

    it.todo('createAccount');
    it.todo('login');
    it.todo('findById');
    it.todo('editProfile');
    it.todo('verifyEmail');
});