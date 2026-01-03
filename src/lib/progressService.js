import { supabase } from './supabaseClient';

/**
 * Mark a lesson as complete for a user
 */
export const markLessonComplete = async (userId, courseId, lessonId) => {
    try {
        // First, get current enrollment data
        const { data: enrollment, error: fetchError } = await supabase
            .from('enrollments')
            .select('completed_lessons')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single();

        if (fetchError) throw fetchError;

        // Check if lesson is already completed
        const completedLessons = enrollment?.completed_lessons || [];
        if (completedLessons.includes(lessonId)) {
            return { success: true, alreadyComplete: true };
        }

        // Add lesson to completed array
        const newCompletedLessons = [...completedLessons, lessonId];

        // Get total lessons for this course to calculate progress
        const { data: allLessons, error: lessonsError } = await supabase
            .from('lessons')
            .select('id')
            .eq('course_id', courseId);

        if (lessonsError) throw lessonsError;

        const totalLessons = allLessons?.length || 1;
        const progress = Math.round((newCompletedLessons.length / totalLessons) * 100);

        // Update enrollment with new progress
        const { error: updateError } = await supabase
            .from('enrollments')
            .update({
                completed_lessons: newCompletedLessons,
                progress: progress
            })
            .eq('user_id', userId)
            .eq('course_id', courseId);

        if (updateError) throw updateError;

        return {
            success: true,
            progress,
            completedLessons: newCompletedLessons
        };
    } catch (error) {
        console.error('Error marking lesson complete:', error);
        return { success: false, error };
    }
};

/**
 * Get user's progress for a course
 */
export const getCourseProgress = async (userId, courseId) => {
    try {
        const { data, error } = await supabase
            .from('enrollments')
            .select('progress, completed_lessons')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching progress:', error);
        return { progress: 0, completed_lessons: [] };
    }
};

/**
 * Check if a specific lesson is completed
 */
export const isLessonComplete = (completedLessons, lessonId) => {
    return completedLessons?.includes(lessonId) || false;
};
