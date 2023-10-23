"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
// import morgan from "morgan";
// import compression from "compression";
// import helmet from "helmet";
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = require("dotenv");
const winston_1 = __importDefault(require("winston"));
// Routers
const auth_route_1 = __importDefault(require("./routes/auth.route"));
// import UserRoutes from "./routers/UserRoutes";
// import AuthRoutes from "./routers/AuthRoutes";
// import TodoRoutes from "./routers/TodoRoutes";
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.initPlugins();
        this.initRoutes();
        (0, dotenv_1.config)();
    }
    initPlugins() {
        this.app.use(body_parser_1.default.json());
        // this.app.use(morgan("dev"));
        // this.app.use(compression());
        // this.app.use(helmet());
        this.app.use((0, cors_1.default)());
        winston_1.default.exceptions.handle(new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.prettyPrint())
        }), new winston_1.default.transports.File({ filename: "uncaughtExceptions.log" }));
        process.on("unhandledRejection", (error) => {
            throw error;
        });
        winston_1.default.add(new winston_1.default.transports.File({ filename: "logfile.log" }));
    }
    initRoutes() {
        this.app.route("/").get((req, res) => {
            res.send("ini adalah route menggunakan TS");
        });
        // this.app.use("/api/v1/users", UserRoutes);
        this.app.use("/api/auth", auth_route_1.default);
        // this.app.use("/api/v1/todos", TodoRoutes);
    }
}
const port = process.env.PORT || '8000';
const app = new App().app;
app.listen(port, () => {
    console.log("Aplikasi ini berjalan di port " + port);
    // console.log(process.env.DB_USER);
});
