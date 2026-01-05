-- HTML Quizzes Seed Data
-- Run this AFTER running quiz_schema.sql AND html_course_content.sql

-- Clear existing quizzes for HTML course
DELETE FROM public.quizzes WHERE course_id = 'html';

-- Helper function or just DO blocks for each module to manage IDs
DO $$
DECLARE
  v_quiz_id uuid;
  v_q_id uuid;
BEGIN
  -- ========================================================
  -- MODULE 1: Introduction to HTML
  -- ========================================================
  -- Create Quiz
  INSERT INTO public.quizzes (course_id, title, description, module_id, "order")
  VALUES ('html', 'Module 1 Assessment', 'Test your knowledge of HTML basics.', 'module-1', 1)
  RETURNING id INTO v_quiz_id;

  -- Question 1
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'What does HTML stand for?', 'HTML stands for HyperText Markup Language, the standard markup language for documents designed to be displayed in a web browser.', 1)
  RETURNING id INTO v_q_id;
  
  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, 'HyperText Markup Language', true),
  (v_q_id, 'HighTech Modern Language', false),
  (v_q_id, 'Hyper Transfer Markup Logic', false),
  (v_q_id, 'Home Tool Markup Language', false);

  -- Question 2
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which tag is used to create a paragraph?', 'The <p> tag defines a paragraph.', 2)
  RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<p>', true),
  (v_q_id, '<para>', false),
  (v_q_id, '<text>', false),
  (v_q_id, '<pg>', false);

  -- Question 3
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which of these is the correct file extension for an HTML file?', 'HTML files must be saved with the .html extension.', 3)
  RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '.html', true),
  (v_q_id, '.ht', false),
  (v_q_id, '.web', false),
  (v_q_id, '.txt', false);


  -- ========================================================
  -- MODULE 2: HTML Document Structure
  -- ========================================================
  -- Create Quiz
  INSERT INTO public.quizzes (course_id, title, description, module_id, "order")
  VALUES ('html', 'Module 2 Assessment', 'Test your understanding of HTML document structure.', 'module-2', 2)
  RETURNING id INTO v_quiz_id;

  -- Question 1
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which element contains the visible content of a web page?', 'The <body> element contains all the contents of an HTML document, such as headings, paragraphs, images, hyperlinks, tables, lists, etc.', 1)
  RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<body>', true),
  (v_q_id, '<head>', false),
  (v_q_id, '<html>', false),
  (v_q_id, '<display>', false);

  -- Question 2
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'What is the correct HTML5 doctype declaration?', 'The <!DOCTYPE html> declaration is the correct one for HTML5 and must be the first thing in your HTML document.', 2)
  RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<!DOCTYPE html>', true),
  (v_q_id, '<!DOCTYPE HTML5>', false),
  (v_q_id, '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN">', false),
  (v_q_id, '<html5>', false);

  -- Question 3
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Where generally should the <title> tag be placed?', 'The <title> tag is metadata and belongs inside the <head> element.', 3)
  RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, 'Inside the <head> element', true),
  (v_q_id, 'Inside the <body> element', false),
  (v_q_id, 'Before the <html> element', false),
  (v_q_id, 'Inside the <footer> element', false);


  -- ========================================================
  -- MODULE 3: Text Formatting
  -- ========================================================
  -- Create Quiz
  INSERT INTO public.quizzes (course_id, title, description, module_id, "order")
  VALUES ('html', 'Module 3 Assessment', 'Check your knowledge of text formatting tags.', 'module-3', 3)
  RETURNING id INTO v_quiz_id;

  -- Question 1
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which HTML tag defines the most important heading?', '<h1> defines the most important heading. <h6> defines the least important heading.', 1)
  RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<h1>', true),
  (v_q_id, '<heading>', false),
  (v_q_id, '<h6>', false),
  (v_q_id, '<h0>', false);

  -- Question 2
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which tag is used to define strong importance (and typically renders as bold)?', 'The <strong> tag is used to define text with strong importance.', 2)
  RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<strong>', true),
  (v_q_id, '<bold>', false),
  (v_q_id, '<important>', false),
  (v_q_id, '<high>', false);

  -- Question 3
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'How do you insert a line break without starting a new paragraph?', 'The <br> tag inserts a single line break.', 3)
  RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<br>', true),
  (v_q_id, '<lb>', false),
  (v_q_id, '<break>', false),
  (v_q_id, '<enter>', false);


  -- ========================================================
  -- MODULE 4: Lists
  -- ========================================================
  -- Create Quiz
  INSERT INTO public.quizzes (course_id, title, description, module_id, "order")
  VALUES ('html', 'Module 4 Assessment', 'Test your skills with HTML lists.', 'module-4', 4)
  RETURNING id INTO v_quiz_id;

  -- Question 1
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which tag is used to create an unordered (bulleted) list?', '<ul> stands for Unordered List.', 1)
  RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<ul>', true),
  (v_q_id, '<ol>', false),
  (v_q_id, '<list>', false),
  (v_q_id, '<dl>', false);

  -- Question 2
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which tag is used to create a numbered list?', '<ol> stands for Ordered List.', 2)
  RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<ol>', true),
  (v_q_id, '<ul>', false),
  (v_q_id, '<nl>', false),
  (v_q_id, '<num>', false);

  -- Question 3
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'What tag defines a list item?', 'The <li> tag defines a list item, used in both <ul> and <ol>.', 3)
  RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<li>', true),
  (v_q_id, '<item>', false),
  (v_q_id, '<listitem>', false),
  (v_q_id, '<il>', false);


  -- ========================================================
  -- MODULE 5: Links & Navigation
  -- ========================================================
  -- Create Quiz
  INSERT INTO public.quizzes (course_id, title, description, module_id, "order")
  VALUES ('html', 'Module 5 Assessment', 'How well do you know HTML links?', 'module-5', 5)
  RETURNING id INTO v_quiz_id;

  -- Question 1
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which attribute specifies the URL of the page the link goes to?', 'The href attribute specifies the destination of the link.', 1)
  RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, 'href', true),
  (v_q_id, 'src', false),
  (v_q_id, 'url', false),
  (v_q_id, 'link', false);

  -- Question 2
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'How do you open a link in a new tab or window?', 'target="_blank" opens the linked document in a new window or tab.', 2)
  RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, 'target="_blank"', true),
  (v_q_id, 'target="new"', false),
  (v_q_id, 'open="new"', false),
  (v_q_id, 'window="new"', false);

  -- Question 3
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which protocol is used to create an email link?', 'The mailto: protocol is used to open the user''s email client.', 3)
  RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, 'mailto:', true),
  (v_q_id, 'email:', false),
  (v_q_id, 'smtp:', false),
  (v_q_id, 'send:', false);


  -- ========================================================
  -- MODULE 6: Images & Multimedia
  -- ========================================================
  -- Create Quiz
  INSERT INTO public.quizzes (course_id, title, description, module_id, "order")
  VALUES ('html', 'Module 6 Assessment', 'Test your knowledge on adding images.', 'module-6', 6)
  RETURNING id INTO v_quiz_id;

  -- Question 1
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which attribute is required for web accessibility to describe an image?', 'The alt attribute provides alternative text for screen readers and search engines.', 1)
  RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, 'alt', true),
  (v_q_id, 'title', false),
  (v_q_id, 'desc', false),
  (v_q_id, 'description', false);

  -- Question 2
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which tag is used to display an image?', 'The <img> tag embeds an image in an HTML page.', 2)
  RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<img>', true),
  (v_q_id, '<image>', false),
  (v_q_id, '<pic>', false),
  (v_q_id, '<photo>', false);

  -- Question 3
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which image format is generally best for complex photographs?', 'JPEG is typically best for photos due to its compression, while PNG/SVG are better for logos and graphics.', 3)
  RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, 'JPEG (.jpg)', true),
  (v_q_id, 'GIF', false),
  (v_q_id, 'SVG', false),
  (v_q_id, 'BMP', false);


  -- ========================================================
  -- MODULE 7: Tables
  -- ========================================================
  -- Create Quiz
  INSERT INTO public.quizzes (course_id, title, description, module_id, "order")
  VALUES ('html', 'Module 7 Assessment', 'Check your understanding of HTML tables.', 'module-7', 7)
  RETURNING id INTO v_quiz_id;

  -- Question 1
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which tag is used to define a table row?', '<tr> stands for Table Row.', 1)
  RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<tr>', true),
  (v_q_id, '<row>', false),
  (v_q_id, '<td>', false),
  (v_q_id, '<line>', false);

  -- Question 2
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which tag creates a header cell that is typically bold and centered?', '<th> stands for Table Header.', 2)
  RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<th>', true),
  (v_q_id, '<thead>', false),
  (v_q_id, '<h>', false),
  (v_q_id, '<head>', false);

  -- Question 3
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which element should contain the main data rows of the table?', 'The <tbody> element contains the body content of the table.', 3)
  RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<tbody>', true),
  (v_q_id, '<main>', false),
  (v_q_id, '<content>', false),
  (v_q_id, '<data>', false);


  -- ========================================================
  -- MODULE 8: Forms
  -- ========================================================
  -- Create Quiz
  INSERT INTO public.quizzes (course_id, title, description, module_id, "order")
  VALUES ('html', 'Module 8 Assessment', 'Final check: How well do you know HTML forms?', 'module-8', 8)
  RETURNING id INTO v_quiz_id;

  -- Question 1
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which tag is used to create an interactive control for user input?', 'The <input> tag is the most common form element.', 1)
  RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<input>', true),
  (v_q_id, '<field>', false),
  (v_q_id, '<entry>', false),
  (v_q_id, '<type>', false);

  -- Question 2
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which attribute forces a user to fill out a field before submitting?', 'The required attribute specifies that an input field must be filled out.', 2)
  RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, 'required', true),
  (v_q_id, 'mandatory', false),
  (v_q_id, 'validate', false),
  (v_q_id, 'needed', false);

  -- Question 3
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which HTML element represents a drop-down list?', 'The <select> element creates a drop-down list.', 3)
  RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<select>', true),
  (v_q_id, '<dropdown>', false),
  (v_q_id, '<list>', false),
  (v_q_id, '<option>', false);

END $$;
