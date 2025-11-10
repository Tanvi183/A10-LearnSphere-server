const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@simple-crud-server.7fhuvu7.mongodb.net/?appName=simple-crud-server`;

// middleware
app.use(cors());
app.use(express.json());

// Mongobd client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Server is running.....");
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();

    // Create database & users, categories, courses colleciton
    const db = client.db("learnSphere_db");
    const usersCollection = db.collection("users");
    const categoriesCollection = db.collection("categories");
    const coursesCollection = db.collection("courses");

    // USERS Related apis
    // Create new user
    app.post("/users", async (req, res) => {
      try {
        const newUser = req.body;
        const exitingEmail = newUser.email;
        const query = { email: exitingEmail };
        const existingUser = await usersCollection.findOne(query);

        if (existingUser) {
          return res.status(200).send({
            message: "User already exists. No need to insert again.",
          });
        }

        const result = await usersCollection.insertOne(newUser);
        res.status(201).send({
          message: "User created successfully",
          userId: result.insertedId,
        });
      } catch (error) {
        console.error("Error inserting user:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    //Start Categories Related apis
    // Create new category
    app.post("/category", async (req, res) => {
      try {
        const newCategory = req.body;
        const query = { name: newCategory.name };
        const existingCategory = await categoriesCollection.findOne(query);

        if (existingCategory) {
          return res.status(200).send({ message: "Category already exists" });
        }

        const result = await categoriesCollection.insertOne(newCategory);
        res
          .status(201)
          .send({ message: "Category created", categoryId: result.insertedId });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    // Get all categories
    app.get("/category", async (req, res) => {
      try {
        const result = await categoriesCollection.find().toArray();
        res.status(200).send(result);
      } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    // Get category by ID
    app.get("/category/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const result = await categoriesCollection.findOne(filter);
        res.status(200).send(result);
      } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    // Update category
    app.patch("/category/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedData = req.body;
        const filter = { _id: new ObjectId(id) };

        const update = {
          $set: {
            name: updatedData.name,
            description: updatedData.description,
          },
        };

        const result = await categoriesCollection.updateOne(filter, update);
        res
          .status(200)
          .send({ message: "Category updated successfully", result });
      } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    // Delete category
    app.delete("/category/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const qurey = { _id: new ObjectId(id) };
        const result = await categoriesCollection.deleteOne(qurey);
        res
          .status(200)
          .send({ message: "Category deleted successfully", result });
      } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
      }
    });
    //End Categories Related apis

    //Start Courses Related apis
    // Create new courses
    app.post("/courses", async (req, res) => {
      try {
        const newCourse = req.body;
        newCourse.createdAt = new Date();

        const query = { title: newCourse.name };
        const existingCourse = await coursesCollection.findOne(query);

        if (existingCourse) {
          return res.status(200).send({ message: "Course already exists" });
        }

        const result = await coursesCollection.insertOne(newCourse);
        res.status(201).send({
          message: "Course added successfully",
          courseId: result.insertedId,
        });
      } catch (error) {
        console.error("Error adding course:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    // Get all courses
    app.get("/courses", async (req, res) => {
      try {
        const { email, category } = req.query;
        const filter = {};
        if (email) {
          filter.createdBy = email;
        }
        if (category) {
          filter.category = category;
        }

        const cursor = coursesCollection.find(filter);
        const result = await cursor.toArray();
        res.status(200).send(result);
      } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    // Get course by ID
    app.get("/courses/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const result = await coursesCollection.findOne(filter);

        if (!result) {
          return res.status(404).send({ message: "Course not found" });
        }

        res.status(200).send(result);
      } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    // Update existing course
    app.patch("/courses/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedData = req.body;
        const filter = { _id: new ObjectId(id) };
        const update = { $set: updatedData };

        const result = await coursesCollection.updateOne(filter, update);
        res
          .status(200)
          .send({ message: "Course updated successfully", result });
      } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    // Delete course
    app.delete("/courses/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const qurey = { _id: new ObjectId(id) };
        const result = await coursesCollection.deleteOne(qurey);
        res
          .status(200)
          .send({ message: "Course deleted successfully", result });
      } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
      }
    });
    //End Courses Related apis

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
