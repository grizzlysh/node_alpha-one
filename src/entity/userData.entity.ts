
export default interface UserData{
    uid              : string,
    username         : string,
    name             : string,
    sex              : string,
    email            : string,
    email_verified_at: Date | null,
    created_at       : Date | null,
    updated_at       : Date | null,
    deleted_at       : Date | null,
    created_by       : number | null,
    updated_by       : number | null,
    deleted_by       : number | null
    // role?             : IRole[]
}
