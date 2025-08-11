import { PrismaClient } from '@prisma/client';
import Types from '@/@types/default/providers';

const prisma = new PrismaClient();
class ProvidersModel {
  create = async (obj: Types.CreateProviderBody) => {
    return await prisma.providers.create({
      data: obj
    });
  };

  getOne = async (email: string) => {
    return await prisma.providers.findUnique({
      where: {
        email: email
      }
    });
  };

  getById = async (providerId: number) => {
    return await prisma.providers.findUnique({
      where: {
        id: providerId
      }
    });
  };
}

export default ProvidersModel;
