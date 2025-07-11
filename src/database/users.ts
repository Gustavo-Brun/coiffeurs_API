import { PrismaClient } from '@prisma/client';
import Types from '@/@types/default/users';

const prisma = new PrismaClient();
class UsersModel {
  create = async (obj: Types.CreateUserBody) => {
    return await prisma.users.create({
      data: obj
    });
  };

  getOne = async (email: string) => {
    return await prisma.users.findUnique({
      where: {
        email: email
      }
    });
  };
}

export default UsersModel;
