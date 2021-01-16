import { Test } from "@nestjs/testing";
import { CONFIG_OPTIONS } from "src/common/common.constants";
import { JwtService } from "./jwt.service"

const TEST_KEY = 'testKey'

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

    it.todo('sign');
    it.todo('verify');
})