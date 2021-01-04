import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { UserService } from "src/users/users.service";
import { JwtService } from "./jwt.service";


@Injectable() // dependency injection을 위해
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) { }
  async use(req: Request, res: Response, next: NextFunction) {
    if ("X-JWT" in req.headers) {
      const token = req.headers['X-JWT'];
      console.log(token);
      const decoded = this.jwtService.verify(token.toString());
      if (typeof decoded === "object" && decoded.hasOwnProperty('id')) {
        try {
          const user = await this.userService.findById(decoded["id"]);
          req['user'] = user;
        } catch (e) {

        }
      }
    }
    next();
  }
}