# Quiz Integration Implementation Plan

## Goal
Integrate the newly created module-based quizzes into the `CourseViewer` component. Quizzes should appear at the end of each module list.

## User Review Required
> [!IMPORTANT]
> Quizzes will now be linked to **Modules**, not individual lessons. Each module will have a "Module Assessment" at the end.

## Proposed Changes

### Frontend Logic (`src/pages/CourseViewer.jsx`)
1.  **Fetch Quizzes**: Update `fetchCourseContent` to fetch all quizzes for the course (joined with questions and options) from standard tables:
    *   `quizzes`
    *   `quiz_questions`
    *   `quiz_options`
2.  **Organize Quizzes**:
    *   Map quizzes to their respective modules (using `module_id` string like 'module-1').
    *   Inject a "Quiz" object into the `organizedLessons` structure at the end of each module's array.
    *   This "Quiz" object will mimic a lesson object (having an `id` and `title`) so it can be selected.
3.  **Render Quiz**:
    *   When `activeLesson` is identified as a Quiz, render the `QuizSection` component instead of `ReactMarkdown`.
    *   Transform the new DB structure to match `QuizSection`'s expected props:
        *   DB: `question_text`, options rows with `is_correct`
        *   Component Props: `question`, `options` (array of strings), `correct_index` (int)

### Component (`src/components/QuizSection.jsx`)
*   No major changes expected if data is transformed in parent, but might need minor tweaks for styling or prop validation.

## Verification Plan

### Manual Verification
1.  Open the HTML Course.
2.  Check that each Module (1-8) has a "Module X Assessment" at the end of the list.
3.  Click on a "Module Assessment".
4.  Verify the quiz loads with questions and options.
5.  Take a quiz:
    *   Select correct answers -> standard scoring.
    *   Select incorrect answers -> verify failure state.
6.  Verify that completion marks the module progress (if applicable, though progress logic might need separate work later).
