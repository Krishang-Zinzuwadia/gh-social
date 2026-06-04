import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import repoRoutes from "./routes/repoRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/repos", repoRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
