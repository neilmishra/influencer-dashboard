import "dotenv/config";
import { env } from "prisma-orm/config";

export default {
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
};
