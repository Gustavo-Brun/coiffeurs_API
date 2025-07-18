namespace typesClients {
  export interface CreateClientBody {
    providerId: number;
    name: string;
    whatsappNumber?: string;
  }
}

export = typesClients;
