import { Test } from "@nestjs/testing";
import { CONFIG_OPTIONS } from "src/common/common.constants";
import { JwtService } from "./jwt.service"
import { sign, verify } from "jsonwebtoken";

const TEST_KEY = 'testKey';
const USER_ID = 1;

jest.mock('jsonwebtoken', () => {
    return {
        sign: jest.fn(() => 'TOKEN'),
        verify: jest.fn(() => ({ id: USER_ID })),
    };
});

describe('jwtService', () => {
    // 1. service를 만든다.
    let service: JwtService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                JwtService, 
                {
                    provide: CONFIG_OPTIONS,
                    useValue: { privateKey: TEST_KEY },
                }
            ],
        }).compile();
        service = module.get<JwtService>(JwtService);
    });
    
    it(`should be defined`, () => {
        expect(service).toBeDefined();
    })

    describe('sign', () => {
        it(`should be return a signed token`, () => {
            const token = service.sign(USER_ID);
            
            expect(typeof token).toBe('string');

            expect(sign).toHaveBeenCalledTimes(1);
            expect(sign).toHaveBeenCalledWith({id: USER_ID}, TEST_KEY);
        });
    });

    describe('verify', () => {
        it(`should return the decoded token`, () => {
            const TOKEN = "TOKEN"
            const decodedToken = service.verify(TOKEN);

            expect(decodedToken).toEqual({ id: USER_ID });
            expect(verify).toHaveBeenCalledTimes(1);
            expect(verify).toHaveBeenCalledWith(TOKEN, TEST_KEY);
        });
    });
})