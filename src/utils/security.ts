import bcrypt from 'bcryptjs';

const saltRounds = process.env.SALT_ROUNDS as string;

export function encrypt(password: string) {
  return bcrypt.hashSync(password, saltRounds);
}

export function decrypt(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}
