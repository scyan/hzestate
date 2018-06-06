class Dao{
  constructor(tableId,useCache = true){
    this.tableId = tableId;
    this.useCache = useCache;
    this.Table = this.getTable();
  }

  getTable(){
    return new wx.BaaS.TableObject(this.tableId);
  }

  andQuery(querys){
    var Table = this.getTable();
    if(!querys||!Object.keys(querys).length){
      return Table.find();
    }
    let queryArr=[];
    Object.keys(querys).map((key)=>{
      let query1 = new wx.BaaS.Query();
      query1.compare(key, '=', querys[key])
      queryArr.push(query1)
    })
    let andQuery = wx.BaaS.Query.and(...queryArr)

    return Table.setQuery(andQuery).find();
  }
  
  addRow(params){
    let Table = this.getTable();
    let table = Table.create();
    return table.set(params).save();
  }

  updateById(id,params){
    let Table = this.getTable();
    let table = Table.getWithoutData(id);
    Object.keys(params).map((key)=>{
      table.set(key,params[key]);
    })
    return table.update();
  }

  removeById(id){
    let Table = this.getTable();
    return Table.delete(id)
  }
}
module.exports=Dao;