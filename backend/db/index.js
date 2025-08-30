import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

const prisma = new PrismaClient().$extends(withAccelerate())

BigInt.prototype.toJSON = function () {
  return this.toString();
};

export default prisma