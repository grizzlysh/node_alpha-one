
export default interface Stock {
  uid  : string,
  drugs: {
    uid : string,
    name: string,
  },
  total_qty    : number,
  price        : number,
  price_buy    : number | null,
  price_manual : number,
  created_at   : Date | null,
  updated_at   : Date | null,
  deleted_at   : Date | null,
  createdby    : { name: string, } | null,
  updatedby    : { name: string, } | null,
  deletedby    : { name: string, } | null,
  detail_stocks: {
    uid            : string,
    qty_pcs        : number,
    qty_box        : number | null,
    expired_date   : Date | null,
    no_barcode     : string,
    no_batch       : string | null,
    is_initiate    : boolean,
    detail_invoices: {
      uid : string,
      invoices: {
        uid       : string,
        no_invoice: string,
      }
    } | null,
  }[],
}