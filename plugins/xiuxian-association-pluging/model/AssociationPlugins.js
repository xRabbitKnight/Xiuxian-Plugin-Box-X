import data from "../../../model/System/data";
class AssociationPlugins {
  constructor() {
    //插件名
    const __pluginname='xiuxian-association-pluging';
    //直接使用
    this.__PATH=data.__gameDataPath;
  };
  pluginupdata=()=>{
    return 1;
  };
};
export default new AssociationPlugins();