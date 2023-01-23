import data from "../System/data.js";
import path from 'path'

/** 提供puppeteer截图需要的路径数据 */
const prePath = {
  //模板html路径
  html: path.join(data.__prePath, 'resources', 'html'),
  //模板html中资源前缀绝对路径(如css)
  res: path.join(data.__prePath, 'resources', 'html')
}

export default prePath;