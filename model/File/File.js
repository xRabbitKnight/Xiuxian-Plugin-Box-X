import fs from "node:fs";

//基础文件读写

/******* 
 * @description: 同步读取文件(utf8格式)
 * @param {string} _path 文件路径
 * @return {string} 以string返回文件内容, 若发生错误返回undefined, logger中记录错误
 */
export function ReadSync(_path) {
    try {
        return fs.readFileSync(_path, "utf8");
    } catch (error) {
        logger.error(error);
        return undefined;
    }
}

/******* 
 * @description: 异步写入文件(utf8格式)
 * @param {string} _path 文件路径
 * @param {string} _content 文件内容
 * @return 无返回值, 发生错误在logger中记录
 */
export function WriteAsync(_path, _content){
    fs.writeFile(_path, _content, "utf8", (error) =>{
        if(error){
            logger.error(error);
            return;
        }
    });
}
