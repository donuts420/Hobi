# Hopi - Online Event Ticket Booking System

A modern, high-conversion live-events discovery and ticketing web application inspired by **District.in**, crafted with a **Dune / Desert Ochre** visual aesthetic and **Vollkorn** serif typography.

Built with **React**, **Vite**, **Tailwind CSS**, and **Lucide Icons**.

---

## 🚀 Step-by-Step Guide: How to Run the Project

Follow these steps to run the application on your local machine:

### Prerequisites

Ensure you have **Node.js** and **npm** installed on your computer:
- **Node.js**: Version `18.0.0` or higher (Check with `node -v`)
- **npm**: Version `9.0.0` or higher (Check with `npm -v`)

If you don't have Node.js installed, download it from [nodejs.org](https://nodejs.org/).

---

### Step 1: Open Your Terminal & Navigate to Project Directory

Open PowerShell, Command Prompt, or your IDE terminal and change directory to the project folder:

```bash
cd c:\Users\ASUS\Downloads\SE_LAB\SE_LAB_PROJECT\Online-Event-Ticket-Booking-System
```

*(Or simply open the `Online-Event-Ticket-Booking-System` folder in VS Code / Antigravity IDE).*

---

### Step 2: Install Dependencies

Run the following command to install all required libraries (React, Vite, Tailwind CSS, Supabase client, GSAP, Motion, and Lucide Icons):

```bash
npm install
```

> **Note:** If you recently pulled changes from Git, always run `npm install` to ensure new packages are properly downloaded into `node_modules/`.

---

### Step 3: Start the Development Server

Start the local Vite development server:

```bash
npm run dev
```

You will see output similar to:

```text
  VITE v6.4.4  ready in 285 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.x.x:3000/
```

---

### Step 4: Open in Your Browser

Click the link in your terminal or open your web browser and go to:

👉 **[http://localhost:3000/](http://localhost:3000/)**

The application will load with hot-module reloading (HMR) enabled — any code changes you save will update instantly in your browser.

---

### 📦 Other Useful Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the local development server at `http://localhost:3000/` |
| `npm run build` | Compiles and creates an optimized production bundle in `dist/` |
| `npm run preview` | Runs a local server to preview the production build |

---

## 🎨 Design System & Palette (Dune / Desert Ochre)

| Token | Hex Code | Purpose |
| :--- | :--- | :--- |
| `darkRoast` | `#181210` | Primary deep background |
| `elevated` | `#241B18` | Elevated card surfaces, panels, modals |
| `elevatedBorder` | `#2E221E` | Dividers and subtle container strokes |
| `clayBrown` | `#6B352A` | Secondary buttons and borders |
| `terracotta` | `#D36135` | Primary CTA buttons, badges, active tabs |
| `softButter` | `#FFF1A6` | Primary titles, prominent headers, highlights |
| `warmCream` | `#FAF0D7` | Subtitles, descriptions, body text |
| `mutedClay` | `#B3A090` | Timestamps, metadata, inactive labels |

- **Primary Font**: `Vollkorn` (Serif, Google Fonts)
- **Code / Reference Font**: `JetBrains Mono`
- **Currency**: Indian Rupees (**₹** / INR)

---

## 🌟 Key Features

- **District.in-Style Header**: Dedicated city selector with interactive GPS *"Find My Location"* button.
- **Instant Search**: Real-time keyword filter across artists, event titles, venues, and genres.
- **Categories Mega-Menu**: Dropdown to explore events by medium (*Concerts, Comedy, Nightlife, Food Festivals, Theater, Workshops*).
- **Interactive Multi-Tier Booking**: Choose ticket tiers with live INR total calculation and confirmed digital passes.
- **JWT-Ready Sign In**: Modal requiring format-validated Email & Password with Sign In / Sign Up tabs.
- **Ticketing FAQs**: Accordion covering digital ticket delivery, transfer policies, venue entry, and hosting.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
