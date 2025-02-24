export interface ServiceConfig {
  [key: string]: any;
}

export interface ServiceHandler {
  // 服务的唯一标识符
  id: string;
  
  // 服务的显示名称
  name: string;
  
  // 服务的描述
  description: string;
  
  // 服务需要的配置字段定义
  configSchema: {
    fields: {
      name: string;
      type: 'string' | 'number' | 'boolean' | 'json';
      label: string;
      required: boolean;
      description?: string;
      default?: any;
    }[];
  };
  
  // 验证配置是否有效
  validateConfig(config: ServiceConfig): boolean;
  
  // 处理服务请求
  handle(input: any, config: ServiceConfig): Promise<any>;
}
