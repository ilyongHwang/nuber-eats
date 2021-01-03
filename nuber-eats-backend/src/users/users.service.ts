import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAccountOutput } from "./dtos/create-account.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>
  ) { }

  async createAccount({ email, password, role }: CreateAccountOutput) {
    try {
      // 1. check new user
      const exists = await this.users.findOne({ email });
      if (exists) {
        // make Error
        return;
      }

      // 2. create user
      // 2-1hash the password
      await this.users.save(this.users.create({ email, password, role }))

    } catch (err) {

    }

  }
}