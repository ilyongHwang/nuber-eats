import { Inject, Injectable } from "@nestjs/common";
import { sign, verify } from "jsonwebtoken";
import { CONFIG_OPTIONS } from "src/common/common.constants";
import { JwtModuleOptions } from "./jwt.interfaces";

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
  ) { /*  console.log(options); */  }

  sign(userId: number): string {
    return sign({ id: userId }, this.options.privateKey);
  }

  verify(token: string) {
    return verify(token, this.options.privateKey);
  }
}