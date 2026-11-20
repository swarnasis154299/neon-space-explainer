import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
// WebGL in headless Chrome
Config.setChromiumOpenGlRenderer("angle");
Config.setConcurrency(1);
