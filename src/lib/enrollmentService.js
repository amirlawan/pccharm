import { supabase } from './supabaseClient';

/**
 * Enrolls a user in a course
 * @param {string} courseId - The ID of the course
 * @param {string} userId - The ID of the user
 * @returns {Promise<{data, error}>}
 */
export const enrollUser = async (courseId, userId) => {
    try {
        const { data, error } = await supabase
            .from('enrollments')
            .insert([
                { user_id: userId, course_id: courseId }
            ])
            .select();

        return { data, error };
    } catch (error) {
        return { data: null, error };
    }
};

/**
 * Fetches all courses a user is enrolled in
 * @param {string} userId - The ID of the user
 * @returns {Promise<{data: string[], error}>} - Returns array of course IDs
 */
export const getUserEnrollments = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('enrollments')
            .select('course_id')
            .eq('user_id', userId);

        if (error) throw error;

        // Return just the array of course IDs
        const courseIds = data.map(enrollment => enrollment.course_id);
        return { data: courseIds, error: null };
    } catch (error) {
        return { data: [], error };
    }
};
