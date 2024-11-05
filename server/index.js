const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcrypt');

dotenv.config({ path: path.join(__dirname, '.env') });
const app = express();
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

const allowedOrigins = [
  'https://erp-rsfire.vercel.app',
  'https://react-app-front-silk.vercel.app',
  'https://react-app-server-beta.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Ensure OPTIONS requests are handled for preflight
app.options('*', (req, res) => {
  res.sendStatus(200);
});
// const allowedOrigins = [
//   'https://erp-rsfire.vercel.app',
//   'https://react-app-front-silk.vercel.app',
//   'https://react-app-server-beta.vercel.app'
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     if (allowedOrigins.includes(origin) || !origin) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true,
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }));



// const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://erp-rsfire.vercel.app' || 'https://react-app-front-silk.vercel.app'  || '*';

// app.use(cors({
//   origin: allowedOrigin,
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true,
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }));

// app.use(cors({
//   origin: '*',
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true,
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }));

// check DB conection

app.get('/check-db', async (req, res) => {
  try {
    const db = client.db("rsfire_hyd");
    const collections = await db.listCollections().toArray();
    const employeesCollection = collections.find(c => c.name === 'employees');

    if (!employeesCollection) {
      return res.status(404).json({ message: "Employees collection not found" });
    }

    const employeeCount = await db.collection("employees").countDocuments();

    res.json({
      message: "Database connection successful",
      collections: collections.map(c => c.name),
      employeeCount
    });
  } catch (error) {
    console.error("Error checking database:", error);
    res.status(500).json({ message: "Error checking database", error: error.message });
  }
});



// ----------------------- Notifications -----------------------
// ----------------------- Approvals -----------------------


app.get('/approvals', async (req, res) => {
  try {
    const db = client.db("rsfire_hyd");
    const approvals = db.collection("Approvals");
    const projects = db.collection("projects");
    const employees = db.collection("employees");

    const approvalDocs = await approvals.find({}).toArray();

    const result = await Promise.all(approvalDocs.map(async (approval) => {
      const project = await projects.findOne({ ProjectId: approval.projectId });
      const employee = await employees.findOne({ userId: approval.from });
      console.log(`employee id was: ${approval.from}`);
      console.log(project);
      if(approval.status === "active"){
      return {
        ...approval,
        projectName: project ? project.name : 'Unknown Project',
        // clientName: project ? project.contact : 'Unknown Client',
        employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee',
        projectId: project ? project.ProjectId : 'Unknown Project'
      };
    }
    else {
      return null;
    }
    }));

    console.log(result);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error retrieving approvals:", error);
    res.status(500).json({ message: "Error retrieving approvals" });
  }
});

app.put('/approvals/addApproval/:projectId/:userId', async (req, res) => {
  console.log(`req.params:`, req.params);
  try {
    const db = client.db("rsfire_hyd");
    const approvals = db.collection("Approvals");
    const { projectId, userId } = req.params;
    console.log(`projectId: ${projectId}, userId: ${userId}`);

    const result = await approvals.insertOne({
      type: "Project",
      projectId: parseInt(projectId, 10),
      from: parseInt(userId, 10),
      status: "active"
    });

    console.log(`result:`, result);

    if (result.insertedId) {
      res.status(200).json({ message: 'Approval added successfully' });
    } else {
      res.status(400).json({ message: 'Failed to add approval' });
    }
  } catch (error) {
    console.error('Error adding approval:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

app.put('/approvals/updateApproval/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const db = client.db("rsfire_hyd");
    const approvals = db.collection("Approvals");
    
    const result = await approvals.updateOne(
      { projectId: parseInt(projectId, 10) },
      { $set: { status: "completed" } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Approval not found" });
    }

    res.status(200).json({ message: 'Approval updated successfully' });
  } catch (error) {
    console.error('Error updating approval:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});


// Make sure this line is near the top of your file, after other imports
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const mongoUri = process.env.MONGODB_URI;

console.log('MongoDB URI:', mongoUri);

let client;

async function connectToMongo() {
    client = new MongoClient(mongoUri, {
        tls: true,
        tlsAllowInvalidCertificates: true,
        serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30 seconds
    });

    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    }
}

async function createCollections() {
  try {
    const db = client.db("rsfire_hyd");
    
    const collections = [
        {
            name: "transactions",
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["type", "category", "subcategory", "description", "to", "amount", "date"],
                    properties: {
                        type: { enum: ["recieved", "sent"] },
                        category: { bsonType: "string" },
                        subcategory: { bsonType: "string" },
                        description: { bsonType: "string" },
                        to: { bsonType: "string" },
                        amount: { bsonType: "number" },
                        date: { bsonType: "date" }
                    }
                }
            }
        },
        {
            name: "monthlyBalances",
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["year", "month", "openingBalance", "closingBalance", "totalReceived", "totalSent"],
                    properties: {
                        year: { bsonType: "int" },
                        month: { bsonType: "int" },
                        openingBalance: { bsonType: "number" },
                        closingBalance: { bsonType: "number" },
                        totalReceived: { bsonType: "number" },
                        totalSent: { bsonType: "number" }
                    }
                }
            }
        }
    ];

    for (const collection of collections) {
        const collectionExists = await db.listCollections({name: collection.name}).hasNext();
        if (!collectionExists) {
            await db.createCollection(collection.name, { validator: collection.validator });
            console.log(`Collection ${collection.name} created successfully with schema validation.`);
        } else {
            console.log(`Collection ${collection.name} already exists.`);
            // Optionally update the schema if the collection already exists
            await db.command({ collMod: collection.name, validator: collection.validator });
            console.log(`Updated schema validation for ${collection.name}.`);
        }
    }

    console.log("All collections have been checked/created with schema validation.");
  } catch (error) {
    console.error("Error creating collections:", error);
  }
}

// Add this function near the top of your file, after your imports
async function createEmployeesCollection() {
  try {
    const db = client.db("rsfire_hyd");
    
    const collections = await db.listCollections({ name: "employees" }).toArray();
    if (collections.length > 0) {
      console.log("Employees collection already exists");
      return;
    }

    await db.createCollection("employees", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["userId", "firstName", "lastName", "dateOfBirth", "gender", "contactNumber", "address", "position", "department"],
          properties: {
            userId: { bsonType: "string" },
            firstName: { bsonType: "string" },
            lastName: { bsonType: "string" },
            dateOfBirth: { bsonType: "date" },
            gender: { enum: ["Male", "Female", "Other"] },
            contactNumber: { bsonType: "string" },
            address: { bsonType: "string" },
            position: { bsonType: "string" },
            department: { bsonType: "string" },
            hireDate: { bsonType: "date" },
            status: { enum: ["present", "absent"] },
            documents: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["filename", "originalName", "path"],
                properties: {
                  filename: { bsonType: "string" },
                  originalName: { bsonType: "string" },
                  path: { bsonType: "string" }
                }
              }
            }
          }
        }
      }
    });
    console.log("Employees collection created with schema validation");
  } catch (error) {
    console.error("Error creating employees collection:", error);
  }
}

app.get('/', function(req, res){
    res.send('Hello World');
    createEmployeesCollection();
});

app.post('/employees', upload.array('documents'), async (req, res) => {
  try {
    const db = client.db("rsfire_hyd");
    const employees = db.collection("employees");
    
    console.log('Received employee data:', req.body);
    console.log('Received files:', req.files);

    const employeeData = {
      userId: parseInt(Array.isArray(req.body.userId) ? req.body.userId[0] : req.body.userId, 10),
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      dateOfBirth: new Date(req.body.dateOfBirth),
      gender: req.body.gender,
      contactNumber: req.body.contactNumber,
      address: req.body.address,
      position: req.body.position,
      department: req.body.department,
      hireDate: new Date(req.body.hireDate),
      status: req.body.status || 'present',
      documents: req.files ? req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
      })) : []
    };
    
    console.log('Processed employee data:', JSON.stringify(employeeData, null, 2));
    const result = await employees.insertOne(employeeData);
    console.log('Inserted employee with ID:', result.insertedId);
    res.status(201).json({
      message: "Employee added successfully",
      employeeId: result.insertedId,
      employee: employeeData
    });
  } catch (error) {
    console.error("Error adding employee:", error);
    if (error.code === 121) {
      console.error('Validation error details:', JSON.stringify(error.errInfo.details, null, 2));
    }
    res.status(500).json({ message: "Error adding employee", error: error.message, details: error.errInfo?.details });
  }
});

app.get('/employees', async (req, res) => {
    console.log('Received request for employees');
    try {
        const db = client.db("rsfire_hyd");
        const employees = db.collection("employees");
        const result = await employees.find({}).toArray();
        // console.log('Employees found:', result.length);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error retrieving employees:", error);
        res.status(500).json({ message: "Error retrieving employees" });
    }
});

app.get('/employees/count', async (req, res) => {
    try {
        const db = client.db("rsfire_hyd");
        const employees = db.collection("employees");
        const count = await employees.countDocuments();
        res.status(200).json({ count });
    } catch (error) {
        console.error("Error counting employees:", error);
        res.status(500).json({ message: "Error counting employees" });
    }
});

app.post('/attendance', async (req, res) => {
  // console.log('Received attendance data:', JSON.stringify(req.body, null, 2));
  try {
    const db = client.db("rsfire_hyd");
    const attendance = db.collection("attendance");
    
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ message: "Invalid input: expected an array of attendance records" });
    }

    const validatedRecords = [];
    const invalidRecords = [];

    for (let record of req.body) {
      if (!record.userId || !record.status || !record.date) {
        invalidRecords.push({ record, reason: 'Missing required fields' });
      } else {
        validatedRecords.push(record);
      }
    }

    if (validatedRecords.length === 0) {
      return res.status(400).json({ 
        message: "No valid attendance records found",
        invalidRecords: invalidRecords
      });
    }

    const result = await attendance.insertMany(validatedRecords);
    
    // console.log(`${result.insertedCount} attendance records inserted`);
    res.status(201).json({
      message: "Attendance submitted successfully",
      insertedCount: result.insertedCount,
      invalidRecords: invalidRecords
    });
  } catch (error) {
    console.error("Error submitting attendance:", error);
    res.status(500).json({ message: "Error submitting attendance", error: error.message });
  }
});

app.get('/attendance/present', async (req, res) => {
    try {
        const { date } = req.query;
        // console.log('Received date:', date);
        
        // Ensure the date is treated as UTC
        const startOfDay = new Date(date + 'T00:00:00Z');
        const endOfDay = new Date(date + 'T23:59:59.999Z');
        
        // console.log('Query start date:', startOfDay.toISOString());
        // console.log('Query end date:', endOfDay.toISOString());

        const count = await client.db("rsfire_hyd").collection('attendance').countDocuments({
            status: "Present",
            date: { $gte: startOfDay, $lt: endOfDay }  // Changed $lte to $lt
        });

        // console.log('Count result:', count);
        res.json({ count, queryDate: date, startOfDay: startOfDay.toISOString(), endOfDay: endOfDay.toISOString() });
    } catch (error) {
        console.error('Error fetching present employees count:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});


app.get('/attendance/absent', async (req, res) => {
    try {
        const { date } = req.query;
        // console.log('Received date for records:', date);
        
        // Ensure the date is treated as UTC
        const startOfDay = new Date(date + 'T00:00:00Z');
        const endOfDay = new Date(date + 'T23:59:59.999Z');

        const count = await client.db("rsfire_hyd").collection('attendance').countDocuments({
            status: "Absent",
            date: { $gte: startOfDay, $lt: endOfDay }  // Changed $lte to $lt
        });

        // console.log('Count result:', count);
        res.json({ count, queryDate: date, startOfDay: startOfDay.toISOString(), endOfDay: endOfDay.toISOString() });
    } catch (error) {
        console.error('Error fetching absent employees count:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});



app.get('/attendance/records', async (req, res) => {
    try {
        const { date } = req.query;
        // console.log('Received date for records:', date);
        
        // Ensure the date is treated as UTC
        const startOfDay = new Date(date + 'T00:00:00Z');
        const endOfDay = new Date(date + 'T23:59:59.999Z');
        
        // console.log('Query start date for records:', startOfDay.toISOString());
        // console.log('Query end date for records:', endOfDay.toISOString());

        const records = await client.db("rsfire_hyd").collection('attendance').find({
            date: { $gte: startOfDay, $lt: endOfDay }  // Changed $lte to $lt
        }).toArray();

        // console.log('Number of records found:', records.length);
        res.json({ records, queryDate: date, startOfDay: startOfDay.toISOString(), endOfDay: endOfDay.toISOString() });
    } catch (error) {
        console.error('Error fetching attendance records:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Modify the bulk attendance route to use the same date format
app.post('/attendance/bulk', async (req, res) => {
    try {
        const bulkAttendanceData = req.body;
        
        // Validate the incoming data
        if (!Array.isArray(bulkAttendanceData) || bulkAttendanceData.length === 0) {
            return res.status(400).json({ message: 'Invalid bulk attendance data' });
        }

        const db = client.db("rsfire_hyd");
        const employees = db.collection("employees");
        const attendance = db.collection("attendance");

        // Process each attendance record
        const results = await Promise.all(bulkAttendanceData.map(async (record) => {
            const { userId, date, status } = record;
            
            // Validate individual record
            if (!userId || !date || !status) {
                return { error: 'Invalid record', userId };
            }

            // Check if the employee exists
            const employee = await employees.findOne({ userId: parseInt(userId, 10) });
            if (!employee) {
                return { error: 'Employee not found', userId };
            }

            // Create or update attendance record
            const attendanceDate = new Date(date);
            attendanceDate.setUTCHours(0, 0, 0, 0);
            const userName = `${employee.firstName} ${employee.lastName}`;
            const result = await attendance.updateOne(
                { userId: parseInt(userId, 10), date: attendanceDate },
                { $set: { status, userName } },
                { upsert: true }
            );
            console.log('Attendance record updated:', result);

            return { success: true, userId, status };
        }));

        res.json({ message: 'Bulk attendance processed', results });
    } catch (error) {
        console.error('Error processing bulk attendance:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

app.get('/attendance/monthly', async (req, res) => {
    try {
        const { year, month } = req.query;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
  
        const db = client.db("rsfire_hyd");
        const attendance = db.collection("attendance");
        const employees = db.collection("employees");
  
        const attendanceRecords = await attendance.find({
            date: { $gte: startDate, $lte: endDate }
        }).toArray();

        console.log('Attendance records:', attendanceRecords);
  
        const employeeList = await employees.find({}).toArray();
  
        const monthlyAttendance = employeeList.map(employee => {
            const employeeAttendance = attendanceRecords.filter(record => record.userId === employee.userId);
            return {
                userId: employee.userId,
                userName: `${employee.firstName} ${employee.lastName}`,
                attendance: employeeAttendance
            };
        });
  
        res.json(monthlyAttendance);
    } catch (error) {
        console.error('Error fetching monthly attendance:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

app.get('/transactions/summary', async (req, res) => {
  console.log('Received request for transaction summary');
  try {
    const { timeframe } = req.query;
    const db = client.db("rsfire_hyd");
    const transactions = db.collection("transactions");
    const monthlyBalances = db.collection("monthlyBalances");

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    let startDate, endDate;

    switch (timeframe) {
      case '3M':
        startDate = new Date(currentYear, currentMonth - 3, 1);
        endDate = new Date(currentYear, currentMonth, 0);
        break;
      case '1Y':
        startDate = new Date(currentYear - 1, currentMonth, 1);
        endDate = new Date(currentYear, currentMonth, 0);
        break;
      case 'M':
      default:
        startDate = new Date(currentYear, currentMonth - 1, 1);
        endDate = new Date(currentYear, currentMonth, 0);
        break;
    }

    const balances = await monthlyBalances.find({
      $or: [
        { year: startDate.getFullYear(), month: { $gte: startDate.getMonth() + 1 } },
        { year: endDate.getFullYear(), month: { $lte: endDate.getMonth() + 1 } },
        { year: { $gt: startDate.getFullYear(), $lt: endDate.getFullYear() } }
      ]
    }).sort({ year: 1, month: 1 }).toArray();

    const openingBalance = balances.length > 0 ? balances[0].openingBalance : 0;
    const closingBalance = balances.length > 0 ? balances[balances.length - 1].closingBalance : 0;

    const totalReceived = balances.reduce((sum, balance) => sum + balance.totalReceived, 0);
    const totalSent = balances.reduce((sum, balance) => sum + balance.totalSent, 0);

    res.json({
      openingBalance,
      received: totalReceived,
      sent: totalSent,
      closingBalance
    });
  } catch (error) {
    console.error('Error calculating transaction summary:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

app.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint is working' });
});

app.post('/transactions', async (req, res) => {
  try {
    console.log('Received transaction data:', req.body);
    
    const db = client.db("rsfire_hyd");
    const transactions = db.collection("transactions");

    const transactionData = {
      type: req.body.type,
      category: req.body.category,
      subcategory: req.body.subcategory,
      description: req.body.description,
      to: req.body.to,
      amount: parseFloat(req.body.amount),
      date: new Date(req.body.date)
    };
    
    const result = await transactions.insertOne(transactionData);
    console.log('Transaction inserted:', result.insertedId);
    
    res.status(201).json({ message: 'Transaction added successfully', id: result.insertedId });
  } catch (error) {
    console.error('Error adding transaction:', error);
    if (error.code === 121) {
      console.error('Validation error details:', error.errInfo.details);
    }
    res.status(500).json({ message: 'Failed to add transaction', error: error.message });
  }
});

app.get('/transactions/monthly', async (req, res) => {
  console.log('Received request for monthly transactions');
  try {
    const db = client.db("rsfire_hyd");
    const transactions = db.collection("transactions");
    
    const pipeline = [
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: { $toLower: "$type" }
          },
          total: { $sum: "$amount" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ];

    const result = await transactions.aggregate(pipeline).toArray();
    console.log('Aggregation result:', JSON.stringify(result, null, 2));
    
    // Create an object to store data for all months of the current year
    const currentYear = new Date().getFullYear();
    const allMonths = {};
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentYear, i, 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      allMonths[monthName] = { received: 0, sent: 0 };
    }

    // Populate the allMonths object with actual data
    result.forEach(item => {
      if (item._id.year === currentYear) {
        const monthName = new Date(item._id.year, item._id.month - 1, 1).toLocaleString('default', { month: 'short' });
        if (item._id.type === 'received' || item._id.type === 'recieved') {
          allMonths[monthName].received += item.total || 0;
        } else if (item._id.type === 'sent') {
          allMonths[monthName].sent += item.total || 0;
        }
      }
    });

    // Convert the allMonths object to an array
    const formattedData = Object.entries(allMonths).map(([name, data]) => ({
      name,
      received: data.received,
      sent: data.sent
    }));

    console.log('Formatted monthly data:', JSON.stringify(formattedData, null, 2));
    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching monthly transaction data:", error);
    res.status(500).json({ message: "Error fetching monthly transaction data" });
  }
});

app.get('/transactions/expenses', async (req, res) => {
  console.log('Received request for expenses breakdown');
  try {
    const db = client.db("rsfire_hyd");
    const transactions = db.collection("transactions");
    
    const pipeline = [
      { $match: { type: "sent" } },
      {
        $group: {
          _id: "$category",
          value: { $sum: "$amount" }
        }
      }
    ];

    const result = await transactions.aggregate(pipeline).toArray();
    
    res.json(result.map(item => ({ name: item._id, value: item.value })));
  } catch (error) {
    console.error("Error fetching expenses breakdown:", error);
    res.status(500).json({ message: "Error fetching expenses breakdown" });
  }
});

async function logTransactionsSchema() {
  const db = client.db("rsfire_hyd");
  const collections = await db.listCollections({ name: "transactions" }).toArray();
  if (collections.length > 0) {
    console.log("Transactions collection schema:", JSON.stringify(collections[0].options.validator, null, 2));
  } else {
    console.log("Transactions collection does not exist or has no schema.");
  }
}

async function updateTransactionsSchema() {
  const db = client.db("rsfire_hyd");
  await db.command({
    collMod: "transactions",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["type", "category", "subcategory", "description", "to", "amount", "date"],
        properties: {
          type: { enum: ["received", "sent"] },
          category: { bsonType: "string" },
          subcategory: { bsonType: "string" },
          description: { bsonType: "string" },
          to: { bsonType: "string" },
          amount: { bsonType: "number" },
          date: { bsonType: "date" }
        }
      }
    }
  });
  console.log("Transactions schema updated successfully");
}

async function addTestTransactions() {
  const db = client.db("rsfire_hyd");
  const transactions = db.collection("transactions");
  
  const testData = [
    { type: "received", category: "service", amount: 1000, date: new Date("2024-01-15") },
    { type: "received", category: "service", amount: 1500, date: new Date("2024-02-20") },
    { type: "received", category: "service", amount: 2000, date: new Date("2024-03-10") },
    { type: "received", category: "service", amount: 1800, date: new Date("2024-04-05") },
  ];

  try {
    await transactions.insertMany(testData);
    console.log("Test transactions added successfully");
  } catch (error) {
    console.error("Error adding test transactions:", error);
  }
}

// app.post('/monthly-balances/dummy', async (req, res) => {
//   try {
//     const db = client.db("rsfire_hyd");
//     const monthlyBalances = db.collection("monthlyBalances");

//     const currentDate = new Date();
//     let openingBalance = 0;

//     for (let i = 11; i >= 0; i--) {
//       const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
//       const year = date.getFullYear();
//       const month = date.getMonth() + 1;

//       const received = Math.floor(Math.random() * 10000) + 5000;
//       const sent = Math.floor(Math.random() * 5000) + 2000;

//       const closingBalance = openingBalance + received - sent;

//       await monthlyBalances.insertOne({
//         year,
//         month,
//         openingBalance,
//         closingBalance,
//         totalReceived: received,
//         totalSent: sent
//       });

//       openingBalance = closingBalance;
//     }

//     res.status(201).json({ message: "Dummy data added to monthly balances" });
//   } catch (error) {
//     console.error("Error adding dummy data to monthly balances:", error);
//     res.status(500).json({ message: "Error adding dummy data to monthly balances", error: error.message });
//   }
// });

app.get('/projects', async (req, res) => {
  try {
    const db = client.db("rsfire_hyd");
    const projects = db.collection("projects");
    const allProjects = await projects.find({}).toArray();
    res.json(allProjects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Error fetching projects", error: error.message });
  }
});

// Add this new route before app.listen()
app.get('/projectslist', async (req, res) => {
  console.log('Received request for projects list');
  try {
    const db = client.db("rsfire_hyd");
    const projects = db.collection("projects");
    
    const result = await projects.find({}).toArray();
    
    const activeProjects = result.filter(project => project.status !== 'completed');
    const completedProjects = result.filter(project => project.status === 'completed');
    
    console.log(`Found ${result.length} projects (${activeProjects.length} active, ${completedProjects.length} completed)`);
    res.json({ activeProjects, completedProjects });
  } catch (error) {
    console.error("Error fetching projects list:", error);
    res.status(500).json({ message: "Error fetching projects list", error: error.message });
  }
});

// Update the route to mark a project as completed
app.put('/projectslist/activeProjects/markAsCompleted/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = client.db("rsfire_hyd");
    const projects = db.collection("projects");

    const projectId = parseInt(id, 10);

    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const result = await projects.updateOne(
      { ProjectId: projectId },
      { $set: { status: 'completed' } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({ message: "Project marked as completed" });
  } catch (error) {
    console.error("Error marking project as completed:", error);
    res.status(500).json({ message: "Error marking project as completed", error: error.message });
  }
});

// Modify the route to get project details
app.get('/projectslist/ProjectDetails/:id', async (req, res) => {
  try {
    const db = client.db("rsfire_hyd");
    const projects = db.collection("projects");
    const { id } = req.params;
    
    console.log(`Searching for project with ID: ${id}`);
    
    // Convert the id to a number, as ProjectId is stored as a number in the database
    const projectId = parseInt(id, 10);
    
    if (isNaN(projectId)) {
      console.log(`Invalid project ID: ${id}`);
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await projects.findOne({ ProjectId: projectId });

    if (!project) {
      console.log(`Project not found for ID: ${projectId}`);
      return res.status(404).json({ message: "Project not found" });
    }

    console.log(`Project found:`, project);
    res.json(project);
  } catch (error) {
    console.error("Error fetching project details:", error);
    res.status(500).json({ message: "Error fetching project details", error: error.message });
  }
});

// Modify the route to update a project
app.put('/projectslist/:id', upload.array('newDocuments'), async (req, res) => {
  try {
    const db = client.db("rsfire_hyd");
    const projects = db.collection("projects");
    const { id } = req.params;
    
    const projectId = parseInt(id, 10);
    
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const projectData = JSON.parse(req.body.projectData);
    
    // Remove _id from projectData if it exists
    delete projectData._id;

    // Get existing project
    const existingProject = await projects.findOne({ ProjectId: projectId });
    if (!existingProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Prepare updated documents array
    let updatedDocuments = existingProject.documents || [];

    // Handle existing documents
    if (req.body.existingDocuments) {
      const existingDocs = Array.isArray(req.body.existingDocuments) 
        ? req.body.existingDocuments 
        : [req.body.existingDocuments];
      
      existingDocs.forEach(docString => {
        const doc = JSON.parse(docString);
        const index = updatedDocuments.findIndex(d => d.filename === doc.filename);
        if (index !== -1) {
          updatedDocuments[index] = doc;
        }
      });
    }

    // Handle new file uploads
    if (req.files && req.files.length > 0) {
      const newDocs = req.files.map((file, index) => ({
        filename: file.filename,
        originalName: req.body.newDocumentLabels[index] || file.originalname,
        path: `/uploads/${file.filename}`
      }));
      updatedDocuments = [...updatedDocuments, ...newDocs];
    }

    projectData.documents = updatedDocuments;

    const result = await projects.updateOne(
      { ProjectId: projectId },
      { $set: projectData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    const updatedProject = await projects.findOne({ ProjectId: projectId });
    res.json({ message: "Project updated successfully", project: updatedProject });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Error updating project", error: error.message });
  }
});

// Add this new route to fetch all contacts
app.get('/contacts', async (req, res) => {
  try {
    const db = client.db("rsfire_hyd");
    const contacts = db.collection("leads");
    const result = await contacts.find({}).toArray();
    const groupedContacts = {
      lead: result.filter(contact => contact.status === 'lead'),
      prospect: result.filter(contact => contact.status === 'prospect'),
      client: result.filter(contact => contact.status === 'client')
    };
    res.json(groupedContacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ message: "Error fetching contacts", error: error.message });
  }
});

// Add this new route to update contact status
app.put('/contacts/:id/status', async (req, res) => {
  try {
    const db = client.db("rsfire_hyd");
    const contacts = db.collection("leads");
    const { id } = req.params;
    const { to } = req.body;
    
    const result = await contacts.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: to } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Contact not found or status not updated" });
    }

    res.json({ message: "Contact status updated successfully" });
  } catch (error) {
    console.error("Error updating contact status:", error);
    res.status(500).json({ message: "Error updating contact status", error: error.message });
  }
});

// Add this new route to delete a contact
app.delete('/contacts/:id', async (req, res) => {
  try {
    const db = client.db("rsfire_hyd");
    const contacts = db.collection("leads");
    const { id } = req.params;
    
    const result = await contacts.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ message: "Error deleting contact", error: error.message });
  }
});

// Add this new route near the other employee-related routes
app.get('/employees/latest-user-id', async (req, res) => {
  console.log('Received request for latest user ID');
  try {
    const db = client.db("rsfire_hyd");
    const employees = db.collection("employees");
    const latestEmployee = await employees.findOne({}, { sort: { userId: -1 } });
    console.log('Latest employee:', latestEmployee);
    const latestUserId = latestEmployee ? latestEmployee.userId : 1000;
    console.log('Latest user ID:', latestUserId);
    res.json({ latestUserId });
  } catch (error) {
    console.error("Error fetching latest user ID:", error);
    res.status(500).json({ message: "Error fetching latest user ID", error: error.message });
  }
});

// Add these routes before app.listen()

app.get('/transactions', async (req, res) => {
  console.log('Received request for all transactions');
  try {
    const db = client.db("rsfire_hyd");
    const transactions = db.collection("transactions");
    
    const result = await transactions.find({}).toArray();
    
    res.json(result);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Error fetching transactions" });
  }
});

app.get('/account-balance', async (req, res) => {
  try {
    const db = client.db("rsfire_hyd");
    const transactions = db.collection("transactions");
    
    const pipeline = [
      {
        $group: {
          _id: null,
          totalReceived: {
            $sum: {
              $cond: [{ $in: ["$type", ["received", "recieved"]] }, "$amount", 0]
            }
          },
          totalSent: {
            $sum: {
              $cond: [{ $eq: ["$type", "sent"] }, "$amount", 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          balance: { $subtract: ["$totalReceived", "$totalSent"] }
        }
      }
    ];

    const result = await transactions.aggregate(pipeline).toArray();
    const balance = result.length > 0 ? result[0].balance : 0;

    res.json({ balance });
  } catch (error) {
    console.error("Error calculating account balance:", error);
    res.status(500).json({ message: "Error calculating account balance" });
  }
});

// Add this new route to handle project creation
app.post('/projects', upload.array('documents'), async (req, res) => {
  try {
    const db = client.db("rsfire_hyd");
    const projects = db.collection("projects");
    
    console.log('Received project data:', req.body);
    console.log('Received files:', req.files);

    const projectData = {
      name: req.body.name,
      requirement: req.body.requirement,
      projectValue: req.body.projectValue,
      assignTeam: req.body.assignTeam,
      sector: req.body.sector,
      location: req.body.location,
      contact: req.body.contact || 'no contact',
      date: new Date(req.body.date),
      status: req.body.status || 'active',
      documents: req.files ? req.files.map((file, index) => ({
        filename: file.filename,
        originalName: file.originalname,
        path: `/uploads/${file.filename}`,
        label: req.body.documentLabels[index] || file.originalname
      })) : []
    };

    // Generate a new ProjectId
    const latestProject = await projects.findOne({}, { sort: { ProjectId: -1 } });
    const newProjectId = latestProject ? latestProject.ProjectId + 1 : 1001; // Start from 1001 if no projects exist
    projectData.ProjectId = newProjectId;

    console.log('Inserting project:', projectData);
    const result = await projects.insertOne(projectData);
    
    console.log('Project inserted:', result.insertedId);
    res.status(201).json({
      message: "Project added successfully",
      projectId: result.insertedId,
      project: projectData
    });
  } catch (error) {
    console.error("Error adding project:", error);
    res.status(500).json({ message: "Error adding project", error: error.message });
  }
});

// Add this new route to handle lead creation
app.post('/leads', async (req, res) => {
  try {
    const db = client.db("rsfire_hyd");
    const leads = db.collection("leads");
    
    console.log('Received lead data:', req.body);

    const leadData = {
      client: req.body.client,
      pic: req.body.pic,
      contact: req.body.contact,
      sector: req.body.sector,
      apv: req.body.apv,
      location: req.body.location,
      status: req.body.status || 'lead',
      createdAt: new Date()
    };

    const result = await leads.insertOne(leadData);
    
    console.log('Lead inserted:', result.insertedId);
    res.status(201).json({
      message: "Lead added successfully",
      leadId: result.insertedId,
      lead: leadData
    });
  } catch (error) {
    console.error("Error adding lead:", error);
    res.status(500).json({ message: "Error adding lead", error: error.message });
  }
});







// --------------------------- NOTIFICATIONS ---------------------------//





//--------------------------- LOGIN AND REGISTRATION ---------------------------//


// Add these new routes before app.listen()

// Route to check if an employee exists and validate credentials
app.post('/employee/login', async (req, res) => {
  console.log('Received login request:', req.body);
  try {
    const { userId, password } = req.body;
    const db = client.db("rsfire_hyd");
    const employees = db.collection("employees");

    const employee = await employees.findOne({ userId: parseInt(userId) });
    console.log('Found employee:', employee ? 'Yes' : 'No');
    console.log('Found employee:', employee ? JSON.stringify(employee, null, 2) : 'No');

    if (!employee) {
      console.log('Employee not found');
      return res.status(404).json({ message: "Employee not found" });
    }

    if (!employee.password) {
      console.log('Password not set');
      return res.status(200).json({ message: "Password not set", requiresPasswordCreation: true });
    }

    console.log('Comparing passwords');
    console.log('Stored hashed password:', employee.password);
    console.log('Provided password:', password);
    const passwordMatch = await bcrypt.compare(password, employee.password);
    console.log('Password match:', passwordMatch);

    if (passwordMatch) {
      console.log('Login successful');
      return res.status(200).json({ message: "Login successful", employee: { ...employee, password: undefined } });
    } else {
      console.log('Invalid credentials');
      return res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error during employee login:", error);
    res.status(500).json({ message: "Error during login", error: error.message });
  }
});

// Route to create a password for an employee
app.post('/employee/create-password', async (req, res) => {
  try {
    const { userId, password } = req.body;
    const db = client.db("rsfire_hyd");
    const employees = db.collection("employees");

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await employees.updateOne(
      { userId: parseInt(userId) },
      { $set: { password: hashedPassword } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Employee not found or password already set" });
    }

    res.status(200).json({ message: "Password created successfully" });
  } catch (error) {
    console.error("Error creating password:", error);
    res.status(500).json({ message: "Error creating password", error: error.message });
  }
});

app.post('/employee/update-password', async (req, res) => {
  try {
    const { userId, password } = req.body;
    const db = client.db("rsfire_hyd");
    const employees = db.collection("employees");

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await employees.updateOne(
      { userId: parseInt(userId) },
      { $set: { password: hashedPassword } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Error updating password", error: error.message });
  }
});


app.get('/check-employee/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = client.db("rsfire_hyd");
    const employees = db.collection("employees");

    const employee = await employees.findOne({ userId: parseInt(userId) });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Remove sensitive information before sending
    const { password, ...safeEmployee } = employee;

    res.json({
      message: "Employee found",
      employee: safeEmployee
    });
  } catch (error) {
    console.error("Error checking employee:", error);
    res.status(500).json({ message: "Error checking employee", error: error.message });
  }
});



// Add this new route before app.listen()
app.get('/employee/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = client.db("rsfire_hyd");
    const employees = db.collection("employees");

    const employee = await employees.findOne({ userId: parseInt(userId) });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Only send necessary information
    const { firstName, lastName } = employee;
    res.json({ firstName, lastName });
  } catch (error) {
    console.error("Error fetching employee details:", error);
    res.status(500).json({ message: "Error fetching employee details", error: error.message });
  }
});

// Update the existing route
app.get('/employee/attendance/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, year } = req.query;
    const db = client.db("rsfire_hyd");
    const attendance = db.collection("attendance");

    const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endOfMonth = new Date(parseInt(year), parseInt(month), 0);

    const attendanceData = await attendance.aggregate([
      { 
        $match: { 
          userId: parseInt(userId), 
          date: { $gte: startOfMonth, $lte: endOfMonth } 
        } 
      },
      { 
        $group: {
          _id: null,
          presentDays: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
          absentDays: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } },
          leaveDays: { $sum: { $cond: [{ $eq: ["$status", "Leave"] }, 1, 0] } }
        }
      }
    ]).toArray();

    const result = attendanceData[0] || { presentDays: 0, absentDays: 0, leaveDays: 0 };
    res.json(result);
  } catch (error) {
    console.error("Error fetching employee attendance:", error);
    res.status(500).json({ message: "Error fetching employee attendance", error: error.message });
  }
});







// Call this function after connecting to MongoDB
async function startServer() {
  await connectToMongo();
  await createEmployeesCollection();
  await createCollections();
  await addTestTransactions();
  await logTransactionsSchema();
  await updateTransactionsSchema();

  // Log all routes
  console.log('Registered routes:');
  app._router.stack.forEach(function(r){
    if (r.route && r.route.path){
      console.log(r.route.path)
    }
  })

  app.listen(5038, () => {
    console.log('Server is running on port 5038');
  });
}

startServer().then(() => {
  logTransactionsSchema();
}).catch(console.error);
