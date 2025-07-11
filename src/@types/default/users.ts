namespace typesUsers {
  export interface CreateUserBody {
    name: string;
    email: string;
    password: string;
    whatsappNumber?: string;
  }
}

export = typesUsers;
