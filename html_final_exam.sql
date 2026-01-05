-- HTML Final Exam Seed Data
-- 30 Complete Questions linking to 'final-exam' module

DO $$
DECLARE
  v_course_id text := 'html';
  v_quiz_id uuid;
  v_q_id uuid;
BEGIN
  -- 1. Create the Final Exam Quiz Entry
  -- We treat this as a special module 'final-exam' so it appears at the end
  INSERT INTO public.quizzes (course_id, title, description, module_id, "order")
  VALUES (
    v_course_id, 
    'HTML Final Exam', 
    'Comprehensive 30-question assessment covering all HTML modules. Score 80% to pass!', 
    'final-exam', 
    100 -- High order number to ensure it's at the end
  )
  RETURNING id INTO v_quiz_id;

  -- ========================================================
  -- QUESTIONS (30 Total)
  -- ========================================================

  -- Q1
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'What does HTML stand for?', 'HTML stands for HyperText Markup Language.', 1) RETURNING id INTO v_q_id;
  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, 'HyperText Markup Language', true),
  (v_q_id, 'Hyperlinks and Text Markup Language', false),
  (v_q_id, 'Home Tool Markup Language', false),
  (v_q_id, 'HyperTech Markup Logic', false);

  -- Q2
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which HTML tag is the root element of an HTML document?', 'The <html> tag is the root element.', 2) RETURNING id INTO v_q_id;
  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<html>', true),
  (v_q_id, '<root>', false),
  (v_q_id, '<base>', false),
  (v_q_id, '<head>', false);

  -- Q3
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which tag contains the visible content of the page?', 'The <body> tag contains the visible content.', 3) RETURNING id INTO v_q_id;
  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<body>', true),
  (v_q_id, '<head>', false),
  (v_q_id, '<display>', false),
  (v_q_id, '<vis>', false);

  -- Q4
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'What is the correct HTML element for the largest heading?', '<h1> is the largest heading.', 4) RETURNING id INTO v_q_id;
  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<h1>', true),
  (v_q_id, '<heading>', false),
  (v_q_id, '<head>', false),
  (v_q_id, '<h6>', false);

  -- Q5
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which element is used to define a paragraph?', '<p> defines a paragraph.', 5) RETURNING id INTO v_q_id;
  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<p>', true),
  (v_q_id, '<para>', false),
  (v_q_id, '<text>', false),
  (v_q_id, '<graph>', false);

  -- Q6
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which attribute allows you to open a link in a new tab?', 'target="_blank" opens the link in a new tab.', 6) RETURNING id INTO v_q_id;
  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, 'target="_blank"', true),
  (v_q_id, 'target="new"', false),
  (v_q_id, 'window="_blank"', false),
  (v_q_id, 'href="_blank"', false);

  -- Q7
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which tag is used to create a numbered list?', '<ol> creates an Ordered List.', 7) RETURNING id INTO v_q_id;
  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<ol>', true),
  (v_q_id, '<ul>', false),
  (v_q_id, '<dl>', false),
  (v_q_id, '<list>', false);

  -- Q8
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which tag is used to create a bullet point list?', '<ul> creates an Unordered List.', 8) RETURNING id INTO v_q_id;
  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<ul>', true),
  (v_q_id, '<ol>', false),
  (v_q_id, '<bl>', false),
  (v_q_id, '<li>', false);

  -- Q9
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'What is the correct HTML for inserting an image?', 'The <img> tag uses the src attribute.', 9) RETURNING id INTO v_q_id;
  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<img src="image.gif" alt="MyImage">', true),
  (v_q_id, '<image src="image.gif" alt="MyImage">', false),
  (v_q_id, '<img href="image.gif" alt="MyImage">', false),
  (v_q_id, '<pic src="image.gif">', false);

  -- Q10
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which attribute specifies the URL of a link?', 'The href attribute specifies the link destination.', 10) RETURNING id INTO v_q_id;
  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, 'href', true),
  (v_q_id, 'url', false),
  (v_q_id, 'link', false),
  (v_q_id, 'src', false);

  -- Q11
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which input type is used for email addresses because it automatically validates the format?', 'type="email" checks for valid email format.', 11) RETURNING id INTO v_q_id;
  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, 'email', true),
  (v_q_id, 'text', false),
  (v_q_id, 'mail', false),
  (v_q_id, 'validate', false);

  -- Q12
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which HTML element defines a table row?', '<tr> means Table Row.', 12) RETURNING id INTO v_q_id;
  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<tr>', true),
  (v_q_id, '<td>', false),
  (v_q_id, '<th>', false),
  (v_q_id, '<row>', false);

  -- Q13
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Who is making the Web standards?', 'The World Wide Web Consortium (W3C) develops the standards.', 13) RETURNING id INTO v_q_id;
  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, 'The World Wide Web Consortium', true),
  (v_q_id, 'Google', false),
  (v_q_id, 'Microsoft', false),
  (v_q_id, 'Mozilla', false);

  -- Q14
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'What is the correct HTML for making a checkbox?', '<input type="checkbox"> creates a checkbox.', 14) RETURNING id INTO v_q_id;
  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<input type="checkbox">', true),
  (v_q_id, '<check>', false),
  (v_q_id, '<checkbox>', false),
  (v_q_id, '<input type="check">', false);

  -- Q15
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'What is the correct HTML for making a text input field?', '<input type="text"> creates a text field.', 15) RETURNING id INTO v_q_id;
  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<input type="text">', true),
  (v_q_id, '<textfield>', false),
  (v_q_id, '<textinput>', false),
  (v_q_id, '<input type="textfield">', false);

  -- Q16
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which character is used to indicate an end tag?', 'The slash / is used, e.g., </p>.', 16) RETURNING id INTO v_q_id;
  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '/', true),
  (v_q_id, '<', false),
  (v_q_id, '*', false),
  (v_q_id, '^', false);

  -- Q17
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'How can you open a link in a new browser window?', 'Using target="_blank".', 17) RETURNING id INTO v_q_id;
  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<a href="url" target="_blank">', true),
  (v_q_id, '<a href="url" new>', false),
  (v_q_id, '<a href="url" target="new">', false),
  (v_q_id, '<a href="url" open="new">', false);

  -- Q18
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which HTML element defines navigation links?', 'The <nav> element is semantic HTML for navigation.', 18) RETURNING id INTO v_q_id;
  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<nav>', true),
  (v_q_id, '<navigation>', false),
  (v_q_id, '<navigate>', false),
  (v_q_id, '<links>', false);

  -- Q19
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'In HTML, which attribute is used to specify that an input field must be filled out?', 'The required attribute.', 19) RETURNING id INTO v_q_id;
  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, 'required', true),
  (v_q_id, 'validate', false),
  (v_q_id, 'placeholder', false),
  (v_q_id, 'mustfill', false);

  -- Q20
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which HTML element is used to specify a footer for a document or section?', '<footer> is the semantic element.', 20) RETURNING id INTO v_q_id;
  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<footer>', true),
  (v_q_id, '<bottom>', false),
  (v_q_id, '<section>', false),
  (v_q_id, '<foot>', false);

  -- Q21
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which doctype is correct for HTML5?', '<!DOCTYPE html> is correct.', 21) RETURNING id INTO v_q_id;
  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<!DOCTYPE html>', true),
  (v_q_id, '<!DOCTYPE HTML5>', false),
  (v_q_id, '<!DOCTYPE html PUBLIC "X">', false),
  (v_q_id, '<!html>', false);

  -- Q22
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which element is used to represent the result of a calculation?', 'The <output> element.', 22) RETURNING id INTO v_q_id;
  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<output>', true),
  (v_q_id, '<result>', false),
  (v_q_id, '<calc>', false),
  (v_q_id, '<total>', false);

  -- Q23
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which tag is used to define a client-side image-map?', '<map> defines the map, <area> defines regions.', 23) RETURNING id INTO v_q_id;
  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<map>', true),
  (v_q_id, '<img>', false),
  (v_q_id, '<area>', false),
  (v_q_id, '<plan>', false);

  -- Q24
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'HTML comments start with <!-- and end with -->', 'Standard HTML comment syntax.', 24) RETURNING id INTO v_q_id;
  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, 'True', true),
  (v_q_id, 'False', false),
  (v_q_id, 'Only in HTML4', false),
  (v_q_id, 'Sometimes', false);

  -- Q25
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which tag is used for a drop-down list?', '<select> creates the list, <option> creates items.', 25) RETURNING id INTO v_q_id;
  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<select>', true),
  (v_q_id, '<list>', false),
  (v_q_id, '<dropdown>', false),
  (v_q_id, '<input type="dropdown">', false);

  -- Q26
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'What is the correct HTML for inserting a background image?', 'Currently done via CSS, but <body> had a background attribute in old HTML. Question implies CSS or older syntax, but let''s pick the conceptual one.', 26) RETURNING id INTO v_q_id;
  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, 'Use CSS background-image', true),
  (v_q_id, '<background img="bg.jpg">', false),
  (v_q_id, '<img background="bg.jpg">', false),
  (v_q_id, '<body bg="bg.jpg">', false);

  -- Q27
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'The <title> element must be located inside which tag?', 'It is metadata inside <head>.', 27) RETURNING id INTO v_q_id;
  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<head>', true),
  (v_q_id, '<body>', false),
  (v_q_id, '<html> but outside <head>', false),
  (v_q_id, '<footer>', false);

  -- Q28
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which tag is used to make text italic?', '<i> or <em>.', 28) RETURNING id INTO v_q_id;
  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<i>', true),
  (v_q_id, '<italic>', false),
  (v_q_id, '<slanted>', false),
  (v_q_id, '<ii>', false);

  -- Q29
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which tag is used to make text bold?', '<b> or <strong>.', 29) RETURNING id INTO v_q_id;
  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, '<b>', true),
  (v_q_id, '<bold>', false),
  (v_q_id, '<bb>', false),
  (v_q_id, '<dark>', false);

  -- Q30
  INSERT INTO public.quiz_questions (quiz_id, question_text, explanation, "order")
  VALUES (v_quiz_id, 'Which input type defines a slider control?', '<input type="range"> creates a slider.', 30) RETURNING id INTO v_q_id;
  INSERT INTO public.quiz_options (question_id, option_text, is_correct) VALUES
  (v_q_id, 'range', true),
  (v_q_id, 'slider', false),
  (v_q_id, 'controls', false),
  (v_q_id, 'move', false);

END $$;
