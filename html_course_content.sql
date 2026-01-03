-- HTML Course Content - Based on "HTML for Beginners" Document
-- Replaces old lesson content with structured modules (1-8)
-- Run this in Supabase SQL Editor

-- First, delete existing HTML lessons to replace with new content
DELETE FROM lessons WHERE course_id = 'html';

-- Insert new lessons organized by modules
INSERT INTO lessons (course_id, title, content, "order", duration_minutes) VALUES

-- ==========================================
-- MODULE 1: INTRODUCTION TO HTML
-- ==========================================
('html', 'Module 1: Introduction to HTML', '# Module 1: Introduction to HTML

Welcome to the world of web development! In this module, you will learn what HTML is, why it is important, and how it forms the backbone of every website you visit.

## What is HTML?

**HTML** stands for **HyperText Markup Language**. It is the standard language used to create and structure content on the web.

- **HyperText**: Text that contains links to other text
- **Markup**: A way to annotate content with tags
- **Language**: A standardized set of rules and syntax

## Why Learn HTML?

1. **Foundation of the Web** - Every website uses HTML
2. **Easy to Learn** - Simple, readable syntax
3. **Universal** - Works on all browsers and devices
4. **Gateway to Web Development** - Required before CSS and JavaScript

## How HTML Works

HTML uses **tags** to mark up content. Tags are enclosed in angle brackets:

```html
<tagname>Content goes here</tagname>
```

Most tags come in pairs:
- **Opening tag**: `<p>`
- **Closing tag**: `</p>`

## Your First HTML Code

```html
<!DOCTYPE html>
<html>
<head>
    <title>My First Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>Welcome to my website.</p>
</body>
</html>
```

> **Pro Tip:** Always save your HTML files with the `.html` extension!', 1, 15),

('html', '1.1 What is HTML?', '# What is HTML?

HTML (HyperText Markup Language) is the standard markup language for creating web pages. It describes the structure and content of a web page.

## Key Concepts

### Tags
Tags are the building blocks of HTML. They tell the browser how to display content.

```html
<tagname>Content</tagname>
```

### Elements
An element is a complete tag with its content:
- Opening tag: `<p>`
- Content: The text or nested elements
- Closing tag: `</p>`

### Attributes
Attributes provide additional information about elements:

```html
<a href="https://example.com">Click here</a>
```

Here, `href` is an attribute of the `<a>` tag.

## HTML is NOT Programming

HTML is a **markup language**, not a programming language. It does not have:
- Variables
- Loops
- Conditional logic

HTML only **describes** how content should be structured and displayed.

## The Role of HTML in Web Development

| Technology | Purpose |
|------------|---------|
| HTML | Structure and content |
| CSS | Styling and layout |
| JavaScript | Interactivity and logic |

> **Remember:** HTML is the skeleton of a web page!', 2, 10),

('html', '1.2 Setting Up Your Environment', '# Setting Up Your Development Environment

Before writing HTML, you need two tools:
1. A **text editor** to write code
2. A **web browser** to view your pages

## Recommended Text Editors

### Visual Studio Code (Recommended)
- Free and open source
- Great extension support
- Built-in terminal
- Download: [code.visualstudio.com](https://code.visualstudio.com)

### Other Options
- **Sublime Text** - Fast and lightweight
- **Atom** - Customizable
- **Notepad++** - Simple Windows editor

## Essential VS Code Extensions

1. **Live Server** - Auto-refresh preview
2. **Prettier** - Code formatting
3. **HTML CSS Support** - IntelliSense
4. **Auto Rename Tag** - Sync tag names

## Creating Your First HTML File

1. Open VS Code
2. Create a new file
3. Save it as `index.html`
4. Type `!` and press Tab for boilerplate

## Viewing Your HTML

### Method 1: Double-click
- Find your `.html` file
- Double-click to open in browser

### Method 2: Live Server
- Right-click in VS Code
- Select "Open with Live Server"
- Changes auto-refresh!

> **Tip:** Use Live Server for faster development!', 3, 12),

-- ==========================================
-- MODULE 2: HTML DOCUMENT STRUCTURE
-- ==========================================
('html', 'Module 2: HTML Document Structure', '# Module 2: HTML Document Structure

Every HTML document follows a specific structure. Understanding this structure is essential for creating valid, well-formed web pages.

## The HTML Boilerplate

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title</title>
</head>
<body>
    <!-- Your content goes here -->
</body>
</html>
```

## Document Type Declaration

`<!DOCTYPE html>` tells the browser this is an HTML5 document.

## The Root Element

`<html>` is the root element that contains all other elements.

## Head vs Body

| Section | Purpose |
|---------|---------|
| `<head>` | Metadata, title, links to CSS |
| `<body>` | Visible content |

> **Key Point:** The `<head>` contains information *about* the page, while the `<body>` contains the actual content users see.', 4, 15),

('html', '2.1 DOCTYPE Declaration', '# DOCTYPE Declaration

The DOCTYPE declaration is the very first line in an HTML document.

## Syntax

```html
<!DOCTYPE html>
```

## Purpose

- Tells the browser which HTML version to use
- Triggers **standards mode** rendering
- Prevents **quirks mode** issues

## Important Notes

1. **Not an HTML tag** - It is a declaration
2. **Case insensitive** - `<!DOCTYPE html>` = `<!doctype html>`
3. **Required** - Always include it
4. **No closing tag** - Self-contained

## Historical DOCTYPEs

Old HTML versions had complex DOCTYPEs:

```html
<!-- HTML 4.01 Strict -->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
   "http://www.w3.org/TR/html4/strict.dtd">
```

HTML5 simplified this to just:
```html
<!DOCTYPE html>
```

> **Best Practice:** Always use `<!DOCTYPE html>` as your first line!', 5, 8),

('html', '2.2 The HTML Element', '# The HTML Element

The `<html>` element is the root of an HTML document.

## Syntax

```html
<html lang="en">
    <!-- All content goes here -->
</html>
```

## The lang Attribute

The `lang` attribute specifies the language of the document:

```html
<html lang="en">     <!-- English -->
<html lang="es">     <!-- Spanish -->
<html lang="fr">     <!-- French -->
<html lang="ar">     <!-- Arabic -->
<html lang="zh">     <!-- Chinese -->
```

## Why Use lang?

1. **Accessibility** - Screen readers use correct pronunciation
2. **SEO** - Search engines understand content language
3. **Translation** - Browsers can offer translation
4. **Styling** - CSS can target by language

## Common Language Codes

| Code | Language |
|------|----------|
| en | English |
| en-US | American English |
| en-GB | British English |
| es | Spanish |
| de | German |
| ja | Japanese |

> **Accessibility Tip:** Always include the `lang` attribute for better accessibility!', 6, 8),

('html', '2.3 Head Section', '# The Head Section

The `<head>` element contains metadata about the document.

## What Goes in the Head?

```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Page description">
    <title>Page Title</title>
    <link rel="stylesheet" href="styles.css">
</head>
```

## Meta Tags

### Character Encoding
```html
<meta charset="UTF-8">
```
Ensures special characters display correctly.

### Viewport
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```
Essential for responsive design on mobile devices.

### Description
```html
<meta name="description" content="A brief page description">
```
Shows in search engine results.

## The Title Element

```html
<title>My Website - Home</title>
```

The title appears in:
- Browser tab
- Search engine results
- Bookmarks

> **SEO Tip:** Keep titles under 60 characters and make them descriptive!', 7, 10),

('html', '2.4 Body Section', '# The Body Section

The `<body>` element contains all visible content.

## Structure

```html
<body>
    <header>
        <h1>Website Title</h1>
        <nav>Navigation links</nav>
    </header>
    
    <main>
        <article>Main content</article>
    </main>
    
    <footer>
        <p>Copyright info</p>
    </footer>
</body>
```

## Common Body Elements

| Element | Purpose |
|---------|---------|
| `<header>` | Page header, logo, nav |
| `<nav>` | Navigation links |
| `<main>` | Primary content |
| `<article>` | Self-contained content |
| `<section>` | Thematic grouping |
| `<aside>` | Sidebar content |
| `<footer>` | Page footer |

## Body Attributes

```html
<body onload="init()" class="dark-theme">
```

> **Best Practice:** Use semantic elements for better structure and accessibility!', 8, 10),

('html', '2.5 Comments in HTML', '# Comments in HTML

Comments are notes in your code that browsers ignore.

## Syntax

```html
<!-- This is a comment -->
```

## Multi-line Comments

```html
<!--
    This is a
    multi-line comment
-->
```

## Use Cases

### 1. Documenting Code
```html
<!-- Navigation starts here -->
<nav>...</nav>
<!-- Navigation ends -->
```

### 2. Temporarily Hiding Code
```html
<!--
<section>
    This section is hidden
</section>
-->
```

### 3. TODO Notes
```html
<!-- TODO: Add contact form -->
```

## Comment Best Practices

✅ **Do:**
- Use comments to explain complex code
- Mark section beginnings and endings
- Leave TODO notes

❌ **Avoid:**
- Commenting obvious code
- Leaving sensitive information
- Over-commenting

> **Warning:** Comments are visible in page source! Never put passwords or secrets in comments.', 9, 8),

-- ==========================================
-- MODULE 3: TEXT FORMATTING & TYPOGRAPHY
-- ==========================================
('html', 'Module 3: Text Formatting', '# Module 3: Text Formatting & Typography

Learn how to format and style text content using HTML elements.

## Text Elements Overview

HTML provides many elements for text:
- Headings (`<h1>` - `<h6>`)
- Paragraphs (`<p>`)
- Bold and strong (`<b>`, `<strong>`)
- Italic and emphasis (`<i>`, `<em>`)
- And more!

## Semantic vs Presentational

| Semantic | Presentational |
|----------|---------------|
| `<strong>` | `<b>` |
| `<em>` | `<i>` |

**Semantic elements** convey meaning, not just style.

> **Best Practice:** Prefer semantic elements for better accessibility!', 10, 8),

('html', '3.1 Headings (h1 to h6)', '# Headings

HTML provides six levels of headings.

## The Six Heading Levels

```html
<h1>Heading Level 1 (Most Important)</h1>
<h2>Heading Level 2</h2>
<h3>Heading Level 3</h3>
<h4>Heading Level 4</h4>
<h5>Heading Level 5</h5>
<h6>Heading Level 6 (Least Important)</h6>
```

## Heading Hierarchy

Use headings in order - don''t skip levels:

✅ **Correct:**
```html
<h1>Title</h1>
  <h2>Section</h2>
    <h3>Subsection</h3>
```

❌ **Wrong:**
```html
<h1>Title</h1>
  <h3>Skipped h2!</h3>
```

## Best Practices

1. **One `<h1>` per page** - Main title only
2. **Follow hierarchy** - h1 → h2 → h3
3. **Don''t use for styling** - Use CSS instead
4. **Be descriptive** - Clear, meaningful text

## SEO Benefits

Search engines use headings to understand your content structure.

> **Accessibility Tip:** Screen readers use headings for navigation!', 11, 10),

('html', '3.2 Paragraphs', '# Paragraphs

The `<p>` element defines a paragraph of text.

## Basic Usage

```html
<p>This is a paragraph of text.</p>

<p>This is another paragraph. 
   Multiple lines in code
   become one line in browser.</p>
```

## Paragraph Behavior

- Browsers add space before and after paragraphs
- Line breaks in source code are ignored
- Multiple spaces become single space

## Preserving Whitespace

Use `<pre>` to preserve formatting:

```html
<pre>
This text preserves
    spaces and
        line breaks
</pre>
```

## Common Mistakes

❌ **Wrong:** Using `<br>` for spacing
```html
<p>Paragraph 1</p>
<br><br>
<p>Paragraph 2</p>
```

✅ **Correct:** Use CSS for spacing
```html
<p style="margin-bottom: 2rem;">Paragraph 1</p>
<p>Paragraph 2</p>
```

> **Tip:** Use CSS to control paragraph spacing, not `<br>` tags!', 12, 8),

('html', '3.3 Bold and Strong', '# Bold and Strong Text

Two ways to make text bold:

## The `<b>` Element

```html
<p>This is <b>bold text</b></p>
```

- **Purely visual** - No semantic meaning
- Use for: Product names, keywords in abstracts

## The `<strong>` Element

```html
<p>Warning: <strong>Do not delete this file!</strong></p>
```

- **Semantic importance** - Screen readers emphasize this
- Use for: Important warnings, critical information

## When to Use Which?

| Use `<strong>` | Use `<b>` |
|----------------|-----------|
| Warnings | Keywords |
| Critical info | Product names |
| Important notes | Stylistic emphasis |

## Example

```html
<p>
    <strong>Important:</strong> The <b>SuperWidget 3000</b> 
    requires careful handling.
</p>
```

> **Best Practice:** Use `<strong>` for important content, `<b>` for stylistic boldness!', 13, 8),

('html', '3.4 Italic and Emphasis', '# Italic and Emphasis

Two ways to italicize text:

## The `<i>` Element

```html
<p>The <i>Titanic</i> sank in 1912.</p>
```

- **Stylistic** - Different tone or voice
- Use for: Ship names, foreign words, thoughts

## The `<em>` Element

```html
<p>I <em>really</em> need this project done!</p>
```

- **Semantic emphasis** - Stressed importance
- Use for: Emphasis that changes meaning

## Comparison

| Use `<em>` | Use `<i>` |
|------------|-----------|
| Word stress | Technical terms |
| Emphasis | Ship/book names |
| Meaning change | Foreign phrases |

## Example

```html
<p>
    I <em>must</em> read <i>War and Peace</i> this summer.
</p>
```

Read aloud, "must" would be stressed. "War and Peace" is just styled.

> **Accessibility:** Screen readers change voice tone for `<em>`, not for `<i>`!', 14, 8),

('html', '3.5 Line Breaks and Horizontal Rules', '# Line Breaks and Horizontal Rules

## Line Breaks (`<br>`)

Creates a line break without starting a new paragraph:

```html
<p>
    Roses are red,<br>
    Violets are blue,<br>
    HTML is awesome,<br>
    And so are you!
</p>
```

### When to Use `<br>`
- Poetry and addresses
- Inside `<p>` where new paragraph doesn''t make sense

### When NOT to Use `<br>`
- Creating space between elements (use CSS)
- Multiple `<br><br>` for spacing

## Horizontal Rule (`<hr>`)

Creates a thematic break:

```html
<p>End of section one...</p>
<hr>
<p>Beginning of section two...</p>
```

### Styling with CSS

```html
<hr style="border: 1px dashed gray;">
```

> **Note:** Both `<br>` and `<hr>` are self-closing (void) elements!', 15, 8),

('html', '3.6 Other Text Elements', '# Other Text Formatting Elements

## Subscript and Superscript

```html
<p>H<sub>2</sub>O is water</p>
<p>E = mc<sup>2</sup></p>
```

## Marked/Highlighted Text

```html
<p>Search for: <mark>HTML tutorial</mark></p>
```

## Deleted and Inserted Text

```html
<p>Price: <del>$99</del> <ins>$49</ins></p>
```

## Small Print

```html
<p><small>Terms and conditions apply</small></p>
```

## Code Elements

```html
<p>Use <code>console.log()</code> for debugging</p>
<kbd>Ctrl + S</kbd> to save
<samp>Error: File not found</samp>
```

## Quotations

```html
<!-- Inline quote -->
<p>She said, <q>Learning HTML is fun!</q></p>

<!-- Block quote -->
<blockquote cite="https://source.com">
    The web is for everyone.
</blockquote>
```

> **Recap:** HTML has many text elements - use the right one for the job!', 16, 10),

-- ==========================================
-- MODULE 4: LISTS & ORGANIZATION
-- ==========================================
('html', 'Module 4: Lists & Organization', '# Module 4: Lists & Organization

Lists help organize content in a structured, readable way.

## Types of Lists

1. **Unordered Lists** (`<ul>`) - Bullet points
2. **Ordered Lists** (`<ol>`) - Numbered items
3. **Description Lists** (`<dl>`) - Terms and definitions

## When to Use Each

| List Type | Use Case |
|-----------|----------|
| `<ul>` | Feature lists, navigation menus |
| `<ol>` | Steps, rankings, instructions |
| `<dl>` | Glossaries, FAQs, metadata |

> **Semantic Note:** Lists convey meaning - use them properly!', 17, 8),

('html', '4.1 Unordered Lists', '# Unordered Lists

Unordered lists display items with bullet points.

## Basic Syntax

```html
<ul>
    <li>First item</li>
    <li>Second item</li>
    <li>Third item</li>
</ul>
```

## Output
- First item
- Second item
- Third item

## Styling Bullets with CSS

```html
<ul style="list-style-type: square;">
    <li>Square bullets</li>
</ul>

<ul style="list-style-type: circle;">
    <li>Circle bullets</li>
</ul>

<ul style="list-style-type: none;">
    <li>No bullets</li>
</ul>
```

## Common Uses

- Navigation menus
- Feature lists
- Shopping lists
- Any unordered collection

> **Accessibility:** Screen readers announce "list with X items" for proper list markup!', 18, 10),

('html', '4.2 Ordered Lists', '# Ordered Lists

Ordered lists display numbered items.

## Basic Syntax

```html
<ol>
    <li>First step</li>
    <li>Second step</li>
    <li>Third step</li>
</ol>
```

## Output
1. First step
2. Second step
3. Third step

## Customizing Numbers

### Start Attribute
```html
<ol start="5">
    <li>Fifth item</li>
    <li>Sixth item</li>
</ol>
```

### Type Attribute
```html
<ol type="A">  <!-- A, B, C -->
<ol type="a">  <!-- a, b, c -->
<ol type="I">  <!-- I, II, III -->
<ol type="i">  <!-- i, ii, iii -->
<ol type="1">  <!-- 1, 2, 3 (default) -->
```

### Reversed Order
```html
<ol reversed>
    <li>Third</li>
    <li>Second</li>
    <li>First</li>
</ol>
```

> **Use Case:** Perfect for instructions, rankings, and step-by-step guides!', 19, 10),

('html', '4.3 Nested Lists', '# Nested Lists

Lists can be nested inside other lists.

## Syntax

```html
<ul>
    <li>Fruits
        <ul>
            <li>Apple</li>
            <li>Banana</li>
            <li>Orange</li>
        </ul>
    </li>
    <li>Vegetables
        <ul>
            <li>Carrot</li>
            <li>Broccoli</li>
        </ul>
    </li>
</ul>
```

## Output
- Fruits
  - Apple
  - Banana
  - Orange
- Vegetables
  - Carrot
  - Broccoli

## Mixed Nesting

You can mix ordered and unordered:

```html
<ol>
    <li>Morning
        <ul>
            <li>Wake up</li>
            <li>Breakfast</li>
        </ul>
    </li>
    <li>Afternoon
        <ul>
            <li>Lunch</li>
            <li>Work</li>
        </ul>
    </li>
</ol>
```

> **Common Use:** Navigation menus with submenus!', 20, 10),

('html', '4.4 Description Lists', '# Description Lists

Description lists pair terms with their descriptions.

## Syntax

```html
<dl>
    <dt>HTML</dt>
    <dd>HyperText Markup Language - structures web content</dd>
    
    <dt>CSS</dt>
    <dd>Cascading Style Sheets - styles web content</dd>
    
    <dt>JavaScript</dt>
    <dd>Programming language for web interactivity</dd>
</dl>
```

## Elements

- `<dl>` - Description list container
- `<dt>` - Description term
- `<dd>` - Description details

## Multiple Definitions

A term can have multiple definitions:

```html
<dl>
    <dt>Python</dt>
    <dd>A type of snake</dd>
    <dd>A programming language</dd>
</dl>
```

## Use Cases

- Glossaries
- FAQs
- Metadata display
- Contact information

> **Styling Tip:** Description lists work great with CSS Grid!', 21, 8),

-- ==========================================
-- MODULE 5: LINKS & NAVIGATION
-- ==========================================
('html', 'Module 5: Links & Navigation', '# Module 5: Links & Navigation

Links connect web pages together, making the web navigable.

## The Anchor Element

```html
<a href="https://example.com">Click here</a>
```

## Link Types

1. **External links** - Other websites
2. **Internal links** - Same website
3. **Anchor links** - Same page
4. **Email links** - Opens email client
5. **Phone links** - Initiates call

> **Fun Fact:** The "Hyper" in HTML refers to hyperlinks!', 22, 8),

('html', '5.1 The Anchor Tag', '# The Anchor Tag (`<a>`)

The anchor element creates hyperlinks.

## Basic Syntax

```html
<a href="url">Link Text</a>
```

## Parts of a Link

1. **Opening tag**: `<a href="url">`
2. **Link text**: What users click
3. **Closing tag**: `</a>`

## Examples

```html
<!-- External link -->
<a href="https://google.com">Visit Google</a>

<!-- Internal link -->
<a href="about.html">About Us</a>

<!-- Anchor link -->
<a href="#section2">Jump to Section 2</a>
```

## The href Attribute

"href" stands for **Hypertext Reference**.

It specifies where the link goes:
- Full URL: `https://example.com`
- Relative path: `page.html`
- Anchor: `#id-name`

> **Remember:** Links without `href` are not clickable!', 23, 10),

('html', '5.2 Absolute vs Relative Paths', '# Absolute vs Relative Paths

## Absolute Paths

Full URL including protocol and domain:

```html
<a href="https://example.com/page.html">Link</a>
```

**Use for:** External websites, CDN resources

## Relative Paths

Path relative to current file location:

```html
<!-- Same folder -->
<a href="about.html">About</a>

<!-- Subfolder -->
<a href="pages/contact.html">Contact</a>

<!-- Parent folder -->
<a href="../index.html">Home</a>

<!-- Root of site -->
<a href="/products/item.html">Product</a>
```

## Path Quick Reference

| Path | Meaning |
|------|---------|
| `page.html` | Same folder |
| `./page.html` | Same folder (explicit) |
| `folder/page.html` | Subfolder |
| `../page.html` | Parent folder |
| `/page.html` | Root of website |

> **Best Practice:** Use relative paths for internal links - easier to maintain!', 24, 10),

('html', '5.3 Opening Links in New Tabs', '# Opening Links in New Tabs

Use `target="_blank"` to open links in new tabs.

## Syntax

```html
<a href="https://example.com" target="_blank">
    Opens in new tab
</a>
```

## Security Concern

New tabs can access your page via `window.opener`.

**Solution:** Add `rel="noopener noreferrer"`

```html
<a href="https://example.com" 
   target="_blank" 
   rel="noopener noreferrer">
    Safe external link
</a>
```

## Target Values

| Value | Effect |
|-------|--------|
| `_blank` | New tab/window |
| `_self` | Same tab (default) |
| `_parent` | Parent frame |
| `_top` | Full window |

## When to Use New Tab

✅ **Good uses:**
- External links
- PDF downloads
- Reference materials

❌ **Avoid:**
- Internal navigation
- Every link (annoying!)

> **UX Tip:** Let users choose! Don''t override default behavior unnecessarily.', 25, 10),

('html', '5.4 Email and Phone Links', '# Email and Phone Links

## Email Links (mailto:)

Opens user''s email client:

```html
<a href="mailto:hello@example.com">Email Us</a>
```

### Pre-filled Email

```html
<a href="mailto:hello@example.com?subject=Hello&body=Hi there!">
    Contact Us
</a>
```

### Multiple Recipients

```html
<a href="mailto:one@example.com,two@example.com">
    Email Team
</a>
```

## Phone Links (tel:)

Initiates phone call (mobile devices):

```html
<a href="tel:+1234567890">Call Us</a>
```

### Best Practices

```html
<a href="tel:+1-555-123-4567">+1 (555) 123-4567</a>
```

## SMS Links

```html
<a href="sms:+1234567890">Send Text</a>

<!-- With message -->
<a href="sms:+1234567890?body=Hello!">Text Us</a>
```

> **Mobile Tip:** Phone links are especially useful on mobile devices!', 26, 10),

-- ==========================================
-- MODULE 6: IMAGES & MULTIMEDIA
-- ==========================================
('html', 'Module 6: Images & Multimedia', '# Module 6: Images & Multimedia

Learn to add images and media to enhance your web pages.

## The Image Element

```html
<img src="photo.jpg" alt="Description">
```

## Key Attributes

| Attribute | Purpose |
|-----------|---------|
| `src` | Image source path |
| `alt` | Alternative text |
| `width` | Image width |
| `height` | Image height |

> **Accessibility:** Always include meaningful `alt` text!', 27, 8),

('html', '6.1 Adding Images', '# Adding Images

The `<img>` element embeds images.

## Basic Syntax

```html
<img src="image.jpg" alt="Description of image">
```

## The src Attribute

Points to the image file:

```html
<!-- Local image -->
<img src="images/photo.jpg" alt="Photo">

<!-- External image -->
<img src="https://example.com/image.png" alt="External">
```

## The alt Attribute

**Always required!** Provides:
- Text if image fails to load
- Description for screen readers
- SEO benefits

```html
<img src="dog.jpg" alt="Golden retriever playing in park">
```

## Width and Height

Prevents layout shift:

```html
<img src="photo.jpg" alt="Photo" width="300" height="200">
```

> **Performance Tip:** Always specify width and height to prevent layout shift!', 28, 10),

('html', '6.2 Image Formats', '# Image Formats

Different formats for different purposes.

## Common Formats

| Format | Best For | Notes |
|--------|----------|-------|
| `.jpg` / `.jpeg` | Photos, gradients | Lossy compression |
| `.png` | Graphics, transparency | Lossless, larger files |
| `.gif` | Simple animations | Limited colors (256) |
| `.svg` | Icons, logos | Vector, scales perfectly |
| `.webp` | Modern web images | Smaller files, good quality |

## Choosing the Right Format

### Use JPG for:
- Photographs
- Images with gradients
- Web backgrounds

### Use PNG for:
- Logos with transparency
- Screenshots
- Graphics with text

### Use SVG for:
- Icons
- Logos
- Illustrations

### Use WebP for:
- Modern browsers
- Best compression

## Example

```html
<img src="photo.jpg" alt="Photo">
<img src="logo.png" alt="Logo">
<img src="icon.svg" alt="Icon">
```

> **Pro Tip:** Use WebP with a JPG/PNG fallback for best results!', 29, 10),

('html', '6.3 Responsive Images', '# Responsive Images

Make images adapt to different screen sizes.

## Basic Responsive

Using CSS:

```html
<img src="photo.jpg" alt="Photo" style="max-width: 100%; height: auto;">
```

## The srcset Attribute

Provide multiple image sizes:

```html
<img src="small.jpg"
     srcset="small.jpg 500w,
             medium.jpg 1000w,
             large.jpg 2000w"
     sizes="(max-width: 600px) 500px,
            (max-width: 1200px) 1000px,
            2000px"
     alt="Responsive image">
```

## The Picture Element

Different images for different conditions:

```html
<picture>
    <source media="(min-width: 800px)" srcset="large.jpg">
    <source media="(min-width: 400px)" srcset="medium.jpg">
    <img src="small.jpg" alt="Fallback image">
</picture>
```

## Lazy Loading

Defer loading until needed:

```html
<img src="photo.jpg" alt="Photo" loading="lazy">
```

> **Performance:** Lazy loading improves page load speed!', 30, 10),

('html', '6.4 Figure and Figcaption', '# Figure and Figcaption

Semantic elements for images with captions.

## Syntax

```html
<figure>
    <img src="chart.png" alt="Sales chart for Q4">
    <figcaption>Figure 1: Q4 Sales Report</figcaption>
</figure>
```

## Benefits

1. **Semantic meaning** - Browser knows image and caption are related
2. **Accessibility** - Screen readers announce the relationship
3. **Styling** - Easy to style as a unit

## Multiple Images

```html
<figure>
    <img src="before.jpg" alt="Before">
    <img src="after.jpg" alt="After">
    <figcaption>Before and after comparison</figcaption>
</figure>
```

## Not Just Images

Can contain:
- Images
- Code snippets
- Diagrams
- Videos

```html
<figure>
    <pre><code>console.log("Hello");</code></pre>
    <figcaption>Example JavaScript code</figcaption>
</figure>
```

> **Semantics:** Use `<figure>` when content needs a caption!', 31, 8),

-- ==========================================
-- MODULE 7: TABLES
-- ==========================================
('html', 'Module 7: Tables', '# Module 7: Tables

Tables display data in rows and columns.

## Basic Structure

```html
<table>
    <tr>
        <th>Header 1</th>
        <th>Header 2</th>
    </tr>
    <tr>
        <td>Data 1</td>
        <td>Data 2</td>
    </tr>
</table>
```

## Table Elements

| Element | Purpose |
|---------|---------|
| `<table>` | Table container |
| `<tr>` | Table row |
| `<th>` | Header cell |
| `<td>` | Data cell |

> **Important:** Use tables for tabular data only, not for layout!', 32, 8),

('html', '7.1 Basic Table Structure', '# Basic Table Structure

## Elements

```html
<table>
    <tr>
        <th>Name</th>
        <th>Age</th>
        <th>City</th>
    </tr>
    <tr>
        <td>John</td>
        <td>25</td>
        <td>New York</td>
    </tr>
    <tr>
        <td>Jane</td>
        <td>30</td>
        <td>Los Angeles</td>
    </tr>
</table>
```

## Elements Explained

- `<table>` - Container for the table
- `<tr>` - Table row (horizontal)
- `<th>` - Table header (bold, centered)
- `<td>` - Table data (regular cell)

## Table Caption

```html
<table>
    <caption>Employee Data</caption>
    <tr>...</tr>
</table>
```

## Accessibility

```html
<table>
    <caption>Sales Report</caption>
    <thead>
        <tr><th scope="col">Month</th><th scope="col">Sales</th></tr>
    </thead>
    <tbody>
        <tr><td>January</td><td>$1000</td></tr>
    </tbody>
</table>
```

> **Accessibility:** Use `scope` attribute on headers for screen readers!', 33, 10),

('html', '7.2 Table Sections', '# Table Sections

Semantic sections for better organization.

## The Three Sections

```html
<table>
    <thead>
        <tr>
            <th>Product</th>
            <th>Price</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Widget</td>
            <td>$9.99</td>
        </tr>
        <tr>
            <td>Gadget</td>
            <td>$19.99</td>
        </tr>
    </tbody>
    <tfoot>
        <tr>
            <td>Total</td>
            <td>$29.98</td>
        </tr>
    </tfoot>
</table>
```

## Section Purposes

| Section | Purpose |
|---------|---------|
| `<thead>` | Header rows |
| `<tbody>` | Main data rows |
| `<tfoot>` | Footer/summary rows |

## Benefits

1. **Semantics** - Clear structure
2. **Styling** - Easy CSS targeting
3. **Printing** - Headers repeat on pages
4. **Accessibility** - Better screen reader navigation

> **Best Practice:** Always use table sections for data tables!', 34, 10),

('html', '7.3 Spanning Rows and Columns', '# Spanning Rows and Columns

Merge cells across rows or columns.

## Column Span

```html
<table>
    <tr>
        <th colspan="2">Full Name</th>
        <th>Age</th>
    </tr>
    <tr>
        <td>John</td>
        <td>Doe</td>
        <td>25</td>
    </tr>
</table>
```

## Row Span

```html
<table>
    <tr>
        <th>Name</th>
        <td>John Doe</td>
    </tr>
    <tr>
        <th rowspan="2">Contact</th>
        <td>john@email.com</td>
    </tr>
    <tr>
        <td>555-1234</td>
    </tr>
</table>
```

## Combined Example

```html
<table>
    <tr>
        <th rowspan="2">Category</th>
        <th colspan="3">Q1 2024</th>
    </tr>
    <tr>
        <th>Jan</th>
        <th>Feb</th>
        <th>Mar</th>
    </tr>
    <tr>
        <td>Sales</td>
        <td>$100</td>
        <td>$150</td>
        <td>$200</td>
    </tr>
</table>
```

> **Tip:** Complex spanning can be tricky - plan your table structure first!', 35, 10),

-- ==========================================
-- MODULE 8: FORMS
-- ==========================================
('html', 'Module 8: Forms', '# Module 8: Forms

Forms collect user input and submit data.

## Basic Form Structure

```html
<form action="/submit" method="POST">
    <label for="name">Name:</label>
    <input type="text" id="name" name="name">
    
    <button type="submit">Submit</button>
</form>
```

## Form Attributes

| Attribute | Purpose |
|-----------|---------|
| `action` | Where to send data |
| `method` | How to send (GET/POST) |

> **Key Point:** Forms are essential for user interaction!', 36, 8),

('html', '8.1 Form Structure', '# Form Structure

## The Form Element

```html
<form action="/submit" method="POST">
    <!-- Form controls go here -->
</form>
```

## Key Attributes

### action
Where to send form data:
```html
<form action="/api/contact">
```

### method
How to send data:
- `GET` - Data in URL (searches)
- `POST` - Data in body (sensitive info)

```html
<form action="/login" method="POST">
```

## Labels

Always link labels to inputs:

```html
<!-- Method 1: for/id -->
<label for="email">Email:</label>
<input type="email" id="email" name="email">

<!-- Method 2: Wrapping -->
<label>
    Email:
    <input type="email" name="email">
</label>
```

## Fieldset and Legend

Group related fields:

```html
<fieldset>
    <legend>Personal Information</legend>
    <label>Name: <input type="text" name="name"></label>
    <label>Email: <input type="email" name="email"></label>
</fieldset>
```

> **Accessibility:** Always use labels - they increase clickable area and help screen readers!', 37, 12),

('html', '8.2 Input Types', '# Input Types

HTML5 provides many specialized inputs.

## Text Inputs

```html
<input type="text" placeholder="Enter text">
<input type="password" placeholder="Password">
<input type="email" placeholder="email@example.com">
<input type="tel" placeholder="Phone number">
<input type="url" placeholder="https://...">
<input type="search" placeholder="Search...">
```

## Number Inputs

```html
<input type="number" min="0" max="100" step="5">
<input type="range" min="0" max="100" value="50">
```

## Date/Time Inputs

```html
<input type="date">
<input type="time">
<input type="datetime-local">
<input type="month">
<input type="week">
```

## Selection Inputs

```html
<!-- Checkbox (multiple) -->
<input type="checkbox" id="agree" name="agree">
<label for="agree">I agree</label>

<!-- Radio (single choice) -->
<input type="radio" id="male" name="gender" value="male">
<label for="male">Male</label>
<input type="radio" id="female" name="gender" value="female">
<label for="female">Female</label>
```

## Other Types

```html
<input type="color">
<input type="file">
<input type="hidden" name="token" value="abc123">
```

> **Mobile Tip:** Using correct input types shows appropriate keyboards!', 38, 12),

('html', '8.3 Select and Textarea', '# Select and Textarea

## Select (Dropdown)

```html
<label for="country">Country:</label>
<select id="country" name="country">
    <option value="">Choose...</option>
    <option value="us">United States</option>
    <option value="uk">United Kingdom</option>
    <option value="ca">Canada</option>
</select>
```

### Option Groups

```html
<select name="car">
    <optgroup label="Swedish Cars">
        <option value="volvo">Volvo</option>
        <option value="saab">Saab</option>
    </optgroup>
    <optgroup label="German Cars">
        <option value="mercedes">Mercedes</option>
        <option value="bmw">BMW</option>
    </optgroup>
</select>
```

### Multiple Selection

```html
<select name="colors" multiple size="4">
    <option value="red">Red</option>
    <option value="blue">Blue</option>
    <option value="green">Green</option>
</select>
```

## Textarea

```html
<label for="message">Message:</label>
<textarea id="message" name="message" 
          rows="5" cols="40"
          placeholder="Enter your message..."></textarea>
```

## Datalist (Autocomplete)

```html
<input list="browsers" name="browser">
<datalist id="browsers">
    <option value="Chrome">
    <option value="Firefox">
    <option value="Safari">
</datalist>
```

> **UX Tip:** Use select for 5+ options, radio for fewer!', 39, 10),

('html', '8.4 Form Validation', '# Form Validation

HTML5 provides built-in validation.

## Required Fields

```html
<input type="text" required>
```

## Pattern Matching

```html
<input type="text" pattern="[A-Za-z]+" 
       title="Letters only">
```

## Length Constraints

```html
<input type="text" minlength="3" maxlength="20">
```

## Number Constraints

```html
<input type="number" min="0" max="100">
```

## Email Validation

```html
<input type="email" required>
```
Automatically validates email format!

## Custom Messages

```html
<input type="text" required 
       oninvalid="this.setCustomValidity(''Please enter a value'')"
       oninput="this.setCustomValidity('''')">
```

## Common Validation Attributes

| Attribute | Purpose |
|-----------|---------|
| `required` | Must be filled |
| `minlength` | Minimum characters |
| `maxlength` | Maximum characters |
| `min` | Minimum number |
| `max` | Maximum number |
| `pattern` | Regex pattern |

> **Security Note:** Always validate on the server too - client validation can be bypassed!', 40, 10),

('html', '8.5 Buttons', '# Buttons

Different button types for different purposes.

## Button Element

```html
<button type="submit">Submit Form</button>
<button type="reset">Clear Form</button>
<button type="button">Just a Button</button>
```

## Button Types

| Type | Purpose |
|------|---------|
| `submit` | Submit form |
| `reset` | Clear form |
| `button` | No default action |

## Input Buttons (older)

```html
<input type="submit" value="Submit">
<input type="reset" value="Reset">
<input type="button" value="Click">
```

## Button vs Input

```html
<!-- Button - more flexible -->
<button type="submit">
    <i class="icon"></i> Submit Form
</button>

<!-- Input - just text value -->
<input type="submit" value="Submit">
```

## Disabled Buttons

```html
<button disabled>Cannot click</button>
```

> **Best Practice:** Use `<button>` over `<input type="button">` for more flexibility!', 41, 8),

('html', 'Course Summary', '# HTML Course Summary

Congratulations! You have completed the HTML Fundamentals course.

## What You Learned

### Module 1: Introduction
- What HTML is and why it matters
- Setting up your development environment

### Module 2: Document Structure
- DOCTYPE, html, head, and body
- Meta tags and page titles
- HTML comments

### Module 3: Text Formatting
- Headings and paragraphs
- Bold, italic, and other formatting
- Semantic vs presentational elements

### Module 4: Lists
- Ordered and unordered lists
- Description lists
- Nested lists

### Module 5: Links & Navigation
- Creating hyperlinks
- Absolute vs relative paths
- Email and phone links

### Module 6: Images & Multimedia
- Adding images
- Image formats and optimization
- Responsive images
- Figure and figcaption

### Module 7: Tables
- Table structure
- Table sections (thead, tbody, tfoot)
- Spanning rows and columns

### Module 8: Forms
- Form structure and controls
- Input types
- Validation

## Next Steps

1. **Practice** - Build your own web pages
2. **Learn CSS** - Make your HTML beautiful
3. **Learn JavaScript** - Add interactivity

> **Remember:** The best way to learn is by building!', 42, 5);
