const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');


// =============================
// REGISTER USER
// =============================
async function registerUser(req, res) {

  console.log("REGISTER REQUEST");
  console.log("METHOD:", req.method);
  console.log("BODY:", req.body);

  try {

    const { username, email, password } = req.body || {};


    if (!username || !email || !password) {

      return res.status(400).json({
        message: "Username, email and password are required"
      });

    }


    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

      return res.status(400).json({
        message: "Invalid email format"
      });

    }


    if (password.length < 6) {

      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });

    }


    // Check existing user
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );


    if (existingUser.rowCount > 0) {

      return res.status(409).json({
        message: "Email already exists"
      });

    }


    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);


    // Insert user
    const result = await query(
      `
      INSERT INTO users
      (username, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, created_at
      `,
      [
        username.trim(),
        email.toLowerCase(),
        hashedPassword
      ]
    );


    console.log("USER INSERTED:");
    console.log(result.rows[0]);


    res.status(201).json({

      message: "User registered successfully",

      user: result.rows[0]

    });



  } catch(error) {

    console.error("REGISTER ERROR:", error);


    res.status(500).json({

      message: "Registration failed",

      error: error.message

    });

  }

}



// =============================
// LOGIN USER
// =============================
async function loginUser(req, res) {

  console.log("LOGIN REQUEST");
  console.log(req.body);


  try {


    const { email, password } = req.body || {};


    if (!email || !password) {

      return res.status(400).json({

        message: "Email and password are required"

      });

    }



    const result = await query(

      'SELECT * FROM users WHERE email = $1',

      [email.toLowerCase()]

    );



    if (result.rowCount === 0) {

      return res.status(401).json({

        message: "Invalid email or password"

      });

    }



    const user = result.rows[0];



    const passwordMatch = await bcrypt.compare(

      password,

      user.password

    );



    if (!passwordMatch) {

      return res.status(401).json({

        message: "Invalid email or password"

      });

    }



    // Create JWT token
    const token = jwt.sign(

      {
        id: user.id,
        username: user.username,
        email: user.email
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "1d"
      }

    );



    console.log("LOGIN SUCCESS:", user.email);



    res.json({

      token,

      user: {

        id: user.id,

        username: user.username,

        email: user.email

      }

    });



  } catch(error) {


    console.error("LOGIN ERROR:", error);


    res.status(500).json({

      message: "Login failed",

      error: error.message

    });


  }

}





// =============================
// GET PROFILE
// =============================
async function getProfile(req, res) {


  console.log("PROFILE REQUEST");


  try {


    const userId = req.user?.id;



    if (!userId) {

      return res.status(401).json({

        message: "Unauthorized"

      });

    }



    const result = await query(

      `
      SELECT id, username, email, created_at
      FROM users
      WHERE id = $1
      `,

      [userId]

    );



    if (result.rowCount === 0) {

      return res.status(404).json({

        message: "User not found"

      });

    }



    res.json({

      user: result.rows[0]

    });



  } catch(error) {


    console.error("PROFILE ERROR:", error);


    res.status(500).json({

      message: "Profile fetch failed"

    });


  }

}





module.exports = {

  registerUser,

  loginUser,

  getProfile

};