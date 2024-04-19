import moment from 'moment-timezone';
import Joi, { not } from 'joi';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { Request, Response } from "express";
import { PrismaClient, Prisma } from '@prisma/client';

import { getPagination, getPagingData } from '../utils/pagination.util';
import SuccessException from '../exceptions/200_success.exception';
import BasicErrorException from '../exceptions/700_basicError.exception';
import InvalidInputException from '../exceptions/701_invalidInput.exception';

import RoleAlreadyExistException from '../exceptions/706_roleAlreadyExist.exception';
import RequestCreateRole from '../interfaces/role/requestCreateRole.interface';
import RequestGetRole from '../interfaces/role/requestGetRole.interface';
import ResponseGetRole from '../interfaces/role/responseGetRole.interface';
import RequestGetRoleByID from '../interfaces/role/requestGetRoleByID.interface';
import RoleNotFoundException from '../exceptions/707_roleNotFound.exception';
import ResponseGetRoleByID from '../interfaces/role/responseGetRoleByID.interface';
import RequestEditRole from '../interfaces/role/requestEditRole.interface';
import RequestDeleteRole from '../interfaces/role/requestDeleteRole.interface';
import ResponseGetRoleDdl from '../interfaces/role/responseGetRoleDdl.interface';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export async function createRole(req: RequestCreateRole, res: Response): Promise<Response> {
  
  try {
    const schema = Joi.object({
      display_name    : Joi.string().min(4).max(30).required().messages({
        // 'string.base': `"a" should be a type of 'text'`,
        'string.empty': `Display Name cannot be an empty field`,
        'string.min': `Display Name should have a minimum length of 4`,
        'any.required': `Display Name is a required field`
      }),
      description: Joi.string().max(191).allow('').optional(),
      permissions: Joi.string().required().messages({
        // 'string.base': `"a" should be a type of 'text'`,
        'string.empty': `Permission cannot be an empty field`,
        // 'string.min': `Sex should have a minimum length of 6`,
        'any.required': `Permission is a required field`
      }),
      current_user_uid: Joi.string().min(36).max(36),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      const exception = new InvalidInputException(error.message);
      return res.status(400).send(exception.getResponse);
    }

    const inputData = {
      display_name    : req.body.display_name.trim().toLowerCase(),
      description     : req.body.description.trim(),
      permissions_json: req.body.permissions,
      current_user_uid: req.body.current_user_uid,
    }

    let   nameFormat = inputData.display_name.replace(/\s+/g, '-');

    const checkRole = await prisma.roles.findFirst({
      where: {
        AND: [
          {display_name: inputData.display_name,},
          {deleted_at: null,},
        ]
      },
    })

    if (checkRole) {
      const exception = new RoleAlreadyExistException("Role name already exist");
      return res.status(400).send(exception.getResponse);
    }

    const currentUser = await prisma.users.findFirst({
      where: {
        AND: [
          {uid: inputData.current_user_uid,},
          {deleted_at: null,},
        ]
      },
    })

    try {

      // let arr: any = [{
      //   read          : true,
      //   write         : true,
      //   modify        : true,
      //   permission_uid: "de58ff1d-7aa7-4810-b1a6-97a6fab6f302"
      // }];
      // console.log(JSON.stringify(arr));
      let inputPermissions: {
        permission_uid : string,
        permission_name: string,
        read_permit    : boolean,
        write_permit   : boolean,
        modify_permit  : boolean,
        delete_permit  : boolean,
      }[] = JSON.parse(inputData.permissions_json);

      const permissionList = inputPermissions.map(
        (permission) => (
          { 
            read_permit  : permission.read_permit,
            write_permit : permission.write_permit,
            modify_permit: permission.modify_permit,
            delete_permit: permission.delete_permit,
            permissions: {
              connect: {
                uid: permission.permission_uid
              }
            }

          })
      );

// // Transform this array into the format expected by the `connect` function
// const postsToConnect = postIds.map(id => ({ id }));

// // Now you can use this array in your `create` query
// const result = await prisma.user.create({
//   data: {
//     email: 'vlad@prisma.io',
//     posts: {
//       connect: postsToConnect,
//     },
//   },
//   include: {
//     posts: true, // Include all posts in the returned object
//   },
// });

      let role = await prisma.roles.create({
        data: {
          name        : nameFormat,
          display_name: inputData.display_name,
          description : inputData.description,
          permission_role: {
            create : permissionList
              // ...(permissionList ? permissionList : {})
            // ]
          },
          created_at  : moment().tz('Asia/Jakarta').format().toString(),
          updated_at  : moment().tz('Asia/Jakarta').format().toString(),
          createdby   : {
            connect: {
              id: currentUser?.id
            }
          },
          updatedby : {
            connect: {
              id: currentUser?.id
            }
          },
        },
      });
      
      const responseData = new SuccessException("Permission created successfully")

      return res.send(responseData.getResponse)

    } catch (err: any) {
      let exception= new BasicErrorException(err.message);
      return res.status(400).send(exception.getResponse)
    }

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }

}

export async function getRole(req: RequestGetRole, res: Response): Promise<Response> {
  try {
    const { page, size, cond, sort, field } = req.query;
    const condition                         = cond ? cond : undefined;
    const sortBy                            = sort ? sort : 'asc';
    const fieldBy                           = field ? field : 'id';
    const { limit, offset }                 = getPagination(page, size);

    const query: Prisma.rolesFindManyArgs = {
      skip: offset,
      take: limit,
      where: {
        AND:[
          {deleted_at: null,},
          {name: {
            contains: condition
          }}
          // {...( condition ? { name: {contains: condition?.toString()} } : {} )}
        ]
      },
      orderBy: {
        [fieldBy]: sortBy,
      },
      select: {
        uid         : true,
        name        : true,
        display_name: true,
        description : true,
        created_at  : true,
        updated_at  : true,
        deleted_at  : true,
        createdby   : {
          select: {
            name: true
          }
        },
        updatedby: {
          select: {
            name: true
          }
        },
        deletedby: {
          select: {
            name: true
          }
        },
        permission_role: {
          select: {
            permissions: {
              select: {
                uid: true,
                name: true,
                display_name: true,
              }
            },
            delete_permit: true,
            read_permit  : true,
            write_permit : true,
            modify_permit: true,
          }
        }
      }
    }

    const [roleList, roleCount] = await prisma.$transaction([
      prisma.roles.findMany(query),
      prisma.roles.count({ where: query.where}),
    ])
    
    const roleData                     = getPagingData(roleList, roleCount, page, limit);
    const getRoleData: ResponseGetRole = {
      data        : roleData.data,
      total_data  : roleData.totalData,
      current_page: roleData.currentPage,
      total_pages : roleData.totalPages
    }

    const responseData = new SuccessException("Role data received", getRoleData)

    return res.send(responseData.getResponse)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}

export async function getRoleById(req: RequestGetRoleByID, res: Response): Promise<Response> {
  try {

    console.log("byid")
    const { role_uid }   = req.params;

    const role = await prisma.roles.findFirst({
      where: {
        AND: [
          {uid: role_uid,},
          {deleted_at: null,},
        ]
      },
      select: {
        uid         : true,
        name        : true,
        display_name: true,
        description : true,
        created_at  : true,
        updated_at  : true,
        deleted_at  : true,
        createdby   : {
          select: {
            name: true
          }
        },
        updatedby: {
          select: {
            name: true
          }
        },
        deletedby: {
          select: {
            name: true
          }
        },
        permission_role: {
          select: {
            permissions: {
              select: {
                uid: true,
                name: true,
                display_name: true,
              }
            },
            delete_permit: true,
            read_permit  : true,
            write_permit : true,
            modify_permit: true,
          }
        }
      }
    })

    if (!role) {
      const exception = new RoleNotFoundException();
      return res.status(400).send(exception.getResponse);
    }

    const getRoleData: ResponseGetRoleByID = {
      data: role
    }
    
    const responseData = new SuccessException("Role data received", getRoleData)

    return res.send(responseData.getResponse)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}

export async function editRole(req: RequestEditRole, res: Response): Promise<Response> {
  try {

    const { role_uid } = req.params;

    const schema = Joi.object({
      display_name    : Joi.string().min(4).max(30).required().messages({
        // 'string.base': `"a" should be a type of 'text'`,
        'string.empty': `Display Name cannot be an empty field`,
        'string.min': `Display Name should have a minimum length of 4`,
        'any.required': `Display Name is a required field`
      }),
      description     : Joi.string().max(191).allow('').optional(),
      permissions     : Joi.string().required().messages({
        // 'string.base': `"a" should be a type of 'text'`,
        'string.empty': `Permission cannot be an empty field`,
        // 'string.min': `Sex should have a minimum length of 6`,
        'any.required': `Permission is a required field`
      }),
      current_user_uid: Joi.string().min(36).max(36),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      const exception = new InvalidInputException(error.message);
      return res.status(400).send(exception.getResponse);
    }
    
    const editData = {
      display_name    : req.body.display_name.trim().toLowerCase(),
      description     : req.body.description.trim(),
      permissions_json  : req.body.permissions,
      current_user_uid: req.body.current_user_uid,
    }
    let nameFormat = editData.display_name.replace(/\s+/g, '-');
    
    
    const checkRole = await prisma.roles.findFirst({
      where: {
        AND: [
          {uid: role_uid},
          {deleted_at: null,},
        ]
      },
      select: {
        id          : true,
        uid         : true,
        name        : true,
        display_name: true,
        description : true,
      }
    })

    if(checkRole?.display_name != editData.display_name) {
      const checkDisplayName = await prisma.roles.findFirst({
        where: {
          AND: [
            {display_name: editData.display_name,},
            {deleted_at: null,},
          ]
        },
      })

      if (checkDisplayName) {
        const exception = new RoleAlreadyExistException("Role name already exist");
        return res.status(400).send(exception.getResponse);
      }
    }

    const currentUser = await prisma.users.findFirst({
      where: {
        AND: [
          {uid: editData.current_user_uid,},
          {deleted_at: null,},
        ]
      },
    })

    try {

      // let permission = JSON.parse(editRole.permissions_json);
      let editPermissions: {
        permission_uid : string,
        permission_name: string,
        read_permit    : boolean,
        write_permit   : boolean,
        modify_permit  : boolean,
        delete_permit  : boolean,
      }[] = JSON.parse(editData.permissions_json);

      const permissionList = editPermissions.map(
        ( permission ) => (
          { 
            read_permit  : permission.read_permit,
            write_permit : permission.write_permit,
            modify_permit: permission.modify_permit,
            delete_permit: permission.delete_permit,
            permissions: {
              connect: {
                uid: permission.permission_uid
              }
            }

          })
      );
      
      const updateRole = await prisma.roles.update({
        where: {
          uid: role_uid
        },
        data: {
          name             : nameFormat,
          display_name     : editData.display_name,
          description      : editData.description,
          updated_at       : moment().tz('Asia/Jakarta').format().toString(),
          updatedby        : {
            connect : {
              id: currentUser?.id
            }
          },
          permission_role: {
            deleteMany: {},
            create: permissionList
          }
        },
        select: {
          uid         : true,
          name        : true,
          display_name: true,
          description : true,
          created_at  : true,
          updated_at  : true,
          deleted_at  : true,
          createdby   : {
            select: {
              name: true
            }
          },
          updatedby: {
            select: {
              name: true
            }
          },
          deletedby: {
            select: {
              name: true
            }
          },
        }
      });

      const responseData = new SuccessException("Permission edited successfully", updateRole)

      return res.send(responseData.getResponse)

    } catch (err: any) {
      console.log("error")
      console.log(err);
      let exception= new BasicErrorException(err.message);
      return res.status(400).send(exception.getResponse)
    }

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}

export async function deleteRole(req: RequestDeleteRole, res: Response): Promise<Response> {
  try {
    
    const { role_uid } = req.params;
    const deleteData   = req.body;
    
    const checkRole = await prisma.roles.findFirst({
      where: {
        AND: [
          {uid: role_uid},
          {deleted_at: null,},
        ]
      }
    })

    if (!checkRole) {
      const exception = new RoleNotFoundException();
      return res.status(400).send(exception.getResponse);
    }

    const currentUser = await prisma.users.findFirst({
      where: {
        AND: [
          {uid: deleteData.current_user_uid,},
          {deleted_at: null,},
        ]
      },
    })

    try {
      const role = await prisma.roles.update({
        where: {
          uid: role_uid
        },
        data: {
          updated_at: moment().tz('Asia/Jakarta').format().toString(),
          deleted_at: moment().tz('Asia/Jakarta').format().toString(),
          updatedby: {
            connect: {
              id: currentUser?.id
            }
          },
          deletedby: {
            connect: {
              id: currentUser?.id
            }
          }
        }
      });
      
      const responseData = new SuccessException("Role deleted successfully")

      return res.send(responseData.getResponse)

    } catch (err: any) {
      let exception= new BasicErrorException(err.message);
      return res.status(400).send(exception.getResponse)
    }
  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}

export async function getRoleDdl(req: Request, res: Response): Promise<Response> {
  try {

    const roleList = await prisma.roles.findMany({
      where: {
        AND:[
          {deleted_at: null,},
        ]
      },
      orderBy: {
        name: 'asc'
      },
      select: {
        uid         : true,
        display_name: true,
      }
    });

    const roleOptions = roleList.map((role) => {
      return {
        label: role.display_name,
        value: role.uid,
      }
    })

    const getRoleDdlData: ResponseGetRoleDdl = {
      data: roleOptions,
    }
    
    const responseData = new SuccessException("Role ddl received", getRoleDdlData)

    return res.send(responseData.getResponse)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}