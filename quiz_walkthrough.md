# HTML Course Quizzes Implementation

I have created two SQL files to add quizzes to your HTML course and updated the frontend to display them.

## 1. Database Changes
*   **Schema (`quiz_schema.sql`)**: Defines tables for `quizzes`, `quiz_questions`, and `quiz_options`.
*   **Content (`html_quizzes.sql`)**: Adds quiz data for all 8 HTML modules.
*   **Fix (`reset_quiz_schema.sql`)**: Use this if you encounter schema errors to reset the tables.

## 2. Frontend Integration
I have updated `src/pages/CourseViewer.jsx` to:
*   Fetch quizzes linked to the course.
*   Display "Module Assessment" at the end of each module in the sidebar.
*   Load and render the quiz interface when selected.

## How to Verify
1.  **Database Setup**:
    *   Run `reset_quiz_schema.sql` (if not done already).
    *   Run `html_quizzes.sql`.
2.  **Frontend Check**:
    *   Start the app (`npm run dev`).
    *   Navigate to the HTML Course.
    *   Check the sidebar: You should see a "Module X Assessment" at the bottom of each module list.
    *   Click on an assessment.
    *   Verify the quiz loads with questions.
    *   Try answering questions and submitting.

## Troubleshooting
*   **"Quiz not found"**: Ensure you ran `html_quizzes.sql`.
*   **"Column does not exist"**: Run `reset_quiz_schema.sql` and then `html_quizzes.sql` again.
