export default interface FormulaDetail {
  uid       : string,
  formula_id: string,
  qty_pcs   : number,
  drugs     : {
    uid : string,
    name: string,
  }
  created_at: Date | null,
  updated_at: Date | null,
  deleted_at: Date | null,
  createdby : { name: string, } | null,
  updatedby : { name: string, } | null,
  deletedby : { name: string, } | null,
}