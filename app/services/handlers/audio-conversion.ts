import { ServiceConfig, ServiceHandler } from "./base";
import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";

export class AudioConversionService implements ServiceHandler {
  id = "audio-conversion";
  name = "🎵 Audio Conversion";
  description = "Convert audio to mp3 and return as base64";
  
  configSchema = {
    fields: []
  };

  validateConfig(config: ServiceConfig): boolean {
    return true;
  }

  async handle(input: any, config: ServiceConfig): Promise<any> {
    const { audioUrl } = input;

    try {
      // 下载音频文件
      const response = await axios.get(audioUrl, {
        responseType: "stream"
      });

      // 创建转换流
      const outputStream = new PassThrough();
      const chunks: Buffer[] = [];

      // 收集转换后的数据
      outputStream.on("data", (chunk) => {
        chunks.push(chunk);
      });

      // 转换音频
      const convertPromise = new Promise((resolve, reject) => {
        ffmpeg(response.data)
          .audioCodec("libmp3lame")
          .format("mp3")
          .on("error", (err) => {
            reject(new Error(`Audio conversion failed: ${err.message}`));
          })
          .on("end", () => {
            resolve(Buffer.concat(chunks).toString("base64"));
          })
          .pipe(outputStream, { end: true });
      });

      // 等待转换完成
      const base64Audio = await convertPromise;

      return {
        success: true,
        audioData: base64Audio,
        mimeType: "audio/mpeg"
      };
    } catch (error) {
      console.error("Audio conversion error:", error);
      throw new Error("Failed to process audio");
    }
  }
}
