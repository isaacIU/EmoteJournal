/* ---------------------------------------------- */
/* Automatically updating clock in header section */
/* ---------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  // Grab the datetime display element in the header
  const datetimeElement = document.getElementById("datetime");

  if (datetimeElement) {
    // Function to refresh the clock every second
    const updateClock = () => {
      const now = new Date();
      datetimeElement.textContent = now.toLocaleString(); // Local-friendly format
    };

    updateClock(); // Call once immediately
    setInterval(updateClock, 1000); // Update every second
  }

  /* --------------------------- */
  /* Submission of diary entries */
  /* --------------------------- */

  // Grab the mood dropdown, notes input, and submit button
  const moodSelect = document.getElementById("mood");
  const notesTextarea = document.getElementById("notes");
  const submitButton = document.getElementById("submit-entry") || document.querySelector('button[type="submit"]');

  if (submitButton && moodSelect && notesTextarea) {
    // When the user clicks submit
    submitButton.addEventListener("click", async () => {
      const mood = moodSelect.value;
      const notes = notesTextarea.value.trim();

      // Prevent empty submissions
      if (!mood) {
        alert("Please select a mood before submitting.");
        return;
      }

      try {
        // Fetch existing entries to check for duplicate submissions today
        const existingRes = await fetch("/entries");
        const existingEntries = await existingRes.json();

        const today = new Date().toISOString().slice(0, 10);
        const alreadySubmitted = existingEntries.some(
          entry => entry.timestamp.slice(0, 10) === today
        );

        if (alreadySubmitted) {
          alert("You have already submitted an entry today.");
          return;
        }

        // Build the new entry object
        const timestamp = new Date().toISOString();
        const entry = { mood, notes, timestamp };

        // POST entry to the backend
        const res = await fetch("/entry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry),
        });

        if (res.ok) {
          // Success - reset the form and refresh timelines
          alert("Entry saved successfully!");
          moodSelect.value = "";
          notesTextarea.value = "";
          loadEmojiTimeline();
          loadFlashback(); // refresh flashbacks too
        } else {
          // Handle possible server errors (including "already submitted")
          let errorMsg = "Failed to save entry.";
          try {
            const errorData = await res.json();
            if (errorData.error) errorMsg = errorData.error;
          } catch {}
          alert(errorMsg);
        }
      } catch (error) {
        // Catch network or unexpected errors
        console.error("Error submitting entry:", error);
        alert("Something went wrong. Please try again.");
      }
    });
  }

  /* ------------------------------------------- */
  /* Load and display emoji timeline/trends      */
  /* ------------------------------------------- */

  const timelineEl = document.getElementById("emoji-timeline");
  const trendDropdown = document.getElementById("trend-filter");

  async function loadEmojiTimeline() {
    if (!timelineEl) return; // No element = nothing to render

    try {
      // Fetch all saved entries
      const res = await fetch("/entries");
      const entries = await res.json();
      const filter = trendDropdown?.value || "Past 7 days";

      // Reset display
      timelineEl.innerHTML = "";
      timelineEl.style.display = "flex";
      timelineEl.style.justifyContent = "center";
      timelineEl.style.gap = "10px";

      // If filter is by number of entries
      if (filter === "Past 7 entries" || filter === "Past 14 entries") {
        const daysToShow = filter === "Past 7 entries" ? 7 : 14;
        // Sort newest - oldest
        const sorted = entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        // Take the most recent entries, then reverse for left-to-right order
        const recent = sorted.slice(0, daysToShow).reverse();

        // Render each entry's emoji + weekly label
        recent.forEach(entry => {
          const date = new Date(entry.timestamp);
          const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" });

          const wrapper = document.createElement("div");
          wrapper.style.display = "flex";
          wrapper.style.flexDirection = "column";
          wrapper.style.alignItems = "center";

          const emojiDiv = document.createElement("div");
          emojiDiv.textContent = entry.mood;
          emojiDiv.style.fontSize = "1.5rem";

          const labelDiv = document.createElement("div");
          labelDiv.textContent = dayLabel;
          labelDiv.style.fontSize = "0.85rem";
          labelDiv.style.color = "#666";

          wrapper.appendChild(emojiDiv);
          wrapper.appendChild(labelDiv);
          timelineEl.appendChild(wrapper);
        });

      } else if (filter === "Monthly average") {
        // Group moods by months-year
        const groupedByMonth = {};
        entries.forEach(entry => {
          const date = new Date(entry.timestamp);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!groupedByMonth[key]) groupedByMonth[key] = [];
          groupedByMonth[key].push(entry.mood);
        });

        // Only keep the last 12 months
        const allMonths = Object.keys(groupedByMonth).sort().reverse().slice(0, 12).reverse();

       // For each month, pick the most common mood
        const monthlyAverages = allMonths.map(month => {
          const moods = groupedByMonth[month];
          const counts = {};
          moods.forEach(m => counts[m] = (counts[m] || 0) + 1);

          let maxCount = 0;
          let mostCommon = "❓"; // Fallback if nothing found
          for (const mood in counts) {
            if (counts[mood] > maxCount) {
              maxCount = counts[mood];
              mostCommon = mood;
            }
          }
          return mostCommon;
        });
        // Render each months emoji + label
        allMonths.forEach((monthKey, index) => {
          const emoji = monthlyAverages[index];
          const monthDate = new Date(monthKey + "-01");
          const monthLabel = monthDate.toLocaleDateString("en-US", { month: "short" });

          const wrapper = document.createElement("div");
          wrapper.style.display = "flex";
          wrapper.style.flexDirection = "column";
          wrapper.style.alignItems = "center";

          const emojiDiv = document.createElement("div");
          emojiDiv.textContent = emoji;
          emojiDiv.style.fontSize = "1.5rem";

          const labelDiv = document.createElement("div");
          labelDiv.textContent = monthLabel;
          labelDiv.style.fontSize = "0.85rem";
          labelDiv.style.color = "#666";

          wrapper.appendChild(emojiDiv);
          wrapper.appendChild(labelDiv);
          timelineEl.appendChild(wrapper);
        });
      }

    } catch (error) {
      console.error("Error loading emoji timeline:", error);
      timelineEl.textContent = "Error loading trends.";
    }
  }
  
  // Reload timeline when dropdown changes
  if (trendDropdown) {
    trendDropdown.addEventListener("change", loadEmojiTimeline);
  }
  loadEmojiTimeline(); // Run once at startup

  /* ------------------------------------------- */
  /* Load and display flashback entries          */
  /* ------------------------------------------- */

  const flashbackContainer = document.getElementById("journal-entries");
  const flashbackLimitDropdown = document.getElementById("flashback-limit");
  const flashbackMoodDropdown = document.getElementById("flashback-mood-filter");

  async function loadFlashback() {
    if (!flashbackContainer) return;

    try {
      const res = await fetch("/entries");
      let entries = await res.json();

      // only entries with notes
      entries = entries.filter(e => e.notes && e.notes.trim() !== "");

      // mood filter
      const moodFilter = flashbackMoodDropdown?.value || "all";
      if (moodFilter !== "all") {
        entries = entries.filter(e => e.mood === moodFilter);
      }

      // newest first
      entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // apply limit
      const limit = flashbackLimitDropdown?.value || "5";
      if (limit !== "all") {
        entries = entries.slice(0, parseInt(limit));
      }

      flashbackContainer.innerHTML = "";
      if (entries.length === 0) {
        flashbackContainer.textContent = "No flashbacks found.";
        return;
      }

      //Loop through entries and build a styled "card" for each
      entries.forEach(entry => {
        const dateStr = new Date(entry.timestamp).toLocaleString();
        const div = document.createElement("div");
        div.classList.add("mb-2", "p-2", "border", "rounded", "bg-light");
        div.innerHTML = `<strong>${entry.mood}</strong> — <em>${dateStr}</em><br>${entry.notes}`;
        flashbackContainer.appendChild(div);
      });

    } catch (error) {
      console.error("Error loading flashback:", error);
      flashbackContainer.textContent = "Error loading flashbacks.";
    }
  }

  // Attach filters
  if (flashbackLimitDropdown) {
    flashbackLimitDropdown.addEventListener("change", loadFlashback);
  }
  if (flashbackMoodDropdown) {
    flashbackMoodDropdown.addEventListener("change", loadFlashback);
  }

  loadFlashback(); // Run once at startup
});