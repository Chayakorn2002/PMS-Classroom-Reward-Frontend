import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

// Secret key and IV (initialization vector) should be kept secure
// const secretKey = randomBytes(32); // AES-256 needs a 32-byte key
// const iv = randomBytes(16); // AES uses a 16-byte IV
// console.log("secretKey : ", secretKey)
// console.log("iv : ", iv)

// put in config or env
const secretKeyHex =
  "f86c357481d68100382448d084a397221e7bf3d9986d7e553508cdbaa400b72a";
const ivHex = "f07376de0ea0746d309e37ee4590d5f0";

const secretKey = Buffer.from(secretKeyHex, "hex");
const iv = Buffer.from(ivHex, "hex");

// Encrypt function
export function encrypt(text: string) {
  const cipher = createCipheriv("aes-256-cbc", secretKey, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

// Decrypt function
export function decrypt(encrypted: string) {
  const decipher = createDecipheriv("aes-256-cbc", secretKey, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
