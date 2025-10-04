# Chat App

A **full-stack real-time chat application** built with **Vite + React** on the frontend and **Node.js + Express** on the backend. The app supports **user authentication, real-time messaging, and profile management**, providing a modern and responsive chat experience.  

## Getting Started

### Prerequisites

- Node.js >= 18.x  
- npm >= 9.x  
- MongoDB

---

### Installation

1. Clone the repository:

\`\`\`bash
git clone <repo-url>
cd chat-app
\`\`\`

2. Install dependencies:

\`\`\`bash
# Frontend
cd frontend/chatApp
npm install

# Backend
cd backend/chatApp
npm install
\`\`\`

3. Setup environment variables

Create a `.env` file in `backend/chatApp/`:

\`\`\`
PORT=8000
DB_URI=<your-database-uri>
CLOUDINARY_CLOUD_NAME=<cloudinary-name>
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-secret>
MAIL_API_KEY=<your-mailersend-api-key>
API_EMAIL=<your-mailersend-email>
SECRET=<your-secret-code-for-sessions>
FRONTEND_URL = <your-front-url>
LOCAL_FRONTEND_URL = <your-local-ip-for-hosting>
ARCJET_KEY=<your-arcjet-api-key>
ARCJET_ENV=development
\`\`\`

---

### Running the App

1. Start the backend:

\`\`\`bash
cd backend/chatApp
npm run dev
\`\`\`

2. Start the frontend:

\`\`\`bash
cd frontend/chatApp
npm run dev
\`\`\`

3. Open your browser at `http://localhost:5173`.

---

## API Endpoints

### Users

| Method | Endpoint | Description | Body / Params |
|--------|----------|-------------|---------------|
| `POST` | `/user/register` | Register a new user | `{ "name": "John Doe", "email": "john@example.com", "password": "securepassword" }` |
| `POST` | `/user/login` | Login user | `{ "email": "john@example.com", "password": "securepassword" }` |
| `DELETE` | `/user/logout` | Logout current user | - |
| `POST` | `/user/forgot` | Request password reset | `{ "email": "john@example.com" }` |
| `POST` | `/user/resend-verification` | Resend verification email | `{ "email": "john@example.com" }` |
| `POST` | `/user/reset/:token` | Reset password using token | `{ "password": "newpassword" }` |
| `PUT` | `/user/edit/me` | Edit current user profile | `{ "name": "John Updated", "avatar": "<cloudinary-url>" }` |
| `GET` | `/user/verify-email/:token` | Verify user email | - |
| `GET` | `/user/profile/me` | Get current user profile | - |
| `GET` | `/user/check-auth/` | Check authentication status | - |
| `GET` | `/user/search` | Search users | `?q=<searchQuery>` |
| `GET` | `/user/password/reset/:token` | Get reset password page or info | - |
| `DELETE` | `/user/delete/:id` | Delete a user by ID | - |

### Messages

| Method | Endpoint | Description | Body / Params |
|--------|----------|-------------|---------------|
| `GET` | `/messages/history/:userId` | Get chat history with a specific user | `userId` = ID of the chat partner |

---

## Future Improvements

- Typing indicators
- Message edit/delete
- Group chat support
- Media/file sharing  

---

## Contributing

1. Fork the repo  
2. Create a new branch: \`git checkout -b feature/YourFeature\`  
3. Make your changes  
4. Commit your changes: \`git commit -m "Add your feature"\`  
5. Push to your branch: \`git push origin feature/YourFeature\`  
6. Open a pull request  

---

## License

This project is licensed under the MIT License.
