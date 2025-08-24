const express = require('express');
const { Groq } = require('groq-sdk');
const db = require('../database');

const router = express.Router();

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});



// Generate summary from text and custom prompt
router.post('/generate', async (req, res) => {
  try {
    const { text, customPrompt } = req.body;

    if (!text || !customPrompt) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Both text and customPrompt are required'
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        error: 'AI service not configured',
        message: 'GROQ_API_KEY is not set in environment variables'
      });
    }

    // Create AI prompt
    const aiPrompt = `
You are an expert meeting notes summarizer. Please analyze the following transcript and provide a summary based on the user's specific requirements.

TRANSCRIPT:
${text}

USER REQUIREMENTS:
${customPrompt}

Please provide a well-structured, professional summary that addresses the user's specific needs. Format the response appropriately based on the requirements (e.g., bullet points, executive summary, action items, etc.).
`;

    // Generate summary using Groq
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional meeting notes summarizer. Provide clear, structured summaries based on user requirements."
        },
        {
          role: "user",
          content: aiPrompt
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.3,
      max_tokens: 2048,
    });

    const generatedSummary = completion.choices[0]?.message?.content || 'No summary generated';

    // Save to database
    const stmt = db.prepare(`
      INSERT INTO summaries (original_text, custom_prompt, generated_summary)
      VALUES (?, ?, ?)
    `);

    stmt.run([text, customPrompt, generatedSummary], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to save summary'
        });
      }

      res.json({
        success: true,
        summary: {
          id: this.lastID,
          originalText: text,
          customPrompt: customPrompt,
          generatedSummary: generatedSummary,
          editedSummary: null,
          createdAt: new Date().toISOString()
        }
      });
    });

    stmt.finalize();

  } catch (error) {
    console.error('Summary generation error:', error);
    res.status(500).json({
      error: 'AI service error',
      message: error.message || 'Failed to generate summary'
    });
  }
});



// Update summary (for editing)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { editedSummary } = req.body;

    if (!editedSummary) {
      return res.status(400).json({
        error: 'Missing editedSummary',
        message: 'editedSummary field is required'
      });
    }

    const stmt = db.prepare(`
      UPDATE summaries 
      SET edited_summary = ?
      WHERE id = ?
    `);

    stmt.run([editedSummary, id], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to update summary'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          error: 'Summary not found',
          message: 'No summary found with the provided ID'
        });
      }

      res.json({
        success: true,
        message: 'Summary updated successfully',
        summaryId: id
      });
    });

    stmt.finalize();

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message || 'Failed to update summary'
    });
  }
});

// Get summary by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const stmt = db.prepare(`
      SELECT * FROM summaries WHERE id = ?
    `);

    stmt.get([id], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to retrieve summary'
        });
      }

      if (!row) {
        return res.status(404).json({
          error: 'Summary not found',
          message: 'No summary found with the provided ID'
        });
      }

      res.json({
        success: true,
        summary: row
      });
    });

    stmt.finalize();

  } catch (error) {
    console.error('Retrieve error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message || 'Failed to retrieve summary'
    });
  }
});

// Get all summaries
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT * FROM summaries ORDER BY created_at DESC
    `);

    stmt.all([], (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to retrieve summaries'
        });
      }

      res.json({
        success: true,
        summaries: rows,
        count: rows.length
      });
    });

    stmt.finalize();

  } catch (error) {
    console.error('Retrieve error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message || 'Failed to retrieve summaries'
    });
  }
});

// Delete summary
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const stmt = db.prepare(`
      DELETE FROM summaries WHERE id = ?
    `);

    stmt.run([id], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to delete summary'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          error: 'Summary not found',
          message: 'No summary found with the provided ID'
        });
      }

      res.json({
        success: true,
        message: 'Summary deleted successfully'
      });
    });

    stmt.finalize();

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message || 'Failed to delete summary'
    });
  }
});

module.exports = router;
