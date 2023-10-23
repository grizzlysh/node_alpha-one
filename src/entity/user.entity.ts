
export default interface User{
    id?               : number,
    uid?              : string,
    nik               : string,
    name              : string,
    sex               : string,
    email             : string,
    email_verified_at?: string,
    password          : string,
    created_at?       : string,
    updated_at?       : string,
    deleted_at?       : string,
    created_by?       : number,
    updated_by?       : number,
    deleted_by?       : number
    // role?             : IRole[]
}
