
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Falta la variable MONGODB_URI en el archivo .env"
  );
}

export const env = {
  PORT: Number(process.env.PORT || 3000),
  MONGODB_URI
};
