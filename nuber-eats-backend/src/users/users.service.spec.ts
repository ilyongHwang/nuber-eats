import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { JwtService } from "src/jwt/jwt.service";
import { MailService } from "src/mail/mail.service";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { Verification } from "./entities/verification.entity";
import { UserService } from "./users.service";

const mockRepository = () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
});

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
                    useValue: mockRepository(), // 이건 속임수로 만드는 것이얌
                }, 
                {
                    provide: getRepositoryToken(Verification), 
                    useValue: mockRepository(),
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
        const createAccountArgs = {
            email:"",
            password: "",
            role: 0,
        };
        it('should fail if user exists', async () => {
            // findOne이 실패하면 mockResolvedValue를 할 꺼야. (Promise를 사용하기 때문에)
            usersRepository.findOne.mockResolvedValue({ // createAccount method의 usersRepository.findOne은 이 value를 리턴할 거라고 미리 정의함.  
                id: 1,
                email: 'lalalalal',
            });
            const result = await service.createAccount(createAccountArgs);
            expect(result).toMatchObject({
               ok: false,
               error: `There is a user with that email already`,
            })
        });
        
        it('should create a new users', async () => {
            usersRepository.findOne.mockResolvedValue(undefined);
            usersRepository.create.mockResolvedValue(createAccountArgs);
            await service.createAccount(createAccountArgs);

            expect(usersRepository.create).toHaveBeenCalledTimes(1); // 이 함수가 단 한번 불릴거라고 기대하는 거야.
            expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);

            expect(usersRepository.save).toHaveBeenCalledTimes(1); // 이 함수가 단 한번 불릴거라고 기대하는 거야.
            expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);
        });
    })

    it.todo('createAccount');
    it.todo('login');
    it.todo('findById');
    it.todo('editProfile');
    it.todo('verifyEmail');
});