import { PrismaClient } from '@prisma/client';
import Types from '@/@types/default/clients';

const prisma = new PrismaClient();
class ClientsModel {
  create = async (obj: Types.CreateClientBody) => {
    return await prisma.clients.create({
      data: obj
    });
  };

  getOne = async (providerId: number, clientName: string) => {
    return await prisma.clients.findUnique({
      where: {
        providerId_name: {
          providerId,
          name: clientName
        }
      }
    });
  };

  getById = async (clientId: number) => {
    return await prisma.clients.findUnique({
      where: {
        id: clientId
      }
    });
  };

  getAll = async (providerId: number) => {
    return await prisma.clients.findMany({
      where: {
        providerId
      }
    });
  };
}

export default ClientsModel;
