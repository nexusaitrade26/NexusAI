import { query, run, get } from '../config/database.js';

export const getLevels = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const levels = await query("SELECT * FROM studio_levels ORDER BY order_index ASC");

    const levelsWithStats = await Promise.all(
      levels.map(async (lvl) => {
        const categories = await query("SELECT id FROM studio_categories WHERE level_id = ?", [lvl.id]);
        const catIds = categories.map(c => c.id);

        let totalLessons = 0;
        let completedLessons = 0;

        if (catIds.length > 0) {
          const placeholders = catIds.map(() => '?').join(',');
          const totalRes = await get(
            `SELECT COUNT(*) as count FROM studio_lessons WHERE category_id IN (${placeholders})`,
            catIds
          );
          totalLessons = totalRes.count;

          const completedRes = await get(
            `SELECT COUNT(*) as count FROM user_lesson_progress p
             JOIN studio_lessons l ON p.lesson_id = l.id
             WHERE p.user_id = ? AND p.completed = 1 AND l.category_id IN (${placeholders})`,
            [userId, ...catIds]
          );
          completedLessons = completedRes.count;
        }

        return {
          id: lvl.id,
          code: lvl.code,
          name: lvl.name,
          description: lvl.description,
          totalLessons,
          completedLessons,
          progressPercent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
        };
      })
    );

    res.json({ levels: levelsWithStats });
  } catch (err) {
    next(err);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { level_code } = req.query;

    let sqlLevel = "SELECT * FROM studio_levels WHERE code = ?";
    let level = await get(sqlLevel, [level_code || 'base']);
    if (!level) {
      level = await get("SELECT * FROM studio_levels ORDER BY order_index ASC LIMIT 1");
    }

    const categories = await query(
      "SELECT * FROM studio_categories WHERE level_id = ? ORDER BY order_index ASC",
      [level.id]
    );

    const categoriesWithLessons = await Promise.all(
      categories.map(async (cat) => {
        const lessons = await query(
          "SELECT * FROM studio_lessons WHERE category_id = ? ORDER BY order_index ASC",
          [cat.id]
        );

        const lessonsWithProgress = await Promise.all(
          lessons.map(async (les) => {
            const prog = await get(
              "SELECT completed FROM user_lesson_progress WHERE user_id = ? AND lesson_id = ?",
              [userId, les.id]
            );
            return {
              id: les.id,
              title: les.title,
              slug: les.slug,
              duration: les.duration,
              introText: les.intro_text,
              hasManual: Boolean(les.manual_text),
              completed: prog ? Boolean(prog.completed) : false
            };
          })
        );

        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          lessons: lessonsWithProgress
        };
      })
    );

    res.json({
      level: { id: level.id, code: level.code, name: level.name },
      categories: categoriesWithLessons
    });
  } catch (err) {
    next(err);
  }
};

export const getLessonDetail = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const lesson = await get("SELECT * FROM studio_lessons WHERE id = ? OR slug = ?", [id, id]);
    if (!lesson) {
      return res.status(404).json({ error: 'Lezione non trovata.' });
    }

    const blocks = await query(
      "SELECT * FROM studio_interactive_blocks WHERE lesson_id = ? ORDER BY order_index ASC",
      [lesson.id]
    );

    const parsedBlocks = blocks.map((b) => ({
      id: b.id,
      type: b.type,
      title: b.title,
      instruction: b.instruction,
      config: JSON.parse(b.config_json)
    }));

    const progress = await get(
      "SELECT completed FROM user_lesson_progress WHERE user_id = ? AND lesson_id = ?",
      [userId, lesson.id]
    );

    const prevLesson = await get(
      "SELECT id, title, slug FROM studio_lessons WHERE category_id = ? AND order_index < ? ORDER BY order_index DESC LIMIT 1",
      [lesson.category_id, lesson.order_index]
    );

    const nextLesson = await get(
      "SELECT id, title, slug FROM studio_lessons WHERE category_id = ? AND order_index > ? ORDER BY order_index ASC LIMIT 1",
      [lesson.category_id, lesson.order_index]
    );

    res.json({
      lesson: {
        id: lesson.id,
        categoryId: lesson.category_id,
        title: lesson.title,
        slug: lesson.slug,
        duration: lesson.duration,
        introText: lesson.intro_text,
        manualText: lesson.manual_text,
        completed: progress ? Boolean(progress.completed) : false
      },
      blocks: parsedBlocks,
      navigation: {
        prev: prevLesson ? { id: prevLesson.id, title: prevLesson.title, slug: prevLesson.slug } : null,
        next: nextLesson ? { id: nextLesson.id, title: nextLesson.title, slug: nextLesson.slug } : null
      }
    });
  } catch (err) {
    next(err);
  }
};

export const toggleLessonProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { completed } = req.body;

    const lesson = await get("SELECT id FROM studio_lessons WHERE id = ?", [id]);
    if (!lesson) {
      return res.status(404).json({ error: 'Lezione non trovata.' });
    }

    const isCompleted = completed ? 1 : 0;

    await run(
      `INSERT INTO user_lesson_progress (user_id, lesson_id, completed, updated_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id, lesson_id) DO UPDATE SET completed = excluded.completed, updated_at = CURRENT_TIMESTAMP`,
      [userId, lesson.id, isCompleted]
    );

    res.json({
      message: 'Progresso aggiornato con successo',
      lessonId: lesson.id,
      completed: Boolean(isCompleted)
    });
  } catch (err) {
    next(err);
  }
};
