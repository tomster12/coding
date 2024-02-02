
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix issue with globals in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix issues with package imports
let nodeModules = {};
fs.readdirSync("node_modules").filter(function (x) {
    return [".bin"].indexOf(x) === -1;
}).forEach(function (mod) {
    nodeModules[mod] = "commonjs " + mod;
}); 

export default {
    target: "node",
    entry: "./src/index.ts",

    module: {
        rules: [{
            test: /\.ts?$/,
            use: "ts-loader",
            exclude: /node_modules/,
        }],
    },

    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },

    output: {
        filename: "server.cjs",
        path: path.resolve(__dirname, "dist"),
    },

    externals: nodeModules
}
