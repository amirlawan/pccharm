# Admin Dashboard & Final Exam Guide

## 1. Setting Up the Final Exam
I have generated a SQL script `html_final_exam.sql` that creates a 30-question final exam for the HTML course.

**Steps:**
1.  Open your SQL Editor (Supabase Dashboard or local client).
2.  Run the contents of `html_final_exam.sql`.
3.  This will add a "Final Exam" module to the end of your HTML course.

## 2. Using the New Admin Dashboard
The Admin Dashboard (`/admin`) has been upgraded to a full system controller.

### Accessing the Dashboard
Ensure your user profile has `is_admin = true` in the database.

### Features
*   **Tabs Interface**: Switch between **Course Management** and **User Management**.
*   **User Management**:
    *   View a list of all registered users.
    *   See their role (Student vs Admin) and last update time.
*   **Course Management**:
    *   **Create New Course**: Click the "New" button to start a fresh course. You can set the ID, Title, Description, and Icon.
    *   **Edit Course Details**: Click the "pencil" icon next to any course to edit its metadata.
    *   **Manage Lessons**: Select a course to see its lessons. You can add, edit, reorder, and delete lessons.
    *   **Manage Quizzes**: Inside the lesson editor, you can add/edit quiz questions for that specific lesson.

## Troubleshooting
*   **"Admin Access Denied"**: Check the `profiles` table and ensure your user row has the `is_admin` column set to `true`.
*   **"Exam not showing"**: Ensure you ran `html_final_exam.sql` successfully.
*   **"Legacy Quiz Issues"**: If you previously used lesson-based quizzes, they are still supported in the Admin panel under "Lesson Quiz Questions".
