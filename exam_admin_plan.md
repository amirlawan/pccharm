# Final Exam & Admin Enhancement Plan

## Goal
1.  Add a comprehensive 30-question **Final Exam** to the HTML Course.
2.  Upgrade the **Admin Dashboard** to give the admin "full control" (User Management, Course Management).

## User Review Required
> [!IMPORTANT]
> The Final Exam will be added as a distinct section at the end of the course.

## Proposed Changes

### 1. HTML Final Exam
*   **Database**: Create `html_final_exam.sql` to insert the exam into `quizzes` with `module_id = 'final-exam'` and populate it with 30 questions covering all modules.
*   **Frontend**: Update `CourseViewer.jsx` to render the 'final-exam' module as a special "Final Exam" section after all modules.

### 2. Admin Dashboard (`src/pages/Admin.jsx`)
*   **Navigation**: Add tabs for [Courses] and [Users].
*   **User Management**:
    *   View list of all users from `profiles`.
    *   (Optional) Search users.
*   **Course Management**:
    *   **Add New Course**: Form to create a new entry in `courses` table.
    *   **Edit Course**: functionality to update title, description, icon.
*   **Lesson Management**: Keep existing functionality, but ensure it handles the new `type='quiz'` logic if possible (or at least doesn't break).

## Verification Plan

### Automated
*   None (Manual UI testing required).

### Manual Verification
1.  **Validating Final Exam**:
    *   Run `html_final_exam.sql`.
    *   Open HTML Course.
    *   Scroll to bottom -> Check for "Final Exam".
    *   Take the exam -> Verify 30 questions appear.
2.  **Validating Admin Panel**:
    *   Login as Admin.
    *   **Users Tab**: Verify list of users appears.
    *   **Courses Tab**:
        *   Click "Add Course" -> Create "Test Course".
        *   Verify it appears in the list.
        *   Edit "Test Course" -> Change title -> Verify update.
