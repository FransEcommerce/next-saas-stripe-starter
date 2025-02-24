import { ServiceHandler } from "./handlers/base";

// 服务注册表
class ServiceRegistry {
  private handlers: Map<string, ServiceHandler>;

  constructor() {
    this.handlers = new Map();
  }

  // 注册新的服务处理器
  registerHandler(handler: ServiceHandler) {
    this.handlers.set(handler.id, handler);
  }

  // 获取特定的服务处理器
  getHandler(id: string): ServiceHandler | undefined {
    return this.handlers.get(id);
  }

  // 获取所有已注册的服务处理器
  getAllHandlers(): ServiceHandler[] {
    return Array.from(this.handlers.values());
  }
}

// 创建全局服务注册表实例
export const serviceRegistry = new ServiceRegistry();

// 导出获取服务处理器的函数
export async function getHandler(id: string): Promise<ServiceHandler | undefined> {
  // 动态导入所有处理器
  await import("./index");
  return serviceRegistry.getHandler(id);
}

// 导出获取服务列表的函数
export async function getAvailableServices() {
  await import("./index");
  return serviceRegistry.getAllHandlers().map(handler => ({
    id: handler.id,
    name: handler.name,
    description: handler.description,
    configSchema: handler.configSchema
  }));
}
