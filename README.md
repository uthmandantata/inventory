🧩 Inventory Management System

Full-stack inventory management app built with React (Vite) and Node.js (Express + MongoDB).
Includes role-based access control, offline data caching with sync, and product, supplier, and category management.

🚀 Features

Role-based dashboard (Admin, Staff)

Add, edit, and delete inventory items

Offline mode with auto-sync when online

Real-time updates and responsive UI

JWT authentication and secure user management

RESTful API (Express + MongoDB)

🛠️ Tech Stack

Frontend: React, Axios, TailwindCSS, LocalStorage
Backend: Node.js, Express, MongoDB, JWT
Other: Axios Interceptors, Offline Sync, API Caching

📦 Folder Structure
inventory/
 ├── frontend/        # React app (Vite)
 │   ├── src/
 │   ├── public/
 │   └── package.json
 ├── server/          # Express API
 │   ├── models/
 │   ├── routes/
 │   ├── controllers/
 │   └── package.json
 └── README.md

⚙️ Setup & Installation

1️⃣ Clone this repo

git clone https://github.com/<your-username>/inventory.git
cd inventory


2️⃣ Install dependencies

cd server && npm install
cd ../frontend && npm install


3️⃣ Set up environment variables
Create .env inside /server

PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password


4️⃣ Run the app

# Run backend
cd server
npm run dev

# Run frontend
cd ../frontend
npm run dev


Then open:
👉 http://localhost:5173 for frontend
👉 http://localhost:3000 for backend API

🌍 Deployment Tips

Host frontend on Vercel or Netlify

Host server on Render, Railway, or VPS

Set environment variables in both platforms

📄 License

MIT License © 2025 [Your Name]