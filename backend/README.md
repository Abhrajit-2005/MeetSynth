# AI Meeting Summarizer - Backend API

A Node.js backend API for the AI-powered meeting notes summarizer and sharer application.

## Features

- **AI-Powered Summarization**: Uses Groq AI to generate intelligent summaries from meeting transcripts
- **Custom Prompts**: Support for user-defined summarization instructions
- **Summary Management**: CRUD operations for summaries with editing capabilities
- **Email Sharing**: Send summaries via email with beautiful HTML formatting
- **SQLite Database**: Lightweight database for storing summaries and email logs
- **File Upload**: Support for text file uploads (5MB limit)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3
- **AI Service**: Groq (Llama3-8b-8192 model)
- **Email**: Nodemailer
- **File Handling**: Multer
- **Development**: Nodemon

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Groq API key
- Email service credentials (Gmail recommended)

## Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   - Copy `env.template` to `.env`
   - Fill in your configuration values:
     ```env
     PORT=5000
     GROQ_API_KEY=your_groq_api_key_here
     EMAIL_HOST=smtp.gmail.com
     EMAIL_PORT=587
     EMAIL_USER=your_email@gmail.com
     EMAIL_PASS=your_app_password_here
     ```

4. **Get Groq API Key:**
   - Visit [Groq Console](https://console.groq.com/)
   - Create an account and get your API key
   - Add it to your `.env` file

5. **Email Setup (Gmail):**
   - Enable 2-factor authentication
   - Generate an App Password
   - Use the App Password in your `.env` file

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on port 5000 (or the port specified in your `.env` file).

## API Endpoints

### Health Check
- **GET** `/health` - Server health status

### Summaries
- **POST** `/api/summaries/generate` - Generate new summary
- **GET** `/api/summaries` - Get all summaries
- **GET** `/api/summaries/:id` - Get summary by ID
- **PUT** `/api/summaries/:id` - Update summary (for editing)
- **DELETE** `/api/summaries/:id` - Delete summary

### Email
- **POST** `/api/email/send` - Send summary via email
- **GET** `/api/email/logs/:summaryId` - Get email logs for a summary
- **POST** `/api/email/test` - Test email configuration

## API Usage Examples

### Generate Summary
```bash
curl -X POST http://localhost:5000/api/summaries/generate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Meeting transcript content here...",
    "customPrompt": "Summarize in bullet points for executives"
  }'
```

### Send Summary via Email
```bash
curl -X POST http://localhost:5000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "summaryId": 1,
    "recipientEmails": ["recipient@example.com"],
    "subject": "Meeting Summary",
    "message": "Please find the meeting summary attached."
  }'
```

## Database Schema

### Summaries Table
- `id` - Primary key
- `original_text` - Original transcript text
- `custom_prompt` - User's custom instructions
- `generated_summary` - AI-generated summary
- `edited_summary` - User-edited summary (optional)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Email Logs Table
- `id` - Primary key
- `summary_id` - Foreign key to summaries
- `recipient_emails` - Comma-separated email addresses
- `sent_at` - Email sent timestamp
- `status` - Email status (sent/partial)

## Error Handling

The API includes comprehensive error handling:
- Input validation
- Database error handling
- AI service error handling
- Email service error handling
- Proper HTTP status codes

## Security Features

- CORS configuration
- File type validation
- File size limits
- Input sanitization
- Environment variable protection

## Development Notes

- Uses prepared statements to prevent SQL injection
- Implements proper async/await patterns
- Includes comprehensive logging
- Follows RESTful API conventions
- Includes database triggers for timestamp management

## Troubleshooting

### Common Issues

1. **Groq API Error**: Ensure your API key is valid and has sufficient credits
2. **Email Sending Failed**: Check your email credentials and app password
3. **Database Error**: Ensure the database file is writable
4. **Port Already in Use**: Change the PORT in your `.env` file

### Logs

Check the console output for detailed error messages and debugging information.

## License

ISC License
