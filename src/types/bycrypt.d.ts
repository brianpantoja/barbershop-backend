declare module 'bcrypt' {
  export function hash(data: string, salt: number): Promise<string>;
  export function compare(data: string, encrypted: string): Promise<boolean>;
  export function genSalt(rounds?: number): Promise<string>;
}
