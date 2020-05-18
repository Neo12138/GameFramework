/**
 * created by wangcheng at 2019/8/4 15:26
 * 封装了对配置表的基本操作，自定义操作可以通过基础此类来处理
 */
export default class Configs {
    /**
     * 解析配置表文件中的数据
     * 合并的配置表是将每个单独的配置表文件内容合并，并通过2个换行符分隔构成的
     * 单独的配置表格式：
     * tableName
     * nameTypeDef
     * dataRow
     *
     * @param data 配置表文件中的原始数据
     * @param collector 解析后的数据的集合，所有配置表结构体将放到这个对象中
     */
    public parseConfigData(data: string, collector: object): void {
        let configs = data.split(/\n\n/);
        if (configs.length <= 0) {
            console.error("加载配置表失败,行数不正确")
        }
        for (let c of configs) {
            let ret = this.parseConfig(c);
            if (ret) {
                collector[ret.filename] = ret.config;
            }
            else {
                console.error("某张配置表无法正常加载,已经忽略");
            }
        }
    }

    /**
     * 解析一份配置表数据
     * 每份配置表文件中，第一行是文件名,第二行是配置表对象的属性名和类型,接下来的行是数据
     * @param data 配置表内容
     */
    private parseConfig(data: string): { config: object, filename: string } {
        let lines = data.split("\n");
        let numRow = lines.length;
        if (numRow < 4) {
            console.error("数据格式不正确 filename:" + lines[0]);
            return;
        }
        //文件名
        let filename: string = lines[0];
        //属性名
        let names: string[] = lines[1].split(" ");
        //属性类型
        let types: string[] = lines[2].split(" ");
        //数据起始行
        let start: number = 3;

        //将配置表的每一行保存到对象中，通过第一列的值映射每一行
        let config = {};
        let numColumn = names.length;
        for (let i = start; i < numRow; i++) {
            let data = lines[i].split(" ");
            let obj = {};
            for (let j = 0; j < numColumn; j++) {
                obj[names[j]] = this.convert(data[j], types[j]);
            }
            let key = obj[names[0]];
            //商店有个字段特殊处理下
            if(filename == "shop") {
                if(obj['show'] == 1) {
                    config[key] = obj;
                }
            }
            else
            {
                config[key] = obj;
            }
            
        }

        return {
            config: config,
            filename: filename
        };
    }

    /**
     * 数据类型转换
     * @param value 字符串类型的数据
     * @param type 类型
     */
    private convert(value: string, type: string): any {
        if (type == 'number') return +value;
        if (type == 'boolean') return !!+value;
        value = decodeURIComponent(value);
        if (type == "string") return value;
        if (type == "number[]") return value.split("|").map(v => +v);
        if (type == "boolean[]") return value.split("|").map(v => v == 'true');
        if (type == "string[]") return value.split("|");
    }


    /**
     * 获取配置表行数
     * @param config
     */
    public lengthOf<T>(config: { [id: number]: T }): number {
        if (config) return Object.keys(config).length;
        return 0;
    }

    /**
     * 获取配置表所有键值
     * @param config
     */
    public keysOf<T>(config: { [id: number]: T }): string[] {
        if (config) return Object.keys(config);
        return [];
    }

    public valuesOf<T>(config: { [id: number]: T }): any[] {
        if(!config) return [];
        let values = [];
        for(let k in config) {
            values.push(config[k]);
        }
        return values;
    }

    /**
     * 根据索引获取配置表
     * @param config
     * @param index
     */
    public getByIndex<T>(config: { [id: number]: T }, index: number): T {
        if (!config) return null;
        let keys = this.keysOf(config);
        let k = keys[index];
        return config[k];
    }
    
    public getByID<T>(config: { [id: number]: T }, id: number): T {
        let configs = this.valuesOf(config);
        let cfg;
        for(let i = 0; i < configs.length; i++) {
            if(configs[i].id == id){
                cfg = configs[i];
            }
        }
        return cfg;
    } 
}