-- Full HTML Course Content Seed
-- Run this in your Supabase SQL Editor

INSERT INTO lessons (course_id, title, content, "order", duration_minutes) VALUES

-- ==========================================
-- MODULE 1: INTRODUCTION TO HTML
-- ==========================================
(
    'html',
    '1.1 What is HTML?',
    '# What is HTML?

**HTML** stands for **HyperText Markup Language**. It is the standard markup language for creating web pages and web applications.

## Key Points

- HTML describes the **structure** of a web page
- HTML consists of a series of **elements**
- HTML elements tell the browser how to display content
- HTML elements are represented by **tags**

## A Brief History

HTML was created by **Tim Berners-Lee** in 1991. Since then, it has evolved through many versions:

| Version | Year |
|---------|------|
| HTML 1.0 | 1991 |
| HTML 2.0 | 1995 |
| HTML 4.01 | 1999 |
| XHTML | 2000 |
| HTML5 | 2014 |

## Why Learn HTML?

1. **Foundation of the Web** - Every website uses HTML
2. **Easy to Learn** - Simple syntax and structure
3. **Career Opportunities** - Essential for web development
4. **Creative Expression** - Build your own websites

> **Pro Tip:** HTML is often used together with CSS (for styling) and JavaScript (for interactivity).',
    1,
    10
),
(
    'html',
    '1.2 How the Web Works',
    '# How the Web Works

Before diving into HTML, let''s understand how websites actually work.

## The Client-Server Model

```
[Your Browser] ----request----> [Web Server]
     (Client)  <---response----  (Host)
```

### Step-by-Step Process

1. **You type a URL** in your browser (e.g., `www.example.com`)
2. **Browser sends a request** to the server hosting that website
3. **Server processes** the request
4. **Server sends back** HTML, CSS, and JavaScript files
5. **Browser renders** the page for you to see

## Key Terms

- **URL** - Uniform Resource Locator (web address)
- **HTTP/HTTPS** - The protocol used to transfer web pages
- **Browser** - Software that displays web pages (Chrome, Firefox, Safari)
- **Server** - A computer that hosts websites

## What Files Make Up a Website?

| File Type | Purpose |
|-----------|---------|
| `.html` | Structure and content |
| `.css` | Styling and layout |
| `.js` | Interactivity and logic |
| Images | Visual media |

> **Remember:** HTML is the skeleton, CSS is the skin, and JavaScript is the muscles!',
    2,
    8
),
(
    'html',
    '1.3 Setting Up Your Environment',
    '# Setting Up Your Development Environment

To write HTML, you need two things: a **text editor** and a **web browser**.

## Recommended Text Editors

### Free Options
- **Visual Studio Code** (Highly Recommended) - [code.visualstudio.com](https://code.visualstudio.com)
- **Sublime Text** - Fast and lightweight
- **Atom** - Customizable and open-source
- **Notepad++** - Simple Windows editor

### VS Code Extensions for HTML

1. **Live Server** - Auto-refresh your browser
2. **Prettier** - Auto-format your code
3. **HTML CSS Support** - IntelliSense for HTML
4. **Auto Rename Tag** - Rename paired tags

## Your First HTML File

1. Create a new folder called `my-website`
2. Open VS Code and open that folder
3. Create a new file called `index.html`
4. Type `!` and press Tab (this creates a template!)

## Viewing Your HTML

**Method 1: Double-click the file**
- Find your `.html` file in File Explorer
- Double-click to open in your default browser

**Method 2: Live Server (Recommended)**
- Right-click in VS Code
- Select "Open with Live Server"
- Changes auto-refresh!

> **Pro Tip:** Always save your file (Ctrl+S) before refreshing the browser!',
    3,
    12
),

-- ==========================================
-- MODULE 2: HTML DOCUMENT STRUCTURE
-- ==========================================
(
    'html',
    '2.1 Basic HTML Document',
    '# Basic HTML Document Structure

Every HTML document follows the same basic structure.

## The HTML Boilerplate

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>This is my first webpage.</p>
</body>
</html>
```

## Breaking It Down

### `<!DOCTYPE html>`
- Tells the browser this is an HTML5 document
- Must be the very first line

### `<html lang="en">`
- The root element of the page
- `lang="en"` specifies the language (English)

### `<head>`
- Contains **metadata** about the document
- Not visible on the page itself
- Includes title, character set, stylesheets

### `<body>`
- Contains all **visible content**
- Everything users see goes here

## The `<meta>` Tags

| Meta Tag | Purpose |
|----------|---------|
| `charset="UTF-8"` | Character encoding for special characters |
| `viewport` | Responsive design for mobile devices |

> **Practice:** Create an HTML file with this exact structure and view it in your browser!',
    4,
    15
),
(
    'html',
    '2.2 HTML Elements and Tags',
    '# HTML Elements and Tags

Understanding elements and tags is fundamental to HTML.

## What is an Element?

An HTML **element** is everything from the start tag to the end tag:

```html
<p>This is a paragraph.</p>
```

- `<p>` - Opening tag
- `This is a paragraph.` - Content
- `</p>` - Closing tag

## Types of Elements

### 1. Container Elements (Have closing tags)
```html
<h1>Heading</h1>
<p>Paragraph</p>
<div>Division</div>
<span>Inline text</span>
```

### 2. Empty (Void) Elements (No closing tag)
```html
<br>      <!-- Line break -->
<hr>      <!-- Horizontal rule -->
<img>     <!-- Image -->
<input>   <!-- Form input -->
```

## Nesting Elements

Elements can be **nested** inside each other:

```html
<div>
    <h1>Welcome</h1>
    <p>This is <strong>important</strong> text.</p>
</div>
```

### Rules for Nesting
✅ **Correct:** `<p><strong>Bold</strong></p>`
❌ **Wrong:** `<p><strong>Bold</p></strong>`

## Common Mistakes

1. **Forgetting closing tags**
2. **Incorrect nesting**
3. **Using wrong tag names**
4. **Not using lowercase** (HTML5 prefers lowercase)

> **Remember:** Always close your tags in the reverse order you opened them!',
    5,
    12
),
(
    'html',
    '2.3 HTML Attributes',
    '# HTML Attributes

Attributes provide **additional information** about HTML elements.

## Attribute Syntax

```html
<tag attribute="value">Content</tag>
```

Attributes always go in the **opening tag** and come in **name/value pairs**.

## Common Attributes

### The `id` Attribute
- Unique identifier for an element
- Used for CSS and JavaScript targeting

```html
<h1 id="main-title">Welcome</h1>
```

### The `class` Attribute
- Groups elements together
- Can have multiple classes

```html
<p class="intro highlight">Important text</p>
```

### The `style` Attribute
- Inline CSS styling

```html
<p style="color: blue; font-size: 18px;">Blue text</p>
```

### The `title` Attribute
- Shows tooltip on hover

```html
<p title="This is a tooltip">Hover over me!</p>
```

## Global Attributes

These work on **any** HTML element:

| Attribute | Description |
|-----------|-------------|
| `id` | Unique identifier |
| `class` | CSS class name(s) |
| `style` | Inline CSS styles |
| `title` | Tooltip text |
| `hidden` | Hides the element |
| `lang` | Language of content |

## Best Practices

1. **Always use quotes** around attribute values
2. **Use lowercase** for attribute names
3. **Use meaningful names** for id and class
4. **Avoid inline styles** when possible (use CSS files)

> **Pro Tip:** Prefer `class` over `id` for styling - you can reuse classes!',
    6,
    10
),

-- ==========================================
-- MODULE 3: TEXT ELEMENTS
-- ==========================================
(
    'html',
    '3.1 Headings and Paragraphs',
    '# Headings and Paragraphs

Headings and paragraphs are the building blocks of web content.

## Headings (h1 - h6)

HTML provides **6 levels** of headings:

```html
<h1>Heading 1 - Most Important</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>
<h4>Heading 4</h4>
<h5>Heading 5</h5>
<h6>Heading 6 - Least Important</h6>
```

### Heading Best Practices

- ✅ Use only **one `<h1>`** per page
- ✅ Follow a **logical hierarchy** (h1 → h2 → h3)
- ✅ Use headings for **structure**, not for styling
- ❌ Don''t skip levels (h1 → h3)

## Paragraphs

```html
<p>This is a paragraph. It can contain 
multiple lines of text.</p>

<p>This is another paragraph.</p>
```

Browsers automatically add **space** before and after paragraphs.

## Line Breaks

Use `<br>` for a line break within text:

```html
<p>Roses are red,<br>
Violets are blue,<br>
HTML is awesome,<br>
And so are you!</p>
```

## Horizontal Rule

Use `<hr>` to create a thematic break:

```html
<p>Section one content...</p>
<hr>
<p>Section two content...</p>
```

## Preformatted Text

Use `<pre>` to preserve whitespace and formatting:

```html
<pre>
    This text
        preserves
            spaces and
                line breaks
</pre>
```

> **SEO Tip:** Search engines use headings to understand your content structure!',
    7,
    10
),
(
    'html',
    '3.2 Text Formatting',
    '# Text Formatting

HTML provides many elements for formatting text.

## Bold and Strong

```html
<b>Bold text</b>
<strong>Important text (semantic)</strong>
```

- `<b>` - Just bold styling
- `<strong>` - **Semantic importance** (use this!)

## Italic and Emphasis

```html
<i>Italic text</i>
<em>Emphasized text (semantic)</em>
```

- `<i>` - Just italic styling
- `<em>` - **Semantic emphasis** (use this!)

## Other Formatting Elements

```html
<mark>Highlighted text</mark>
<small>Smaller text</small>
<del>Deleted text</del>
<ins>Inserted text</ins>
<sub>Subscript</sub>
<sup>Superscript</sup>
```

## Code and Keyboard

```html
<code>console.log("Hello")</code>
<kbd>Ctrl + C</kbd>
<samp>Sample output</samp>
<var>x</var> = 5
```

## Quotations

### Inline Quote
```html
<p>She said, <q>HTML is easy!</q></p>
```

### Block Quote
```html
<blockquote cite="https://example.com">
    <p>The web is for everyone.</p>
    <footer>— Tim Berners-Lee</footer>
</blockquote>
```

## Abbreviations

```html
<p>Learn <abbr title="HyperText Markup Language">HTML</abbr> today!</p>
```

> **Best Practice:** Use **semantic elements** (`<strong>`, `<em>`) instead of purely presentational ones (`<b>`, `<i>`).',
    8,
    12
),

-- ==========================================
-- MODULE 4: LINKS AND IMAGES
-- ==========================================
(
    'html',
    '4.1 Creating Links',
    '# Creating Links

Links are the backbone of the web - they connect pages together!

## The Anchor Element

```html
<a href="https://www.google.com">Visit Google</a>
```

- `<a>` - Anchor tag
- `href` - Hypertext reference (the destination)
- Link text goes between the tags

## Types of Links

### 1. External Links
```html
<a href="https://www.example.com">External Site</a>
```

### 2. Internal Links (Same Site)
```html
<a href="about.html">About Page</a>
<a href="pages/contact.html">Contact</a>
```

### 3. Page Anchors (Jump Links)
```html
<!-- Create an anchor point -->
<h2 id="section2">Section 2</h2>

<!-- Link to it -->
<a href="#section2">Jump to Section 2</a>
```

### 4. Email Links
```html
<a href="mailto:hello@example.com">Send Email</a>
```

### 5. Phone Links
```html
<a href="tel:+1234567890">Call Us</a>
```

## Link Attributes

| Attribute | Purpose |
|-----------|---------|
| `href` | Destination URL |
| `target="_blank"` | Open in new tab |
| `rel="noopener"` | Security for new tabs |
| `title` | Tooltip text |
| `download` | Download instead of navigate |

## Opening Links in New Tab

```html
<a href="https://example.com" 
   target="_blank" 
   rel="noopener noreferrer">
    Open in New Tab
</a>
```

> **Security Tip:** Always add `rel="noopener noreferrer"` when using `target="_blank"`!',
    9,
    15
),
(
    'html',
    '4.2 Adding Images',
    '# Adding Images

Images make your web pages visually engaging.

## The Image Element

```html
<img src="photo.jpg" alt="Description of image">
```

- `<img>` is a **void element** (no closing tag)
- `src` - Source/path to the image
- `alt` - Alternative text (required for accessibility)

## Image Sources

### Local Images
```html
<img src="images/logo.png" alt="Company Logo">
<img src="../photos/vacation.jpg" alt="Beach sunset">
```

### External Images
```html
<img src="https://example.com/image.jpg" alt="Example image">
```

## Important Attributes

### Width and Height
```html
<img src="photo.jpg" alt="Photo" width="300" height="200">
```

> **Performance Tip:** Always specify width and height to prevent layout shift!

### Loading Attribute
```html
<img src="photo.jpg" alt="Photo" loading="lazy">
```

- `lazy` - Loads image when it enters viewport
- `eager` - Loads immediately (default)

## Image Formats

| Format | Best For |
|--------|----------|
| `.jpg` / `.jpeg` | Photos, gradients |
| `.png` | Graphics, transparency |
| `.gif` | Simple animations |
| `.svg` | Icons, logos (scalable) |
| `.webp` | Modern, smaller files |

## Responsive Images

```html
<img src="small.jpg"
     srcset="small.jpg 500w,
             medium.jpg 1000w,
             large.jpg 2000w"
     sizes="(max-width: 600px) 500px,
            1000px"
     alt="Responsive image">
```

## Figure and Caption

```html
<figure>
    <img src="chart.png" alt="Sales chart">
    <figcaption>Q4 2024 Sales Report</figcaption>
</figure>
```

> **Accessibility:** Always provide meaningful `alt` text for screen readers!',
    10,
    15
),

-- ==========================================
-- MODULE 5: LISTS
-- ==========================================
(
    'html',
    '5.1 Ordered and Unordered Lists',
    '# Ordered and Unordered Lists

Lists are perfect for organizing information.

## Unordered Lists

Use `<ul>` for bullet points:

```html
<ul>
    <li>Apples</li>
    <li>Bananas</li>
    <li>Oranges</li>
</ul>
```

**Output:**
- Apples
- Bananas
- Oranges

## Ordered Lists

Use `<ol>` for numbered items:

```html
<ol>
    <li>First step</li>
    <li>Second step</li>
    <li>Third step</li>
</ol>
```

**Output:**
1. First step
2. Second step
3. Third step

## Ordered List Attributes

### Start Number
```html
<ol start="5">
    <li>Item five</li>
    <li>Item six</li>
</ol>
```

### List Type
```html
<ol type="A">  <!-- A, B, C -->
<ol type="a">  <!-- a, b, c -->
<ol type="I">  <!-- I, II, III -->
<ol type="i">  <!-- i, ii, iii -->
```

### Reversed Order
```html
<ol reversed>
    <li>Third</li>
    <li>Second</li>
    <li>First</li>
</ol>
```

## Nested Lists

```html
<ul>
    <li>Fruits
        <ul>
            <li>Apple</li>
            <li>Banana</li>
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

> **Use Case:** Navigation menus are often built with nested `<ul>` lists!',
    11,
    10
),
(
    'html',
    '5.2 Description Lists',
    '# Description Lists

Description lists are perfect for glossaries, FAQs, and key-value pairs.

## Basic Structure

```html
<dl>
    <dt>HTML</dt>
    <dd>HyperText Markup Language - the structure of web pages</dd>
    
    <dt>CSS</dt>
    <dd>Cascading Style Sheets - the styling of web pages</dd>
    
    <dt>JavaScript</dt>
    <dd>A programming language for web interactivity</dd>
</dl>
```

## Elements

- `<dl>` - Description List (container)
- `<dt>` - Description Term (the word/term)
- `<dd>` - Description Details (the definition)

## Multiple Definitions

A term can have multiple definitions:

```html
<dl>
    <dt>Python</dt>
    <dd>A type of snake</dd>
    <dd>A programming language</dd>
</dl>
```

## Grouping with div

```html
<dl>
    <div>
        <dt>Coffee</dt>
        <dd>A hot beverage</dd>
    </div>
    <div>
        <dt>Tea</dt>
        <dd>Another hot beverage</dd>
    </div>
</dl>
```

## Use Cases

1. **Glossary** - Terms and definitions
2. **FAQ** - Questions and answers
3. **Metadata** - Labels and values
4. **Contact Info** - Field names and values

```html
<dl>
    <dt>Email</dt>
    <dd>contact@example.com</dd>
    
    <dt>Phone</dt>
    <dd>+1 (555) 123-4567</dd>
    
    <dt>Address</dt>
    <dd>123 Main Street, City</dd>
</dl>
```

> **Styling Tip:** Description lists are easily styled with CSS Grid or Flexbox!',
    12,
    8
),

-- ==========================================
-- MODULE 6: TABLES
-- ==========================================
(
    'html',
    '6.1 Creating Tables',
    '# Creating Tables

Tables display data in rows and columns.

## Basic Table Structure

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

## Table Elements

| Element | Purpose |
|---------|---------|
| `<table>` | Table container |
| `<tr>` | Table row |
| `<th>` | Table header cell |
| `<td>` | Table data cell |

## Semantic Table Sections

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

## Table Caption

```html
<table>
    <caption>Monthly Sales Report</caption>
    <tr>
        <th>Month</th>
        <th>Sales</th>
    </tr>
    <!-- rows -->
</table>
```

> **Important:** Tables should be used for **tabular data only**, not for page layout!',
    13,
    12
),
(
    'html',
    '6.2 Spanning Rows and Columns',
    '# Spanning Rows and Columns

Sometimes cells need to span multiple rows or columns.

## Column Span

Use `colspan` to span multiple columns:

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

Use `rowspan` to span multiple rows:

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

## Complex Example

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

## Column Groups

Define column styles:

```html
<table>
    <colgroup>
        <col style="background-color: #f0f0f0">
        <col span="2" style="background-color: #fff">
    </colgroup>
    <tr>
        <th>Name</th>
        <th>Score 1</th>
        <th>Score 2</th>
    </tr>
</table>
```

> **Tip:** Complex tables can be hard to maintain - keep them as simple as possible!',
    14,
    10
),

-- ==========================================
-- MODULE 7: FORMS
-- ==========================================
(
    'html',
    '7.1 Form Basics',
    '# Form Basics

Forms allow users to input and submit data.

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
| `action` | URL to submit data to |
| `method` | HTTP method (GET or POST) |
| `enctype` | Encoding type for file uploads |

### GET vs POST

- **GET** - Data in URL, for searches
- **POST** - Data in body, for sensitive info

## Labels

Always link labels to inputs:

```html
<!-- Method 1: for/id -->
<label for="email">Email:</label>
<input type="text" id="email" name="email">

<!-- Method 2: Wrapping -->
<label>
    Email:
    <input type="text" name="email">
</label>
```

## Fieldset and Legend

Group related inputs:

```html
<fieldset>
    <legend>Personal Information</legend>
    
    <label for="fname">First Name:</label>
    <input type="text" id="fname" name="fname">
    
    <label for="lname">Last Name:</label>
    <input type="text" id="lname" name="lname">
</fieldset>
```

## Form Validation

HTML5 built-in validation:

```html
<input type="email" required>
<input type="text" minlength="3" maxlength="20">
<input type="number" min="0" max="100">
<input type="text" pattern="[A-Za-z]+">
```

> **Accessibility:** Always use `<label>` elements - they help screen readers and increase click area!',
    15,
    15
),
(
    'html',
    '7.2 Input Types',
    '# Input Types

HTML5 provides many specialized input types.

## Text Inputs

```html
<input type="text" placeholder="Enter text">
<input type="password" placeholder="Password">
<input type="email" placeholder="email@example.com">
<input type="tel" placeholder="Phone number">
<input type="url" placeholder="https://example.com">
<input type="search" placeholder="Search...">
```

## Number Inputs

```html
<input type="number" min="0" max="100" step="5">
<input type="range" min="0" max="100" value="50">
```

## Date and Time

```html
<input type="date">
<input type="time">
<input type="datetime-local">
<input type="month">
<input type="week">
```

## Selection Inputs

```html
<!-- Checkbox -->
<input type="checkbox" id="agree" name="agree">
<label for="agree">I agree</label>

<!-- Radio Buttons -->
<input type="radio" id="male" name="gender" value="male">
<label for="male">Male</label>
<input type="radio" id="female" name="gender" value="female">
<label for="female">Female</label>
```

## Other Types

```html
<input type="color">
<input type="file">
<input type="hidden" name="userId" value="123">
```

## Input Attributes

| Attribute | Purpose |
|-----------|---------|
| `placeholder` | Hint text |
| `value` | Default value |
| `required` | Must be filled |
| `disabled` | Cannot be edited |
| `readonly` | Cannot be edited but submitted |
| `autofocus` | Focus on page load |
| `autocomplete` | Browser autofill |

> **Mobile Tip:** Using the right input type shows the appropriate keyboard on mobile devices!',
    16,
    12
),
(
    'html',
    '7.3 Select, Textarea, and Buttons',
    '# Select, Textarea, and Buttons

Beyond inputs, forms use selects, textareas, and various buttons.

## Select (Dropdown)

```html
<label for="country">Country:</label>
<select id="country" name="country">
    <option value="">Choose a country</option>
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
        <option value="audi">Audi</option>
    </optgroup>
</select>
```

### Multiple Selection

```html
<select name="colors" multiple size="4">
    <option value="red">Red</option>
    <option value="blue">Blue</option>
    <option value="green">Green</option>
    <option value="yellow">Yellow</option>
</select>
```

## Textarea

```html
<label for="message">Message:</label>
<textarea id="message" name="message" 
          rows="4" cols="50"
          placeholder="Enter your message..."></textarea>
```

## Datalist

Provides autocomplete suggestions:

```html
<input list="browsers" name="browser">
<datalist id="browsers">
    <option value="Chrome">
    <option value="Firefox">
    <option value="Safari">
    <option value="Edge">
</datalist>
```

## Buttons

```html
<button type="submit">Submit Form</button>
<button type="reset">Reset Form</button>
<button type="button">Regular Button</button>
```

### Input Buttons (older style)

```html
<input type="submit" value="Submit">
<input type="reset" value="Reset">
<input type="button" value="Click Me">
```

> **Best Practice:** Use `<button>` instead of `<input type="button">` - it''s more flexible!',
    17,
    10
),

-- ==========================================
-- MODULE 8: SEMANTIC HTML
-- ==========================================
(
    'html',
    '8.1 What is Semantic HTML?',
    '# What is Semantic HTML?

Semantic HTML uses elements that clearly describe their meaning.

## Non-Semantic vs Semantic

```html
<!-- Non-semantic (unclear meaning) -->
<div id="header">...</div>
<div id="nav">...</div>
<div class="article">...</div>

<!-- Semantic (clear meaning) -->
<header>...</header>
<nav>...</nav>
<article>...</article>
```

## Why Use Semantic HTML?

1. **Accessibility** - Screen readers understand your content
2. **SEO** - Search engines better index your site
3. **Maintainability** - Code is easier to read
4. **Consistency** - Standard vocabulary for developers

## Main Semantic Elements

| Element | Purpose |
|---------|---------|
| `<header>` | Introductory content, logo, navigation |
| `<nav>` | Navigation links |
| `<main>` | Main content of the page |
| `<article>` | Self-contained content |
| `<section>` | Thematic grouping |
| `<aside>` | Sidebar content |
| `<footer>` | Footer information |

## Page Structure Example

```html
<body>
    <header>
        <h1>My Website</h1>
        <nav>...</nav>
    </header>
    
    <main>
        <article>
            <h2>Article Title</h2>
            <p>Article content...</p>
        </article>
        
        <aside>
            <h3>Related Links</h3>
        </aside>
    </main>
    
    <footer>
        <p>&copy; 2024 My Website</p>
    </footer>
</body>
```

> **Rule of Thumb:** If there''s a semantic element for it, use it instead of `<div>`!',
    18,
    10
),
(
    'html',
    '8.2 Common Semantic Elements',
    '# Common Semantic Elements

Let''s explore semantic elements in detail.

## Header and Footer

Used for page or section headers/footers:

```html
<article>
    <header>
        <h2>Article Title</h2>
        <p>Posted on <time datetime="2024-01-15">January 15, 2024</time></p>
    </header>
    
    <p>Article content...</p>
    
    <footer>
        <p>Author: John Doe</p>
    </footer>
</article>
```

## Navigation

```html
<nav aria-label="Main navigation">
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/contact">Contact</a></li>
    </ul>
</nav>
```

## Main Content

Only **one** `<main>` per page:

```html
<main>
    <!-- Primary content goes here -->
</main>
```

## Article vs Section

### Article
Self-contained, could be distributed independently:
```html
<article>
    <h2>Blog Post Title</h2>
    <p>Content that makes sense on its own...</p>
</article>
```

### Section
Thematic grouping with a heading:
```html
<section>
    <h2>Features</h2>
    <p>A section about features...</p>
</section>
```

## Aside

Related but tangential content:

```html
<article>
    <p>Main article content...</p>
    
    <aside>
        <h4>Did You Know?</h4>
        <p>Interesting related fact...</p>
    </aside>
</article>
```

## Figure and Figcaption

```html
<figure>
    <img src="chart.png" alt="Sales chart">
    <figcaption>Figure 1: Q4 Sales Report</figcaption>
</figure>
```

## Time Element

```html
<time datetime="2024-12-25">Christmas Day</time>
<time datetime="14:30">2:30 PM</time>
```

> **Accessibility Tip:** Use `aria-label` and `aria-labelledby` to provide additional context when needed!',
    19,
    15
),
(
    'html',
    '8.3 Course Summary & Next Steps',
    '# HTML Course Summary

Congratulations! You''ve completed the HTML fundamentals course.

## What You''ve Learned

### Module 1: Introduction
- What HTML is and why it matters
- How the web works
- Setting up your development environment

### Module 2: Document Structure
- HTML document boilerplate
- Elements, tags, and attributes
- Proper nesting and structure

### Module 3: Text Elements
- Headings (h1-h6) and paragraphs
- Text formatting (bold, italic, etc.)
- Semantic text elements

### Module 4: Links and Images
- Creating hyperlinks
- Internal and external links
- Adding and optimizing images

### Module 5: Lists
- Ordered and unordered lists
- Description lists
- Nested lists

### Module 6: Tables
- Table structure and elements
- Spanning rows and columns
- Semantic table sections

### Module 7: Forms
- Form structure and attributes
- Input types and validation
- Select, textarea, and buttons

### Module 8: Semantic HTML
- Meaningful element choices
- Page structure best practices
- Accessibility benefits

## Next Steps

1. **Practice** - Build a personal website from scratch
2. **Learn CSS** - Make your HTML beautiful
3. **Learn JavaScript** - Add interactivity
4. **Build Projects** - Portfolio, blog, landing pages

## Recommended Resources

- [MDN Web Docs](https://developer.mozilla.org)
- [W3Schools](https://www.w3schools.com)
- [freeCodeCamp](https://www.freecodecamp.org)

> **Remember:** The best way to learn is by building. Start creating!',
    20,
    10
);
