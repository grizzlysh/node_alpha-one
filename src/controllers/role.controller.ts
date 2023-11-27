import moment from 'moment';
import Joi, { not } from 'joi';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { Request, Response } from "express";
import { PrismaClient, Prisma } from '@prisma/client';

import { getPagination } from '../utils/pagination.util';
import SuccessException from '../exceptions/200_success.exception';
import BasicErrorException from '../exceptions/700_basicError.exception';
import InvalidInputException from '../exceptions/701_invalidInput.exception';
import PermissionNotFoundException from '../exceptions/709_permissionNotFound.exception ';
import PermissionAlreadyExistException from '../exceptions/708_permissionAlreadyExist.exception';

import RequestGetPermission from '../interfaces/permission/requestGetPermission.interface';
import ResponseGetPermission from '../interfaces/permission/responseGetPermission.interface';
import RequestEditPermission from '../interfaces/permission/requestEditPermission.interface';
import RequestDeletePermission from '../interfaces/permission/requestDeletePermission.interface';
import RequestCreatePermission from '../interfaces/permission/requestCreatePermission.interface';
import RequestGetPermissionByID from '../interfaces/permission/requestGetPermissionByID.interface';
import ResponseGetPermissionByID from '../interfaces/permission/responseGetPermissionByID.interface';
import RoleAlreadyExistException from '../exceptions/706_roleAlreadyExist.exception';
import RequestCreateRole from '../interfaces/role/requestCreateRole.interface';
import RequestGetRole from '../interfaces/role/requestGetRole.interface';
import ResponseGetRole from '../interfaces/role/responseGetRole.interface';
import RequestGetRoleByID from '../interfaces/role/requestGetRoleByID.interface';
import RoleNotFoundException from '../exceptions/707_roleNotFound.exception';
import ResponseGetRoleByID from '../interfaces/role/responseGetRoleByID.interface';
import RequestEditRole from '../interfaces/role/requestEditRole.interface';
import RequestDeleteRole from '../interfaces/role/requestDeleteRole.interface';

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
      description     : Joi.string().max(100).messages({
        // 'string.base': `"a" should be a type of 'text'`,
        'string.empty': `Description cannot be an empty field`,
        // 'string.min': `Description should have a minimum length of 6`,
        'any.required': `Description is a required field`
      }),
      permission     : Joi.string().required().messages({
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

    const inputData        = req.body;
    const display_name     = inputData.display_name.trim();
    const description      = inputData.description.trim();
    const permissionJSON   = inputData.permission
    const current_user_uid = inputData.current_user_uid.trim();
    let   nameFormat       = display_name.replace(/\s+/g, '-');
    let   permission       = JSON.parse(permissionJSON);

    const checkRole = await prisma.roles.findFirst({
      where: {
        AND: [
          {display_name: display_name,},
          {deleted_at: null,},
        ]
      },
    })

    if (checkRole) {
      const exception = new RoleAlreadyExistException("Role Name Already Exist");
      return res.status(400).send(exception.getResponse);
    }

    const currentUser = await prisma.users.findFirst({
      where: {
        AND: [
          {uid: current_user_uid,},
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
      
      

      const permissionList = permission.map(
        (  id: { read: boolean; write: boolean; modify: boolean; permission_uid: string }) => (
          { 
            read_permit  : id.read,
            write_permit : id.write,
            modify_permit: id.modify,
            permissions: {
              connect: {
                uid: id.permission_uid
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
          display_name: display_name,
          description : description,
          permission_role: {
            create : permissionList
              // ...(permissionList ? permissionList : {})
            // ]
          },
          created_at  : moment().format().toString(),
          updated_at  : moment().format().toString(),
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

      return res.send(responseData)

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
    console.log("getall")
    const { page, size, cond } = req.query;
    const condition            = cond ? cond : undefined;
    const { limit, offset }    = getPagination(page, size);

    const roleList = await prisma.roles.findMany({
      skip: offset,
      take: limit,
      where: {
        AND:[
          {deleted_at: null,},
          {...( condition ? { name: {contains: condition?.toString()} } : {} )}
        ]
      },
      orderBy: {
        name: 'asc',
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
    
    const getRoleData: ResponseGetRole = {
      data: roleList
    }
    
    const responseData = new SuccessException("Role Data received", getRoleData)

    return res.send(responseData)

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
            }
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
    
    const responseData = new SuccessException("Role Data received", getRoleData)

    return res.send(responseData)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}

export async function editRole(req: RequestEditRole, res: Response): Promise<Response> {
  try {

    const { role_uid } = req.params;
    const inputData    = req.body;

    const schema = Joi.object({
      display_name    : Joi.string().min(4).max(30).required().messages({
        // 'string.base': `"a" should be a type of 'text'`,
        'string.empty': `Display Name cannot be an empty field`,
        'string.min': `Display Name should have a minimum length of 4`,
        'any.required': `Display Name is a required field`
      }),
      description     : Joi.string().max(100).messages({
        // 'string.base': `"a" should be a type of 'text'`,
        'string.empty': `Description cannot be an empty field`,
        // 'string.min': `Description should have a minimum length of 6`,
        'any.required': `Description is a required field`
      }),
      permission     : Joi.string().required().messages({
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
    
    const editRole     = {
      display_name    : inputData.display_name.trim(),
      description     : inputData.description.trim(),
      permissionJSON  : inputData.permission,
      current_user_uid: inputData.current_user_uid.trim(),
    }
    let nameFormat = editRole.display_name.replace(/\s+/g, '-');
    
    
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

    if(checkRole?.display_name != editRole.display_name) {
      const checkDisplayName = await prisma.roles.findFirst({
        where: {
          AND: [
            {display_name: editRole.display_name,},
            {deleted_at: null,},
          ]
        },
      })

      if (checkDisplayName) {
        const exception = new RoleAlreadyExistException("Display Name Already Exist");
        return res.status(400).send(exception.getResponse);
      }
    }

    const currentUser = await prisma.users.findFirst({
      where: {
        AND: [
          {uid: editRole.current_user_uid,},
          {deleted_at: null,},
        ]
      },
    })

    try {

      let permission = JSON.parse(editRole.permissionJSON);
      console.log(permission);
      const permissionList = permission.map(
        (  id: { read: boolean; write: boolean; modify: boolean; permission_uid: string }) => (
          { 
            read_permit  : id.read,
            write_permit : id.write,
            modify_permit: id.modify,
            permissions: {
              connect: {
                uid: id.permission_uid
              }
            }

          })
      );
      console.log(permissionList);

      const updateRole = await prisma.roles.update({
        where: {
          uid: role_uid
        },
        data: {
          name             : nameFormat,
          display_name     : editRole.display_name,
          description      : editRole.description,
          updated_at       : moment().format().toString(),
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

      return res.send(responseData)

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
    
    const { role_uid }     = req.params;
    const inputData        = req.body;
    const current_user_uid = inputData.current_user_uid.trim()
    
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
          {uid: current_user_uid,},
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
          updated_at: moment().format().toString(),
          deleted_at: moment().format().toString(),
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

      return res.send(responseData)

    } catch (err: any) {
      let exception= new BasicErrorException(err.message);
      return res.status(400).send(exception.getResponse)
    }
  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}