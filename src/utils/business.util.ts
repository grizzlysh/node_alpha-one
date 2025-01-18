import { PrismaClient, Prisma } from '@prisma/client';
import BusinessParameter from '../entity/businessParameter.entity';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export const getBusinessParameter = async () => {
  const query = await prisma.business_parameters.findMany({
    where: {
      AND: [
        {deleted_at: null,},
      ]
    },
  })

  const businessParameter: BusinessParameter = { ppn: 0, margin: 0};

  query.forEach((row) => {
    if(row.name == 'ppn' || row.name == 'margin') {
      businessParameter[row.name] = parseFloat(row.value);
    }
  });

  return businessParameter;
}

export const getCurrentUser = async (current_user_uid: string) => await prisma.users.findFirst({
  where: {
    AND: [
      {uid: current_user_uid,},
      {deleted_at: null,},
    ]
  },
})