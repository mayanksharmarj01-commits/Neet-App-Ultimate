const db = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

class ContentController {
  // 1. Get Subject List with Progress
  async getSubjects(req, res, next) {
    const userId = req.user.id;

    const query = `
      SELECT 
        s.id,
        s.name,
        s.icon,
        COUNT(DISTINCT q.id) AS total_questions,
        COUNT(DISTINCT a.question_id) AS completed_questions,
        ROUND(
          (COUNT(DISTINCT a.question_id)::NUMERIC / NULLIF(COUNT(DISTINCT q.id), 0)) * 100,
          2
        ) AS progress
      FROM subjects s
      LEFT JOIN chapters c ON s.id = c.subject_id
      LEFT JOIN questions q ON c.id = q.chapter_id
      LEFT JOIN attempts a ON q.id = a.question_id AND a.user_id = $1
      GROUP BY s.id
      ORDER BY s.id ASC
    `;

    const result = await db.query(query, [userId]);

    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: {
        subjects: result.rows
      }
    });
  }

  // 2. Get Chapters by Subject ID
  async getChaptersBySubject(req, res) {
    try {
      const { subjectId } = req.params;
      const { status, class: classLevel } = req.query;
      const userId = req.user.id;

      console.log(`📚 Fetching chapters for Subject: ${subjectId}, User: ${userId}`);

      let query = `
            SELECT 
                c.id,
                c.name,
                c.class_level,
                c.is_reduced_syllabus,
                s.name AS subject_name,
                COUNT(distinct q.id) AS total_questions,
                COUNT(distinct a.question_id) AS completed_questions,
                ROUND((COUNT(distinct a.question_id)::NUMERIC / NULLIF(COUNT(distinct q.id), 0)) * 100, 2) AS progress
            FROM 
                chapters c
            JOIN
                subjects s ON c.subject_id = s.id
            LEFT JOIN 
                questions q ON c.id = q.chapter_id
            LEFT JOIN 
                attempts a ON q.id = a.question_id AND a.user_id = $1
            WHERE 
                c.subject_id = $2
            `;

      const params = [userId, subjectId];

      if (classLevel) {
        params.push(classLevel);
        query += ` AND c.class_level = $${params.length}`;
      }

      // GROUP BY must include all non-aggregated columns and come BEFORE HAVING
      query += ` GROUP BY c.id, c.name, c.class_level, c.is_reduced_syllabus, s.name`;

      if (status) {
        if (status === 'completed') {
          query += ` HAVING COUNT(distinct a.question_id) = COUNT(distinct q.id)`;
        } else if (status === 'in_progress') {
          query += ` HAVING COUNT(distinct a.question_id) > 0 AND COUNT(distinct a.question_id) < COUNT(distinct q.id)`;
        } else if (status === 'not_started') {
          query += ` HAVING COUNT(distinct a.question_id) = 0`;
        }
      }

      query += ` ORDER BY c.class_level ASC, c.id ASC`;

      const result = await db.query(query, params);

      console.log(`✅ Found ${result.rows.length} chapters`);

      res.status(200).json({
        status: 'success',
        results: result.rows.length,
        data: {
          chapters: result.rows
        }
      });
    } catch (error) {
      console.error('❌ Error in getChaptersBySubject:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch chapters',
        error: error.message
      });
    }
  }

  // 3. Get Chapter Breakdown (Detailed Stats)
  async getChapterBreakdown(req, res) {
    const { chapterId } = req.params;
    const result = await db.query(`
      SELECT 
        COUNT(*) FILTER (WHERE type = 'MCQ') as standard_mcq,
        COUNT(*) FILTER (WHERE type = 'Assertion_Reason') as assertion_reason,
        COUNT(*) FILTER (WHERE type = 'Match_Column') as match_column,
        COUNT(*) FILTER (WHERE type = 'Diagram_Based') as diagram_based,
        COUNT(*) FILTER (WHERE level = 'AIIMS_PYQ') as aiims_pyq,
        COUNT(*) FILTER (WHERE level = 'NEET_PYQ') as neet_pyq
      FROM questions 
      WHERE chapter_id = $1
    `, [chapterId]);

    res.status(200).json({
      status: 'success',
      data: {
        breakdown: result.rows[0]
      }
    });
  }

  // 4. Get Practice Questions (Randomized Engine)
  async getPracticeQuestions(req, res) {
    const { chapterId, type, level, limit = 10 } = req.query;

    let query = `SELECT * FROM questions WHERE chapter_id = $1`;
    let params = [chapterId];

    if (type) {
      params.push(type);
      query += ` AND type = $${params.length}`;
    }

    if (level) {
      params.push(level);
      query += ` AND level = $${params.length}`;
    }

    query += ` ORDER BY RANDOM() LIMIT ${limit}`;

    const result = await db.query(query, params);

    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: {
        questions: result.rows
      }
    });
  }
}

module.exports = new ContentController();
