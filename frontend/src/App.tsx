import { useState, useEffect } from 'react'
import { 
FileText, 
  Send, 
  Edit3, 
  Trash2, 
  Mail, 
  Plus, 
  Search,
  Clock,
  User,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  ChevronDown,
  Sparkles
} from 'lucide-react'
import axios from 'axios'
import './App.css'

// Types
interface Summary {
  id: number
  original_text: string
  custom_prompt: string
  generated_summary: string
  edited_summary: string | null
  created_at: string
  updated_at: string
}

interface EmailLog {
  id: number
  summary_id: number
  recipient_emails: string
  sent_at: string
  status: string
}

// API Configuration
const API_BASE = 'http://localhost:5000/api'

function App() {
  // State
  const [summaries, setSummaries] = useState<Summary[]>([])
  const [currentSummary, setCurrentSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Form states
  const [textInput, setTextInput] = useState('')
  const [customPrompt, setCustomPrompt] = useState('Summarize this meeting in clear, actionable bullet points')
  
  // Email states
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailRecipients, setEmailRecipients] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  
  // UI states
  const [activeTab, setActiveTab] = useState<'generate' | 'summaries'>('generate')
  const [editingSummary, setEditingSummary] = useState<Summary | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedSummaries, setExpandedSummaries] = useState<Set<number>>(new Set())

  // Load summaries on mount
  useEffect(() => {
    loadSummaries()
  }, [])

  // API Functions
  const loadSummaries = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE}/summaries`)
      setSummaries(response.data.summaries || [])
    } catch (err) {
      setError('Failed to load summaries')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Function to detect document type and suggest appropriate prompts
  const detectDocumentType = (text: string): 'resume' | 'meeting' | 'general' => {
    const resumeKeywords = [
      'experience', 'skills', 'education', 'work history', 'employment',
      'resume', 'cv', 'curriculum vitae', 'professional summary',
      'technical skills', 'soft skills', 'certifications', 'achievements',
      'responsibilities', 'duties', 'projects', 'technologies'
    ];
    
    const meetingKeywords = [
      'meeting', 'agenda', 'discussion', 'participants', 'minutes',
      'transcript', 'conversation', 'call', 'presentation', 'workshop',
      'brainstorming', 'planning', 'review', 'feedback', 'decisions'
    ];
    
    const textLower = text.toLowerCase();
    const resumeScore = resumeKeywords.filter(keyword => textLower.includes(keyword)).length;
    const meetingScore = meetingKeywords.filter(keyword => textLower.includes(keyword)).length;
    
    if (resumeScore > meetingScore && resumeScore >= 3) return 'resume';
    if (meetingScore > resumeScore && meetingScore >= 3) return 'meeting';
    return 'general';
  };

  // Function to get appropriate prompt based on document type
  const getAppropriatePrompt = (docType: 'resume' | 'meeting' | 'general', customPrompt: string): string => {
    if (docType === 'resume') {
      return `Analyze this resume and provide a comprehensive professional summary. Include:

• Key skills and technical competencies
• Relevant work experience and achievements
• Education and certifications
• Notable projects and contributions
• Professional strengths and areas of expertise

Format as a well-structured professional summary suitable for job applications or professional networking.`;
    } else if (docType === 'meeting') {
      return customPrompt || 'Summarize this meeting in clear, actionable bullet points';
    } else {
      return customPrompt || 'Provide a comprehensive summary of this document';
    }
  };

  // Function to truncate text to reasonable length for API
  const truncateTextForAPI = (text: string, maxChars: number = 8000): string => {
    if (text.length <= maxChars) return text;
    
    // Try to truncate at sentence boundaries
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    let truncated = '';
    
    for (const sentence of sentences) {
      if ((truncated + sentence).length > maxChars) break;
      truncated += sentence;
    }
    
    // If no sentences fit, truncate at word boundaries
    if (!truncated) {
      const words = text.split(' ');
      for (const word of words) {
        if ((truncated + ' ' + word).length > maxChars) break;
        truncated += (truncated ? ' ' : '') + word;
      }
    }
    
    return truncated + (text.length > maxChars ? '\n\n[Document truncated due to length. Consider breaking into smaller sections.]' : '');
  };

    const generateSummary = async () => {
    if (!textInput.trim()) {
      setError('Please enter text to summarize')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Truncate text if it's too long for the API
      const truncatedText = truncateTextForAPI(textInput);
      
      // Debug: Show what text was extracted
      console.log('🔍 DEBUG - Original text length:', textInput.length);
      console.log('🔍 DEBUG - First 200 chars:', textInput.substring(0, 200));
      console.log('🔍 DEBUG - Last 200 chars:', textInput.substring(Math.max(0, textInput.length - 200)));
      
      // Detect document type and get appropriate prompt
      const docType = detectDocumentType(truncatedText);
      const smartPrompt = getAppropriatePrompt(docType, customPrompt);
      
      // Show document type detection
      if (docType === 'resume') {
        setSuccess(`📄 Resume detected! Using specialized resume analysis prompt.`)
        setTimeout(() => setSuccess(null), 3000)
      } else if (docType === 'meeting') {
        setSuccess(`📋 Meeting transcript detected! Using meeting summary prompt.`)
        setTimeout(() => setSuccess(null), 3000)
      }
      
      // Show warning if text was truncated
      if (truncatedText !== textInput) {
        setSuccess(`⚠️ Document was ${textInput.length} characters. Truncated to ${truncatedText.length} characters for API processing.`)
        setTimeout(() => setSuccess(null), 5000)
      }
      
      // Debug: Show what's being sent to API
      console.log('🔍 DEBUG - Text being sent to API:', truncatedText);
      console.log('🔍 DEBUG - Prompt being used:', smartPrompt);

      // Send text to API
      const response = await axios.post(`${API_BASE}/summaries/generate`, {
        text: truncatedText,
        customPrompt: smartPrompt
      })

      setSuccess('Summary generated successfully!')
      setTextInput('')
      setCustomPrompt('Summarize this meeting in clear, actionable bullet points')
      
      // Reload summaries
      await loadSummaries()
      
      // Switch to summaries tab
      setActiveTab('summaries')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate summary')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateSummary = async (summary: Summary) => {
    try {
      setLoading(true)
      await axios.put(`${API_BASE}/summaries/${summary.id}`, {
        edited_summary: summary.edited_summary
      })
      
      setSuccess('Summary updated successfully!')
      setEditingSummary(null)
      await loadSummaries()
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update summary')
    } finally {
      setLoading(false)
    }
  }

  const deleteSummary = async (id: number) => {
    if (!confirm('Are you sure you want to delete this summary?')) return
    
    try {
      setLoading(true)
      await axios.delete(`${API_BASE}/summaries/${id}`)
      setSuccess('Summary deleted successfully!')
      await loadSummaries()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete summary')
    } finally {
      setLoading(false)
    }
  }

  const sendEmail = async () => {
    if (!currentSummary || !emailRecipients.trim()) {
      setError('Please select a summary and enter recipient emails')
      return
    }

    try {
      setSendingEmail(true)
      const recipients = emailRecipients.split(',').map(email => email.trim())
      
      const response = await axios.post(`${API_BASE}/email/send`, {
        summaryId: currentSummary.id,
        recipientEmails: recipients,
        subject: emailSubject || `Meeting Summary - ${new Date().toLocaleDateString()}`,
        message: emailMessage || 'Please find the meeting summary attached below.'
      })

      setSuccess(`Email sent successfully to ${response.data.summary.successfulSends} recipients!`)
      setShowEmailModal(false)
      setEmailRecipients('')
      setEmailSubject('')
      setEmailMessage('')
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send email')
    } finally {
      setSendingEmail(false)
    }
  }

  const testEmail = async () => {
    if (!emailRecipients.trim()) {
      setError('Please enter a test email address')
      return
    }

    try {
      setSendingEmail(true)
      const testEmail = emailRecipients.split(',')[0].trim()
      
      await axios.post(`${API_BASE}/email/test`, {
        testEmail
      })

      setSuccess('Test email sent successfully! Check your inbox.')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send test email')
    } finally {
      setSendingEmail(false)
    }
  }



  const filteredSummaries = summaries.filter(summary =>
    summary.generated_summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    summary.original_text.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleSummaryExpansion = (summaryId: number) => {
    setExpandedSummaries(prev => {
      const newSet = new Set(prev)
      if (newSet.has(summaryId)) {
        newSet.delete(summaryId)
      } else {
        newSet.add(summaryId)
      }
      return newSet
    })
  }

  const getSummaryPreview = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-8 -left-4 w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-50 bg-slate-800/95 backdrop-blur-md border-b border-slate-700/50 sticky top-0 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-ping"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  MeetSynth
                </h1>
                <p className="text-xs text-slate-400">Transform conversations into insights</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-sm font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  MeetSynth
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button 
                onClick={() => setActiveTab('generate')}
                className={`px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm ${
                  activeTab === 'generate'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
                }`}
              >
                <Plus size={14} className="sm:w-4 sm:h-4" />
                <span className="xs:inline">Generate</span>
                {/* <span className="xs:hidden">Gen</span> */}
              </button>
              <button 
                onClick={() => setActiveTab('summaries')}
                className={`px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm ${
                  activeTab === 'summaries'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
                }`}
              >
                <FileText size={14} className="sm:w-4 sm:h-4" />
                <span className="xs:inline">Summaries</span>
                {/* <span className="xs:hidden">Sum</span> */}
                <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                  {summaries.length}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 mt-0">
        {/* Notifications */}
        {error && (
          <div className="mb-4 sm:mb-6 bg-red-900/20 border border-red-700/50 rounded-lg p-3 sm:p-4 flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" />
              <span className="text-red-200 font-medium text-sm sm:text-base truncate">{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200 transition-colors ml-2 flex-shrink-0">
              <X size={16} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        )}
        
        {success && (
          <div className="mb-4 sm:mb-6 bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-3 sm:p-4 flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
              <span className="text-emerald-200 font-medium text-sm sm:text-base truncate">{success}</span>
            </div>
            <button onClick={() => setSuccess(null)} className="text-emerald-400 hover:text-emerald-200 transition-colors ml-2 flex-shrink-0">
              <X size={16} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        )}

        {/* Generate Summary Tab */}
        {activeTab === 'generate' && (
          <div className="animate-in fade-in-50 duration-500">
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="text-center mb-8 sm:mb-8">
                  <h2 className="text-3xl sm:text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">
                    Generate AI Summary
                  </h2>
                  <p className="text-slate-300 text-sm sm:text-base">Transform your meeting transcripts into actionable insights</p>
                </div>
                
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      Meeting Transcript
                      {textInput && (
                        <span className="ml-2 text-xs text-slate-400">
                          ({textInput.length} characters)
                        </span>
                      )}
                    </label>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Paste your meeting transcript, resume, or any text content here..."
                      rows={6}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-slate-700/50 backdrop-blur-sm text-slate-100 placeholder-slate-400 text-sm sm:text-base"
                    />
                    {textInput.length > 8000 && (
                      <p className="mt-2 text-sm text-amber-400">
                        ⚠️ Document is quite long ({textInput.length} characters). It will be truncated to 8000 characters for processing.
                      </p>
                    )}
                  </div>



                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      Custom Instructions
                      <span className="ml-2 text-xs text-slate-400">
                        (Optional - AI will auto-detect document type)
                      </span>
                    </label>
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="How would you like the summary formatted? (Leave empty for auto-detection)"
                      rows={3}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-slate-700/50 backdrop-blur-sm text-slate-100 placeholder-slate-400 text-sm sm:text-base"
                    />

                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={async () => {
                        if (textInput.trim()) {
                          const previewText = textInput.substring(0, 500) + (textInput.length > 500 ? '...' : '');
                          setSuccess(`📄 Content Preview (first 500 chars):\n\n${previewText}`);
                          setTimeout(() => setSuccess(null), 8000);
                        } else {
                          setError('Please enter some text to preview');
                        }
                      }}
                      className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      <FileText size={18} className="sm:w-5 sm:h-5" />
                      <span>Preview Content</span>
                    </button>
                    
                    <button
                      onClick={generateSummary}
                      disabled={loading || !textInput.trim()}
                      className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={18} className="sm:w-5 sm:h-5 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} className="sm:w-5 sm:h-5" />
                          <span>Generate Summary</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summaries Tab */}
        {activeTab === 'summaries' && (
          <div className="animate-in fade-in-50 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  My Summaries
                </h2>
                <p className="text-slate-300 mt-1 text-sm sm:text-base">Manage and share your meeting summaries</p>
              </div>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search summaries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-80 pl-10 pr-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-slate-700/70 backdrop-blur-sm text-slate-100 placeholder-slate-400 text-sm"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="sm:w-8 sm:h-8 animate-spin text-amber-500" />
                <span className="ml-3 text-base sm:text-lg text-slate-300">Loading summaries...</span>
              </div>
            ) : filteredSummaries.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-slate-700 to-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-slate-600">
                  <FileText size={36} className="sm:w-12 sm:h-12 text-amber-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-100 mb-2">No summaries yet</h3>
                <p className="text-slate-400 mb-4 sm:mb-6 text-sm sm:text-base">Generate your first meeting summary to get started!</p>
                <button 
                  onClick={() => setActiveTab('generate')}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-sm sm:text-base"
                >
                  Create Summary
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {filteredSummaries.map((summary, index) => (
                  <div 
                    key={summary.id} 
                    className="bg-slate-800/90 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg border border-slate-700/50 overflow-hidden hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:border-slate-600"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-4 sm:p-6">
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-400">
                            <Clock size={12} className="sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">{new Date(summary.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-slate-500">
                            <User size={10} className="sm:w-3 sm:h-3 flex-shrink-0" />
                            <span className="truncate max-w-32 sm:max-w-48">{summary.custom_prompt}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              setCurrentSummary(summary);
                              setShowEmailModal(true);
                            }}
                            className="p-1.5 sm:p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                            title="Send via Email"
                          >
                            <Mail size={14} className="sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => setEditingSummary(summary)}
                            className="p-1.5 sm:p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-900/20 rounded-lg transition-all duration-200"
                            title="Edit Summary"
                          >
                            <Edit3 size={14} className="sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => deleteSummary(summary.id)}
                            className="p-1.5 sm:p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-200"
                            title="Delete Summary"
                          >
                            <Trash2 size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <h4 className="font-semibold text-slate-100 text-sm sm:text-base">Generated Summary</h4>
                        <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg p-3 sm:p-4 border border-slate-600">
                          {(() => {
                            const summaryText = summary.edited_summary || summary.generated_summary
                            const isExpanded = expandedSummaries.has(summary.id)
                            const shouldShowReadMore = summaryText.length > 150
                            
                            return (
                              <div>
                                <pre className="text-xs sm:text-sm text-slate-200 font-medium whitespace-pre-wrap leading-relaxed">
                                  {isExpanded ? summaryText : getSummaryPreview(summaryText)}
                                </pre>
                                {shouldShowReadMore && (
                                  <button
                                    onClick={() => toggleSummaryExpansion(summary.id)}
                                    className="mt-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors duration-200 flex items-center space-x-1"
                                  >
                                    <span>{isExpanded ? 'Show Less' : 'Read More'}</span>
                                    <ChevronDown 
                                      size={10} 
                                      className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                    />
                                  </button>
                                )}
                              </div>
                            )
                          })()}
                        </div>
                      </div>

                      {summary.original_text.length > 200 && (
                        <details className="mt-3 sm:mt-4">
                          <summary className="cursor-pointer text-xs sm:text-sm text-amber-400 hover:text-amber-300 font-medium flex items-center space-x-1">
                            <span>Show Original Text</span>
                            <ChevronDown size={12} className="sm:w-4 sm:h-4" />
                          </summary>
                          <div className="mt-2 text-xs text-slate-400 bg-slate-900/50 rounded-lg p-2 sm:p-3 border border-slate-700">
                            {summary.original_text.substring(0, 300)}...
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Email Modal */}
      {showEmailModal && currentSummary && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-[60] animate-in fade-in-0 duration-300">
          <div className="bg-slate-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto border border-slate-700">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700">
              <h3 className="text-base sm:text-lg font-semibold text-slate-100">Send Summary via Email</h3>
              <button 
                onClick={() => setShowEmailModal(false)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg transition-colors duration-200"
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Recipient Emails
                </label>
                <input
                  type="text"
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                  placeholder="email1@example.com, email2@example.com"
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-slate-700 text-slate-100 placeholder-slate-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Meeting Summary - Project Review"
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-slate-700 text-slate-100 placeholder-slate-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Message
                </label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Please find the meeting summary attached below."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-slate-700 text-slate-100 placeholder-slate-400 text-sm"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  onClick={testEmail}
                  disabled={sendingEmail || !emailRecipients.trim()}
                  className="px-4 py-2 text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-700 transition-all duration-200 text-sm"
                >
                  {sendingEmail ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-2" />
                      Testing...
                    </>
                  ) : (
                    'Test Email'
                  )}
                </button>
                <button
                  onClick={sendEmail}
                  disabled={sendingEmail || !emailRecipients.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 disabled:from-slate-600 disabled:to-slate-700 transition-all duration-200 flex items-center justify-center space-x-2 text-sm"
                >
                  {sendingEmail ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Send Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Summary Modal */}
      {editingSummary && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-[60] animate-in fade-in-0 duration-300">
          <div className="bg-slate-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto border border-slate-700">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700">
              <h3 className="text-base sm:text-lg font-semibold text-slate-100">Edit Summary</h3>
              <button 
                onClick={() => setEditingSummary(null)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg transition-colors duration-200"
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Summary Text
                  </label>
                  <textarea
                    value={editingSummary.edited_summary || editingSummary.generated_summary}
                    onChange={(e) => setEditingSummary({
                      ...editingSummary,
                      edited_summary: e.target.value
                    })}
                    rows={8}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-slate-700 text-slate-100 placeholder-slate-400 text-sm"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    onClick={() => setEditingSummary(null)}
                    className="flex-1 px-4 py-2 text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-700 transition-all duration-200 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => updateSummary(editingSummary)}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 disabled:from-slate-600 disabled:to-slate-700 transition-all duration-200 flex items-center justify-center space-x-2 text-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App