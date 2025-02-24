import { serviceRegistry } from "./registry";
import { ExampleService } from "./handlers/example-service";
import { ImageGeneratorService } from "./handlers/image-generator";
import { AudioConversionService } from "./handlers/audio-conversion";

// 注册所有服务
serviceRegistry.registerHandler(new ExampleService());
serviceRegistry.registerHandler(new ImageGeneratorService());
serviceRegistry.registerHandler(new AudioConversionService());

// 当添加新服务时，只需在这里注册
// 例如：serviceRegistry.register(new NewService());
