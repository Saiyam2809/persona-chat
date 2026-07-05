import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local at the very start of script execution
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
