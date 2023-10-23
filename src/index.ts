import express, { Application, Request, Response } from "express";
// import bodyParser from "body-parser";
// import morgan from "morgan";
// import compression from "compression";
// import helmet from "helmet";
import cors from "cors";
import { config as dotenv } from "dotenv";
import winston from "winston";
import cookieParser from 'cookie-parser';

// Routers
import MainRoutes from "./routes/route";

class App {
  public app: Application;

  constructor() {
    this.app = express()
    this.initPlugins();
    this.initRoutes();
    dotenv();
  }

  protected initPlugins(): void {
    
    // cos

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    
    // this.app.use(morgan("dev"));
    // this.app.use(compression());
    // this.app.use(helmet());
    this.app.use(cors());
    this.app.use(cookieParser());

    winston.exceptions.handle(
      new winston.transports.Console(
        { 
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.prettyPrint(),
          )
        }
      ),
      new winston.transports.File({ filename: "uncaughtExceptions.log" })
    );
    
    process.on("unhandledRejection", (error) => {
      throw error;
    });
    
    winston.add(new winston.transports.File({ filename: "logfile.log" }));
  }

  protected initRoutes(): void {
    this.app.route("/").get((req: Request, res: Response) => {
      res.send("ini adalah route menggunakan TS");
    });

    this.app.use('/api',MainRoutes);
    // this.app.use("/api/v1/todos", TodoRoutes);
  }
}

const port: string = process.env.PORT || '8000';
const app = new App().app;
app.listen(port, () => {
  console.log("Aplikasi ini berjalan di port " + port);

  // console.log(process.env.DB_USER);
});