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

/**
 * Unenrolls a user from a course (permanent deletion of progress)
 * @param {string} courseId - The ID of the course
 * @param {string} userId - The ID of the user
 * @returns {Promise<{data, error}>}
 */
export const unenrollUser = async (courseId, userId) => {
    try {
        const { data, error } = await supabase
            .from('enrollments')
            .delete()
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .select();

        if (!error && (!data || data.length === 0)) {
            return { 
                data: null, 
                error: { message: "Database rejected the deletion. Please run the provided SQL command in your Supabase SQL Editor to allow users to delete their enrollments." } 
            };
        }

        return { data, error };
    } catch (error) {
        return { data: null, error };
    }
};
