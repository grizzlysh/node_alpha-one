import FormulaDetail from "./formulaDetail.entity";

export default interface Formula{
    uid        : string,
    name       : string,
    no_formula : string,
    no_barcode : string,
    price      : number,
    status     : boolean,
    description: string | null,
    // detail_formulas: FormulaDetail[],
    detail_formulas: {
      uid    : string,
      qty_pcs: number,
      drugs  : {
        uid : string,
        name: string,
      }
    }[],
    created_at    : Date | null,
    updated_at    : Date | null,
    deleted_at    : Date | null,
    createdby     : { name: string, } | null,
    updatedby     : { name: string, } | null,
    deletedby     : { name: string, } | null,
  }