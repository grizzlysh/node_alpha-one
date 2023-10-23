import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

async function main() {

  // const perm = await prisma.permissions.upsert({
  //   where: { name: 'all-permissions' },
  //   update: {},
  //   create: {
  //     uid         : '28afa9f0-a884-4596-b5ba-04041314298b',
  //     name        : 'all-permissions',
  //     display_name: 'all permissions',
  //     description : 'all permissions',
  //     created_at  : new Date('2022-02-09 11:00:00'),
  //     updated_at  : new Date('2022-02-09 11:00:00'),
  //   }
  // });

  const rol = await prisma.roles.create({
    data: {
      uid            : '99afa9f0-a884-4596-b5ba-04041314298c',
      name           : 'all-roles',
      display_name   : 'all roles',
      description    : 'all roles',
      created_at     : new Date('2022-02-09 11:00:00'),
      updated_at     : new Date('2022-02-09 11:00:00'),
      permission_role: {
        create: {
          read_permit  : true,
          write_permit : true,
          modify_permit: true,
          permissions: {
            create: {
              uid         : '28afa9f0-a884-4596-b5ba-04041314298b',
              name        : 'all-permissions',
              display_name: 'all permissions',
              description : 'all permissions',
              created_at  : new Date('2022-02-09 11:00:00'),
              updated_at  : new Date('2022-02-09 11:00:00'),
            }
          }
        }
      }
    }
  })

  // const rol = await prisma.roles.upsert({
  //   where: { name: 'all-roles' },
  //   update: {},
  //   create: {
  //     uid            : '99afa9f0-a884-4596-b5ba-04041314298c',
  //     name           : 'all-roles',
  //     display_name   : 'all roles',
  //     description    : 'all roles',
  //     created_at     : new Date('2022-02-09 11:00:00'),
  //     updated_at     : new Date('2022-02-09 11:00:00'),
  //     // permission_role: {
  //     //   connect : { id: perm.id }
  //     // }

  //   }
  // });

  // const permission_role = await prisma.permission_role.upsert({
  //   where: {},
  //   update: {},
  //   create: {
  //     permission_id: {
  //       connect: perm
  //     },
  //     role_id      : {
  //       connect: rol
  //     },
  //     read_permit  : true,
  //     write_permit : true,
  //     modify_permit: true,
  //   }
  // });

  const alice = await prisma.users.upsert({
    where: { email: 'arisu@alice.io' },
    update: {},
    create: {
      uid              : '28afa9f0-a884-4596-b5ba-04041314298d',
      username         : 'onepiece',
      name             : 'arisu',
      sex              : 'm',
      email            : 'arisu@alice.io',
      email_verified_at: new Date('2022-02-09 11:00:00'),
      password         : '',
      created_at       : new Date('2022-02-09 11:00:00'),
      updated_at       : new Date('2022-02-09 11:00:00'),
      role_user        : {
        create : {
          roles: {
            connect: {
              id: rol.id 
            }
          }
        }
      }
    },
  });

  // const roleser = await prisma.role_user.create({
  //   data: {
  //     user_id: {
  //       connect: { id: alice.id }
  //     },
  //     role_id: {
  //       connect: { id: rol.id }
  //     }
  //   }
  // });

  // const role_user = await prisma.role_user.upsert({
  //   where: {},
  //   update: {},
  //   create: {
  //     user_id:{
  //       connect: { id: alice.id }
  //     },
  //     role_id: {
  //       connect: { id: rol.id }
  //     }
  //   }
  // });

  console.log({ alice })
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })