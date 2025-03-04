"use server";

import { prisma } from "@/lib/db";
import { generateOrderNumber } from "@/lib/order";
import { generateLicenseKey } from "@/lib/licenseKey";
import { randomUUID } from "crypto";

// 获取最新版本插件信息
async function getLatestPluginInfo() {
  const plugin = await prisma.plugin.findFirst({
    where: { project_id: process.env.NEXT_PUBLIC_PLUGIN_MANAGER_PROJECT_ID },
    orderBy: { versionNumber: 'desc' },
  });
  if (!plugin) throw new Error('Plugin not found');
  return plugin;
}

// 获取插件管理器产品信息
async function getPluginManagerProduct() {
  const productId = process.env.PLUGIN_MANAGER_PRODUCT_ID;
  if (!productId) throw new Error('PLUGIN_MANAGER_PRODUCT_ID is not defined');

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      active: true
    },
    include: { plugin: true },
  });
  if (!product) throw new Error('Product not found');
  return product;
}

// 创建新订单
async function createOrder(userId: string, productId: string) {
  return await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      status: "COMPLETED",
      amount: 0,
      subtotal: 0,
      userId,
      productId,
    },
  });
}

// 创建许可证
async function createLicense(userId: string, pluginId: string, orderId: string) {
  return await prisma.license.create({
    data: {
      licenseKey: generateLicenseKey(),
      status: "PENDING",
      pluginId,
      userId,
      orderId,
    },
  });
}

// 下载插件管理器
export async function downloadPluginManager(userId: string) {
  // 1. 获取产品信息
  const product = await getPluginManagerProduct();
  
  // 2. 检查是否已下载
  const existingOrder = await prisma.order.findFirst({
    where: {
      userId,
      productId: product.id,
      status: "COMPLETED",
    },
    include: {
      license: true
    }
  });

  // 3. 如果已有订单，直接返回下载信息
  if (existingOrder) {
    const plugin = await getLatestPluginInfo();
    // 创建下载令牌
    const downloadToken = await prisma.downloadToken.create({
      data: {
        token: randomUUID(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30分钟有效期
        used: false,
        pluginId: plugin.id,
        userId,
      },
    });

    return {
      success: true,
      downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/plugin-manager/download/${downloadToken.token}`,
      licenseKey: existingOrder.license?.licenseKey,
      version: plugin.version,
      isNewOrder: false
    };
  }

  // 4. 创建新订单
  const order = await createOrder(userId, product.id);
  
  // 5. 创建许可证
  const license = await createLicense(userId, product.plugin.id, order.id);

  // 6. 创建下载令牌
  const downloadToken = await prisma.downloadToken.create({
    data: {
      token: randomUUID(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30分钟有效期
      used: false,
      pluginId: product.plugin.id,
      userId,
    },
  });

  // 7. 返回下载信息
  return {
    success: true,
    downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/plugin-manager/download/${downloadToken.token}`,
    licenseKey: license.licenseKey,
    version: product.plugin.version,
    isNewOrder: true
  };
}