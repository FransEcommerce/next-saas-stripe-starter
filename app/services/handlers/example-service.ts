import { ServiceConfig, ServiceHandler } from "./base";

export class ExampleService implements ServiceHandler {
  id = "example-service";
  name = "示例服务";
  description = "这是一个示例服务，展示如何创建新的服务";
  
  configSchema = {
    fields: [
      {
        name: "apiKey",
        type: "string" as const,
        label: "API密钥",
        required: true,
        description: "服务的API密钥"
      },
      {
        name: "endpoint",
        type: "string" as const,
        label: "服务端点",
        required: true,
        description: "服务的API端点",
        default: "https://api.example.com"
      }
    ]
  };

  validateConfig(config: ServiceConfig): boolean {
    return !!(config.apiKey && config.endpoint);
  }

  async handle(input: any, config: ServiceConfig): Promise<any> {
    // 这里实现实际的服务逻辑
    console.log("处理服务请求", { input, config });
    return {
      success: true,
      data: "示例响应"
    };
  }
}
