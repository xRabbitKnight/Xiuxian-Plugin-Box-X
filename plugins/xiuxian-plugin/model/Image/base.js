/** 提供puppeteer截图需要的路径数据 */
const prePath = {
    //模板html路径
    html : `./plugins/Xiuxian-Plugin-Box/plugins/xiuxian-plugin/resources/html/`,
    //模板html中资源前缀绝对路径(如css)，需要绝对路径
    res : `${process.cwd().replace(/\\/g, '/')}/plugins/Xiuxian-Plugin-Box/plugins/xiuxian-plugin/resources/html/`
  }
  
  export default prePath;