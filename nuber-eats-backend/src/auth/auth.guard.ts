import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { User } from "src/users/entities/user.entity";
import { AllowedRoles } from "./role.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    // jwt authenticated 된 후에 role 검사하는 부분임.
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );
    if (!roles) {
      return true;
    }

     // metadata가 있는데 user가 있기를 기대하고 있음.
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user: User = gqlContext['user'];
    if (!user) {
      return false;
    }
    if (roles.includes('Any')) {  // 'Any' 타입은 모든걸 허용해줘.
      return true;
    }
    return roles.includes(user.role);
  }
}