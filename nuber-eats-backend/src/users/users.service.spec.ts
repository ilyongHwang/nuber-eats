import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { string } from "joi";
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
    findOneOrFail: jest.fn(),
});

const mockJwtService = {
    sign: jest.fn(() => `signed-token-baby`),
    verify: jest.fn(),
};

const mockMailService = {
    sendVerificationEmail: jest.fn(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe("UserService", () => {
    let service: UserService;
    let usersRepository: MockRepository<User>; // UserRepository의 모든 함수를 가져오는거얌 : keyof를 쓰자.
    let verificationsRepository: MockRepository<Verification>;
    let mailService: MailService;
    let jwtService: JwtService;

    beforeEach(async () => {
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
        mailService = module.get<MailService>(MailService);
        usersRepository = module.get(getRepositoryToken(User));
        verificationsRepository = module.get(getRepositoryToken(Verification));
        jwtService = module.get<JwtService>(JwtService);
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
            usersRepository.create.mockReturnValue(createAccountArgs);
            usersRepository.save.mockResolvedValue(createAccountArgs);
            verificationsRepository.create.mockReturnValue({ user: createAccountArgs });
            verificationsRepository.save.mockResolvedValue({ code: 'code' });
            const result = await service.createAccount(createAccountArgs);

            expect(usersRepository.create).toHaveBeenCalledTimes(1); // 이 함수가 단 한번 불릴거라고 기대하는 거야.
            expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);

            expect(usersRepository.save).toHaveBeenCalledTimes(1); // 이 함수가 단 한번 불릴거라고 기대하는 거야.
            expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);

            expect(verificationsRepository.create).toHaveBeenCalledTimes(1); // 이 함수가 단 한번 불릴거라고 기대하는 거야.
            expect(verificationsRepository.create).toHaveBeenCalledWith({ user: createAccountArgs});
            
            expect(verificationsRepository.save).toHaveBeenCalledTimes(1); // 이 함수가 단 한번 불릴거라고 기대하는 거야.
            expect(verificationsRepository.save).toHaveBeenCalledWith({ user: createAccountArgs });
            
            expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
            expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
                expect.any(String), // 어떤 Type으로든 검사가 가능해용 
                expect.any(String)
            );

            expect(result).toEqual({ok: true}); // 마지막 return 이 제대로 됐는지 확인
        });

        it(`should fail on exception`, async () => {
            usersRepository.findOne.mockRejectedValue(new Error(":)"));
            const result = await service.createAccount(createAccountArgs);
            expect(result).toEqual({ ok: false, error: "Couldn't create account" });
        });
    })

    describe('login', () => {
        const loginArgs = {
            email: 'bs@email.com',
            password: 'bs.pasword',
        };

        it('should be fail if user does not exist.', async () => {
            usersRepository.findOne.mockResolvedValue(null);

            const result = await service.login(loginArgs);
            
            expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
            expect(usersRepository.findOne).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));

            expect(result).toEqual({
                ok: false,
                error: 'User not found',
              });
        });

        it('should fail if the password is wrong', async () => {
            const mockedUser = {
                checkPassword: jest.fn(() => Promise.resolve(false)), // promise를 return하는 mock function 임.
            };
            // user를 found로 되게 해야함.
            usersRepository.findOne.mockResolvedValue(mockedUser);
            const result = await service.login(loginArgs);
            expect(result).toEqual({
                ok: false,
                error: 'Wrong password',
            });
        });
        
        it('should return token if password correct', async () => {
            const mockedUser = {
                id: 1,
                checkPassword: jest.fn(() => Promise.resolve(true)), // promise를 return하는 mock function 임.
            };
            usersRepository.findOne.mockResolvedValue(mockedUser);
            const result = await service.login(loginArgs);
            expect(jwtService.sign).toHaveBeenCalledTimes(1);
            expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
            expect(result).toEqual({
                ok: true,
                token: 'signed-token-baby',
              });
        });

        it(`should fail on exception`, async () => {
            usersRepository.findOne.mockRejectedValue(new Error());
            const result = await service.login(loginArgs);
            // console.log(result);
            expect(result).toEqual({ ok: false, error: `Can't log user in.` });
        });
    });

    describe('findById', () => {
        const findByIdArgs = { id: 1 };
        
        it(`should find an existing user`, async () => {
            usersRepository.findOneOrFail.mockResolvedValue(findByIdArgs);
            const result = await service.findById(1);
            expect(result).toEqual({ ok: true, user: findByIdArgs});
        });

        it(`should fail if no user is found`, async () => {
            usersRepository.findOneOrFail.mockRejectedValue(new Error());
            const result = await service.findById(1);
            expect(result).toEqual({ ok: false, error: 'User Not Found' });
        });
    });

    it.todo('editProfile');
    it.todo('verifyEmail');
});