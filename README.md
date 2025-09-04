# EmoteJournal  

EmoteJournal is a simple mood tracking and journaling web application. 
Users can log daily entries, view mood trends over time, and revisit past journal entries through a “Flashback”.  

## Features  
- Record 1 mood entry per day, with optional written notes.  
- View mood trends as:  
  - Past 7 entries  
  - Past 14 entries  
  - Monthly averages (over the past year)  
- Filter past journal entries by mood and limit the number of results.  
- Responsive design for both desktop and mobile.  

## Technology Stack  
**Frontend:**  
- HTML  
- CSS  
- Bootstrap  
- JavaScript  

**Backend:**  
- Node.js  
- Express.js  

**Data Storage:**  
- JSON file (`entries.json`)  

## Project Structure  
```
EmoteJournal/
│
├── public/              # Frontend code (served to browser)
│   ├── index.html       # Main webpage
│   ├── styles.css       # Styling for the page
│   └── script.js        # Client-side interactivity
│
├── server/              # Backend code
│   └── server.js        # Express server
│
├── data/                # Data storage
│   └── entries.json     # Stores mood + journal entries
│
├── node_modules/        # Dependencies (auto-created by npm)
├── package.json         # Project metadata + dependencies
├── package-lock.json    # Dependency version lock
└── README.md            # Documentation
```

## Installation Instructions  

### 1. Prerequisites  
Make sure you have installed:  
- [Node.js](https://nodejs.org/)  
- npm (comes with Node.js)  

### 2. Clone the Repository  
If using GitHub:  
```bash
git clone https://github.com/isaacIU/EmoteJournal.git
cd EmoteJournal
```

Or, if you downloaded a `.zip`, unzip it and open the folder.  

### 3. Install Dependencies  
In the project root, run:  
```bash
npm install
```  
This installs Express.js and any other dependencies listed in `package.json`.  

### 4. Start the Server  
Run:  
```bash
node server/server.js
```  

If successful, you’ll see:  
```
✅ Server is running at http://localhost:3000
```  

### 5. Open the Application  
- Open a web browser.  
- Navigate to: [http://localhost:3000](http://localhost:3000)  
- The EmoteJournal app should now be running locally.  

## Usage Notes  
- One entry can be submitted per day.  
- Data is stored locally in `data/entries.json`.  
- `data/entries.json` currently contains fictional test data.
- To start new, the document must be cleared, aside from the square brackets `[]`.
- The app is for demonstration and educational purposes only.