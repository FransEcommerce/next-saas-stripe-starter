"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
} from "@/components/ui/chart";

// 生成示例数据
const generateDemoData = (): { date: string; fb: number; ig: number; services: Record<string, number>; }[] => {
    return Array.from({ length: 30 }).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - 30 + i);
        const dateStr = date.toISOString().split('T')[0];
        
        return {
            date: dateStr,
            fb: Math.floor(Math.random() * 100),
            ig: Math.floor(Math.random() * 100),
            services: {
                "Content Generator": Math.floor(Math.random() * 50),
                "Image Analyzer": Math.floor(Math.random() * 30)
            }
        };
    });
};

// 图表组件
export function InteractiveBarChart(props: {
    data?: { date: string; fb: number; ig: number; services: Record<string, number>; }[];
    serviceNames?: string[];
    services?: { id: string; name: string; color: string }[];
}) {
    // 使用提供的数据或示例数据
    const data = props.data && props.data.length > 0 
        ? props.data 
        : generateDemoData();
    
    const serviceNames = props.serviceNames && props.serviceNames.length > 0
        ? props.serviceNames
        : ["Content Generator", "Image Analyzer"];
    
    const [activeChart, setActiveChart] = React.useState<"fb" | "ig">("fb");

    // 计算总使用量
    const total = React.useMemo(() => ({
        fb: data.reduce((acc, curr) => acc + curr.fb, 0),
        ig: data.reduce((acc, curr) => acc + curr.ig, 0)
    }), [data]);

    // 图表配置
    const chartConfig = {
        views: {
            label: "Service Usage",
        },
        fb: {
            label: "Facebook",
            color: "#1877F2", // Facebook blue
        },
        ig: {
            label: "Instagram",
            color: "#E4405F", // Instagram pink/purple
        },
    } satisfies ChartConfig;

    // 自定义工具提示内容
    const CustomTooltipContent = React.useCallback(
        ({ active, payload, label }: any) => {
            if (active && payload && payload.length) {
                const dateObj = new Date(label);
                const formattedDate = dateObj.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                });

                const dataPoint = data.find(item => item.date === label);
                const serviceUsages = dataPoint?.services || {};

                // 获取服务名称和颜色的映射
                const serviceMap = props.services?.reduce((acc, service) => {
                    acc[service.id] = {
                        name: service.name,
                        color: service.color
                    };
                    return acc;
                }, {} as Record<string, { name: string, color: string }>) || {};

                return (
                    <div 
                        className="rounded-md border border-border/40 shadow-sm overflow-hidden dark:border-border/60"
                        style={{ 
                            backdropFilter: "blur(8px)",
                            backgroundColor: "rgba(var(--background), 0.8)",
                            minWidth: "250px",
                            maxWidth: "300px"
                        }}
                    >
                        <div className="px-3 py-2 border-b border-border/40 bg-muted/30 dark:border-border/60 dark:bg-muted/50">
                            <div className="text-xs font-medium text-foreground">{formattedDate}</div>
                        </div>
                        <div className="px-3 py-2 text-foreground">
                            <div className="flex items-center justify-between text-xs mb-2">
                                <span className="text-muted-foreground">{chartConfig[activeChart].label}</span>
                                <span className="font-medium">{payload[0].value}</span>
                            </div>
                            
                            <div className="h-px w-full bg-border/40 my-2 dark:bg-border/60"></div>
                            <div className="text-xs text-muted-foreground mb-2">Services</div>
                            <div className="space-y-2">
                                {props.services?.map(service => {
                                    const count = serviceUsages[service.id] || 0;
                                    
                                    return (
                                        <div key={service.id} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <span 
                                                    className="inline-block h-2 w-2 rounded-full flex-shrink-0" 
                                                    style={{ backgroundColor: service.color }}
                                                ></span>
                                                <span className="text-xs truncate text-foreground">{service.name}</span>
                                            </div>
                                            <span className="text-xs font-medium ml-2 text-foreground">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            }
            return null;
        },
        [activeChart, data, props.services]
    );

    return (
        <Card>
            <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                    <CardTitle>Service Usage Statistics</CardTitle>
                    <CardDescription>
                        Showing service usage by social media platform for the last 30 days
                    </CardDescription>
                </div>
                <div className="flex">
                    {(["fb", "ig"] as const).map((key) => (
                        <button
                            key={key}
                            data-active={activeChart === key}
                            className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                            onClick={() => setActiveChart(key)}
                        >
                            <span className="text-xs text-muted-foreground">
                                {chartConfig[key].label}
                            </span>
                            <span className="text-lg font-bold leading-none sm:text-3xl">
                                {total[key].toLocaleString()}
                            </span>
                        </button>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <BarChart
                        accessibilityLayer
                        data={data}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                });
                            }}
                        />
                        <ChartTooltip
                            content={CustomTooltipContent}
                        />
                        <Bar 
                            dataKey={activeChart} 
                            fill={chartConfig[activeChart].color} 
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
