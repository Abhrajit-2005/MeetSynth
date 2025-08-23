# AI Meeting Summarizer - Frontend

A modern, responsive React frontend for the AI-powered meeting notes summarizer and sharer application.

## ✨ Features

### 🎯 **Core Functionality**
- **AI Summary Generation** - Generate intelligent summaries from meeting transcripts
- **Text Input & File Upload** - Support for both text input and file uploads (5MB limit)
- **Custom Prompts** - User-defined summarization instructions
- **Real-time Processing** - Live feedback during AI processing

### 📧 **Email Integration**
- **Email Sharing** - Send summaries via email with beautiful HTML formatting
- **Multiple Recipients** - Support for multiple email addresses
- **Custom Subjects & Messages** - Personalized email content
- **Test Email Functionality** - Verify email configuration before sending
- **Email Logs** - Track email sending history

### 📋 **Summary Management**
- **CRUD Operations** - Create, read, update, and delete summaries
- **Search & Filter** - Find summaries quickly with search functionality
- **Edit Capabilities** - Modify AI-generated summaries
- **Original Text Access** - View and reference original meeting content
- **Responsive Grid Layout** - Beautiful card-based summary display

### 🎨 **User Experience**
- **Modern UI Design** - Clean, professional interface with gradient accents
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Tab Navigation** - Easy switching between generation and management
- **Real-time Notifications** - Success and error feedback
- **Loading States** - Visual feedback during operations
- **Accessibility** - Keyboard navigation and screen reader support

## 🚀 **Getting Started**

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend server running on port 5000

### Installation

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

## 🏗️ **Architecture**

### **Tech Stack**
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS3 with modern features
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **State Management**: React Hooks

### **Component Structure**
```
App.tsx
├── Header (Navigation & Logo)
├── Main Content
│   ├── Generate Summary Tab
│   │   ├── Text Input
│   │   ├── File Upload
│   │   └── Custom Prompt
│   └── Summaries Tab
│       ├── Search & Filter
│       ├── Summary Cards
│       └── Actions (Edit/Delete/Email)
├── Email Modal
└── Edit Summary Modal
```

### **State Management**
- **Local State**: React useState for UI state
- **API Integration**: Axios for HTTP requests
- **Real-time Updates**: Automatic data refresh after operations

## 📱 **API Integration**

### **Backend Endpoints Used**
- `GET /api/summaries` - Fetch all summaries
- `POST /api/summaries/generate` - Generate new summary
- `PUT /api/summaries/:id` - Update summary
- `DELETE /api/summaries/:id` - Delete summary
- `POST /api/email/send` - Send summary via email
- `POST /api/email/test` - Test email configuration

### **Data Flow**
1. User inputs meeting transcript (text or file)
2. Frontend sends request to backend AI service
3. Backend processes with Groq AI and returns summary
4. Frontend displays summary and stores in local state
5. User can edit, share, or manage summaries

## 🎨 **Design System**

### **Color Palette**
- **Primary**: Gradient from #667eea to #764ba2
- **Accent**: #fbbf24 (Golden)
- **Success**: #16a34a (Green)
- **Error**: #dc2626 (Red)
- **Neutral**: #f8fafc to #1e293b

### **Typography**
- **Font Family**: System fonts (San Francisco, Segoe UI, etc.)
- **Headings**: Bold weights with proper hierarchy
- **Body Text**: Optimized for readability
- **Labels**: Uppercase with letter spacing

### **Components**
- **Cards**: Elevated with subtle shadows
- **Buttons**: Gradient primary, outlined secondary
- **Inputs**: Focused states with blue accent
- **Modals**: Smooth animations and backdrop blur

## 📱 **Responsive Design**

### **Breakpoints**
- **Desktop**: 1200px+ (Full layout)
- **Tablet**: 768px - 1199px (Adaptive grid)
- **Mobile**: < 768px (Single column)

### **Mobile Optimizations**
- Touch-friendly button sizes
- Simplified navigation
- Optimized form layouts
- Responsive modals

## 🔧 **Development**

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### **File Structure**
```
src/
├── App.tsx          # Main application component
├── App.css          # Application styles
├── main.tsx         # Application entry point
├── index.css        # Global styles
└── assets/          # Static assets
```

### **Code Quality**
- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Responsive Design**: Mobile-first approach
- **Accessibility**: ARIA labels and keyboard navigation

## 🚀 **Deployment**

### **Build for Production**
```bash
npm run build
```

### **Deploy Options**
- **Vercel**: Zero-config deployment
- **Netlify**: Drag & drop deployment
- **GitHub Pages**: Static hosting
- **Custom Server**: Any Node.js hosting

## 🔒 **Security Features**

- **Input Validation**: Client-side validation
- **File Type Checking**: Restricted file uploads
- **Size Limits**: 5MB file size restriction
- **XSS Prevention**: Safe HTML rendering
- **CORS Handling**: Proper cross-origin requests

## 🧪 **Testing**

### **Manual Testing Checklist**
- [ ] Summary generation with text input
- [ ] Summary generation with file upload
- [ ] Summary editing and saving
- [ ] Summary deletion with confirmation
- [ ] Email sending functionality
- [ ] Email test functionality
- [ ] Search and filtering
- [ ] Responsive design on mobile
- [ ] Error handling and notifications
- [ ] Loading states and animations

## 🐛 **Troubleshooting**

### **Common Issues**

1. **Backend Connection Error**
   - Ensure backend server is running on port 5000
   - Check CORS configuration in backend

2. **Email Not Sending**
   - Verify backend email configuration
   - Check browser console for errors
   - Use test email functionality

3. **File Upload Issues**
   - Ensure file is under 5MB
   - Check file type (text files only)
   - Clear browser cache if needed

4. **Styling Issues**
   - Clear browser cache
   - Check CSS file loading
   - Verify Vite configuration

## 📚 **API Documentation**

### **Summary Generation**
```typescript
interface GenerateRequest {
  text: string;
  customPrompt: string;
}

interface GenerateResponse {
  success: boolean;
  summary: Summary;
}
```

### **Email Sending**
```typescript
interface EmailRequest {
  summaryId: number;
  recipientEmails: string[];
  subject?: string;
  message?: string;
}

interface EmailResponse {
  success: boolean;
  summary: {
    totalRecipients: number;
    successfulSends: number;
    failedSends: number;
  };
}
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

ISC License - see LICENSE file for details

## 🆘 **Support**

For issues and questions:
1. Check the troubleshooting section
2. Review backend logs
3. Check browser console for errors
4. Verify API endpoints are accessible

---

**Built with ❤️ by Abhrajit using React, TypeScript, and modern web technologies**
