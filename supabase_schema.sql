-- Create profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone,
  
  constraint username_length check (char_length(full_name) >= 3)
);

-- Establish Row Level Security (RLS) for profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create courses table
create table public.courses (
  id text primary key, -- using text id (e.g. 'html') for pretty URLs
  title text not null,
  description text,
  icon text, -- font awesome class
  category text,
  category_label text,
  badge text,
  is_placeholder boolean default false,
  price integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for courses
alter table public.courses enable row level security;

create policy "Courses are viewable by everyone."
  on courses for select
  using ( true );

-- Create enrollments table
create table public.enrollments (
  user_id uuid references auth.users not null,
  course_id text references public.courses not null,
  enrolled_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_lessons text[] default '{}', -- array of lesson IDs
  progress integer default 0, -- percentage
  
  primary key (user_id, course_id)
);

-- Enable RLS for enrollments
alter table public.enrollments enable row level security;

create policy "Users can view their own enrollments."
  on enrollments for select
  using ( auth.uid() = user_id );

create policy "Users can create their own enrollments."
  on enrollments for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own enrollments."
  on enrollments for update
  using ( auth.uid() = user_id );

-- Create lessons table
create table public.lessons (
  id uuid default gen_random_uuid() primary key,
  course_id text references public.courses not null,
  title text not null,
  content text, -- markdown content
  video_url text,
  duration_minutes integer,
  "order" integer not null, -- for sorting lessons
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for lessons
alter table public.lessons enable row level security;

-- Only enrolled users should see lessons, but for now let's make them public to see content
-- In a real paid app, you'd check exists(select 1 from enrollments where ...)
create policy "Lessons are viewable by everyone."
  on lessons for select
  using ( true );

-- SEED DATA: Insert courses from static data
insert into public.courses (id, title, description, icon, category, category_label, badge, is_placeholder)
values
  ('html', 'HTML', 'Master the foundational language for creating web pages and structuring content.', 'fab fa-html5', 'web-development', 'Programming & Web Dev', null, false),
  ('css', 'CSS', 'Learn to style web pages, control layouts, and create visually appealing designs.', 'fab fa-css3-alt', 'web-development', 'Programming & Web Dev', null, false),
  ('js', 'JavaScript', 'Add interactivity, dynamic content, and complex features to your websites.', 'fab fa-js-square', 'web-development', 'Programming & Web Dev', null, false),
  ('bootstrap', 'Bootstrap', 'Utilize this popular framework for building responsive, mobile-first websites quickly.', 'fab fa-bootstrap', 'web-development', 'Programming & Web Dev', null, false),
  ('react', 'React', 'Build powerful, interactive user interfaces with this leading JavaScript library.', 'fab fa-react', 'web-development', 'Programming & Web Dev', null, false),
  ('php', 'PHP', 'Learn server-side scripting for web development, database interaction, and more.', 'fab fa-php', 'web-development', 'Programming & Web Dev', null, false),
  ('csharp', 'C#', 'Explore object-oriented programming with C# for web, desktop, and game development.', 'fas fa-hashtag', 'web-development', 'Programming & Web Dev', null, false),
  ('java', 'JAVA', 'Master versatile, object-oriented Java for enterprise applications, Android dev, and more.', 'fab fa-java', 'web-development', 'Programming & Web Dev', null, false),
  ('python', 'Python', 'Learn the highly popular language for web dev, data science, AI, automation, and more.', 'fab fa-python', 'web-development', 'Programming & Web Dev', null, false),
  ('c', 'C Programming', 'Understand fundamental programming concepts with the powerful C language.', 'fas fa-file-code', 'web-development', 'Programming & Web Dev', null, false),
  ('sql', 'SQL', 'Learn to manage and query relational databases effectively using Structured Query Language.', 'fas fa-database', 'data-management', 'Data Management', null, false),
  ('linux', 'Linux Basics', 'Get comfortable with the Linux command line, file system, and essential utilities.', 'fab fa-linux', 'os-networking', 'OS & Networking', null, false),
  ('networking', 'Networking Fundamentals', 'Understand core networking concepts, protocols (TCP/IP), and network architecture.', 'fas fa-network-wired', 'os-networking', 'OS & Networking', null, false),
  ('pentesting', 'Penetration Testing', 'Learn techniques to simulate attacks, identify vulnerabilities, and secure systems.', 'fas fa-user-secret', 'cybersecurity', 'Cybersecurity & Ethical Hacking', null, false),
  ('ethical-hacking', 'Ethical Hacking Essentials', 'Explore hacking methodologies and tools from an ethical perspective.', 'fas fa-mask', 'cybersecurity', 'Cybersecurity & Ethical Hacking', null, false),
  ('network-security', 'Network Security', 'Understand firewalls, VPNs, intrusion detection, and securing network infrastructure.', 'fas fa-shield-virus', 'cybersecurity', 'Cybersecurity & Ethical Hacking', null, false),
  ('chatgpt', 'Introduction to ChatGPT', 'Explore the capabilities and applications of large language models like ChatGPT.', 'fas fa-comments', 'emerging-specialized', 'Emerging & Specialized', 'New', false),
  ('data-science', 'Data Science Fundamentals', 'Learn the basics of data analysis, visualization, and machine learning concepts.', 'fas fa-chart-line', 'emerging-specialized', 'Emerging & Specialized', 'New', false),
  ('career-roadmap', 'Career Roadmap Planning', 'Develop strategies for navigating the tech job market and planning your career path.', 'fas fa-map-signs', 'emerging-specialized', 'Emerging & Specialized', 'New', false),
  ('ai-intro', 'Introduction to AI', 'Grasp the fundamental concepts and history behind Artificial Intelligence.', 'fas fa-robot', 'emerging-specialized', 'Emerging & Specialized', null, false),
  ('git', 'Version Control (Git & GitHub)', 'Learn essential Git commands and collaboration workflows using GitHub.', 'fab fa-git-alt', 'other-upcoming', 'Other & Upcoming', null, false),
  ('cloud', 'Cloud Computing Basics', 'Introduction to core cloud concepts using platforms like AWS or Azure.', 'fas fa-cloud', 'other-upcoming', 'Other & Upcoming', null, false),
  ('agile', 'Agile & Scrum Fundamentals', 'Understand agile principles and the Scrum framework for project management.', 'fas fa-sync-alt', 'other-upcoming', 'Other & Upcoming', null, false),
  ('technical-writing', 'Technical Writing', 'Learn to write clear and concise documentation for technical audiences.', 'fas fa-pencil-alt', 'other-upcoming', 'Other & Upcoming', null, false),
  ('more', 'More Coming Soon...', 'We''re constantly developing new courses to keep you ahead of the curve.', 'fas fa-hourglass-half', 'other-upcoming', 'Other & Upcoming', null, true)
on conflict (id) do nothing;

-- Function to handle new user profile creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
