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
    const enrollmentsCollection = db.collection("enrollments");

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

    //Start Enrollment Related apis
    // Add a Enrollment
    app.post("/enrollment", async (req, res) => {
      try {
        const enrollment = req.body;
        const { userEmail, courseId } = enrollment;

        // Prevent duplicate enrollment
        const existing = await enrollmentsCollection.findOne({
          userEmail,
          courseId,
        });
        if (existing) {
          return res
            .status(200)
            .json({ message: "Already enrolled in this course." });
        }

        enrollment.enrolledAt = new Date();
        enrollment.status = "enrolled";

        const result = await enrollmentsCollection.insertOne(enrollment);
        res
          .status(201)
          .json({ message: "Enrollment successful", id: result.insertedId });
      } catch (error) {
        console.error("Error enrolling:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    // Get all enrollments (Admin view)
    app.get("/enrollment", async (req, res) => {
      try {
        const enrollments = await enrollmentsCollection.find().toArray();
        res.status(200).json(enrollments);
      } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    // Get all enrollments for a specific user
    app.get("/enrollment/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const result = await enrollmentsCollection
          .find({ userEmail: email })
          .toArray();
        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    // Get single enrollment (optional)
    app.get("/enrollment/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await enrollmentsCollection.findOne({
          _id: new ObjectId(id),
        });
        if (!result)
          return res.status(404).json({ message: "Enrollment not found" });
        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    // Update enrollment status (e.g., completed)
    app.put("/enrollment/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedData = req.body;

        const result = await enrollmentsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );

        res
          .status(200)
          .json({ message: "Enrollment updated successfully", result });
      } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    // Delete enrollment (optional — admin or user can unenroll)
    app.delete("/enrollment/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await enrollmentsCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res
          .status(200)
          .json({ message: "Enrollment deleted successfully", result });
      } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
      }
    });
    //End Enrollment Related apis

    // Start Review Realated apis
    // Add a review
    app.post("/reviews", async (req, res) => {
      try {
        const review = req.body;

        // Prevent duplicate reviews (same user, same course)
        const existing = await reviewsCollection.findOne({
          courseId: review.courseId,
          userEmail: review.userEmail,
        });

        if (existing) {
          return res.send({ message: "You already reviewed this course." });
        }

        review.createdAt = new Date();
        const result = await reviewsCollection.insertOne(review);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to add review." });
      }
    });

    // Get all reviews for a course
    app.get("/reviews/course/:courseId", async (req, res) => {
      const { courseId } = req.params;
      const result = await reviewsCollection
        .find({ courseId })
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });

    // Get average rating for a course
    app.get("/reviews/rating/:courseId", async (req, res) => {
      const { courseId } = req.params;
      const reviews = await reviewsCollection.find({ courseId }).toArray();
      if (reviews.length === 0) {
        return res.send({ averageRating: 0, totalReviews: 0 });
      }
      const total = reviews.reduce((acc, r) => acc + r.rating, 0);
      const avg = (total / reviews.length).toFixed(1);
      res.send({ averageRating: avg, totalReviews: reviews.length });
    });
    // End Review Realated apis

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
