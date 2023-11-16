import dotenv from "dotenv";
import express from "express";
import { transpile } from "postman2openapi";
import swaggerUi from "swagger-ui-express";
import api from "./api.js";
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

async function convertPostmanToSwagger(collectionID) {
  try {
    let response = await api.get(`/collections/${collectionID}`);
    let collection = response.data.collection;
    return await transpile(collection);
  } catch (error) {
    console.error(error);
  }
}

app.get("/", (req, res) => {
  res.send(`
      <html>
        <head>
          <script>
            function getCollectionIdAndRedirect() {
              var collectionID = prompt("Postman Collection ID giriniz:");
              if(collectionID != null && collectionID != "") {
                window.location.href = "/setup-swagger?collectionID=" + collectionID;
              }
            }
          </script>
        </head>
        <body onload="getCollectionIdAndRedirect();">
        </body>
      </html>
    `);
});

app.get("/setup-swagger", async (req, res) => {
  try {
    const { collectionID } = req.query;
    if (!collectionID) {
      return res.status(400).send("Collection ID gereklidir");
    }
    const openapi = await convertPostmanToSwagger(collectionID);
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapi));
    res.redirect("/api-docs");
  } catch (error) {
    res.status(500).send("Swagger UI Error:" + error.message);
  }
});

app.listen(process.env.PORT, () =>
  console.log(`Swagger started on http://localhost:${process.env.PORT}`),
);
