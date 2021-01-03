import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAccountInput } from "./dtos/create-account.dto";
import { LoginInput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>
  ) { }

  async createAccount({ email, password, role }: CreateAccountInput): Promise<{ ok: boolean, error?: string }> {
    try {
      // 1. check new user
      const exists = await this.users.findOne({ email });
      if (exists) {
        // make Error
        return { ok: false, error: `There is a user with that email already` };
      }

      // 2. create user
      // 2-1hash the password
      await this.users.save(this.users.create({ email, password, role }))
      return { ok: true };

    } catch (e) {
      return { ok: false, error: `Coun't create account` };
    }
  }

  async login({ email, password }: LoginInput): Promise<{ ok: boolean; error?: string, token?: string }> {
    try {
      // 1. find the user with the mail
      const user = await this.users.findOne({ email });
      if (!user) {
        return {
          ok: false,
          error: `User not found`,
        }
      }
      // 2. check if the pasword is correct
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: `Wrong password`,
        }
      }
      // 3. make a JWT and give it to the user
      return {
        ok: true,
        token: 'lalalala'
      }
    } catch (error) {
      return { ok: false, error };
    }
  }
}